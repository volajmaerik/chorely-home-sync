import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg p-2 mb-6">
          <img src="/chorely-logo.png" alt="Chorely" className="w-full h-full object-contain" />
        </div>
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-flex items-center gap-2 text-primary underline hover:text-primary/80 transition-colors">
          <img src="/chorely-logo.png" alt="Chorely" className="h-4 w-4" />
          Return to Chorely
        </a>
      </div>
    </div>
  );
};

export default NotFound;
