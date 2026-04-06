/**
 * Bias & Framing Analyzer
 * Detects loaded language, gaslighting patterns, and potential manipulation
 */

class BiasAnalyzer {
  constructor() {
    // Pattern libraries for heuristic-based detection
    this.loaded_language_patterns = {
      'obviously': { type: 'false-consensus', risk: 'medium', explanation: 'suggests agreement where there is none' },
      'clearly': { type: 'false-consensus', risk: 'medium', explanation: 'implies the point is obvious, discourages questioning' },
      'everyone knows': { type: 'false-consensus', risk: 'high', explanation: 'appeals to non-existent mass agreement' },
      'common sense': { type: 'false-consensus', risk: 'high', explanation: 'frames disputed claim as basic truth' },
      'natural': { type: 'identity-inflation', risk: 'high', explanation: 'conflates description with inevitability' },
      'meant to': { type: 'identity-inflation', risk: 'high', explanation: 'confuses purpose/identity' },
      'real': { type: 'definition-shift', risk: 'medium', explanation: 'often used to exclude or redefine' },
      'crazy': { type: 'tone-aggression', risk: 'high', explanation: 'dismisses without argument' },
      'insane': { type: 'tone-aggression', risk: 'high', explanation: 'dismisses without argument' },
      'ridiculous': { type: 'tone-aggression', risk: 'high', explanation: 'dismisses without argument' },
      'obviously wrong': { type: 'tone-aggression', risk: 'high', explanation: 'combines consensus-claim with dismissal' },
      'if you care about': { type: 'emotional-escalation', risk: 'medium', explanation: 'used to frame option as moral test' },
      'should care': { type: 'emotional-escalation', risk: 'medium', explanation: 'prescriptive framing of emotions' },
    };

    this.gaslighting_patterns = {
      'identity': /you are|you're|you must be|that's who you are|you can't help but/gi,
      'definition-shift': /by definition|technically|the actual meaning|real\s+\w+|true\s+\w+/gi,
      'confusion-of-condition': /if you|when you|because you|since you/gi,
      'false-consensus': /everyone|people say|most would|they all/gi,
      'tone-aggression': /clearly|obviously|ridiculous|insane|crazy|delusional/gi,
    };

    this.domination_phrases = {
      'direct': [
        'you must', 'you have to', 'you need to', 'you should',
        'you will', 'you cannot', 'you cannot deny'
      ],
      'subtle-control': [
        'if you care', 'if you\'re honest', 'real people',
        'normal people', 'well-adjusted', 'mature'
      ],
      'appeal-to-false-consensus': [
        'everyone knows', 'as everyone can see', 'it\'s common knowledge',
        'any reasonable person would see'
      ]
    };
  }

  /**
   * Analyze a text passage for bias and framing issues
   */
  analyze(text) {
    if (!text || typeof text !== 'string') {
      return { issues: [], score: 0, summary: 'No text to analyze' };
    }

    const issues = [];
    const textLower = text.toLowerCase();

    // Check for loaded language
    for (const [pattern, info] of Object.entries(this.loaded_language_patterns)) {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        issues.push({
          type: info.type,
          pattern,
          count: matches.length,
          risk: info.risk,
          explanation: info.explanation,
        });
      }
    }

    // Check for identity conflation (e.g., "you are X" vs "you did X")
    const identityMatches = textLower.match(/\byou ar|you'r|that's who you are|you are (a|the)/gi);
    if (identityMatches && identityMatches.length > 0) {
      issues.push({
        type: 'identity-inflation',
        pattern: 'identity-claim',
        count: identityMatches.length,
        risk: 'high',
        explanation: 'conflates behavior/condition with permanent identity',
      });
    }

    // Check for domination/control phrases
    for (const [category, phrases] of Object.entries(this.domination_phrases)) {
      for (const phrase of phrases) {
        const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
        if (regex.test(textLower)) {
          issues.push({
            type: 'domination-phrase',
            category,
            pattern: phrase,
            risk: category === 'direct' ? 'high' : 'medium',
            explanation: `${category} pattern: may indicate controlling language`,
          });
        }
      }
    }

