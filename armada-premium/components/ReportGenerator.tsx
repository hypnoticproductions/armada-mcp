// components/ReportGenerator.tsx

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  Users, 
  Globe, 
  Activity,
  DollarSign,
  BarChart3,
  Network,
  Loader2,
  RefreshCw,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  PieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { CulturalReport, Corridor } from '@/types/armada';
import { CORRIDORS } from '@/config/corridors';

export default function ReportGenerator() {
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor>('jamaica');
  const [reportType, setReportType] = useState<'ili' | 'diffusion' | 'intervention' | 'comprehensive'>('comprehensive');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CulturalReport | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setHasGenerated(true);

    // Simulate API call
    setTimeout(() => {
      setReport({
        id: `report-${Date.now()}`,
        corridor: selectedCorridor,
        metrics: {
          ili: 72 + Math.floor(Math.random() * 20),
          cps: 0.65 + Math.random() * 0.25,
          bfi: 0.35 + Math.random() * 0.35,
          ncb: 0.55 + Math.random() * 0.35,
          corridorHarmonization: 0.75 + Math.random() * 0.2
        },
        recommendations: [
          `Partner with ${CORRIDORS[selectedCorridor].name} community organizations (ILI: 85+) for initial rollout`,
          'Deploy transport vouchers to address high BFI barriers',
          'Leverage diaspora bridge nodes for rapid content diffusion',
          `Time interventions for peak ${selectedCorridor} engagement windows`
        ],
        insights: [
          `Strong institutional trust in ${CORRIDORS[selectedCorridor].name} cultural institutions`,
          'High barrier friction due to access costs',
          `Diaspora networks show 3x amplification potential for ${selectedCorridor} content`,
          'Youth cohort shows highest compliance propensity for this corridor'
        ],
        generatedAt: new Date().toISOString()
      });
      setLoading(false);
    }, 2000);
  };

  const diffusionData = [
    { week: 'W1', origin: 100, diaspora1: 20, diaspora2: 15, diaspora3: 10 },
    { week: 'W2', origin: 150, diaspora1: 45, diaspora2: 30, diaspora3: 25 },
    { week: 'W3', origin: 220, diaspora1: 80, diaspora2: 65, diaspora3: 55 },
    { week: 'W4', origin: 300, diaspora1: 150, diaspora2: 120, diaspora3: 100 },
    { week: 'W5', origin: 380, diaspora1: 220, diaspora2: 180, diaspora3: 160 },
    { week: 'W6', origin: 450, diaspora1: 300, diaspora2: 250, diaspora3: 220 },
  ];

  const institutionData = [
    { name: 'Religious', ili: 85, members: 45000 },
    { name: 'Education', ili: 72, members: 32000 },
    { name: 'Cultural', ili: 88, members: 15000 },
    { name: 'Diaspora', ili: 78, members: 12000 },
    { name: 'Business', ili: 68, members: 8000 },
    { name: 'Media', ili: 82, members: 5000 },
  ];

  const barrierData = [
    { name: 'Access', value: 35 },
    { name: 'Cost', value: 25 },
    { name: 'Awareness', value: 20 },
    { name: 'Trust', value: 12 },
    { name: 'Other', value: 8 },
  ];

  const radarData = report ? [
    { metric: 'ILI Score', value: report.metrics.ili },
    { metric: 'CPS', value: report.metrics.cps * 100 },
    { metric: 'BFI', value: report.metrics.bfi * 100 },
    { metric: 'NCB', value: report.metrics.ncb * 100 },
    { metric: 'CHI', value: report.metrics.corridorHarmonization * 100 },
  ] : [];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const exportReport = (format: 'pdf' | 'json') => {
    if (!report) return;
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `armada-report-${selectedCorridor}-${Date.now()}.json`;
      a.click();
    }
    // PDF export would require additional library setup
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cultural Intelligence Reports</h1>
            <p className="text-sm text-slate-400">Generate analysis and intervention playbooks</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Select Corridor
              </label>
              <Select
                value={selectedCorridor}
                onValueChange={(value) => setSelectedCorridor(value as Corridor)}
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
            
            <div>
              <label className="text-sm font-medium text-slate-400 mb-2 block">
                Report Type
              </label>
              <Select
                value={reportType}
                onValueChange={(value) => setReportType(value as any)}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  <SelectItem value="ili">Institutional Legitimacy</SelectItem>
                  <SelectItem value="diffusion">Diffusion Patterns</SelectItem>
                  <SelectItem value="intervention">Intervention Readiness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateReport}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={() => exportReport('json')}
                disabled={!report}
                variant="outline"
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-400">Generating cultural intelligence report...</p>
        </div>
      )}

      {report && !loading && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">ILI Score</p>
                    <p className="text-3xl font-bold text-purple-400">{report.metrics.ili}</p>
                    <p className="text-xs text-slate-500">Institutional Trust</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">CPS</p>
                    <p className="text-3xl font-bold text-blue-400">
                      {(report.metrics.cps * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500">Compliance Propensity</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">BFI</p>
                    <p className="text-3xl font-bold text-yellow-400">
                      {(report.metrics.bfi * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500">Barrier Friction</p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">NCB</p>
                    <p className="text-3xl font-bold text-green-400">
                      {(report.metrics.ncb * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500">Network Bridge</p>
                  </div>
                  <Network className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">CHI</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {(report.metrics.corridorHarmonization * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-slate-500">Harmonization</p>
                  </div>
                  <Globe className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="institutions">Institutions</TabsTrigger>
                  <TabsTrigger value="diffusion">Diffusion</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">ARMADA Metric Radar</h3>
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
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Key Insights</h3>
                      {report.insights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/50 rounded-lg">
                          <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                          <p className="text-sm text-slate-300">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="institutions" className="space-y-6 mt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Institutional Legitimacy by Type</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={institutionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="name" tick={{ fill: '#94a3b8' }} />
                          <YAxis tick={{ fill: '#94a3b8' }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                            labelStyle={{ color: '#e2e8f0' }}
                          />
                          <Bar dataKey="ili" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Network Reach</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={institutionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="members"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {institutionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="diffusion" className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Cross-Corridor Diffusion Pattern</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={diffusionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                      <XAxis dataKey="week" tick={{ fill: '#94a3b8' }} />
                      <YAxis tick={{ fill: '#94a3b8' }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                        labelStyle={{ color: '#e2e8f0' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="origin" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Origin" />
                      <Area type="monotone" dataKey="diaspora1" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Diaspora 1" />
                      <Area type="monotone" dataKey="diaspora2" stackId="1" stroke="#10b981" fill="#10b981" name="Diaspora 2" />
                      <Area type="monotone" dataKey="diaspora3" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Diaspora 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="recommendations" className="space-y-4 mt-6">
                  <h3 className="text-lg font-medium mb-4">Strategic Recommendations</h3>
                  
                  <div className="space-y-4">
                    {report.recommendations.map((rec, i) => (
                      <Card key={i} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                              {i + 1}
                            </div>
                            <p className="text-sm text-slate-300">{rec}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert className="border-blue-500/50 bg-blue-500/10 mt-6">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      These recommendations are generated based on current ILI, CPS, BFI, and NCB metrics.
                      Review and adapt to your specific context before implementation.
                    </AlertDescription>
                  </Alert>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {!report && !loading && !hasGenerated && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-16 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Report Generated</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Select a corridor and report type, then click "Generate Report" to create your first cultural intelligence analysis.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
