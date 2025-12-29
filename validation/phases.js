// mcp-tool/validation/phases.js
// Configuration for all 31 validation phases

module.exports = [
  // Core Phases (1-8)
  { id: 1, name: 'Novelty Check', description: 'Ensure content originality', critical: true },
  { id: 2, name: 'Forbidden Scanner', description: 'Detect prohibited content', critical: true },
  { id: 3, name: 'Corridor Validator', description: 'Verify cultural authenticity', critical: true },
  { id: 4, name: 'Mutation Detector', description: 'Identify pattern mutations', critical: false },
  { id: 5, name: 'Emotional Scorer', description: 'Measure emotional alignment', critical: false },
  { id: 6, name: 'Phrase Matrix', description: 'Analyze phrase structures', critical: false },
  { id: 7, name: 'Governance Check', description: 'Validate governance compliance', critical: true },
  { id: 8, name: 'Strict Enforcer', description: 'Enforce strict mode rules', critical: false },
  
  // Extended Phases (9-22)
  { id: 9, name: 'Linguistic Coherence', description: 'Check language structure', critical: false },
  { id: 10, name: 'Semantic Depth', description: 'Analyze meaning complexity', critical: false },
  { id: 11, name: 'Rhythmic Analysis', description: 'Evaluate rhythmic patterns', critical: false },
  { id: 12, name: 'Cultural Sensitivity', description: 'Cross-cultural appropriateness', critical: true },
  { id: 13, name: 'Historical Accuracy', description: 'Verify historical references', critical: false },
  { id: 14, name: 'Geographic Resonance', description: 'Geographic authenticity', critical: false },
  { id: 15, name: 'Demographic Alignment', description: 'Target audience alignment', critical: false },
  { id: 16, name: 'Sentiment Analysis', description: 'Emotional sentiment check', critical: false },
  { id: 17, name: 'Tone Consistency', description: 'Maintain tonal consistency', critical: false },
  { id: 18, name: 'Narrative Flow', description: 'Story progression check', critical: false },
  { id: 19, name: 'Character Development', description: 'Character arc validation', critical: false },
  { id: 20, name: 'Thematic Coherence', description: 'Theme consistency', critical: false },
  { id: 21, name: 'Symbolic Analysis', description: 'Symbolic content check', critical: false },
  { id: 22, name: 'Metaphor Validation', description: 'Metaphor authenticity', critical: false },
  
  // Advanced Phases (23-31)
  { id: 23, name: 'Shadow Mode', description: 'Anti-detection patterns', critical: false },
  { id: 24, name: 'Economic Engine', description: 'Revenue optimization', critical: false },
  { id: 25, name: 'Legion Engine', description: 'Multi-personality generation', critical: false },
  { id: 26, name: 'Sphere Engine', description: 'Temporal alignment', critical: false },
  { id: 27, name: 'Continental Engine', description: 'Geographic resonance', critical: false },
  { id: 28, name: 'Neural Bridge', description: 'AI model compatibility', critical: false },
  { id: 29, name: 'Quantum Validation', description: 'Pattern probability analysis', critical: false },
  { id: 30, name: 'Cosmic Resonance', description: 'Universal pattern alignment', critical: false },
  { id: 31, name: 'Final Gate', description: 'Final quality gate', critical: true }
];
