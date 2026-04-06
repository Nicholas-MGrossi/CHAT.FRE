const express = require('express');
const router = express.Router();
const biasAnalyzer = require('../utils/biasAnalyzer');

/**
 * POST /api/analyze/text
 * Analyze a text passage for bias/framing without a conversation
 */
router.post('/text', (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Valid text is required' });
  }

  const analysis = biasAnalyzer.analyze(text);
  const suggestions = biasAnalyzer.suggestAlternatives(text, analysis.issues);

  res.json({
    text,
    analysis,
    suggestions,
  });
});

/**
 * POST /api/analyze/compare
 * Compare original and modified text to see bias reduction
 */
router.post('/compare', (req, res) => {
  const { original, modified } = req.body;

  if (!original || !modified) {
    return res.status(400).json({ error: 'Both original and modified text are required' });
  }

  const originalAnalysis = biasAnalyzer.analyze(original);
  const modifiedAnalysis = biasAnalyzer.analyze(modified);

  const improvement = originalAnalysis.score - modifiedAnalysis.score;

  res.json({
    original: {
      text: original,
      analysis: originalAnalysis,
    },
    modified: {
      text: modified,
      analysis: modifiedAnalysis,
    },
    improvement: {
      scoreDifference: improvement,
      percentImprovement: Math.round((improvement / originalAnalysis.score) * 100),
      issuesRemoved: originalAnalysis.issues.length - modifiedAnalysis.issues.length,
    },
  });
});

module.exports = router;
