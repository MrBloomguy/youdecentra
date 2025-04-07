// This file contains polyfills for Web3 libraries
// Import it before any other imports in main.tsx

// Critical: Define global before anything else loads
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.global = window;
  
  // Make global itself also have a global property that references itself
  // This is needed for some nested web3 libraries
  // @ts-ignore
  window.global.global = window.global;
}

// Define process
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = window.process || { env: {} };
}

// Setup WebSocket polyfill for walletconnect
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.WebSocket = window.WebSocket || {};
}

// Export a function to verify our polyfills are applied
export function ensurePolyfills() {
  if (typeof window !== 'undefined') {
    console.debug("Polyfills verification:", {
      hasGlobal: 'global' in window,
      hasGlobalGlobal: window.global && 'global' in window.global,
      hasProcess: 'process' in window,
      hasProcessEnv: window.process && 'env' in window.process,
      hasWebSocket: 'WebSocket' in window
    });
    
    // Ensure polyfills aren't being overwritten
    if (!('global' in window)) {
      console.error("window.global is missing after polyfill initialization!");
      // @ts-ignore
      window.global = window;
    }
  }
}