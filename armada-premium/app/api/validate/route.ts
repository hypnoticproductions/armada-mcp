// app/api/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ValidationResult, ValidateOptions, PhaseResult } from '@/types/armada';
import { PHASE_CONFIGS, SYSTEM_CONFIG } from '@/config/corridors';

export async function POST(request: NextRequest) {
  try {
    const options: ValidateOptions = await request.json();
    
    // Validate required fields
    if (!options.content || !options.corridor) {
      return NextResponse.json(
        { error: 'Missing required fields: content and corridor are required' },
        { status: 400 }
      );
    }

    const { content, corridor, emotionalState, runPhases } = options;

    // Determine which phases to run
    const phasesToRun = runPhases && runPhases.length > 0 
      ? runPhases 
      : SYSTEM_CONFIG.keyPhases;

    const results: ValidationResult = {
      line: content,
      original: content,
      scores: {
        arm: 0,
        corridor: 0,
        novelty: 0,
        economic: 0,
        mythos: 0,
        shadow: 0,
        continental: 0
      },
      flags: [],
      phaseResults: []
    };

    // Run each phase
    for (const phaseNum of phasesToRun) {
      const startTime = Date.now();
      const phaseConfig = PHASE_CONFIGS.find(p => p.id === phaseNum);
      
      const phaseResult: PhaseResult = {
        phase: phaseNum,
        name: phaseConfig?.name || `Phase ${phaseNum}`,
        status: 'running',
        duration: 0
      };

      try {
        const phaseValidation = await runPhaseValidation(phaseNum, content, corridor, emotionalState);
        
        // Update results
        if (phaseValidation.line !== content) {
          results.line = phaseValidation.line;
        }
        
        // Merge scores
        Object.assign(results.scores, phaseValidation.scores);
        
        // Add flags
        if (phaseValidation.flags) {
          results.flags.push(...phaseValidation.flags.map(f => ({
            ...f,
            severity: f.severity as 'low' | 'medium' | 'high' | 'critical',
            type: f.type as 'novelty' | 'forbidden' | 'corridor' | 'mutation' | 'emotional' | 'governance',
            phase: phaseNum
          })));
        }

        phaseResult.status = phaseValidation.ok ? 'passed' : 'failed';
        phaseResult.score = phaseValidation.score;
        phaseResult.modifications = phaseValidation.modifications;
        
      } catch (error) {
        phaseResult.status = 'failed';
        phaseResult.error = error instanceof Error ? error.message : 'Unknown error';
      }

      phaseResult.duration = Date.now() - startTime;
      results.phaseResults.push(phaseResult);
    }

    // Calculate overall ARM score
    results.scores.arm = calculateOverallScore(results.scores);

    // Determine overall validity
    const criticalPhasesFailed = results.phaseResults
      .filter(pr => {
        const config = PHASE_CONFIGS.find(p => p.id === pr.phase);
        return config?.critical && pr.status === 'failed';
      }).length;

    const isValid = criticalPhasesFailed === 0 && results.scores.arm >= SYSTEM_CONFIG.armThreshold;

    console.log(`[ARMADA] Validated content: corridor=${corridor}, armScore=${results.scores.arm.toFixed(2)}, valid=${isValid}`);

    return NextResponse.json({
      ...results,
      valid: isValid,
      criticalFailures: criticalPhasesFailed
    });
    
  } catch (error) {
    console.error('[ARMADA] Validation error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred during validation';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function runPhaseValidation(
  phaseNum: number,
  content: string,
  corridor: string,
  emotionalState?: string
): Promise<{
  ok: boolean;
  score: number;
  line: string;
  scores: Record<string, number>;
  flags: Array<{ type: string; severity: string; message: string }>;
  modifications?: string[];
}> {
  // Simulate phase validation - in production, each phase would have specific logic
  await new Promise(resolve => setTimeout(resolve, 50)); // Simulate processing

  const flags: Array<{ type: string; severity: string; message: string }> = [];
  let modifiedLine = content;
  let score = 0.85; // Base score
  const scores: Record<string, number> = {
    arm: 0.85,
    corridor: 0.85,
    novelty: 0.85,
    economic: 0.85,
    mythos: 0.85,
    shadow: 0.85,
    continental: 0.85
  };

  // Phase-specific validation logic
  switch (phaseNum) {
    case 1: // Novelty Check
      scores.novelty = checkNovelty(content);
      if (scores.novelty < 0.7) {
        flags.push({
          type: 'novelty',
          severity: 'medium',
          message: 'Content may lack sufficient originality'
        });
      }
      break;

    case 2: // Forbidden Scanner
      const forbiddenCheck = checkForbiddenContent(content);
      scores.arm = forbiddenCheck.score;
      if (forbiddenCheck.flags.length > 0) {
        flags.push(...forbiddenCheck.flags);
        modifiedLine = forbiddenCheck.modifiedContent || content;
      }
      break;

    case 3: // Corridor Validator
      scores.corridor = checkCorridorAuthenticity(content, corridor);
      if (scores.corridor < 0.7) {
        flags.push({
          type: 'corridor',
          severity: 'medium',
          message: `Content may not fully align with ${corridor} corridor authenticity`
        });
      }
      break;

    case 4: // Mutation Detector
      // Check for unwanted pattern mutations
      scores.shadow = 0.9;
      break;

    case 5: // Emotional Scorer
      scores.mythos = checkEmotionalAlignment(content, emotionalState || 'hype');
      if (scores.mythos < 0.7) {
        flags.push({
          type: 'emotional',
          severity: 'low',
          message: 'Emotional alignment could be strengthened'
        });
      }
      break;

    case 6: // Phrase Matrix
      scores.continental = 0.88;
      break;

    case 7: // Governance Check
      scores.arm = Math.min(scores.arm, 0.95);
      break;

    case 8: // Strict Enforcer
      // Additional strict mode checks
      break;

    case 23: // Shadow Mode
      scores.shadow = 0.92;
      break;

    case 24: // Economic Engine
      scores.economic = 0.88;
      break;

    case 25: // Legion Engine
      scores.novelty = Math.max(scores.novelty, 0.85);
      break;

    case 26: // Sphere Engine
      scores.mythos = 0.90;
      break;

    case 27: // Continental Engine
      scores.continental = 0.87;
      break;

    default:
      // Unknown phase - assume passed
      break;
  }

  // Recalculate ARM score
  scores.arm = calculateOverallScore(scores);

  return {
    ok: scores.arm >= 0.7,
    score: scores.arm,
    line: modifiedLine,
    scores,
    flags,
    modifications: flags.length > 0 ? ['Content adjusted based on validation flags'] : undefined
  };
}

function checkNovelty(content: string): number {
  // Simple novelty check - check for common phrases
  const commonPhrases = ['love', 'heart', 'baby', 'girl', 'world', 'life'];
  const contentLower = content.toLowerCase();
  const phraseCount = commonPhrases.filter(p => contentLower.includes(p)).length;
  
  // Higher variety = higher novelty
  const uniqueness = Math.min(1, phraseCount / commonPhrases.length);
  
  return Math.max(0.5, 1 - (uniqueness * 0.3));
}

function checkForbiddenContent(content: string): { score: number; flags: Array<{ type: string; severity: string; message: string }>; modifiedContent?: string } {
  const forbiddenWords = [
    'lit', 'sus', 'no cap', 'on fleek', 'vibe check', 'flex', 'slay',
    'glow up', 'ghosted', 'canceled', 'periodt', 'tea', 'spill', 'yeet',
    'finna', 'bussin', 'rizz', 'sigma', 'beta', 'alpha', 'NPC', 'mid',
    'I apologize', 'As an AI', 'I cannot', 'I am an AI'
  ];

  const flags: Array<{ type: string; severity: string; message: string }> = [];
  let modifiedContent = content;

  for (const word of forbiddenWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(content)) {
      flags.push({
        type: 'forbidden',
        severity: word.includes('I am') || word.includes('I apologize') ? 'critical' : 'high',
        message: `Forbidden content detected: "${word}"`
      });
      // Remove or mask forbidden content
      modifiedContent = modifiedContent.replace(regex, '[REDACTED]');
    }
  }

  // Score based on number of violations
  const violationCount = flags.length;
  const score = Math.max(0, 1 - (violationCount * 0.2));

  return { score, flags, modifiedContent: modifiedContent !== content ? modifiedContent : undefined };
}

function checkCorridorAuthenticity(content: string, corridor: string): number {
  // Simple corridor authenticity check
  const corridorWordCounts: Record<string, string[]> = {
    jamaica: ['mi', 'yuh', 'di', 'inna', 'yard', 'bwoy', 'gal'],
    stlucia: ['mwen', 'woy', 'fete', 'kay', 'lajan', 'piton'],
    uganda: ['ndi', 'boda', 'matoke', 'muziki', 'kampala'],
    southafrica: ['yebo', 'mzansi', 'amanzi', 'ubuntu', 'gqom'],
    nigeria: ['wahala', 'oga', 'chop', 'baba', 'naija'],
    senegal: ['dara', 'xam sa', 'jamm', 'serigne', 'touba'],
    london: ['blud', 'peng', 'ends', 'roadman', 'mandem'],
    paris: ['meuf', 'keuf', 'bijou', 'daron', 'reuf'],
    seoul: ['fighting', 'oppa', 'aegyo', 'kawaii', 'gambatte'],
    tokyo: ['sugoi', 'yamete', 'senpai', 'kouhai', 'baka'],
    mumbai: ['bhai', 'yaar', 'paisa', 'dil', 'chai'],
    usa: ['lit', 'slay', 'bet', 'tea', 'vibe'],
    colombia: ['parce', 'uana', 'chimba', 'rumba', 'parcero']
  };

  const words = corridorWordCounts[corridor.toLowerCase()] || [];
  const contentLower = content.toLowerCase();
  const foundWords = words.filter(w => contentLower.includes(w.toLowerCase()));

  // Authenticity score based on presence of corridor-specific words
  const authenticity = words.length > 0 
    ? Math.min(1, (foundWords.length / words.length) * 2) // Weight corridor words more heavily
    : 0.85; // Default score for unknown corridors

  return Math.max(0.5, authenticity);
}

function checkEmotionalAlignment(content: string, emotionalState: string): number {
  // Simple emotional alignment check
  const emotionalIndicators: Record<string, string[]> = {
    hype: ['fire', 'energy', 'rush', 'adrenaline', 'body'],
    grief: ['night', 'water', 'tears', 'loss', 'ancestors'],
    romantic: ['love', 'heart', 'moonlight', 'passion', 'kiss'],
    defiance: ['stand', 'rise', 'unbreakable', 'resist', 'fight'],
    joy: ['celebration', 'dance', 'light', 'happiness', 'smile'],
    anger: ['rage', 'fight', 'destroy', 'revenge', 'heat'],
    spiritual: ['divine', 'ancestors', 'cosmic', 'prayer', 'bless'],
    resilience: ['survival', 'strength', 'persist', 'grow', 'endure']
  };

  const indicators = emotionalIndicators[emotionalState.toLowerCase()] || [];
  const contentLower = content.toLowerCase();
  const foundIndicators = indicators.filter(i => contentLower.includes(i.toLowerCase()));

  const alignment = indicators.length > 0 
    ? Math.min(1, foundIndicators.length / indicators.length)
    : 0.85;

  return Math.max(0.5, alignment);
}

function calculateOverallScore(scores: Record<string, number>): number {
  const weights: Record<string, number> = {
    arm: 0.30,
    corridor: 0.25,
    novelty: 0.15,
    economic: 0.10,
    mythos: 0.10,
    shadow: 0.05,
    continental: 0.05
  };

  let total = 0;
  let weightSum = 0;

  for (const [key, weight] of Object.entries(weights)) {
    if (scores[key] !== undefined) {
      total += scores[key] * weight;
      weightSum += weight;
    }
  }

  return weightSum > 0 ? Math.round((total / weightSum) * 100) / 100 : 0;
}
