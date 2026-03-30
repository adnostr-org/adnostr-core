// ArbitrageDashboard.tsx - Dashboard Component for Displaying Arbitrage Data and Material Preview

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ApifyTokenConfig } from './ApifyTokenConfig';
import { useAdConsole, type ArbitrageData, type NipAdsCreationRequest } from '@/hooks/useAdConsole';
import { useToast } from '@/hooks/useToast';
import { Loader2, CheckCircle, XCircle, Key, AlertCircle } from 'lucide-react';

interface ArbitrageDashboardProps {
  // Add any props if needed
}

interface SavingsData {
  web2_cost_per_1k_usd?: number;
  nostr_cost_per_1k_usd?: number;
  savings_per_1k_usd?: number;
  savings_percentage?: number;
  message?: string;
}

interface DashboardData {
  savings?: SavingsData;
  material?: {
    url?: string;
  };
}

const ArbitrageDashboard: React.FC<ArbitrageDashboardProps> = () => {
  const { fetchArbitrageData, arbitrageLog, createAndBroadcastAd } = useAdConsole();
  const { toast } = useToast();
  const [arbitrageData, setArbitrageData] = React.useState<DashboardData | null>(null);
  const [materialUrl, setMaterialUrl] = React.useState<string>('');
  const [nipAdsEvent, setNipAdsEvent] = React.useState<object | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{success: boolean; event_id?: string} | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchArbitrageData();
        setArbitrageData(data as DashboardData);
        // Assuming data contains material URL or ID to fetch URL
        if (data && data.material) {
          setMaterialUrl(data.material.url || '');
        }
        // Assuming data contains or can be used to create NIP-ADS event
        if (data) {
          setNipAdsEvent({
            kind: 40000, // Custom kind for ads
            content: JSON.stringify({
              type: 'advertisement',
              data: data
            }),
            tags: [['t', 'adnostr'], ['t', 'nip-ads']],
            created_at: Math.floor(Date.now() / 1000)
          });
        }
      } catch (error) {
        console.error('Failed to load arbitrage data:', error);
      }
    };
    loadData();
  }, [fetchArbitrageData]);
  
  const handlePublishNipAds = async () => {
    if (!arbitrageData) {
      toast({
        title: "No data available",
        description: "Please wait for arbitrage data to load",
        variant: "destructive"
      });
      return;
    }

    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      // Create NIP-ADS request from arbitrage data
      const request: NipAdsCreationRequest = {
        title: `AdNostr Arbitrage: ${arbitrageData.savings?.savings_percentage?.toFixed(1)}% Savings`,
        description: `Save ${arbitrageData.savings?.savings_percentage?.toFixed(1)}% by using Nostr advertising instead of Web2 platforms.`,
        image_url: materialUrl || undefined,
        web2_cpc: arbitrageData.savings?.web2_cost_per_1k_usd ? arbitrageData.savings.web2_cost_per_1k_usd / 1000 : 0.5,
        category: "1", // Technology category
        language: "en",
        price_slot: "BTC1_000"
      };

      // Create and broadcast
      const result = await createAndBroadcastAd(request);
      
      setBroadcastResult({
        success: result.success,
        event_id: result.event_id
      });

      toast({
        title: result.success ? "Broadcast Successful!" : "Broadcast Failed",
        description: result.success 
          ? `NIP-ADS event published to ${result.relay_urls.length} relays`
          : result.error || "Unknown error occurred",
        variant: result.success ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Failed to broadcast NIP-ADS:', error);
      setBroadcastResult({
        success: false
      });
      
      toast({
        title: "Broadcast Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsBroadcasting(false);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Left Panel: Real-time Logs */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Activity Stream</CardTitle>
          <CardDescription>Real-time arbitrage engine logs</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[400px]">
          <div className="space-y-2 font-mono text-sm">
            {arbitrageLog.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-2">📊</div>
                <p>Waiting for activity...</p>
              </div>
            ) : (
              arbitrageLog.slice(0, 15).map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                    log.level === 'error'
                      ? 'bg-destructive/5 border-destructive/20'
                      : log.level === 'success'
                      ? 'bg-green-500/5 border-green-500/20'
                      : log.level === 'warn'
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-medium text-muted-foreground">{log.timestamp}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        log.level === 'error'
                          ? 'bg-destructive text-destructive-foreground'
                          : log.level === 'success'
                          ? 'bg-green-500 text-green-50'
                          : log.level === 'warn'
                          ? 'bg-amber-500 text-amber-50'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {log.level}
                    </span>
                  </div>
                  <p className="text-sm">{log.message}</p>
                  {log.data && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View details
                      </summary>
                      <pre className="mt-1 text-xs bg-background p-2 rounded border overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Middle Panel: Cost Comparison */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Cost Arbitrage</CardTitle>
          <CardDescription>Web2 vs Nostr comparison</CardDescription>
        </CardHeader>
        <CardContent>
          {arbitrageData ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cost per 1k Impressions</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-muted-foreground">
                        ${arbitrageData.savings?.web2_cost_per_1k_usd?.toFixed(2) || '0.00'}
                      </div>
                      <div className="text-xs text-muted-foreground">Web2</div>
                    </div>
                    <div className="text-2xl">→</div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${arbitrageData.savings?.nostr_cost_per_1k_usd?.toFixed(4) || '0.0000'}
                      </div>
                      <div className="text-xs text-muted-foreground">Nostr</div>
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    style={{ width: `${Math.min(100, (arbitrageData.savings?.savings_percentage || 0))}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Savings</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${arbitrageData.savings?.savings_per_1k_usd?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Efficiency</div>
                    <div className="text-2xl font-bold text-green-600">
                      {arbitrageData.savings?.savings_percentage || 0}%
                    </div>
                  </div>
                </div>
              </div>
              
              {arbitrageData.savings?.message && (
                <div className="p-3 bg-muted/30 rounded-lg border">
                  <p className="text-sm">{arbitrageData.savings.message}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-2 border-border border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Calculating arbitrage opportunities...</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Right Panel: NIP-ADS Preview */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">NIP-ADS Preview</CardTitle>
          <CardDescription>Protocol event generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border bg-muted/20">
            {materialUrl ? (
              <img 
                src={materialUrl} 
                alt="Ad Material" 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🖼️</span>
                </div>
                <p className="text-sm text-muted-foreground">Material preview</p>
                <p className="text-xs text-muted-foreground mt-1">Select an ad to view</p>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">NIP-ADS Event</span>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">kind:40000</span>
            </div>
            <div className="font-mono text-xs bg-background border rounded-lg p-3 max-h-32 overflow-auto">
              <pre>{nipAdsEvent ? JSON.stringify(nipAdsEvent, null, 2) : '// Event data will appear here'}</pre>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handlePublishNipAds} 
              disabled={isBroadcasting || !arbitrageData}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              size="lg"
            >
              {isBroadcasting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <span className="font-mono">[BROADCAST_NIP_ADS]</span>
              )}
            </Button>
            
            {broadcastResult && (
              <div className={`p-3 rounded-lg border ${
                broadcastResult.success 
                  ? 'bg-green-500/5 border-green-500/20' 
                  : 'bg-destructive/5 border-destructive/20'
              }`}>
                <div className="flex items-center gap-2">
                  {broadcastResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">
                    {broadcastResult.success ? 'Broadcast Successful' : 'Broadcast Failed'}
                  </span>
                </div>
                {broadcastResult.event_id && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Event ID: {broadcastResult.event_id}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            <p>Broadcasts to Nostr network via wss://relay.adnostr.org</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArbitrageDashboard;