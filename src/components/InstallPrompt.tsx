import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, X, Smartphone } from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { useState } from "react";

export default function InstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:w-96 shadow-lg border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Install MarcLyn Hub</CardTitle>
            <Badge variant="secondary" className="text-xs">PWA</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-sm">
          Get faster access and offline support by installing our app
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button onClick={handleInstall} size="sm" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDismissed(true)}
          >
            Not Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}