const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Upload and extract questions from PDF
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📄 Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Parse PDF
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    if (!pdfText.trim()) {
      return res.status(400).json({
        error: 'Could not extract text from PDF. Please use a text-based PDF (not scanned images).',
      });
    }

    console.log(`✓ PDF extracted: ${pdfText.length} characters`);

    // Extract questions using Claude
    const extractionPrompt = `You are an expert at extracting questions from PDF documents. 

Here is the PDF text:
${pdfText}

Please extract ALL questions from this PDF. For each question:
1. Identify the question number/label
2. Extract the complete question text
3. Identify the subject/category if mentioned
4. Keep the exact wording

Return the questions as a JSON array with this structure:
[
  {
    "id": 1,
    "text": "Complete question text",
    "category": "Subject or Category",
    "difficulty": "Easy/Medium/Hard (estimate based on content)"
  }
]

Return ONLY valid JSON, no other text.`;

    console.log('🤖 Extracting questions with Claude...');

    const extractionResponse = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: extractionPrompt,
        },
      ],
    });

    const extractedText = extractionResponse.content[0].text;
    
    // Parse the JSON response
    let questions = [];
    try {
      // Extract JSON from the response
      const jsonMatch = extractedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      return res.status(500).json({
        error: 'Failed to parse questions. Please ensure your PDF contains clear questions.',
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        error: 'No questions found in the PDF. Please check your file format.',
      });
    }

    console.log(`✓ Extracted ${questions.length} questions`);

    res.json({
      success: true,
      questions,
      totalQuestions: questions.length,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error('❌ Error in upload:', error);
    res.status(500).json({
      error: 'Error processing PDF',
      details: error.message,
    });
  }
});

// Generate solution for a question
app.post('/api/solve', async (req, res) => {
  try {
    const { questionText, category, difficulty } = req.body;

    if (!questionText) {
      return res.status(400).json({ error: 'Question text is required' });
    }

    console.log(`📝 Generating solution for: ${questionText.substring(0, 50)}...`);

    const solutionPrompt = `You are an expert educator and problem solver. A student is asking for help with this question:

Question: ${questionText}
Category: ${category || 'General'}
Difficulty Level: ${difficulty || 'Unknown'}

Please provide:
1. **Detailed Solution**: Step-by-step solution with clear explanations
2. **Key Concepts**: Important concepts needed to understand this question (as a bullet list)
3. **Common Mistakes**: Common mistakes students make (as a bullet list)
4. **Study Tips**: Tips for understanding and remembering this concept (as a bullet list)
5. **Video Keywords**: 3-5 keywords that would help find YouTube videos about this topic

Format your response as:
## Detailed Solution
[Your detailed solution here]

## Key Concepts
- Concept 1
- Concept 2
...

## Common Mistakes
- Mistake 1
- Mistake 2
...

## Study Tips
- Tip 1
- Tip 2
...

## Video Keywords
- keyword1
- keyword2
...`;

    const solutionResponse = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: solutionPrompt,
        },
      ],
    });

    const solution = solutionResponse.content[0].text;

    // Parse the response into sections
    const sections = {
      fullSolution: solution,
      detailedSolution: extractSection(solution, 'Detailed Solution'),
      keyConcepts: extractBulletPoints(solution, 'Key Concepts'),
      commonMistakes: extractBulletPoints(solution, 'Common Mistakes'),
      studyTips: extractBulletPoints(solution, 'Study Tips'),
      videoKeywords: extractBulletPoints(solution, 'Video Keywords'),
    };

    console.log('✓ Solution generated');

    res.json({
      success: true,
      question: questionText,
      category,
      difficulty,
      solution: sections,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error generating solution:', error);
    res.status(500).json({
      error: 'Error generating solution',
      details: error.message,
    });
  }
});

// Get video suggestions for a topic
app.post('/api/videos', async (req, res) => {
  try {
    const { keywords, category } = req.body;

    if (!keywords || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords are required' });
    }

    console.log(`🎬 Searching videos for: ${keywords.join(', ')}`);

    // Create a list of suggested videos based on keywords
    const videoSuggestions = keywords.map((keyword, index) => ({
      id: `video-${index}`,
      title: `${keyword} - Explained`,
      description: `Learn about ${keyword} with detailed explanations and examples.`,
      keywords: [keyword, category || 'education'],
      searchQuery: `${keyword} tutorial explained`,
      difficulty: 'Beginner to Intermediate',
    }));

    res.json({
      success: true,
      videos: videoSuggestions,
      searchSuggestion: `Search YouTube for: "${keywords.join(', ')}"`,
    });
  } catch (error) {
    console.error('❌ Error getting videos:', error);
    res.status(500).json({
      error: 'Error fetching video suggestions',
      details: error.message,
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 50MB.' });
    }
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: 'Only PDF files are allowed' });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Helper function to extract a section from the response
function extractSection(text, sectionName) {
  const regex = new RegExp(`## ${sectionName}([\\s\\S]*?)(?=##|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

// Helper function to extract bullet points
function extractBulletPoints(text, sectionName) {
  const section = extractSection(text, sectionName);
  return section
    .split('\n')
    .filter(line => line.startsWith('-') || line.startsWith('•'))
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(line => line.length > 0);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  🚀 AI Question Solver Server Running    ║');
  console.log(`║  📍 Port: ${PORT}                                 ║`);
  console.log(`║  🌐 API: http://localhost:${PORT}/api           ║`);
  console.log('║  ✅ Ready to accept requests              ║');
  console.log('╚════════════════════════════════════════════╝\n');
});

module.exports = app;
