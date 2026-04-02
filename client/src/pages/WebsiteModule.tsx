import BizForgeDashboard from "@/components/BizForgeDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function WebsiteModule() {
  const [, navigate] = useLocation();
  const [previewMode, setPreviewMode] = useState(false);

  const { data: businesses } = trpc.business.list.useQuery();
  const selectedBusiness = businesses?.[0];

  const { data: website, isLoading: websiteLoading } = trpc.business.getWebsite.useQuery(
    { businessId: selectedBusiness?.id || 0 },
    { enabled: !!selectedBusiness }
  );

  const generateMutation = trpc.business.generateWebsite.useMutation({
    onSuccess: () => {
      toast.success("Website generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate website");
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (!selectedBusiness) {
    return (
      <BizForgeDashboard>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No business selected</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </BizForgeDashboard>
    );
  }

  return (
    <BizForgeDashboard>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-3xl font-bold">{selectedBusiness.name}</h1>
          <p className="text-muted-foreground mt-1">Website Generator</p>
        </div>

        {/* Website Results */}
        {websiteLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Loading website...</p>
            </CardContent>
          </Card>
        ) : website ? (
          <div className="space-y-4">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card border border-border">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>

              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4">
                {/* Hero Section */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Hero Section</CardTitle>
                    <CardDescription>Main headline and subheading</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">Hero Title</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(website.heroTitle || "")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-lg font-bold">{website.heroTitle}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">Hero Subtitle</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(website.heroSubtitle || "")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm">{website.heroSubtitle}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">Hero Description</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(website.heroDescription || "")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm leading-relaxed">{website.heroDescription}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Features Section */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">Features Section</CardTitle>
                    <CardDescription>Key benefits and features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm leading-relaxed flex-1">
                        {website.featuresSectionCopy}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(website.featuresSectionCopy || "")}
                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* CTA Section */}
                {website.ctaText && (
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="text-base">Call-to-Action</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm leading-relaxed flex-1">
                          {website.ctaText}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(website.ctaText || "")}
                          className="text-muted-foreground hover:text-foreground flex-shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo" className="space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">SEO Metadata</CardTitle>
                    <CardDescription>Search engine optimization tags</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">Page Title</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(website.seoTitle || "")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded">{website.seoTitle}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">Meta Description</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(website.seoDescription || "")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded">{website.seoDescription}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">Keywords</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(website.seoKeywords || "")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded">{website.seoKeywords}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">No website generated yet</p>
                <Button
                  onClick={() => generateMutation.mutate({ businessId: selectedBusiness.id })}
                  disabled={generateMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Website"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </BizForgeDashboard>
  );
}
