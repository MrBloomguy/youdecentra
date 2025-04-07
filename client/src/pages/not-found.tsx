import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useWebSocket } from "@/lib/websocket";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  const [polyfillStatus, setPolyfillStatus] = useState<Record<string, boolean> | null>(null);
  const [wsStatus, setWsStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const webSocket = useWebSocket();

  useEffect(() => {
    // Check polyfills status
    try {
      const status = {
        hasGlobal: typeof window !== 'undefined' && 'global' in window,
        // @ts-ignore - We need to check if global.global exists
        hasGlobalGlobal: typeof window !== 'undefined' && window.global && 'global' in window.global,
        hasProcess: typeof window !== 'undefined' && 'process' in window,
        // @ts-ignore - We need to check if Buffer exists
        hasBuffer: typeof window !== 'undefined' && 'Buffer' in window,
        hasWebSocket: typeof window !== 'undefined' && 'WebSocket' in window
      };
      setPolyfillStatus(status);
    } catch (err: any) {
      setError('Error checking polyfills: ' + (err.message || String(err)));
    }

    // Check WebSocket server status
    fetch('/api/websocket-test')
      .then(res => res.json())
      .then(data => setWsStatus(data))
      .catch(err => setError('Error fetching WebSocket status: ' + err.message));
  }, []);

  const testWebSocketConnection = () => {
    webSocket.connect();
    webSocket.debugConnectionState();
    setTimeout(() => {
      webSocket.ping();
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <CardTitle>404 Page Not Found</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Polyfills Status</h3>
              <div className="bg-slate-100 p-3 rounded text-sm font-mono overflow-auto max-h-32">
                {polyfillStatus ? JSON.stringify(polyfillStatus, null, 2) : 'Loading...'}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">WebSocket Server Status</h3>
              <div className="bg-slate-100 p-3 rounded text-sm font-mono overflow-auto max-h-32">
                {wsStatus ? JSON.stringify(wsStatus, null, 2) : 'Loading...'}
              </div>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded">
                {error}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
          <Button onClick={testWebSocketConnection} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Test WebSocket
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
