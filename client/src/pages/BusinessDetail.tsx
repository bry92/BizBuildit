import BizForgeDashboard from "@/components/BizForgeDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Palette, Globe, DollarSign, Megaphone, Loader2, ArrowLeft, Image } from "lucide-react";
import { toast } from "sonner";
import ExportButtons from "@/components/ExportButtons";

interface BusinessDetailProps {
  params: {
    id: string;
  };
}

export default function BusinessDetail({ params }: BusinessDetailProps) {
  const businessId = parseInt(params.id);
  const [, navigate] = useLocation();

  const { data: business, isLoading: businessLoading } = trpc.business.get.useQuery({
    businessId,
  });

  const { data: branding, isLoading: brandingLoading } = trpc.business.getBranding.useQuery({
    businessId,
  });

  const { data: website, isLoading: websiteLoading } = trpc.business.getWebsite.useQuery({
    businessId,
  });

  const { data: pricing, isLoading: pricingLoading } = trpc.business.getPricing.useQuery({
    businessId,
  });

  const { data: leads, isLoading: leadsLoading } = trpc.business.getLeads.useQuery({
    businessId,
  });

  const generateBrandingMutation = trpc.business.generateBranding.useMutation({
    onSuccess: () => {
      toast.success("Branding generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate branding");
    },
  });

  const generateWebsiteMutation = trpc.business.generateWebsite.useMutation({
    onSuccess: () => {
      toast.success("Website generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate website");
    },
  });

  const generatePricingMutation = trpc.business.generatePricing.useMutation({
    onSuccess: () => {
      toast.success("Pricing generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate pricing");
    },
  });

  const generateLeadsMutation = trpc.business.generateLeads.useMutation({
    onSuccess: () => {
      toast.success("Lead templates generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate leads");
    },
  });

  if (businessLoading) {
    return (
      <BizForgeDashboard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading business details...</p>
          </div>
        </div>
      </BizForgeDashboard>
    );
  }

  if (!business) {
    return (
      <BizForgeDashboard>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Business not found</p>
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
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
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
            <h1 className="text-2xl sm:text-3xl font-bold truncate">{business.name}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
              {business.serviceType} • {business.location}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="px-3 py-1 bg-primary/20 text-primary text-xs sm:text-sm font-medium rounded">
              {business.status}
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm font-medium text-foreground mb-3">Download Business Package</p>
          <ExportButtons businessId={business.id} businessName={business.name} />
        </div>

        {/* Business Info Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Business Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Service Type</p>
              <p className="font-medium">{business.serviceType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{business.location}</p>
            </div>
            {business.targetMarket && (
              <div>
                <p className="text-xs text-muted-foreground">Target Market</p>
                <p className="font-medium text-sm">{business.targetMarket}</p>
              </div>
            )}
            {business.businessGoals && (
              <div>
                <p className="text-xs text-muted-foreground">Business Goals</p>
                <p className="font-medium text-sm">{business.businessGoals}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generation Tabs */}
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-card border border-border">
            <TabsTrigger value="branding" className="flex items-center gap-2 text-xs sm:text-sm">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="website" className="flex items-center gap-2 text-xs sm:text-sm">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Website</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2 text-xs sm:text-sm">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2 text-xs sm:text-sm">
              <Megaphone className="w-4 h-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
            <TabsTrigger value="logo" className="flex items-center gap-2 text-xs sm:text-sm">
              <Image className="w-4 h-4" />
              <span className="hidden sm:inline">Logo</span>
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-4">
            {brandingLoading ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading branding...</p>
                </CardContent>
              </Card>
            ) : branding ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Brand Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Business Name</p>
                    <p className="font-medium text-lg">{branding.businessName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tagline</p>
                    <p className="font-medium italic">{branding.tagline}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Brand Voice</p>
                    <p className="text-sm">{branding.brandVoice}</p>
                  </div>
                  {branding.colorPalette ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Color Palette</p>
                      <div className="flex gap-2">
                        {Object.entries(branding.colorPalette as Record<string, string>).map(
                          ([key, color]) => (
                            <div key={key} className="flex flex-col items-center gap-1">
                              <div
                                className="w-12 h-12 rounded border border-border"
                                style={{ backgroundColor: String(color) }}
                              />
                              <p className="text-xs text-muted-foreground capitalize">{key}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <p className="text-xs text-muted-foreground">Logo Concept</p>
                    <p className="text-sm">{branding.logoDescription}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <Palette className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No branding generated yet</p>
                  <Button
                    onClick={() => generateBrandingMutation.mutate({ businessId })}
                    disabled={generateBrandingMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {generateBrandingMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Branding"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Website Tab */}
          <TabsContent value="website" className="space-y-4">
            {websiteLoading ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading website...</p>
                </CardContent>
              </Card>
            ) : website ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Landing Page</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Hero Title</p>
                    <p className="font-medium text-lg">{website.heroTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hero Subtitle</p>
                    <p className="font-medium">{website.heroSubtitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm">{website.heroDescription}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Features</p>
                    <p className="text-sm">{website.featuresSectionCopy}</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">SEO Information</p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Title:</span> {website.seoTitle}</p>
                      <p><span className="font-medium">Description:</span> {website.seoDescription}</p>
                      <p><span className="font-medium">Keywords:</span> {website.seoKeywords}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No website generated yet</p>
                  <Button
                    onClick={() => generateWebsiteMutation.mutate({ businessId })}
                    disabled={generateWebsiteMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {generateWebsiteMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Website"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4">
            {pricingLoading ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading pricing...</p>
                </CardContent>
              </Card>
            ) : pricing ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Pricing Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pricing.marketBenchmark ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Market Benchmark</p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(pricing.marketBenchmark as Record<string, number>).map(
                          ([key, value]) => (
                            <div key={key} className="bg-muted p-3 rounded">
                              <p className="text-xs text-muted-foreground capitalize">{key}</p>
                              <p className="font-bold text-lg">${Number(value)}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                  {pricing.recommendedTiers ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Recommended Tiers</p>
                      <div className="space-y-2">
                        {(pricing.recommendedTiers as Array<{name: string; price: number; description: string}>).map(
                          (tier, idx) => (
                            <div key={idx} className="bg-muted p-3 rounded">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{String(tier.name)}</p>
                                  <p className="text-sm text-muted-foreground">{String(tier.description)}</p>
                                </div>
                                <p className="font-bold text-lg">${Number(tier.price)}</p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                  {pricing.pricingStrategy ? (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Strategy</p>
                      <p className="text-sm">{pricing.pricingStrategy}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No pricing generated yet</p>
                  <Button
                    onClick={() => generatePricingMutation.mutate({ businessId })}
                    disabled={generatePricingMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {generatePricingMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Pricing"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads" className="space-y-4">
            {leadsLoading ? (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-muted-foreground">Loading leads...</p>
                </CardContent>
              </Card>
            ) : leads ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Lead Generation Templates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {leads.facebookAdCopy ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Facebook Ad Copy</p>
                      <p className="text-sm bg-muted p-3 rounded">{leads.facebookAdCopy}</p>
                    </div>
                  ) : null}
                  {leads.googleAdCopy ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Google Ads Copy</p>
                      <p className="text-sm bg-muted p-3 rounded">{leads.googleAdCopy}</p>
                    </div>
                  ) : null}
                  {leads.linkedinAdCopy ? (
                    <div>
                      <p className="text-xs text-muted-foreground">LinkedIn Ad Copy</p>
                      <p className="text-sm bg-muted p-3 rounded">{leads.linkedinAdCopy}</p>
                    </div>
                  ) : null}
                  {leads.smsScript ? (
                    <div>
                      <p className="text-xs text-muted-foreground">SMS Script</p>
                      <p className="text-sm bg-muted p-3 rounded">{leads.smsScript}</p>
                    </div>
                  ) : null}
                  {leads.leadMagnetIdeas ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Lead Magnet Ideas</p>
                      <p className="text-sm bg-muted p-3 rounded">{leads.leadMagnetIdeas}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="py-8 text-center">
                  <Megaphone className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No leads generated yet</p>
                  <Button
                    onClick={() => generateLeadsMutation.mutate({ businessId })}
                    disabled={generateLeadsMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {generateLeadsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Leads"
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Logo Tab */}
          <TabsContent value="logo" className="space-y-4">
            <Card className="bg-card border-border">
              <CardContent className="py-8 text-center">
                <Image className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Generate professional logos and visual assets</p>
                <Button
                  onClick={() => navigate(`/logo?id=${businessId}`)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Go to Logo Generator
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
         </Tabs>
      </div>
    </BizForgeDashboard>
  );
}
