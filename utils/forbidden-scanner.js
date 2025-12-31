// mcp-tool/utils/forbidden-scanner.js
// Forbidden word and structure detection

class ForbiddenScanner {
  constructor() {
    // Universal forbidden words (common across all corridors)
    this.universalForbidden = [
      'nigger', 'nigga', 'faggot', 'faggots', 'dyke', 'tranny', 'shemale',
      'cunt', 'cunts', 'fuck', 'fucker', 'fucking', 'fucked', 'fucks',
      'shit', 'shits', 'shitty', 'bullshit',
      'bitch', 'bitches', 'bitchy',
      'whore', 'whores',
      'slut', 'sluts', 'slutty',
      'rape', 'rapist', 'raped',
      'kill', 'kills', 'killing', 'killed', 'murder', 'murderer', 'murders',
      'terrorist', 'terrorism',
      'child abuse', 'pedophile', 'pedophiles', 'child porn',
      'drug recipe', 'bomb recipe', 'weapon manufacture'
    ];

    // Corridor-specific mappings
    this.corridorForbiddenMappings = {
      jamaica: ['me ', 'you ', 'the ', ' in ', ' is ', ' are '], // Standard English forbidden in patois context
      stlucia: ['I ', 'party', 'house', 'money'], // Too generic
      uganda: ['I am', 'bike', 'banana'], // Context-specific
      southafrica: ['yes ', 'south africa', 'water'], // Too literal
      nigeria: ['sorry', 'please', 'thank you'], // Too polite
      senegal: ['hello', 'goodbye'], // Too formal
      london: ['please', 'thank you', 'sorry'], // Too polite for street
      paris: ['hello', 'goodbye'], // Too formal
      seoul: ['hello', 'goodbye'], // Too formal
      tokyo: ['please', 'thank you'], // Overly polite
      mumbai: ['please', 'thank you', 'excuse me'], // Too formal
      usa: ['please', 'thank you', 'sorry'], // Too polite
      colombia: ['please', 'thank you', 'excuse me'] // Too formal
    };
  }

  /**
   * Escape special regex characters to prevent injection
   */
  escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Scan content for forbidden words
   */
  scan(content, corridor = 'general') {
    const lowerContent = content.toLowerCase();
    const flags = [];
    let cleanedContent = content;

    // Check universal forbidden words
    for (const word of this.universalForbidden) {
      if (lowerContent.includes(word)) {
        flags.push({
          severity: 'critical',
          type: 'forbidden',
          message: `Universal forbidden word detected: "${word}"`,
          word: word,
          lineNumber: this.findLineNumber(content, word)
        });

        // Remove or mask the word (escape special regex characters)
        const escapedWord = this.escapeRegex(word);
        cleanedContent = cleanedContent.replace(new RegExp(escapedWord, 'gi'), '█'.repeat(word.length));
      }
    }

    // Check corridor-specific forbidden
    const corridorForbidden = this.corridorForbiddenMappings[corridor] || [];
    for (const word of corridorForbidden) {
      if (lowerContent.includes(word.toLowerCase())) {
        // Only flag if it appears to be the main language (not code-switching)
        // Escape special regex characters to prevent injection
        const escapedWord = this.escapeRegex(word.trim());
        const pattern = new RegExp(`\\b${escapedWord}\\b`, 'i');
        if (pattern.test(lowerContent)) {
          flags.push({
            severity: 'high',
            type: 'forbidden',
            message: `Corridor-inappropriate word for ${corridor}: "${word}"`,
            word: word,
            lineNumber: this.findLineNumber(content, word)
          });
        }
      }
    }

    // Check for structure issues
    const structureIssues = this.checkStructure(content);
    flags.push(...structureIssues.flags);

    return {
      clean: flags.filter(f => f.severity === 'critical').length === 0,
      flags,
      cleanedContent: cleanedContent !== content ? cleanedContent : null,
      suggestions: this.generateSuggestions(flags)
    };
  }

  /**
   * Check for structural issues
   */
  checkStructure(content) {
    const flags = [];
    const lines = content.split('\n');
    
    // Check for empty lines
    const emptyLineCount = lines.filter(line => line.trim().length === 0).length;
    if (emptyLineCount > lines.length * 0.3) {
      flags.push({
        severity: 'low',
        type: 'structure',
        message: 'High percentage of empty lines detected'
      });
    }

    // Check for very short content
    if (content.length < 50) {
      flags.push({
        severity: 'medium',
        type: 'structure',
        message: 'Content is very short - may lack sufficient detail'
      });
    }

    // Check for all caps (shouting)
    const words = content.split(/\s+/);
    const capsWords = words.filter(word => /^[^a-z]*[A-Z]{3,}[^a-z]*$/.test(word));
    if (capsWords.length > words.length * 0.3) {
      flags.push({
        severity: 'low',
        type: 'structure',
        message: 'Excessive use of capital letters detected'
      });
    }

    return { flags };
  }

  /**
   * Generate suggestions for fixing issues
   */
  generateSuggestions(flags) {
    const suggestions = [];

    for (const flag of flags) {
      switch (flag.type) {
        case 'forbidden':
          if (flag.severity === 'critical') {
            suggestions.push(`Remove or replace the forbidden word: "${flag.word}"`);
          } else {
            suggestions.push(`Consider using more culturally appropriate language for ${flag.message.split('for ')[1] || 'this context'}`);
          }
          break;
        case 'structure':
          suggestions.push(`Review content structure - ${flag.message.toLowerCase()}`);
          break;
        default:
          suggestions.push(`Review content for ${flag.type} issues`);
      }
    }

    return suggestions;
  }

  /**
   * Find line number of a word in content
   */
  findLineNumber(content, word) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(word.toLowerCase())) {
        return i + 1;
      }
    }
    return null;
  }

  /**
   * Add custom forbidden words for a corridor
   */
  addCorridorForbidden(corridor, words) {
    if (!this.corridorForbiddenMappings[corridor]) {
      this.corridorForbiddenMappings[corridor] = [];
    }
    this.corridorForbiddenMappings[corridor].push(...words);
  }

  /**
   * Remove a forbidden word from a corridor
   */
  removeCorridorForbidden(corridor, word) {
    if (this.corridorForbiddenMappings[corridor]) {
      this.corridorForbiddenMappings[corridor] = 
        this.corridorForbiddenMappings[corridor].filter(w => w !== word);
    }
  }
}

module.exports = ForbiddenScanner;
