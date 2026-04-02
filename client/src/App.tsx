import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CreateBusiness from "./pages/CreateBusiness";
import BusinessDetail from "./pages/BusinessDetail";
import BrandingModule from "./pages/BrandingModule";
import WebsiteModule from "./pages/WebsiteModule";
import PricingModule from "./pages/PricingModule";
import LeadsModule from "./pages/LeadsModule";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/create-business"} component={CreateBusiness} />
      <Route path="/business/:id" component={BusinessDetail} />
      <Route path={"/branding"} component={BrandingModule} />
      <Route path={"/website"} component={WebsiteModule} />
      <Route path={"/pricing"} component={PricingModule} />
      <Route path={"/leads"} component={LeadsModule} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
