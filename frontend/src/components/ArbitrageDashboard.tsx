// ArbitrageDashboard.tsx - Dashboard Component for Displaying Arbitrage Data and Material Preview

import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useAdConsole } from '@/hooks/useAdConsole';

interface ArbitrageDashboardProps {
  // Add any props if needed
}

const ArbitrageDashboard: React.FC<ArbitrageDashboardProps> = () => {
  const { fetchArbitrageData, arbitrageLog } = useAdConsole();
  const [arbitrageData, setArbitrageData] = React.useState<any>(null);
  const [materialUrl, setMaterialUrl] = React.useState<string>('');
  const [nipAdsEvent, setNipAdsEvent] = React.useState<any>(null);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchArbitrageData();
        setArbitrageData(data);
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
  
  const handlePublishNipAds = () => {
    // Placeholder for publishing NIP-ADS event to relay
    console.log('Publishing NIP-ADS event:', nipAdsEvent);
    alert('NIP-ADS event published (simulated). Check console for details.');
  };
  
  return (
    <div className="grid grid-cols-3 gap-4 p-4 h-screen">
      {/* Left Panel: Input & Logs */}
      <Card className="col-span-1 h-full" style={{ backgroundColor: 'hsl(210 40% 98%)', borderColor: 'hsl(214.3 31.8% 91.4%)' }}>
        <CardHeader>
          <CardTitle>AdNostr Console</CardTitle>
          <CardDescription>Real-time scraping and arbitrage logs</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[80vh] font-mono text-sm">
          <pre>
            {arbitrageLog.map((log, index) => (
              <div key={index} className="border-b border-gray-200 py-1">
                <span className="text-gray-500">{log.timestamp}</span>: {log.message}
                {log.data && <div className="text-xs text-gray-400">{JSON.stringify(log.data, null, 2)}</div>}
              </div>
            ))}
          </pre>
        </CardContent>
      </Card>
      
      {/* Middle Panel: Comparison Table */}
      <Card className="col-span-1 h-full" style={{ backgroundColor: 'hsl(210 40% 98%)', borderColor: 'hsl(214.3 31.8% 91.4%)' }}>
        <CardHeader>
          <CardTitle>Cost Arbitrage Comparison</CardTitle>
          <CardDescription>Web2 vs Nostr Cost Savings</CardDescription>
        </CardHeader>
        <CardContent>
          {arbitrageData ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead>Web2</TableHead>
                  <TableHead>Nostr</TableHead>
                  <TableHead>Savings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Cost per 1k (USD)</TableCell>
                  <TableCell>{arbitrageData.savings?.web2_cost_per_1k_usd?.toFixed(2) || 'N/A'}</TableCell>
                  <TableCell>{arbitrageData.savings?.nostr_cost_per_1k_usd?.toFixed(4) || 'N/A'}</TableCell>
                  <TableCell className="font-bold text-green-600">{arbitrageData.savings?.savings_per_1k_usd?.toFixed(2) || 'N/A'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Savings Percentage</TableCell>
                  <TableCell colSpan={2}></TableCell>
                  <TableCell className="font-bold text-green-600">{arbitrageData.savings?.savings_percentage}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Message</TableCell>
                  <TableCell colSpan={3}>{arbitrageData.savings?.message || 'N/A'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            <p>Loading arbitrage data...</p>
          )}
        </CardContent>
      </Card>
      
      {/* Right Panel: Nostr Preview */}
      <Card className="col-span-1 h-full" style={{ backgroundColor: 'hsl(210 40% 98%)', borderColor: 'hsl(214.3 31.8% 91.4%)' }}>
        <CardHeader>
          <CardTitle>Nostr Ad Preview</CardTitle>
          <CardDescription>Material and NIP-ADS Event</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex-1 max-h-64 overflow-hidden rounded-md border" style={{ borderColor: 'hsl(214.3 31.8% 91.4%)' }}>
            {materialUrl ? (
              <img src={materialUrl} alt="Selected Material" className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No material selected</div>
            )}
          </div>
          <div className="flex-1 overflow-auto max-h-48 font-mono text-sm bg-gray-50 p-2 rounded-md border" style={{ borderColor: 'hsl(214.3 31.8% 91.4%)' }}>
            <pre>{JSON.stringify(nipAdsEvent, null, 2) || 'No NIP-ADS event data'}</pre>
          </div>
          <Button onClick={handlePublishNipAds} className="mt-4" style={{ backgroundColor: 'hsl(222.2 84% 4.9%)', color: 'hsl(210 40% 98%)' }}>
            [EXECUTE_NIP_ADS]
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArbitrageDashboard;