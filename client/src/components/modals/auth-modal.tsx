import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useUIStore } from '@/lib/store';

export default function AuthModal() {
  const { login, ready, authenticated } = usePrivy();
  const { isAuthModalOpen, setAuthModalOpen } = useUIStore();
  
  // Close modal when authenticated
  useEffect(() => {
    if (authenticated) {
      setAuthModalOpen(false);
    }
  }, [authenticated, setAuthModalOpen]);
  
  return (
    <Dialog open={isAuthModalOpen} onOpenChange={setAuthModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-center mb-2">
            <i className="ri-reddit-fill text-reddit-orange text-4xl"></i>
            <DialogTitle className="font-bold text-xl mt-2">Log in to RedditWeb3</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Connect your wallet to join discussions and communities
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="space-y-3">
          <Button 
            onClick={login}
            className="w-full flex items-center justify-center bg-reddit-blue hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-full"
          >
            <i className="ri-wallet-3-line mr-2"></i>
            <span>Connect Wallet</span>
          </Button>

          <Button 
            onClick={login}
            variant="outline"
            className="w-full flex items-center justify-center border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-2.5 px-4 rounded-full"
          >
            <i className="ri-mail-line mr-2"></i>
            <span>Continue with Email</span>
          </Button>

          <Button 
            onClick={login}
            variant="outline"
            className="w-full flex items-center justify-center border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold py-2.5 px-4 rounded-full"
          >
            <i className="ri-google-fill mr-2"></i>
            <span>Continue with Google</span>
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">User Agreement</a> and acknowledge our <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </p>
      </DialogContent>
    </Dialog>
  );
}
