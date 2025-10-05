import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Workbook } from "./pages/Workbook";
import { HazardsIncidents } from "./pages/HazardsIncidents";
import { Entities } from "./pages/Entities";
import { Maps } from "./pages/Maps";
import { Wordclouds } from "./pages/Wordclouds";
import { Agent } from "./pages/Agent";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    // Landing page at '/'
    { path: "/", element: <Landing /> },

    // App layout for dashboard and other routes
    {
      path: "/",
      element: <AppLayout />,
      children: [
        { path: "dashboard", element: <Dashboard /> },
        { path: "analytics", element: <Analytics /> },
        { path: "workbook", element: <Workbook /> },
        { path: "entities", element: <Entities /> },
        { path: "hazards", element: <HazardsIncidents /> },
        { path: "maps", element: <Maps /> },
        { path: "wordclouds", element: <Wordclouds /> },
        { path: "agent", element: <Agent /> },
        { path: "reports", element: <div className="p-8 text-center text-muted-foreground">Reports coming soon</div> },
        { path: "settings", element: <div className="p-8 text-center text-muted-foreground">Settings coming soon</div> },
      ],
    },
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      // Enable only supported future flags for current router version
      v7_relativeSplatPath: true,
    },
  }
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
