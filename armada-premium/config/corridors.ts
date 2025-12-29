// config/corridors.ts

import { CorridorConfig, EmotionalConfig, Corridor } from '@/types/armada';

export const CORRIDORS: Record<Corridor, CorridorConfig> = {
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
    culturalAnchors: ['lagos streets', 'afrobeats', 'hustle culture', 'oil wealth', ' Nollywood', 'marketplaces']
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
    culturalAnchors: ['east london', 'grime scene', 'multicultural melting pot', 'tube', 'estate life', ' postcode wars']
  },
  paris: {
    name: 'Paris',
    language: 'French with verlan',
    emotionalTone: 'Chic, revolutionary, poetic',
    keyPhrases: ['meuf', 'keuf', 'mektoub', 'bijour', 'keum', 'daron', 'reuf', 'frerot', 'familia'],
    forbiddenWords: ['hello', 'goodbye'],
    armThreshold: 0.85,
    culturalAnchors: ['banlieue', 'verlan slang', 'château', 'metro', 'cafe culture', 'revolutionary spirit']
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
    keyPhrases: ['bhai', 'yaar', 'paisa', 'dil', 'zonak', ' Masti', 'jhol', 'tapri', 'chai', 'poha'],
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
    keyPhrases: [' parce', 'uana', 'chimba', 'dar la pela', 'rumba', 'parcero', 'la caneca', 'farra'],
    forbiddenWords: ['please', 'thank you', 'excuse me'],
    armThreshold: 0.85,
    culturalAnchors: ['salsa', 'coffee region', 'cartagena', 'bogota', 'paisa culture', 'football passion']
  }
};

