import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Download, Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface LogoModuleProps {
  params: {
    id: string;
  };
}

export default function LogoModule({ params }: LogoModuleProps) {
  const businessId = parseInt(params.id);
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: business } = trpc.business.get.useQuery({ businessId });
  const { data: logo, isLoading: logoLoading } = trpc.logo.get.useQuery({ businessId });

  const generateLogoMutation = trpc.logo.generate.useMutation({
    onSuccess: () => {
      toast.success("Logos and visual assets generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate logos");
    },
  });

  const handleCopy = (url: string | null | undefined, type: string) => {
    if (!url) {
      toast.error(`${type} not available`);
      return;
    }
    navigator.clipboard.writeText(url);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    toast.success(`${type} URL copied!`);
  };

  const handleDownload = (url: string | null | undefined, filename: string) => {
    if (!url) {
      toast.error("URL not available");
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Business not found</p>
        <Button onClick={() => navigate("/")} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/business/${businessId}`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{business.name}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Logo & Visual Assets</p>
        </div>
      </div>

      {/* Generation Button */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Generate Visual Assets</CardTitle>
          <CardDescription>Create professional logos, social media banners, and business card designs</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => generateLogoMutation.mutate({ businessId })}
            disabled={generateLogoMutation.isPending}
            className="w-full sm:w-auto"
          >
            {generateLogoMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Logos & Assets"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Logo Preview */}
      {logoLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : logo ? (
        <Tabs defaultValue="logo" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="logo" className="text-xs sm:text-sm">
              Logo
            </TabsTrigger>
            <TabsTrigger value="facebook" className="text-xs sm:text-sm">
              Facebook
            </TabsTrigger>
            <TabsTrigger value="instagram" className="text-xs sm:text-sm">
              Instagram
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="text-xs sm:text-sm">
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="card" className="text-xs sm:text-sm">
              Card
            </TabsTrigger>
            <TabsTrigger value="favicon" className="text-xs sm:text-sm">
              Favicon
            </TabsTrigger>
            <TabsTrigger value="icon" className="text-xs sm:text-sm">
              Icon
            </TabsTrigger>
          </TabsList>

          {/* Logo Tab */}
          <TabsContent value="logo" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Business Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {logo.logoImageUrl ? (
                  <>
                    <div className="bg-background rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                      <img
                        src={logo.logoImageUrl}
                        alt="Business Logo"
                        className="max-w-full max-h-[300px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleCopy(logo.logoImageUrl, "Logo URL")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {copied === "Logo URL" ? "Copied!" : "Copy URL"}
                      </Button>
                      <Button
                        onClick={() => handleDownload(logo.logoImageUrl, "logo.png")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No logo generated yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facebook Banner Tab */}
          <TabsContent value="facebook" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Facebook Banner (1200x628px)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {logo.facebookBannerUrl ? (
                  <>
                    <div className="bg-background rounded-lg p-4 flex items-center justify-center">
                      <img
                        src={logo.facebookBannerUrl}
                        alt="Facebook Banner"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleCopy(logo.facebookBannerUrl, "Facebook URL")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        onClick={() => handleDownload(logo.facebookBannerUrl, "facebook-banner.png")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No banner generated yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instagram Banner Tab */}
          <TabsContent value="instagram" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Instagram Banner (1080x1080px)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {logo.instagramBannerUrl ? (
                  <>
                    <div className="bg-background rounded-lg p-4 flex items-center justify-center">
                      <img
                        src={logo.instagramBannerUrl}
                        alt="Instagram Banner"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleCopy(logo.instagramBannerUrl, "Instagram URL")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        onClick={() => handleDownload(logo.instagramBannerUrl, "instagram-banner.png")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No banner generated yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* LinkedIn Banner Tab */}
          <TabsContent value="linkedin" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">LinkedIn Banner (1500x500px)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {logo.linkedinBannerUrl ? (
                  <>
                    <div className="bg-background rounded-lg p-4 flex items-center justify-center">
                      <img
                        src={logo.linkedinBannerUrl}
                        alt="LinkedIn Banner"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleCopy(logo.linkedinBannerUrl, "LinkedIn URL")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        onClick={() => handleDownload(logo.linkedinBannerUrl, "linkedin-banner.png")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No banner generated yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Card Tab */}
          <TabsContent value="card" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Business Card Design</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {logo.businessCardUrl ? (
                  <>
                    <div className="bg-background rounded-lg p-4 flex items-center justify-center">
                      <img
                        src={logo.businessCardUrl}
                        alt="Business Card"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleCopy(logo.businessCardUrl, "Card URL")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        onClick={() => handleDownload(logo.businessCardUrl, "business-card.png")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No card design generated yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favicon Tab */}
          <TabsContent value="favicon" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Favicon (256x256px)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {logo.faviconUrl ? (
                  <>
                    <div className="bg-background rounded-lg p-8 flex items-center justify-center">
                      <img
                        src={logo.faviconUrl}
                        alt="Favicon"
                        className="max-w-full max-h-[256px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleCopy(logo.faviconUrl, "Favicon URL")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        onClick={() => handleDownload(logo.faviconUrl, "favicon.png")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No favicon generated yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* App Icon Tab */}
          <TabsContent value="icon" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">App Icon (512x512px)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {logo.appIconUrl ? (
                  <>
                    <div className="bg-background rounded-lg p-8 flex items-center justify-center">
                      <img
                        src={logo.appIconUrl}
                        alt="App Icon"
                        className="max-w-full max-h-[300px] object-contain"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleCopy(logo.appIconUrl, "Icon URL")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        onClick={() => handleDownload(logo.appIconUrl, "app-icon.png")}
                        variant="outline"
                        size="sm"
                        className="text-xs sm:text-sm"
                      >
                        <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Download
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No icon generated yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No logos generated yet. Click the button above to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
