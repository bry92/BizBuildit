import BizBuildItDashboard from "@/components/BizForgeDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Save, Copy } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useNotifications } from "@/components/NotificationCenter";

export default function BrandingModule() {
  const [, navigate] = useLocation();
  const { addNotification } = useNotifications();
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    businessName: "",
    tagline: "",
    brandVoice: "",
  });

  const { data: businesses } = trpc.business.list.useQuery();
  const selectedBusiness = businesses?.[0];

  const { data: branding, isLoading: brandingLoading } = trpc.business.getBranding.useQuery(
    { businessId: selectedBusiness?.id || 0 },
    { enabled: !!selectedBusiness }
  );

  const generateMutation = trpc.business.generateBranding.useMutation({
    onSuccess: () => {
      addNotification({
        type: "success",
        title: "Branding Generated!",
        message: "Your brand identity has been created. Review and customize as needed.",
        duration: 4000,
      });
    },
    onError: (error) => {
      addNotification({
        type: "error",
        title: "Generation Failed",
        message: error.message || "Failed to generate branding",
        duration: 5000,
      });
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification({
      type: "success",
      title: "Copied!",
      message: "Text copied to clipboard.",
      duration: 2000,
    });
  };

  if (!selectedBusiness) {
    return (
      <BizBuildItDashboard>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No business selected</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </BizBuildItDashboard>
    );
  }

  return (
    <BizBuildItDashboard>
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
          <p className="text-muted-foreground mt-1">Branding Engine</p>
        </div>

        {/* Business Context */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Business Context</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Service Type</p>
              <p className="font-medium">{selectedBusiness.serviceType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-medium">{selectedBusiness.location}</p>
            </div>
            {selectedBusiness.targetMarket && (
              <div>
                <p className="text-xs text-muted-foreground">Target Market</p>
                <p className="font-medium text-sm">{selectedBusiness.targetMarket}</p>
              </div>
            )}
            {selectedBusiness.businessGoals && (
              <div>
                <p className="text-xs text-muted-foreground">Business Goals</p>
                <p className="font-medium text-sm">{selectedBusiness.businessGoals}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Branding Results */}
        {brandingLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Loading branding...</p>
            </CardContent>
          </Card>
        ) : branding ? (
          <div className="space-y-4">
            {/* Business Name */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Business Name</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(branding.businessName)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{branding.businessName}</p>
              </CardContent>
            </Card>

            {/* Tagline */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Tagline</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(branding.tagline || "")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg italic text-foreground">{branding.tagline}</p>
              </CardContent>
            </Card>

            {/* Brand Voice */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Brand Voice & Tone</CardTitle>
                <CardDescription>How your brand communicates</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{branding.brandVoice}</p>
              </CardContent>
            </Card>

            {/* Color Palette */}
            {branding.colorPalette ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Color Palette</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(branding.colorPalette as Record<string, string>).map(
                      ([key, color]) => (
                        <div key={key} className="flex flex-col items-center gap-2">
                          <div
                            className="w-16 h-16 rounded border border-border cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: String(color) }}
                            onClick={() => handleCopy(String(color))}
                            title="Click to copy color code"
                          />
                          <p className="text-xs text-muted-foreground capitalize font-medium">
                            {key}
                          </p>
                          <p className="text-xs text-muted-foreground">{String(color)}</p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Logo Concept */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Logo Concept</CardTitle>
                <CardDescription>Design direction and inspiration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{branding.logoDescription}</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">No branding generated yet</p>
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
                    "Generate Branding"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {branding && (
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setEditData({
                  businessName: branding.businessName || "",
                  tagline: branding.tagline || "",
                  brandVoice: branding.brandVoice || "",
                });
                setEditMode(!editMode);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              {editMode ? "Cancel" : "Edit"}
            </Button>
            {editMode && (
              <Button variant="outline" className="border-border">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        )}
      </div>
    </BizBuildItDashboard>
  );
}
