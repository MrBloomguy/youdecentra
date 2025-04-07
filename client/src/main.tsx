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
