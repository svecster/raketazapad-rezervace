import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-warning/10 p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-warning" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">404 - Stránka nenalezena</CardTitle>
            <CardDescription className="mt-2">
              Požadovaná stránka neexistuje nebo byla přesunuta
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Omlouváme se, ale stránka kterou hledáte nebyla nalezena.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět
            </Button>
            <Button asChild className="flex items-center">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Domů
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
