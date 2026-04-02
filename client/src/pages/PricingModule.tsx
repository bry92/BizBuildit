import BizBuildItDashboard from "@/components/BizForgeDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";

export default function PricingModule() {
  const [, navigate] = useLocation();

  const { data: businesses } = trpc.business.list.useQuery();
  const selectedBusiness = businesses?.[0];

  const { data: pricing, isLoading: pricingLoading } = trpc.business.getPricing.useQuery(
    { businessId: selectedBusiness?.id || 0 },
    { enabled: !!selectedBusiness }
  );

  const generateMutation = trpc.business.generatePricing.useMutation({
    onSuccess: () => {
      toast.success("Pricing generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate pricing");
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
          <p className="text-muted-foreground mt-1">Pricing Calculator</p>
        </div>

        {/* Pricing Results */}
        {pricingLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Loading pricing...</p>
            </CardContent>
          </Card>
        ) : pricing ? (
          <div className="space-y-4">
            {/* Market Benchmark */}
            {pricing.marketBenchmark ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Market Benchmark</CardTitle>
                  <CardDescription>Typical pricing in your market</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(pricing.marketBenchmark as Record<string, number>).map(
                      ([key, value]) => (
                        <div key={key} className="bg-muted p-4 rounded text-center">
                          <p className="text-xs text-muted-foreground capitalize mb-1">
                            {key}
                          </p>
                          <p className="text-2xl font-bold">${Number(value)}</p>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Recommended Tiers */}
            {pricing.recommendedTiers ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Recommended Pricing Tiers</CardTitle>
                  <CardDescription>Suggested service packages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(pricing.recommendedTiers as Array<{name: string; price: number; description: string}>).map(
                      (tier, idx) => (
                        <div key={idx} className="bg-muted p-4 rounded border border-border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-lg">{String(tier.name)}</p>
                              <p className="text-sm text-muted-foreground">
                                {String(tier.description)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">${Number(tier.price)}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(`${tier.name}: $${tier.price}`)}
                                className="text-muted-foreground hover:text-foreground mt-1"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Pricing Strategy */}
            {pricing.pricingStrategy ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Pricing Strategy</CardTitle>
                  <CardDescription>Recommended approach and rationale</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm leading-relaxed flex-1">{pricing.pricingStrategy}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(pricing.pricingStrategy || "")}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">No pricing generated yet</p>
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
                    "Generate Pricing"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </BizBuildItDashboard>
  );
}
