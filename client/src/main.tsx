import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 MAIN.TSX: Starting React app...");
console.log("🚀 MAIN.TSX: Root element:", document.getElementById("root"));

try {
  createRoot(document.getElementById("root")!).render(<App />);
  console.log("🚀 MAIN.TSX: App rendered successfully!");
} catch (error) {
  console.error("🚀 MAIN.TSX: Error rendering app:", error);
}
