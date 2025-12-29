// mcp-tool/validation/scoring.js
// ARM score calculation algorithms

/**
 * Calculate overall ARM score from individual scores
 */
function calculateArmScore(scores) {
  const weights = {
    corridor: 0.25,
    novelty: 0.20,
    mythos: 0.15,
    shadow: 0.15,
    economic: 0.10,
    continental: 0.15
  };

  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    if (scores[key] !== undefined) {
      totalScore += scores[key] * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

/**
 * Calculate corridor authenticity score
 */
function calculateCorridorScore(content, corridor) {
  const lowerContent = content.toLowerCase();
  
  // Corridor-specific scoring (simplified)
  const corridorPatterns = {
    jamaica: ['reggae', 'dancehall', 'yard', 'bwoy', 'gal', 'mi', 'yuh', 'di'],
    stlucia: ['kweyol', 'piton', 'fete', 'annou', 'mwen'],
    uganda: ['kampala', 'matoke', 'boda', 'muziki', 'bulungi'],
    southafrica: ['ubuntu', 'mzansi', 'amanzi', 'yebo', 'township'],
    nigeria: ['naija', 'lagos', 'wahala', 'chop', 'oga'],
    senegal: ['dakar', 'mbalax', 'teranga', 'serigne', 'youssou'],
    london: ['blud', 'ends', 'roadman', 'peng', 'mandem'],
    paris: ['verlan', 'meuf', 'keuf', 'banlieue', 'chateau'],
    seoul: ['oppa', 'aegyo', 'hongdae', 'k-pop', 'fighting'],
    tokyo: ['sugoi', 'kawaii', 'senpai', 'arigatou', 'gambatte'],
    mumbai: ['bhai', 'yaar', 'bollywood', 'chai', 'paisa'],
    usa: ['lit', 'slay', 'no cap', 'bet', 'vibe'],
    colombia: ['salsa', 'parce', 'uana', 'rumba', 'farra']
  };

  const patterns = corridorPatterns[corridor] || [];
  if (patterns.length === 0) return 0.5;

  const foundPatterns = patterns.filter(pattern => 
    lowerContent.includes(pattern.toLowerCase())
  );

  return Math.min(foundPatterns.length / patterns.length + 0.3, 1.0);
}

/**
 * Calculate novelty score (uniqueness of content)
 */
function calculateNoveltyScore(content) {
  const words = content.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  
  if (wordCount < 5) return 0.5;

  // Calculate word diversity
  const uniqueWords = new Set(words);
  const diversityScore = uniqueWords.size / wordCount;

  // Check for repeated phrases
  const repeatedPhrases = [];
  for (let i = 0; i < words.length - 3; i++) {
    const phrase = words.slice(i, i + 4).join(' ');
    const remainingContent = words.slice(i + 1).join(' ');
    if (remainingContent.includes(phrase)) {
      repeatedPhrases.push(phrase);
    }
  }

  const repetitionPenalty = Math.min(repeatedPhrases.length / 10, 0.3);

  return Math.max(diversityScore - repetitionPenalty, 0);
}

/**
 * Calculate emotional alignment score
 */
function calculateEmotionalScore(content, emotionalState) {
  const emotionalPatterns = {
    hype: { positive: ['fire', 'energy', 'power', 'rise', 'dominate', 'boost'], negative: ['slow', 'calm', 'sleep'] },
    swagger: { positive: ['king', 'boss', 'top', 'best', 'legend', 'royal'], negative: ['fail', 'lose', 'weak'] },
    grief: { positive: ['lost', 'tears', 'pain', 'miss', 'gone', 'alone'], negative: ['happy', 'joy', 'celebrate'] },
    romantic: { positive: ['love', 'heart', 'baby', 'kiss', 'together', 'forever'], negative: ['hate', 'break', 'alone'] },
    rage: { positive: ['fight', 'war', 'destroy', 'hate', 'anger', 'fury'], negative: ['peace', 'calm', 'forgive'] },
    defiance: { positive: ['stand', 'rise', 'unbreakable', 'resist', 'fight', 'strong'], negative: ['surrender', 'give up', 'weak'] },
    spiritual: { positive: ['god', 'faith', 'pray', 'soul', 'divine', 'heaven'], negative: ['doubt', 'sin', 'hell'] },
    joy: { positive: ['happy', 'celebrate', 'dance', 'smile', 'light', 'fun'], negative: ['sad', 'cry', 'pain'] }
  };

  const patterns = emotionalPatterns[emotionalState];
  if (!patterns) return 0.5;

  const lowerContent = content.toLowerCase();
  const positiveCount = patterns.positive.filter(w => lowerContent.includes(w)).length;
  const negativeCount = patterns.negative.filter(w => lowerContent.includes(w)).length;

  const totalPatterns = patterns.positive.length + patterns.negative.length;
  const score = (positiveCount * 2 - negativeCount) / totalPatterns + 0.5;

  return Math.max(0, Math.min(1, score));
}

module.exports = {
  calculateArmScore,
  calculateCorridorScore,
  calculateNoveltyScore,
  calculateEmotionalScore
};
