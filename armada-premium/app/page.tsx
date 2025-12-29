// app/page.tsx

'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, FileText, Shield, Activity, Zap, Globe, ChevronRight, Terminal } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto p-6 lg:p-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm mb-6">
          <Terminal className="w-4 h-4" />
          <span>ARM Protocol v4.2 • Cultural Intelligence System</span>
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
          ARMADA Command Center
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto">
          Hemispheric Cultural Control Grid • AI-Powered Song Generation & Validation
          <br />
          <span className="text-sm text-slate-500">Generate culturally authentic content across 13 corridors with 31-phase validation</span>
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Corridors</p>
                <p className="text-3xl font-bold text-white">13</p>
              </div>
              <Globe className="w-10 h-10 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">ARM Score</p>
                <p className="text-3xl font-bold text-emerald-400">0.85</p>
              </div>
              <Activity className="w-10 h-10 text-emerald-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Phases</p>
                <p className="text-3xl font-bold text-white">31</p>
              </div>
              <Zap className="w-10 h-10 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Emotions</p>
                <p className="text-3xl font-bold text-white">30</p>
              </div>
              <Shield className="w-10 h-10 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link href="/song-engine">
          <Card className="h-full bg-slate-900/50 border-slate-800 hover:border-purple-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Music className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-white">Song Engine</CardTitle>
              <CardDescription className="text-slate-400">
                Generate corridor-authentic songs with ARM ≥0.85 across 13 cultural corridors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>13 Cultural Corridors</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>30 Emotional States</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Hybrid Corridor Blending</span>
                </div>
              </div>
              <div className="mt-4 flex items-center text-purple-400 text-sm font-medium">
                Open Engine <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports">
          <Card className="h-full bg-slate-900/50 border-slate-800 hover:border-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-white">Cultural Reports</CardTitle>
              <CardDescription className="text-slate-400">
                Generate intelligence reports and intervention playbooks for cultural analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>ILI & CPS Analysis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span>Diffusion Patterns</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Barrier Kit ROI</span>
                </div>
              </div>
              <div className="mt-4 flex items-center text-blue-400 text-sm font-medium">
                View Reports <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/validation">
          <Card className="h-full bg-slate-900/50 border-slate-800 hover:border-emerald-600 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 group cursor-pointer">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-white">Validation Dashboard</CardTitle>
              <CardDescription className="text-slate-400">
                Real-time ARM scoring and governance compliance across 31 validation phases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Real-time Monitoring</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Forbidden Structure Detection</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>Mutation Risk Assessment</span>
                </div>
              </div>
              <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium">
                View Dashboard <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* System Status */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-white">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">API Status</p>
                <p className="text-xs text-slate-400">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-white">Average ARM</p>
                <p className="text-xs text-slate-400">0.91</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-white">Active Corridors</p>
                <p className="text-xs text-slate-400">13/13</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-sm font-medium text-white">Protocol Version</p>
                <p className="text-xs text-slate-400">v4.2</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
