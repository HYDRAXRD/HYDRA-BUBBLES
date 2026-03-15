import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RadixProvider } from "@/providers/RadixProvider";

createRoot(document.getElementById("root")!).render(
  <RadixProvider>
    <App />
  </RadixProvider>
);
