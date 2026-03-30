import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArbitrageDashboard from '@/components/ArbitrageDashboard';
import { useAdConsole } from '@/hooks/useAdConsole';
import { Button } from '@/components/ui/button';
import { Terminal, Zap, Globe, TrendingUp, Database, Shield } from 'lucide-react';

export function Oracle() {
  const { t } = useTranslation();
  const { dashboard, arbitrageLog, fetchArbitrageData, isExecuting } = useAdConsole();

  const handleRefreshData = async () => {
    await fetchArbitrageData();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Terminal className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  AdNostr Oracle
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Decentralized advertising arbitrage engine bridging Web2 CPC with Nostr protocol.
                Real-time cost optimization and NIP-ADS generation.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleRefreshData} 
                disabled={isExecuting}
                variant="outline"
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                {isExecuting ? 'Fetching...' : 'Refresh Data'}
              </Button>
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80">
                <Zap className="h-4 w-4" />
                Connect Nostr
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Global ROI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard.isLoading ? '...' : `${dashboard.data?.global_roi?.toFixed(2) || '0.00'}%`}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all platforms</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Total Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${dashboard.isLoading ? '...' : (dashboard.data?.savings_generated || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Generated through arbitrage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                Active Experts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard.isLoading ? '...' : (dashboard.data?.active_experts || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Apify scraping agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                Protocol Version
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NIP-ADS</div>
              <p className="text-xs text-muted-foreground mt-1">Kind 40000+</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Activity & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Activity Stream */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Stream</CardTitle>
                <CardDescription>Real-time arbitrage operations</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <div className="space-y-3">
                  {arbitrageLog.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="mb-2">📊</div>
                      <p>Waiting for activity...</p>
                      <p className="text-sm mt-1">Click "Refresh Data" to start</p>
                    </div>
                  ) : (
                    arbitrageLog.slice(0, 10).map((log, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          log.level === 'error'
                            ? 'bg-destructive/5 border-destructive/20'
                            : log.level === 'success'
                            ? 'bg-green-500/5 border-green-500/20'
                            : 'bg-muted/30 border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <span className="text-xs font-medium text-muted-foreground">{log.timestamp}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.level === 'error' ? 'bg-destructive text-destructive-foreground' :
                            log.level === 'success' ? 'bg-green-500 text-green-50' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {log.level}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Protocol operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Zap className="h-4 w-4" />
                  Generate NIP-ADS Event
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Globe className="h-4 w-4" />
                  Connect to Relay
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Database className="h-4 w-4" />
                  Export Analytics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Arbitrage Dashboard */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Arbitrage Engine</CardTitle>
                <CardDescription>
                  Web2 vs Nostr cost comparison and protocol integration
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                      value="dashboard"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger
                      value="protocol"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Protocol View
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                    >
                      Settings
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard" className="p-6">
                    <ArbitrageDashboard />
                  </TabsContent>
                  
                  <TabsContent value="protocol" className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">NIP-ADS Protocol</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Event Structure</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`{
  "kind": 40000,
  "content": "Advertisement JSON",
  "tags": [
    ["t", "ad"],
    ["price_slot", "BTC1_000"],
    ["category", "1"],
    ["language", "en"]
  ]
}`}
                              </pre>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm">Price Slots</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>BTC1_000</span>
                                  <span className="text-muted-foreground">1,000 sats</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>BTC10_000</span>
                                  <span className="text-muted-foreground">10,000 sats</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>BTC100_000</span>
                                  <span className="text-muted-foreground">100,000 sats</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Configuration</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Default Relay</label>
                          <input 
                            type="text" 
                            defaultValue="wss://relay.damus.io" 
                            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Price Slot Filter</label>
                          <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
                            <option>BTC1_000 (Default)</option>
                            <option>BTC10_000</option>
                            <option>BTC100_000</option>
                          </select>
                        </div>
                        <Button className="w-full">Save Settings</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                AdNostr Oracle v1.0 • Powered by Nostr Protocol & Apify MCP
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Bridge Web2 advertising costs to decentralized Nostr network
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-xs">
                Documentation
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                API Reference
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                Report Issue
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Oracle;