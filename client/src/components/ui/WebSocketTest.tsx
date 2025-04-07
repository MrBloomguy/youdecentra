import { useState, useEffect } from 'react';
import { useWebSocket } from '@/lib/websocket';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';

export function WebSocketTest() {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const webSocket = useWebSocket();
  
  useEffect(() => {
    // Connect to WebSocket when component mounts
    webSocket.connect();
    
    // Add listeners for connection status and messages
    const statusListener = (isConnected: boolean) => {
      setConnected(isConnected);
      if (isConnected) {
        setMessages(prev => [...prev, `Connected at ${new Date().toLocaleTimeString()}`]);
      } else {
        setMessages(prev => [...prev, `Disconnected at ${new Date().toLocaleTimeString()}`]);
      }
    };
    
    const messageListener = (message: { type: string; data: any }) => {
      setMessages(prev => [...prev, `${message.type}: ${JSON.stringify(message.data)}`]);
    };
    
    webSocket.addStatusListener(statusListener);
    webSocket.addMessageListener(messageListener);
    
    // Clean up listeners when component unmounts
    return () => {
      webSocket.removeStatusListener(statusListener);
      webSocket.removeMessageListener(messageListener);
    };
  }, [webSocket]);
  
  const handleSendPing = () => {
    webSocket.send('ping', { timestamp: new Date().toISOString() });
    setMessages(prev => [...prev, `Sent ping at ${new Date().toLocaleTimeString()}`]);
  };
  
  const handleReconnect = () => {
    webSocket.disconnect();
    setTimeout(() => {
      webSocket.connect();
    }, 500);
  };
  
  const handleDebug = () => {
    webSocket.debugConnectionState();
    fetch('/api/websocket-test')
      .then(res => res.json())
      .then(data => {
        setMessages(prev => [...prev, `Server WS status: ${JSON.stringify(data)}`]);
      })
      .catch(err => {
        setMessages(prev => [...prev, `Error fetching WS status: ${err.message}`]);
      });
  };
  
  return (
    <div className="border rounded-lg p-4 mb-6 space-y-4">
      <h3 className="text-lg font-medium">WebSocket Test</h3>
      
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        <p>{connected ? 'Connected' : 'Disconnected'}</p>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleSendPing} disabled={!connected}>Send Ping</Button>
        <Button onClick={handleReconnect} variant="outline">Reconnect</Button>
        <Button onClick={handleDebug} variant="secondary">Debug</Button>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Messages:</h4>
        <div className="bg-muted p-3 rounded-md h-32 overflow-y-auto text-sm">
          {messages.length === 0 ? (
            <p className="text-muted-foreground">No messages yet</p>
          ) : (
            messages.map((msg, i) => <div key={i} className="mb-1">{msg}</div>)
          )}
        </div>
      </div>
      
      {!connected && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            WebSocket connection failed. Check console for errors.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}