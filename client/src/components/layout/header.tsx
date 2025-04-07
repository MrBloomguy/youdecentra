import React from 'react';
import { Link, useLocation } from 'wouter';
import { usePrivy } from '@privy-io/react-auth';
import { 
  Home, 
  Search, 
  User, 
  Menu, 
  LogIn,
  LogOut,
  Sun,
  Moon,
  Github,
  Trophy,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Logo, LogoWithText } from '@/components/ui/logo';
import NotificationDropdown from '@/components/notifications/notification-dropdown';
import { useThemeStore, useAuthStore } from '@/lib/store';
import { useUserPoints, useTotalPoints } from '@/lib/points';

export default function Header() {
  const [location] = useLocation();
  const { login, logout, authenticated, user } = usePrivy();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  
  const handleLogin = () => {
    login();
  };
  
  const handleLogout = () => {
    logout();
  };
  
  // Get user points
  const { points: userPoints = 0, loading: pointsLoading } = useUserPoints(user?.wallet?.address);
  const { totalPoints = 0, loading: totalPointsLoading } = useTotalPoints();

  return (
    <header className="sticky top-0 bg-background z-40 border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          {location === '/' ? (
            <div className="flex items-center gap-2">
              <LogoWithText />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="icon-interaction"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div onClick={() => window.location.href = '/'} className="cursor-pointer">
                <Logo className="w-8 h-8" />
              </div>
            </div>
          )}
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <div
            onClick={() => window.location.href = '/'}
            className={`flex items-center gap-1 cursor-pointer ${
              location === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </div>
          
          <Button variant="ghost" className="text-muted-foreground">
            <Search className="h-5 w-5 mr-2" />
            <span>Search</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Points display for authenticated users */}
          {isAuthenticated && !pointsLoading && (
            <div className="hidden md:flex items-center">
              <Badge className="bg-primary hover:bg-primary/90 flex items-center gap-1 text-black dark:text-black badge-hover">
                <Trophy className="h-3 w-3" />
                <span>{userPoints}/{totalPoints || 0} Points</span>
              </Badge>
            </div>
          )}
          
          {/* GitHub icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex icon-interaction"
            onClick={() => window.open('https://github.com', '_blank')}
            aria-label="View source code on GitHub"
          >
            <Github className="h-5 w-5" />
          </Button>
          
          {/* Theme toggle - shown on both mobile and desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="icon-interaction"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {/* Mobile points display */}
          {isAuthenticated && !pointsLoading && (
            <div className="md:hidden flex items-center">
              <Badge className="bg-primary hover:bg-primary/90 flex items-center gap-1 text-black dark:text-black badge-hover">
                <Trophy className="h-3 w-3" />
                <span>{userPoints}</span>
              </Badge>
            </div>
          )}
          
          {isAuthenticated ? (
            <>
              {/* Notifications - shown on both mobile and desktop */}
              <NotificationDropdown />
              
              {/* User dropdown - only shown on desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="hidden md:flex">
                  <Button variant="ghost" size="icon" className="relative icon-interaction">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={() => window.location.href = `/user/${user?.id}`}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={handleLogin} className="gap-2 bg-primary hover:bg-primary/90 text-black dark:text-black btn-micro-interaction">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden icon-interaction">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}