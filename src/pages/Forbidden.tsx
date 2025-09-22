import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-destructive/10 p-4 rounded-full">
              <Shield className="h-12 w-12 text-destructive" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">403 - Přístup zamítnut</CardTitle>
            <CardDescription className="mt-2">
              Nemáte oprávnění pro přístup k této stránce
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Pro přístup k této části aplikace potřebujete vyšší oprávnění. 
            Kontaktujte správce systému.
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
            <Button 
              onClick={() => navigate("/")}
              className="flex items-center"
            >
              <Home className="mr-2 h-4 w-4" />
              Domů
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}