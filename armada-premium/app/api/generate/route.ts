// app/api/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { buildSongPrompt, buildHybridPrompt } from '@/lib/prompts/song-generation';
import { callClaude } from '@/lib/claude';
import { SongRequest, SongResponse } from '@/types/armada';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const songRequest: SongRequest = await request.json();
    
    // Validate required fields
    if (!songRequest.prompt || !songRequest.corridor || !songRequest.emotionalState) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, corridor, and emotionalState are required' },
        { status: 400 }
      );
    }

    // Build the prompt
    let prompt: string;
    if (songRequest.hybridMode && songRequest.secondaryCorridor) {
      prompt = buildHybridPrompt(
        songRequest.corridor as any,
        songRequest.secondaryCorridor,
        songRequest.emotionalState,
        songRequest.bpm,
        songRequest.prompt
      );
    } else {
      prompt = buildSongPrompt(songRequest);
    }

    // Call Claude API
    const claudeResponse = await callClaude({
      systemPrompt: 'You are the ARMADA Song Engine. You respond ONLY in valid JSON format. No markdown, no code blocks, no explanations. Just raw JSON.',
      userPrompt: prompt,
      maxTokens: 4096,
      temperature: 0.7
    });

    // Parse Claude's response
    let songData: SongResponse;
    try {
      // Try to parse directly
      songData = JSON.parse(claudeResponse.content);
      
      // Ensure required fields
      if (!songData.title || !songData.sections || !Array.isArray(songData.sections)) {
        throw new Error('Invalid response structure from Claude');
      }
      
      // Add missing fields if needed
      songData.id = songData.id || uuidv4();
      songData.overallArmScore = songData.overallArmScore || calculateAverageArmScore(songData.sections);
      songData.validationFlags = songData.validationFlags || [];
      songData.metadata = songData.metadata || {
        bpm: songRequest.bpm,
        genre: songRequest.genre || 'auto-detected',
        corridor: songRequest.corridor,
        emotionalState: songRequest.emotionalState,
        generatedAt: new Date().toISOString()
      };
      
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      
      // Try to extract JSON from response
      const jsonMatch = claudeResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          songData = JSON.parse(jsonMatch[0]);
        } catch {
          return NextResponse.json(
            { error: 'Failed to parse Claude response as valid JSON' },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'No valid JSON found in Claude response' },
          { status: 500 }
        );
      }
    }

    // Calculate scores
    const overallArmScore = songData.overallArmScore || calculateAverageArmScore(songData.sections);
    const corridorScore = calculateCorridorScore(songData, songRequest.corridor);

    // Prepare response
    const response: SongResponse = {
      ...songData,
      id: songData.id || uuidv4(),
      overallArmScore,
      corridorScore,
      validationFlags: songData.validationFlags || [],
      phaseResults: songData.phaseResults || [],
      metadata: {
        ...songData.metadata,
        bpm: songRequest.bpm,
        genre: songData.metadata?.genre || 'auto-detected',
        corridor: songRequest.corridor,
        emotionalState: songRequest.emotionalState,
        generatedAt: new Date().toISOString()
      }
    };

    // Check if regeneration is needed in strict mode
    if (songRequest.strictMode && overallArmScore < 0.85) {
      // Add a hint for regeneration
      response.metadata = {
        ...response.metadata,
        _regenerate: true,
        _previousScore: overallArmScore,
        _message: `Score ${overallArmScore.toFixed(2)} below threshold 0.85. Consider regenerating with adjusted parameters.`
      };
    }

    console.log(`[ARMADA] Generated song: corridor=${songRequest.corridor}, armScore=${overallArmScore.toFixed(2)}`);

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[ARMADA] Generate error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred during song generation';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

function calculateAverageArmScore(sections: Array<{ armScore: number }>): number {
  if (!sections.length) return 0;
  const total = sections.reduce((sum, section) => sum + (section.armScore || 0), 0);
  return Math.round((total / sections.length) * 100) / 100;
}

function calculateCorridorScore(songData: SongResponse, corridor: string): number {
  // Simple corridor score calculation based on corridor-specific markers
  const allLyrics = songData.sections.map(s => s.lyrics).join(' ').toLowerCase();
  
  // This would be more sophisticated in production
  // For now, just return the overall ARM score as a proxy
  return songData.overallArmScore || 0.85;
}
