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
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import NotificationDropdown from '@/components/notifications/notification-dropdown';
import { useThemeStore, useAuthStore } from '@/lib/store';
import MessageDialog from '@/components/messaging/message-dialog';

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
  
  return (
    <header className="sticky top-0 bg-background z-40 border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="flex items-center gap-2">
              <span className="font-bold text-xl">Web3Reddit</span>
            </a>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Link href="/">
            <a className={`flex items-center gap-1 ${
              location === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <Home className="h-5 w-5" />
              <span>Home</span>
            </a>
          </Link>
          
          <Button variant="ghost" className="text-muted-foreground">
            <Search className="h-5 w-5 mr-2" />
            <span>Search</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden md:flex"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          {isAuthenticated ? (
            <>
              <NotificationDropdown />
              
              {/* Message button - this would typically navigate to a messages page 
                  but for now we'll use a demo message dialog */}
              {user && (
                <MessageDialog 
                  recipientId="demo-user-id"
                  recipientName="Demo User"
                />
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href={`/user/${user?.id}`}>
                      <a className="w-full cursor-pointer">Profile</a>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={handleLogin} className="gap-2">
              <LogIn className="h-4 w-4" />
              <span>Login</span>
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}