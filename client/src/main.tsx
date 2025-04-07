// Polyfills for web3 libraries
import { Buffer } from 'buffer';

// Comprehensive polyfills for web3 libraries
window.global = window;
window.Buffer = Buffer;

// Additional polyfills for WalletConnect and other libraries
if (typeof global === 'undefined') {
  (window as any).global = window;
}
if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// Add additional Node.js specific globals that might be needed
(window as any).globalThis = window;

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { PrivyProvider } from "@privy-io/react-auth";

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
      <App />
    </QueryClientProvider>
  </PrivyProvider>
);
