'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Activity, Database, Zap, TrendingUp, Clock } from 'lucide-react';

interface Stats {
  totalJobs: number;
  recentLogs: any[];
  lastRun: string | null;
  health: string;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAutomation = async () => {
    setRunning(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/automation/run', {
        method: 'POST',
      });
      const data = await response.json();
      setResult(data);
      
      // Refresh stats after automation
      setTimeout(() => {
        fetchStats();
      }, 2000);
    } catch (error) {
      console.error('Error running automation:', error);
      setResult({ success: false, error: 'Failed to run automation' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">👑 Owner Panel</h1>
            </div>
            <Link href="/jobs">
              <Button variant="outline">View Jobs</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-6 w-6 mr-2 text-blue-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              🚀 Manually trigger automation or check system health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button
                variant="primary"
                size="lg"
                onClick={runAutomation}
                disabled={running}
              >
                {running ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Run Automation Now
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={fetchStats}>
                🔄 Refresh Stats
              </Button>
            </div>

            {/* Automation Result */}
            {result && (
              <div className={`mt-4 p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h4 className="font-semibold mb-2">
                  {result.success ? '✅ Automation Completed!' : '❌ Automation Failed'}
                </h4>
                {result.success ? (
                  <div className="text-sm space-y-1">
                    <p>📥 Items Collected: {result.itemsCollected}</p>
                    <p>✅ Items Verified: {result.itemsVerified}</p>
                  </div>
                ) : (
                  <p className="text-sm text-red-600">{result.error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : stats ? (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Total Jobs</CardTitle>
                    <Database className="h-8 w-8 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-blue-600">{stats.totalJobs}</p>
                  <p className="text-sm text-gray-600 mt-2">Jobs in database</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">System Health</CardTitle>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge 
                    variant={stats.health === 'healthy' ? 'success' : 'warning'}
                    className="text-lg px-4 py-2"
                  >
                    {stats.health === 'healthy' ? '✅ Healthy' : '⚠️ Unknown'}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-4">95% Automation Rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Last Run</CardTitle>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  {stats.lastRun ? (
                    <p className="text-sm text-gray-700">
                      {new Date(stats.lastRun).toLocaleString('hi-IN')}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Never run</p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">Click "Run Automation" above</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2" />
                  Recent Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentLogs && stats.recentLogs.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentLogs.map((log, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="info">{log.type}</Badge>
                          <span className="text-sm text-gray-500">
                            {log.timestamp && new Date(log.timestamp).toLocaleString('hi-IN')}
                          </span>
                        </div>
                        {log.itemsCollected !== undefined && (
                          <div className="text-sm space-y-1">
                            <p>📥 Collected: {log.itemsCollected}</p>
                            <p>🔍 Processed: {log.itemsProcessed}</p>
                            <p>✅ Approved: {log.itemsApproved}</p>
                            <p>⏱️ Duration: {log.duration}s</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No activity logs yet. Run automation to see logs.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}

        {/* Info Section */}
        <Card className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle>💡 How it Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm"><strong>Step 1:</strong> Click "Run Automation Now" to trigger data collection</p>
            <p className="text-sm"><strong>Step 2:</strong> System will scrape RSS feeds and government websites</p>
            <p className="text-sm"><strong>Step 3:</strong> AI (Gemini 2.0) verifies each job posting</p>
            <p className="text-sm"><strong>Step 4:</strong> Verified jobs are saved and notifications sent</p>
            <p className="text-sm"><strong>Step 5:</strong> Check "View Jobs" to see all discovered jobs</p>
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> In production, this will run automatically every 30 minutes. 
                For deployment instructions, check the documentation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