export const EMOTIONAL_STATES: Record<string, EmotionalConfig> = {
  hype: {
    syllablePattern: '4-8 bursts',
    pacing: 'fast',
    vowels: 'short/clipped',
    fields: ['fire', 'body', 'energy surges', 'adrenaline']
  },
  swagger: {
    syllablePattern: '5-9 deliberate',
    pacing: 'moderate',
    vowels: 'rich/emphasized',
    fields: ['confidence', 'style', 'dominance', 'cool']
  },
  grief: {
    syllablePattern: '8-12 sustained pours',
    pacing: 'slow',
    vowels: 'long/open',
    fields: ['night', 'water (tears)', 'ancestors', 'loss']
  },
  romantic: {
    syllablePattern: '6-10 flowing',
    pacing: 'moderate',
    vowels: 'soft/musical',
    fields: ['love', 'heart', 'moonlight', 'passion']
  },
  rage: {
    syllablePattern: '5-9 punches',
    pacing: 'fast',
    vowels: 'hard/sharp',
    fields: ['anger', 'fight', 'destruction', 'revenge']
  },
  defiance: {
    syllablePattern: '6-10 strong statements',
    pacing: 'medium-fast',
    vowels: 'mixed',
    fields: ['stand', 'rise', 'unbreakable', 'resistance']
  },
  spiritual: {
    syllablePattern: '7-11 transcendent',
    pacing: 'slow-moderate',
    vowels: 'open/expansive',
    fields: ['divine', 'ancestors', 'cosmic', 'prayer']
  },
  joy: {
    syllablePattern: '5-9 celebrations',
    pacing: 'moderate-fast',
    vowels: 'bright/open',
    fields: ['celebration', 'dance', 'light', 'happiness']
  },
  pride: {
    syllablePattern: '6-10 declarations',
    pacing: 'moderate',
    vowels: 'full/strong',
    fields: ['heritage', 'triumph', 'identity', 'honor']
  },
  resilience: {
    syllablePattern: '7-12 endurance',
    pacing: 'moderate',
    vowels: 'sustained',
    fields: ['survival', 'strength', 'persistence', 'growth']
  },
  melancholy: {
    syllablePattern: '8-12 reflective',
    pacing: 'slow',
    vowels: 'warm/sad',
    fields: ['nostalgia', 'what if', 'memory', 'soft pain']
  },
  nostalgia: {
    syllablePattern: '7-11 memory-focused',
    pacing: 'moderate',
    vowels: 'warm/faded',
    fields: ['past', 'memories', 'childhood', 'golden days']
  },
  euphoria: {
    syllablePattern: '4-8 peaks',
    pacing: 'fast',
    vowels: 'bright/expansive',
    fields: ['peak', 'rush', 'pure joy', 'transcendence']
  },
  sorrow: {
    syllablePattern: '8-12 deep',
    pacing: 'slow',
    vowels: 'dark/hollow',
    fields: ['pain', 'void', 'absence', 'grief']
  },
  anger: {
    syllablePattern: '5-9 intense',
    pacing: 'fast',
    vowels: 'hard/staccato',
    fields: ['rage', 'injustice', 'burst', 'heat']
  },
  fear: {
    syllablePattern: '6-10 uncertain',
    pacing: 'variable',
    vowels: 'tight/restricted',
    fields: ['darkness', 'uncertainty', 'threat', 'vulnerability']
  },
  tenderness: {
    syllablePattern: '6-10 gentle',
    pacing: 'slow',
    vowels: 'soft/round',
    fields: ['touch', 'care', 'warmth', 'softness']
  },
  excitement: {
    syllablePattern: '4-8 rapid',
    pacing: 'fast',
    vowels: 'short/bright',
    fields: ['anticipation', 'energy', 'thrill', 'rush']
  },
  relaxation: {
    syllablePattern: '7-11 calm',
    pacing: 'slow',
    vowels: 'smooth/flowing',
    fields: ['peace', 'ease', 'comfort', 'serenity']
  },
  energy: {
    syllablePattern: '4-8 dynamic',
    pacing: 'fast',
    vowels: 'powerful/varied',
    fields: ['power', 'movement', 'drive', 'vitality']
  },
  contemplation: {
    syllablePattern: '8-12 meditative',
    pacing: 'slow',
    vowels: 'open/reflective',
    fields: ['thought', 'depth', 'question', 'insight']
  },
  triumph: {
    syllablePattern: '5-9 victorious',
    pacing: 'moderate-fast',
    vowels: 'full/announcing',
    fields: ['victory', 'conquest', 'glory', 'success']
  },
  introspection: {
    syllablePattern: '8-12 inner-focused',
    pacing: 'slow',
    vowels: 'intimate/deep',
    fields: ['self', 'inner world', 'reflection', 'identity']
  },
  rebellion: {
    syllablePattern: '5-9 challenging',
    pacing: 'moderate-fast',
    vowels: 'sharp/declaring',
    fields: ['against', 'change', 'authority', 'freedom']
  },
  serenity: {
    syllablePattern: '7-11 peaceful',
    pacing: 'slow',
    vowels: 'pure/clear',
    fields: ['tranquility', 'balance', 'harmony', 'peace']
  },
  vibrancy: {
    syllablePattern: '5-9 alive',
    pacing: 'moderate',
    vowels: 'colorful/rich',
    fields: ['color', 'life', 'richness', 'vitality']
  },
  darkness: {
    syllablePattern: '6-10 shadow',
    pacing: 'moderate-slow',
    vowels: 'deep/obscure',
    fields: ['shadow', 'void', 'mystery', 'depth']
  },
  passion: {
    syllablePattern: '5-9 intense',
    pacing: 'moderate-fast',
    vowels: 'burning/strong',
    fields: ['fire', 'desire', 'intensity', 'commitment']
  },
  somberness: {
    syllablePattern: '8-12 subdued',
    pacing: 'slow',
    vowels: 'muted/quiet',
    fields: ['gloom', 'reverence', 'solemnity', 'reflection']
  },
  suspense: {
    syllablePattern: '6-10 tension',
    pacing: 'variable',
    vowels: 'tight/anticipating',
    fields: ['tension', 'unknown', 'build', 'anticipation']
  }
};

export const PHASE_CONFIGS = [
  { id: 1, name: 'Novelty Check', description: 'Ensure content originality', critical: true },
  { id: 2, name: 'Forbidden Scanner', description: 'Detect prohibited content', critical: true },
  { id: 3, name: 'Corridor Validator', description: 'Verify cultural authenticity', critical: true },
  { id: 4, name: 'Mutation Detector', description: 'Identify pattern mutations', critical: false },
  { id: 5, name: 'Emotional Scorer', description: 'Measure emotional alignment', critical: false },
  { id: 6, name: 'Phrase Matrix', description: 'Analyze phrase structures', critical: false },
  { id: 7, name: 'Governance Check', description: 'Validate governance compliance', critical: true },
  { id: 8, name: 'Strict Enforcer', description: 'Enforce strict mode rules', critical: false },
  { id: 23, name: 'Shadow Mode', description: 'Anti-detection patterns', critical: false },
  { id: 24, name: 'Economic Engine', description: 'Revenue optimization', critical: false },
  { id: 25, name: 'Legion Engine', description: 'Multi-personality generation', critical: false },
  { id: 26, name: 'Sphere Engine', description: 'Temporal alignment', critical: false },
  { id: 27, name: 'Continental Engine', description: 'Geographic resonance', critical: false },
],

export const SYSTEM_CONFIG = {
  armThreshold: 0.85,
  maxRetries: 3,
  timeout: 30000,
  enableAllPhases: false,
  keyPhases: [1, 2, 3, 4, 5, 23, 24, 25, 26, 27]
};
