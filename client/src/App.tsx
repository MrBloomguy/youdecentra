import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Community from "@/pages/community";
import PostDetail from "@/pages/post-detail";
import Profile from "@/pages/profile";
import Leaderboard from "@/pages/leaderboard";
import Messages from "@/pages/messages";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect } from "react";
import { useCommunityStore, useThemeStore, useAuthStore } from "./lib/store";
import { OrbisContextProvider } from "./lib/orbis";
import { webSocketClient } from "./lib/websocket";
import Layout from "@/components/layout/layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/community/:id" component={Community} />
      <Route path="/post/:id" component={PostDetail} />
      <Route path="/user/:id" component={Profile} />
      <Route path="/discover" component={() => <Home isDiscoverPage={true} />} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/messages" component={Messages} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { ready, authenticated, user } = usePrivy();
  const { initializeCommunities } = useCommunityStore();
  const { isDarkMode } = useThemeStore();
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
      
      // Authenticate WebSocket connection with user ID
      webSocketClient.authenticate(user.id);
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
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </OrbisContextProvider>
  );
}

export default App;
