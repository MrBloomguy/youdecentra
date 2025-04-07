import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Community from "@/pages/community";
import PostDetail from "@/pages/post-detail";
import Profile from "@/pages/profile";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { useCommunityStore, useThemeStore, useAuthStore } from "./lib/store";
import { OrbisContextProvider } from "./lib/orbis";
import { webSocketClient } from "./lib/websocket";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/w/:id" component={Community} />
      <Route path="/post/:id" component={PostDetail} />
      <Route path="/user/:id" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { ready, authenticated, user } = usePrivy();
  const { initializeCommunities } = useCommunityStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { setUser, setIsAuthenticated } = useAuthStore();

  // Initialize communities on app load
  useEffect(() => {
    initializeCommunities();
  }, [initializeCommunities]);
  
  // Connect to WebSocket for real-time updates
  useEffect(() => {
    webSocketClient.connect();
    
    return () => {
      webSocketClient.disconnect();
    };
  }, []);
  
  // Set theme on initial load
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);
  
  // Update auth store when Privy auth state changes
  useEffect(() => {
    if (ready && authenticated && user) {
      setUser({
        id: user.id,
        walletAddress: user.wallet?.address || "",
        email: user.email?.address || "",
        avatar: null,
      });
      setIsAuthenticated(true);
    } else if (ready) {
      setIsAuthenticated(false);
    }
  }, [ready, authenticated, user, setUser, setIsAuthenticated]);

  // Debug function for development
  const debugWebSocket = () => {
    console.log('Debugging WebSocket connection...');
    webSocketClient.debugConnectionState();
    webSocketClient.ping();
  };

  return (
    <OrbisContextProvider>
      <Router />
      <Toaster />
      
      {/* WebSocket Test Component (visible in development) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-4 right-4 z-50 w-96 bg-background border rounded-lg shadow-md overflow-hidden">
          {/* Import dynamically to prevent errors in production */}
          {(() => {
            try {
              const WebSocketTest = require('@/components/ui/WebSocketTest').WebSocketTest;
              return <WebSocketTest />;
            } catch (e) {
              return (
                <div className="p-4">
                  <p className="text-red-500">Error loading WebSocket test component</p>
                  <button 
                    onClick={debugWebSocket}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Debug WebSocket
                  </button>
                </div>
              );
            }
          })()}
        </div>
      )}
    </OrbisContextProvider>
  );
}

export default App;
