// components/SongGenerator.tsx

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Music, 
  Play, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Loader2, 
  AlertTriangle,
  Zap,
  Globe,
  Heart,
  Settings
} from 'lucide-react';
import { SongRequest, SongResponse, Corridor, EmotionalState } from '@/types/armada';
import { CORRIDORS, EMOTIONAL_STATES } from '@/config/corridors';

export default function SongGenerator() {
  const [request, setRequest] = useState<SongRequest>({
    prompt: '',
    corridor: 'jamaica',
    emotionalState: 'hype',
    bpm: 140,
    genre: 'dancehall',
    strictMode: true,
    hybridMode: false,
    secondaryCorridor: 'nigeria'
  });
  
  const [response, setResponse] = useState<SongResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateSong = async () => {
    if (!request.prompt.trim()) {
      setError('Please enter a creative prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await res.json();
      setResponse(data);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate song');
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = () => {
    if (!response) return;
    
    const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${response.title.replace(/\s+/g, '_')}_armada.json`;
    a.click();
  };

  const exportToSuno = () => {
    if (!response) return;
    
    const sunoFormat = response.sections.map(section => {
      return `[${section.type.toUpperCase()}]\n${section.lyrics}\n\n[Delivery: ${section.delivery}]\n`;
    }).join('\n');
    
    const blob = new Blob([sunoFormat], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${response.title.replace(/\s+/g, '_')}_suno.txt`;
    a.click();
  };

  const copyToClipboard = () => {
    if (!response) return;
    
    const text = response.sections.map(s => s.lyrics).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerate = () => {
    generateSong();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Song Generation Engine</h1>
            <p className="text-sm text-slate-400">Create culturally authentic songs with ARM ≥0.85</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Generation Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Prompt Input */}
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Creative Prompt
              </label>
              <Textarea
                value={request.prompt}
                onChange={(e) => setRequest({...request, prompt: e.target.value})}
                placeholder="Describe your song concept, theme, or story..."
                className="min-h-[100px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Corridor Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">
                  Primary Corridor
                </label>
                <Select
                  value={request.corridor}
                  onValueChange={(value) => setRequest({...request, corridor: value as Corridor})}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CORRIDORS).map(corridor => (
                      <SelectItem key={corridor} value={corridor}>
                        {CORRIDORS[corridor as Corridor].name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Emotional State */}
              <div>
                <label className="text-sm font-medium text-slate-400 mb-2 block">
                  Emotional State
                </label>
                <Select
                  value={request.emotionalState}
                  onValueChange={(value) => setRequest({...request, emotionalState: value as EmotionalState})}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(EMOTIONAL_STATES).map(state => (
                      <SelectItem key={state} value={state}>
                        {state.charAt(0).toUpperCase() + state.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* BPM Slider */}
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                BPM: {request.bpm}
              </label>
              <Slider
                value={[request.bpm]}
                onValueChange={(value) => setRequest({...request, bpm: value[0]})}
                min={60}
                max={200}
                step={5}
                className="py-2"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Slow (60)</span>
                <span>Medium (120)</span>
                <span>Fast (200)</span>
              </div>
            </div>

            {/* Hybrid Mode Toggle */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hybridMode"
                  checked={request.hybridMode}
                  onChange={(e) => setRequest({...request, hybridMode: e.target.checked})}
                  className="rounded bg-slate-800 border-slate-700"
                />
                <label htmlFor="hybridMode" className="text-sm text-slate-300">
                  Hybrid Mode
                </label>
              </div>

              {request.hybridMode && (
                <Select
                  value={request.secondaryCorridor}
                  onValueChange={(value) => setRequest({...request, secondaryCorridor: value as Corridor})}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 w-40">
                    <SelectValue placeholder="Secondary" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CORRIDORS)
                      .filter(c => c !== request.corridor)
                      .map(corridor => (
                        <SelectItem key={corridor} value={corridor}>
                          {CORRIDORS[corridor as Corridor].name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="checkbox"
                  id="strictMode"
                  checked={request.strictMode}
                  onChange={(e) => setRequest({...request, strictMode: e.target.checked})}
                  className="rounded bg-slate-800 border-slate-700"
                />
                <label htmlFor="strictMode" className="text-sm text-slate-300">
                  Strict Mode (≥0.85)
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={generateSong}
              disabled={loading || !request.prompt.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Generate Song
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Output Panel */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Generated Output
              </div>
              {response && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={exportToSuno}>
                    <Download className="w-3 h-3 mr-1" />
                    Suno
                  </Button>
                  <Button size="sm" variant="outline" onClick={exportToJSON}>
                    <Download className="w-3 h-3 mr-1" />
                    JSON
                  </Button>
                  <Button size="sm" variant="outline" onClick={copyToClipboard}>
                    {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loading && (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Building prompt...</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-1" />
                </div>
              </div>
            )}

            {response && !loading && (
              <>
                {/* Score Badge */}
                <div className="flex items-center gap-4">
                  <Badge 
                    variant={response.overallArmScore >= 0.85 ? 'success' : 'warning'}
                    className="text-lg px-4 py-2"
                  >
                    ARM: {response.overallArmScore.toFixed(2)}
                  </Badge>
                  <Badge variant="info" className="px-4 py-2">
                    Corridor: {response.metadata.corridor}
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2">
                    {response.metadata.bpm} BPM
                  </Badge>
                </div>

                {/* Song Title */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-xl font-bold text-white">{response.title}</h3>
                  <p className="text-sm text-slate-400">
                    Generated {new Date(response.metadata.generatedAt).toLocaleString()}
                  </p>
                </div>

                {/* Song Sections */}
                <Tabs defaultValue="lyrics" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="lyrics">Lyrics</TabsTrigger>
                    <TabsTrigger value="delivery">Delivery Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="lyrics" className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
                    {response.sections.map((section, i) => (
                      <div key={i} className="bg-slate-800/30 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-purple-400 capitalize">
                            {section.type}
                          </h4>
                          <Badge 
                            variant={section.armScore >= 0.85 ? 'success' : 'warning'}
                            className="text-xs"
                          >
                            ARM: {section.armScore.toFixed(2)}
                          </Badge>
                        </div>
                        <pre className="whitespace-pre-wrap text-sm font-mono text-slate-300">
                          {section.lyrics}
                        </pre>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="delivery" className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
                    {response.sections.map((section, i) => (
                      <div key={i} className="bg-slate-800/30 rounded-lg p-4 space-y-2">
                        <h4 className="text-sm font-semibold text-purple-400 capitalize">
                          {section.type}
                        </h4>
                        <p className="text-sm text-slate-300">{section.delivery}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>

                {/* Validation Flags */}
                {response.validationFlags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-400">Validation Flags</h4>
                    {response.validationFlags.map((flag, i) => (
                      <Alert 
                        key={i} 
                        className={
                          flag.severity === 'critical' ? 'border-red-500/50 bg-red-500/10' :
                          flag.severity === 'high' ? 'border-orange-500/50 bg-orange-500/10' :
                          flag.severity === 'medium' ? 'border-yellow-500/50 bg-yellow-500/10' :
                          'border-blue-500/50 bg-blue-500/10'
                        }
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          [{flag.type.toUpperCase()}] {flag.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {/* Regenerate Button */}
                <Button onClick={regenerate} variant="outline" className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </>
            )}

            {!response && !loading && !error && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                  <Music className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Song Generated</h3>
                <p className="text-sm text-slate-400 max-w-sm">
                  Enter a creative prompt and click "Generate Song" to create your first ARMADA composition.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
