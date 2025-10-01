import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Set dark mode by default
if (!document.documentElement.classList.contains('light')) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
