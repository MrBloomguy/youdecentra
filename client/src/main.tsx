// Set up polyfills for Web3 libraries
import { Buffer } from 'buffer';

// Create global object before any imports that might use it
window.global = window;

// Important: Define globals before any imports that might use them
// Buffer polyfill
window.Buffer = Buffer;

// Process polyfill
window.process = window.process || { env: {} };

// Console debug for polyfill checking
console.debug("Polyfills initialized:", { 
  hasGlobal: typeof window.global !== 'undefined',
  hasBuffer: typeof window.Buffer !== 'undefined',
  hasProcess: typeof window.process !== 'undefined'
});

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { PrivyProvider } from "@privy-io/react-auth";
import { GraphProvider } from "./lib/GraphProvider";

createRoot(document.getElementById("root")!).render(
  <PrivyProvider
    appId="cm8ki21cg00q7tcgdnn0emd1t"
    config={{
      loginMethods: ["wallet", "email", "google"],
      appearance: {
        theme: "light",
        accentColor: "#FF4500",
        logo: "https://cdn-icons-png.flaticon.com/512/1384/1384876.png"
      },
    }}
  >
    <QueryClientProvider client={queryClient}>
      <GraphProvider>
        <App />
      </GraphProvider>
    </QueryClientProvider>
  </PrivyProvider>
);
