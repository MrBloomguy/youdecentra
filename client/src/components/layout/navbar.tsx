import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { usePrivy } from '@privy-io/react-auth';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useThemeStore, useAuthStore, useUIStore } from '@/lib/store';
import { formatAddress } from '@/lib/utils';

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { login, logout, authenticated, ready, user } = usePrivy();
  const { setAuthModalOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log('Searching for:', searchQuery);
    }
  };
  
  const handleLogin = () => {
    setAuthModalOpen(true);
    login();
  };
  
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-reddit-light-brighter dark:bg-reddit-dark-brighter border-b border-reddit-light-border dark:border-reddit-dark-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-12 md:h-14">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <i className="ri-reddit-fill text-reddit-orange text-3xl mr-2"></i>
            <span className="text-black dark:text-white font-semibold text-lg hidden md:block">RedditWeb3</span>
          </Link>
        </div>

        {/* Community Dropdown (Desktop Only) */}
        <div className="hidden md:flex relative items-center mx-4 max-w-[200px] xl:max-w-[270px]">
          <Button 
            variant="ghost" 
            className="flex items-center space-x-1 text-sm p-1 h-8"
          >
            <span className="font-medium truncate">Home</span>
            <i className="ri-arrow-down-s-line"></i>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex-grow max-w-[800px] mx-2 md:mx-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search RedditWeb3"
              className="w-full bg-gray-100 dark:bg-gray-800 rounded-full py-1 px-4 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <i className="ri-search-line text-gray-400"></i>
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button 
            onClick={toggleTheme} 
            size="icon" 
            variant="ghost" 
            className="rounded-full"
          >
            <i className="ri-moon-line dark:hidden"></i>
            <i className="ri-sun-line hidden dark:block"></i>
          </Button>

          {/* Login/Wallet Connect Button (when logged out) */}
          {!authenticated && ready && (
            <Button 
              onClick={handleLogin}
              className="bg-reddit-blue hover:bg-blue-600 text-white font-semibold py-1 px-4 rounded-full text-sm"
            >
              Connect Wallet
            </Button>
          )}

          {/* User Menu (when logged in) */}
          {authenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md p-1">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {user.wallet?.address ? (
                      <span className="text-xs">{formatAddress(user.wallet.address).substring(0, 2)}</span>
                    ) : (
                      <i className="ri-user-3-line"></i>
                    )}
                  </div>
                  <i className="ri-arrow-down-s-line"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/user/${user.id}`} className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
