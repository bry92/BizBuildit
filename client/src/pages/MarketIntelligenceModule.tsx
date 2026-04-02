import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, TrendingUp, Users, Target } from "lucide-react";
import { toast } from "sonner";

interface MarketIntelligenceModuleProps {
  params: {
    id: string;
  };
}

export default function MarketIntelligenceModule({ params }: MarketIntelligenceModuleProps) {
  const businessId = parseInt(params.id);
  const [, navigate] = useLocation();

  const { data: business } = trpc.business.get.useQuery({ businessId });
  const analyzeMutation = trpc.marketIntelligence.analyze.useMutation({
    onSuccess: () => {
      toast.success("Market intelligence analysis complete!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to analyze market");
    },
  });

  const [analysis, setAnalysis] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeMutation.mutateAsync({ businessId });
      setAnalysis(result);
    } finally {
      setLoading(false);
    }
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
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Market Intelligence & Competitor Analysis</p>
        </div>
      </div>

      {/* Analysis Button */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Generate Market Analysis</CardTitle>
          <CardDescription>Analyze market size, competitors, trends, and opportunities</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleAnalyze}
            disabled={analyzeMutation.isPending || loading}
            className="w-full sm:w-auto"
          >
            {analyzeMutation.isPending || loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Market"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : analysis ? (
        <Tabs defaultValue="market" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 bg-card border border-border">
            <TabsTrigger value="market" className="text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Market
            </TabsTrigger>
            <TabsTrigger value="competitors" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Competitors
            </TabsTrigger>
            <TabsTrigger value="gaps" className="text-xs sm:text-sm">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Opportunities
            </TabsTrigger>
          </TabsList>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Market Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.marketAnalysis ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Market Size</p>
                      <p className="font-semibold text-sm">{analysis.marketAnalysis.marketSize || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Market Growth</p>
                      <p className="font-semibold text-sm">{analysis.marketAnalysis.marketGrowth || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Market Saturation</p>
                      <p className="font-semibold text-sm">{analysis.marketAnalysis.marketSaturation || "N/A"}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No market data available</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{analysis.marketAnalysis?.marketTrends || "N/A"}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Target Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{analysis.marketAnalysis?.targetDemographics || "N/A"}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Market Challenges</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{analysis.marketAnalysis?.challenges || "N/A"}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Competitive Advantage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {analysis.competitorAnalysis?.competitiveAdvantage || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Market Position</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {analysis.competitorAnalysis?.marketPosition || "N/A"}
                </p>
              </CardContent>
            </Card>

            {analysis.competitorAnalysis?.directCompetitors && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Direct Competitors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(analysis.competitorAnalysis.directCompetitors as any[]).map((competitor, idx) => (
                    <div key={idx} className="border-b border-border pb-4 last:border-b-0">
                      <p className="font-semibold text-sm">{competitor.name}</p>
                      <div className="mt-2 space-y-1 text-xs">
                        <p>
                          <span className="text-muted-foreground">Strengths:</span> {competitor.strength}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Weaknesses:</span> {competitor.weakness}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Pricing:</span> {competitor.pricing}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {analysis.competitorAnalysis?.indirectCompetitors && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-base">Indirect Competitors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(analysis.competitorAnalysis.indirectCompetitors as any[]).map((competitor, idx) => (
                    <div key={idx} className="border-b border-border pb-3 last:border-b-0">
                      <p className="font-semibold text-sm">{competitor.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{competitor.threat}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="gaps" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Market Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{analysis.marketGaps?.marketGaps || "N/A"}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Untapped Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{analysis.marketGaps?.untappedSegments || "N/A"}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Innovation Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {analysis.marketGaps?.innovationOpportunities || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Partnership Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">
                  {analysis.marketGaps?.partnershipOpportunities || "N/A"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Recommended Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{analysis.marketGaps?.recommendedStrategy || "N/A"}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No analysis generated yet. Click the button above to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
