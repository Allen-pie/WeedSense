import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./custom_components/auth_context";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider attribute={"class"}>
      <Router>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Router>
      <Toaster />
    </ThemeProvider>
  </StrictMode>
);