    // Calculate risk score (0-10)
    const riskScore = this._calculateRiskScore(issues);

    // Generate summary
    const summary = this._generateSummary(issues, riskScore);

    return {
      issues: this._dedupIssues(issues),
      score: riskScore,
      summary,
      flagCount: issues.length,
    };
  }

  /**
   * Calculate overall risk score
   */
  _calculateRiskScore(issues) {
    if (issues.length === 0) return 0;

    const riskMap = { high: 3, medium: 2, low: 1 };
    const totalRisk = issues.reduce((sum, issue) => {
      const risk = riskMap[issue.risk] || 1;
      const count = issue.count || 1;
      return sum + (risk * count);
    }, 0);

    // Normalize to 0-10 scale
    return Math.min(10, Math.round((totalRisk / (issues.length * 3)) * 10));
  }

  /**
   * Generate human-readable summary
   */
  _generateSummary(issues, score) {
    if (issues.length === 0) {
      return 'No significant framing or gaslighting patterns detected.';
    }

    const types = new Set(issues.map(i => i.type));
    const typesList = Array.from(types).join(', ');

    let summary = `⚠️ Detected potential issues: ${typesList}. `;
    
    if (score >= 7) {
      summary += 'HIGH risk of manipulation or gaslighting.';
    } else if (score >= 4) {
      summary += 'MODERATE risk of biased framing.';
    } else {
      summary += 'LOW risk, but review suggestions.';
    }

    return summary;
  }

  /**
   * Deduplicate issues by pattern
   */
  _dedupIssues(issues) {
    const seen = new Map();
    
    return issues.filter(issue => {
      const key = `${issue.type}:${issue.pattern}`;
      if (seen.has(key)) {
        const existing = seen.get(key);
        existing.count = (existing.count || 1) + (issue.count || 1);
        return false;
      }
      seen.set(key, issue);
      return true;
    });
  }

  /**
   * Suggest alternative framings
   */
  suggestAlternatives(text, issues) {
    const suggestions = [];

    for (const issue of issues) {
      let suggestion = {};

      switch (issue.type) {
        case 'identity-inflation':
          suggestion = {
            issue: issue.pattern,
            problematic: 'Frames behavior as permanent identity',
            alternative: 'Describe the specific behavior or condition without conflating to identity',
            example: 'Instead of "you are X", try "you did/said X" or "this situation is X"',
          };
          break;

        case 'false-consensus':
          suggestion = {
            issue: issue.pattern,
            problematic: 'Appeals to false agreement',
            alternative: 'Use data, evidence, or acknowledge disagreement',
            example: 'Instead of "everyone knows...", provide specific evidence or acknowledge viewpoints',
          };
          break;

        case 'definition-shift':
          suggestion = {
            issue: issue.pattern,
            problematic: 'Redefines terms to suit argument',
            alternative: 'Define terms upfront or acknowledge differing interpretations',
            example: 'Be explicit: "By X, I mean Y specifically, not Z"',
          };
          break;

        case 'tone-aggression':
          suggestion = {
            issue: issue.pattern,
            problematic: 'Dismisses without argument',
            alternative: 'Engage with the specific claim and explain why you disagree',
            example: `Instead of "${issue.pattern}", explain the actual flaw or provide counter-evidence`,
          };
          break;

        case 'domination-phrase':
          suggestion = {
            issue: issue.pattern,
            problematic: 'Uses controlling language',
            alternative: 'Reframe as suggestion or question',
            example: 'Instead of "you must...", try "consider..." or "have you thought about..."',
          };
          break;

        default:
          suggestion = {
            issue: issue.pattern,
            problematic: 'Potentially biased framing detected',
            alternative: 'Review and consider neutral alternatives',
          };
      }

      suggestions.push(suggestion);
    }

    return suggestions;
  }
}

module.exports = new BiasAnalyzer();
