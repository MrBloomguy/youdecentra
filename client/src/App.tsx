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

  return (
    <OrbisContextProvider>
      <Router />
      <Toaster />
    </OrbisContextProvider>
  );
}

export default App;
