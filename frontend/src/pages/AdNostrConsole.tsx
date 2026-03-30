import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArbitrageDashboard from '@/components/ArbitrageDashboard';
import { useAdConsole } from '@/hooks/useAdConsole';

export function AdNostrConsole() {
  const { t } = useTranslation();
  const { dashboard, arbitrageLog } = useAdConsole();

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          AdNostr Console
        </h1>
        <p className="text-muted-foreground">
          Decentralized Ad Arbitrage Oracle - Bridging Web2 CPC with Nostr Protocol
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dashboard Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Global Metrics Card */}
          <Card>
            <CardHeader>
              <CardTitle>Global Metrics</CardTitle>
              <CardDescription>Real-time arbitrage performance</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard.isLoading ? (
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              ) : dashboard.error ? (
                <p className="text-destructive">Failed to load dashboard data</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Global ROI</span>
                    <span className="text-2xl font-bold text-green-600">
                      {dashboard.data?.global_roi?.toFixed(2) || '0.00'}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                    <span className="text-xl font-semibold">
                      ${(dashboard.data?.total_revenue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Savings Generated</span>
                    <span className="text-xl font-semibold text-green-600">
                      ${(dashboard.data?.savings_generated || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Experts</span>
                    <span className="text-xl font-semibold">
                      {(dashboard.data?.active_experts || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Log */}
          <Card className="h-[400px]">
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Real-time system events</CardDescription>
            </CardHeader>
            <CardContent className="overflow-y-auto h-[300px]">
              <div className="space-y-2 font-mono text-sm">
                {arbitrageLog.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No activity yet</p>
                ) : (
                  arbitrageLog.slice(0, 20).map((log, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded border ${
                        log.level === 'error'
                          ? 'bg-destructive/10 border-destructive/20'
                          : log.level === 'success'
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            log.level === 'error'
                              ? 'bg-destructive text-destructive-foreground'
                              : log.level === 'success'
                              ? 'bg-green-500 text-green-50'
                              : 'bg-muted'
                          }`}
                        >
                          {log.level.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1">{log.message}</p>
                      {log.data && (
                        <pre className="mt-1 text-xs text-muted-foreground overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Arbitrage Dashboard */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Arbitrage Engine</CardTitle>
              <CardDescription>
                Web2 vs Nostr cost comparison and NIP-ADS generation
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
                    value="advanced"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Advanced Controls
                  </TabsTrigger>
                  <TabsTrigger
                    value="protocol"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Protocol View
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="p-6">
                  <ArbitrageDashboard />
                </TabsContent>
                <TabsContent value="advanced" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Advanced Configuration</h3>
                    <p className="text-muted-foreground">
                      Configure Apify MCP connections, revenue calculation parameters, and
                      material matching algorithms.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Apify Integration</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Connect to Google Ads Transparency and TikTok Ads Library
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Revenue Engine</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-muted-foreground">
                            Configure R = (C × ln(I + 1)) / D^k parameters
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="protocol" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">NIP-ADS Protocol</h3>
                    <p className="text-muted-foreground">
                      View and manage NIP-ADS events on the Nostr network.
                    </p>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Protocol Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`NIP-ADS Protocol Specification:
- Kind: 40000 (Custom advertisement events)
- Content: JSON with ad metadata
- Tags: [["t", "adnostr"], ["t", "nip-ads"]]
- Purpose: Bridge Web2 advertising to Nostr network
- Settlement: Lightning Network (Sats per click)`}
                        </pre>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 pt-6 border-t">
        <p className="text-sm text-muted-foreground text-center">
          AdNostr-Core v1.0.2 • Powered by Apify MCP & Nostr Protocol • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default AdNostrConsole;