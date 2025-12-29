// mcp-tool/corridors/config.js
// Cultural corridor configurations for validation

module.exports = {
  jamaica: {
    name: 'Jamaica',
    language: 'Jamaican Patois',
    emotionalTone: 'Bold and rhythmic, defiance with humor',
    keyPhrases: ['mi', 'yuh', 'di', 'inna', 'yard', 'bwoy', 'gal', 'pickney', 'ungry', 'wah'],
    forbiddenWords: ['me', 'you', 'the', 'in', 'is', 'are'],
    armThreshold: 0.85,
    culturalAnchors: ['zinc roof', 'duppy', 'lion', 'chain-break', 'reggae', 'dancehall', 'streets of Kingston', 'sea', 'sun']
  },
  stlucia: {
    name: 'St. Lucia',
    language: 'Kwéyòl-English',
    emotionalTone: 'Celebratory yet introspective',
    keyPhrases: ['mwen', 'woy', 'fete', 'kay', 'lajan', 'piton', 'annou', 'si', 'tjen', 'dlo'],
    forbiddenWords: ['I', 'party', 'house', 'money'],
    armThreshold: 0.85,
    culturalAnchors: ['pitons', 'carnival', 'sea-salt', 'plantation houses', 'French colonial heritage', 'jounen kweyol']
  },
  uganda: {
    name: 'Uganda',
    language: 'Luganda-English',
    emotionalTone: 'Resilient and communal',
    keyPhrases: ['ndi', 'boda', 'matoke', 'muziki', 'mabasa', 'ekiboneza', 'ensonga', 'museveni', 'kampala', 'bulungi'],
    forbiddenWords: ['I am', 'bike', 'banana'],
    armThreshold: 0.85,
    culturalAnchors: ['kampala streets', 'boda boda', 'matoke market', 'traditional drums', 'church community', 'hospitality']
  },
  southafrica: {
    name: 'South Africa',
    language: 'Mixed (Zulu/Xhosa/English)',
    emotionalTone: 'Unity in diversity, struggle and triumph',
    keyPhrases: ['yebo', 'mzansi', 'amanzi', 'ubuntu', 'gqom', 'tsotsi', 'letho', 'sies', 'hai'],
    forbiddenWords: ['yes', 'south africa', 'water'],
    armThreshold: 0.85,
    culturalAnchors: ['ubuntu philosophy', 'township energy', 'struggle history', 'rainbow nation', 'shosholoza', 'soweto']
  },
  nigeria: {
    name: 'Nigeria',
    language: 'Nigerian Pidgin-English',
    emotionalTone: 'Ambitious, vibrant, hustler mentality',
    keyPhrases: ['wahala', 'oga', 'baba', 'chop', 'money', 'billionaire', 'naija', 'jam', 'palava', 'toto'],
    forbiddenWords: ['sorry', 'please', 'thank you'],
    armThreshold: 0.85,
    culturalAnchors: ['lagos streets', 'afrobeats', 'hustle culture', 'oil wealth', 'Nollywood', 'marketplaces']
  },
  senegal: {
    name: 'Senegal',
    language: 'Wolof-French',
    emotionalTone: 'Mbalax rhythm, spiritual depth',
    keyPhrases: ['dara', 'xam sa', 'ngi', 'tay', 'jamm', 'serigne', 'marabout', 'touba', 'youssou'],
    forbiddenWords: ['hello', 'goodbye'],
    armThreshold: 0.85,
    culturalAnchors: ['mbalax rhythm', 'sufi spirituality', 'teranga hospitality', 'dakar streets', 'youssou ndour']
  },
  london: {
    name: 'London',
    language: 'Multicultural London English',
    emotionalTone: 'Streetwise, diverse, grime-influenced',
    keyPhrases: ['blud', 'peng', 'ends', 'roadman', 'mandem', 'safe', 'wha', 'g', 'braps', 'p'],
    forbiddenWords: ['please', 'thank you', 'sorry'],
    armThreshold: 0.85,
    culturalAnchors: ['east london', 'grime scene', 'multicultural melting pot', 'tube', 'estate life', 'postcode wars']
  },
  paris: {
    name: 'Paris',
    language: 'French with verlan',
    emotionalTone: 'Chic, revolutionary, poetic',
    keyPhrases: ['meuf', 'keuf', 'mektoub', 'bijour', 'keum', 'daron', 'reuf', 'frerot', 'familia'],
    forbiddenWords: ['hello', 'goodbye'],
    armThreshold: 0.85,
    culturalAnchors: ['banlieue', 'verlan slang', 'chateau', 'metro', 'cafe culture', 'revolutionary spirit']
  },
  seoul: {
    name: 'Seoul',
    language: 'Korean with Konglish',
    emotionalTone: 'K-pop energy, competitive, passionate',
    keyPhrases: ['fighting', 'oppa', 'sunbaenim', 'aegyo', 'dope', 'sasaeng', 'bias', 'stan', 'fancam'],
    forbiddenWords: ['hello', 'goodbye'],
    armThreshold: 0.85,
    culturalAnchors: ['hongdae', 'k-pop industry', 'han river', 'pc bang', 'skincare', 'instant noodles']
  },
  tokyo: {
    name: 'Tokyo',
    language: 'Japanese with English borrowings',
    emotionalTone: 'Hyper-modern, otaku culture, detail-obsessed',
    keyPhrases: ['sugoi', 'kawaii', 'yamete', 'gambatte', 'senpai', 'kouhai', 'baka', 'arigatou', 'yatta'],
    forbiddenWords: ['please', 'thank you'],
    armThreshold: 0.85,
    culturalAnchors: ['shibuya crossing', 'akihabara', 'harajuku', 'train stations', 'convenience stores', 'anime culture']
  },
  mumbai: {
    name: 'Mumbai',
    language: 'Hinglish',
    emotionalTone: 'Film-star glamour, hustle, spiritual contrast',
    keyPhrases: ['bhai', 'yaar', 'paisa', 'dil', 'zonak', 'masti', 'jhol', 'tapri', 'chai', 'poha'],
    forbiddenWords: ['please', 'thank you', 'excuse me'],
    armThreshold: 0.85,
    culturalAnchors: ['bollywood', 'dharavi', 'marine drive', 'vada pav', 'local train', 'film city', 'ganesh chaturthi']
  },
  usa: {
    name: 'USA',
    language: 'American English',
    emotionalTone: 'Confident, diverse, aspirational',
    keyPhrases: ['lit', 'slay', 'no cap', 'bet', 'fr', 'tea', 'vibe', 'goated', 'W', 'ratio'],
    forbiddenWords: ['please', 'thank you', 'sorry'],
    armThreshold: 0.85,
    culturalAnchors: ['highway', 'suburbs', 'hip-hop culture', 'social media', 'entrepreneurship', 'american dream']
  },
  colombia: {
    name: 'Colombia',
    language: 'Colombian Spanish-English',
    emotionalTone: 'Warm, rhythmic, proud',
    keyPhrases: ['parce', 'uana', 'chimba', 'dar la pela', 'rumba', 'parcero', 'la caneca', 'farra'],
    forbiddenWords: ['please', 'thank you', 'excuse me'],
    armThreshold: 0.85,
    culturalAnchors: ['salsa', 'coffee region', 'cartagena', 'bogota', 'paisa culture', 'football passion']
  }
};
