// components/ValidationDashboard.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  Globe,
  Target,
  Search,
  Filter,
  Terminal,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { PhaseResult, ValidationFlag } from '@/types/armada';
import { PHASE_CONFIGS, SYSTEM_CONFIG } from '@/config/corridors';
import { formatDuration, getPhaseStatusColor, getSeverityColor } from '@/lib/utils';

export default function ValidationDashboard() {
  const [isValidating, setIsValidating] = useState(false);
  const [activePhase, setActivePhase] = useState<number | null>(null);
  const [phaseResults, setPhaseResults] = useState<Record<number, PhaseResult>>({});
  const [overallScore, setOverallScore] = useState(0);
  const [validationFlags, setValidationFlags] = useState<ValidationFlag[]>([]);
  const [progress, setProgress] = useState(0);
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  // Simulated real-time metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    armScore: 0.91,
    corridorAuthenticity: 0.88,
    emotionalAlignment: 0.93,
    forbiddenStructures: 0.05,
    governanceCompliance: 0.95,
    mutationRisk: 0.12,
  });

  // Demo validation run
  const runDemoValidation = () => {
    setIsValidating(true);
    setPhaseResults({});
    setValidationFlags([]);
    setOverallScore(0);
    setProgress(0);
    setConsoleOutput(['[ARMADA] Starting validation process...']);

    const phasesToRun = SYSTEM_CONFIG.keyPhases;
    let currentIndex = 0;

    const runNextPhase = () => {
      if (currentIndex >= phasesToRun.length) {
        setIsValidating(false);
        setActivePhase(null);
        setProgress(100);
        setConsoleOutput(prev => [...prev, '[ARMADA] Validation complete!', `[ARMADA] Final ARM Score: ${(0.85 + Math.random() * 0.1).toFixed(2)}`]);
        return;
      }

      const phaseNum = phasesToRun[currentIndex];
      const phaseConfig = PHASE_CONFIGS.find(p => p.id === phaseNum);
      
      setActivePhase(phaseNum);
      setProgress((currentIndex / phasesToRun.length) * 100);
      setConsoleOutput(prev => [...prev, `[ARMADA] Running ${phaseConfig?.name || `Phase ${phaseNum}`}...`]);

      // Simulate phase execution
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% pass rate
        const score = 0.7 + Math.random() * 0.3;
        
        const result: PhaseResult = {
          phase: phaseNum,
          name: phaseConfig?.name || `Phase ${phaseNum}`,
          status: success ? 'passed' : 'failed',
          score,
          duration: Math.floor(Math.random() * 500) + 100
        };

        setPhaseResults(prev => ({ ...prev, [phaseNum]: result }));
        
        if (!success) {
          setValidationFlags(prev => [...prev, {
            type: 'forbidden',
            severity: phaseConfig?.critical ? 'critical' : 'medium',
            message: `${phaseConfig?.name || `Phase ${phaseNum}`} validation failed`,
            phase: phaseNum
          }]);
          setConsoleOutput(prev => [...prev, `[WARNING] ${phaseConfig?.name || `Phase ${phaseNum}`} failed: Score ${score.toFixed(2)}`]);
        } else {
          setConsoleOutput(prev => [...prev, `[SUCCESS] ${phaseConfig?.name || `Phase ${phaseNum}`} passed: Score ${score.toFixed(2)}`]);
        }

        currentIndex++;
        runNextPhase();
      }, 800);
    };

    runNextPhase();
  };

  // Real-time metrics update simulation
  useEffect(() => {
    if (!isValidating) {
      const interval = setInterval(() => {
        setRealTimeMetrics(prev => ({
          armScore: Math.max(0.8, Math.min(0.98, prev.armScore + (Math.random() - 0.5) * 0.02)),
          corridorAuthenticity: Math.max(0.75, Math.min(0.95, prev.corridorAuthenticity + (Math.random() - 0.5) * 0.02)),
          emotionalAlignment: Math.max(0.8, Math.min(0.98, prev.emotionalAlignment + (Math.random() - 0.5) * 0.02)),
          forbiddenStructures: Math.max(0, Math.min(0.15, prev.forbiddenStructures + (Math.random() - 0.5) * 0.01)),
          governanceCompliance: Math.max(0.85, Math.min(1, prev.governanceCompliance + (Math.random() - 0.5) * 0.01)),
          mutationRisk: Math.max(0.05, Math.min(0.25, prev.mutationRisk + (Math.random() - 0.5) * 0.02)),
        }));
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isValidating]);

  // Calculate overall score from phase results
  useEffect(() => {
    const scores = Object.values(phaseResults)
      .filter(r => r.score !== undefined)
      .map(r => r.score!);
    
    if (scores.length > 0) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      setOverallScore(avg);
    }
  }, [phaseResults]);

  const radarData = [
    { metric: 'ARM Score', value: realTimeMetrics.armScore * 100 },
    { metric: 'Corridor Auth', value: realTimeMetrics.corridorAuthenticity * 100 },
    { metric: 'Emotional Align', value: realTimeMetrics.emotionalAlignment * 100 },
    { metric: 'Governance', value: realTimeMetrics.governanceCompliance * 100 },
    { metric: 'Structure Safety', value: (1 - realTimeMetrics.forbiddenStructures) * 100 },
    { metric: 'Mutation Resist', value: (1 - realTimeMetrics.mutationRisk) * 100 },
  ];

  const scoreHistory = Array.from({ length: 10 }, (_, i) => ({
    time: i,
    score: 0.7 + Math.random() * 0.25
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Validation Dashboard</h1>
            <p className="text-sm text-slate-400">Real-time ARM scoring and governance compliance</p>
          </div>
        </div>
        <Button
          onClick={runDemoValidation}
          disabled={isValidating}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isValidating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run Validation
            </>
          )}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">ARM Score</p>
                <p className={`text-2xl font-bold ${
                  realTimeMetrics.armScore >= 0.85 ? 'text-emerald-400' : 
                  realTimeMetrics.armScore >= 0.7 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {(realTimeMetrics.armScore * 100).toFixed(1)}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Corridor Auth</p>
                <p className={`text-2xl font-bold ${
                  realTimeMetrics.corridorAuthenticity >= 0.85 ? 'text-emerald-400' : 'text-yellow-400'
                }`}>
                  {(realTimeMetrics.corridorAuthenticity * 100).toFixed(1)}%
                </p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Emotional</p>
                <p className={`text-2xl font-bold ${
                  realTimeMetrics.emotionalAlignment >= 0.85 ? 'text-emerald-400' : 'text-yellow-400'
                }`}>
                  {(realTimeMetrics.emotionalAlignment * 100).toFixed(1)}%
                </p>
              </div>
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Forbidden</p>
                <p className={`text-2xl font-bold ${
                  realTimeMetrics.forbiddenStructures <= 0.1 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {(realTimeMetrics.forbiddenStructures * 100).toFixed(1)}%
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Compliance</p>
                <p className={`text-2xl font-bold ${
                  realTimeMetrics.governanceCompliance >= 0.85 ? 'text-emerald-400' : 'text-yellow-400'
                }`}>
                  {(realTimeMetrics.governanceCompliance * 100).toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Mutation Risk</p>
                <p className={`text-2xl font-bold ${
                  realTimeMetrics.mutationRisk <= 0.2 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {(realTimeMetrics.mutationRisk * 100).toFixed(1)}%
                </p>
              </div>
              <Activity className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Radar Chart */}
        <Card className="bg-slate-900/50 border-slate-800 col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              System Health Radar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#475569" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                <Radar 
                  name="Metrics" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Phase Progress */}
        <Card className="bg-slate-900/50 border-slate-800 col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Validation Progress
              </div>
              {isValidating && (
                <Badge variant="info" className="animate-pulse">
                  Running Phase {activePhase}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isValidating && (
              <div className="mb-4">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-slate-400 mt-2">
                  {Math.round(progress)}% Complete • {Object.keys(phaseResults).length}/{SYSTEM_CONFIG.keyPhases.length} phases
                </p>
              </div>
            )}

            <div className="grid grid-cols-5 gap-2 max-h-[250px] overflow-y-auto">
              {SYSTEM_CONFIG.keyPhases.map(phaseNum => {
                const result = phaseResults[phaseNum];
                const isActive = activePhase === phaseNum;
                const config = PHASE_CONFIGS.find(p => p.id === phaseNum);
                
                return (
                  <button
                    key={phaseNum}
                    onClick={() => setSelectedPhase(selectedPhase === phaseNum ? null : phaseNum)}
                    className={`
                      p-2 rounded-lg border text-center transition-all
                      ${isActive ? 'border-purple-500 bg-purple-500/20' : 
                        result?.status === 'passed' ? 'border-emerald-500/50 bg-emerald-500/10' :
                        result?.status === 'failed' ? 'border-red-500/50 bg-red-500/10' :
                        'border-slate-700 bg-slate-800/50'}
                      hover:border-slate-600
                    `}
                  >
                    <div className="text-xs font-medium text-slate-300">{phaseNum}</div>
                    <div className="mt-1">
                      {result?.status === 'passed' && <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />}
                      {result?.status === 'failed' && <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                      {isActive && <RefreshCw className="w-4 h-4 text-purple-400 mx-auto animate-spin" />}
                      {!result && !isActive && <Clock className="w-4 h-4 text-slate-500 mx-auto" />}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 truncate">
                      {config?.name.split(' ')[0] || `Phase ${phaseNum}`}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedPhase && phaseResults[selectedPhase] && (
              <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {phaseResults[selectedPhase].name}
                  </span>
                  <Badge variant={phaseResults[selectedPhase].status === 'passed' ? 'success' : 'destructive'}>
                    {phaseResults[selectedPhase].status}
                  </Badge>
                </div>
                {phaseResults[selectedPhase].score !== undefined && (
                  <p className="text-sm text-slate-400 mt-1">
                    Score: {(phaseResults[selectedPhase].score! * 100).toFixed(1)}%
                  </p>
                )}
                {phaseResults[selectedPhase].duration !== undefined && (
                  <p className="text-sm text-slate-400">
                    Duration: {formatDuration(phaseResults[selectedPhase].duration!)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Console and Flags */}
      <div className="grid grid-cols-2 gap-6">
        {/* Validation Log */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-400" />
              Validation Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="console-output h-64 overflow-y-auto space-y-1">
              {consoleOutput.length === 0 ? (
                <div className="text-slate-500 text-sm text-center py-8">
                  Run validation to see console output
                </div>
              ) : (
                consoleOutput.map((line, i) => (
                  <div 
                    key={i} 
                    className={`console-line ${
                      line.includes('[SUCCESS]') ? 'success' :
                      line.includes('[WARNING]') ? 'warning' :
                      line.includes('[ERROR]') ? 'error' : 'system'
                    }`}
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Flags */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Validation Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {validationFlags.length === 0 ? (
                <div className="text-slate-500 text-sm text-center py-8">
                  {isValidating ? 'Running validation...' : 'No validation flags detected'}
                </div>
              ) : (
                validationFlags.map((flag, i) => (
                  <Alert 
                    key={i} 
                    className={`${getSeverityColor(flag.severity)} border`}
                  >
                    <AlertDescription className="text-sm">
                      <span className="font-medium">[{flag.phase}]</span> {flag.message}
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score History */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            ARM Score History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={scoreHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="time" tick={{ fill: '#94a3b8' }} />
              <YAxis domain={[0, 1]} tick={{ fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
