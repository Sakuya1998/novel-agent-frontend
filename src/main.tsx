import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "./app/router";
import { SessionProvider } from "./auth/SessionProvider";
import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { WorkspaceProvider } from "./workspaces/WorkspaceProvider";
import "./styles.css";
import "./workspace.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppErrorBoundary><SessionProvider><WorkspaceProvider><AppRouter /></WorkspaceProvider></SessionProvider></AppErrorBoundary>
  </StrictMode>,
);
