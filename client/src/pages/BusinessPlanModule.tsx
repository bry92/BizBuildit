import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Download, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BusinessPlanModuleProps {
  params: {
    id: string;
  };
}

export default function BusinessPlanModule({ params }: BusinessPlanModuleProps) {
  const businessId = parseInt(params.id);
  const [, navigate] = useLocation();

  const { data: business } = trpc.business.get.useQuery({ businessId });
  const { data: plan, isLoading: planLoading } = trpc.businessPlan.get.useQuery({ businessId });

  const generatePlanMutation = trpc.businessPlan.generate.useMutation({
    onSuccess: () => {
      toast.success("Business plan and financial projections generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate business plan");
    },
  });

  const handleDownloadPlan = () => {
    if (!plan) {
      toast.error("No plan available to download");
      return;
    }

    const planContent = `
# Business Plan: ${business?.name || "Business"}

## Executive Summary
${plan.executiveSummary || "N/A"}

## Company Description
${plan.companyDescription || "N/A"}

## Market Analysis
${plan.marketAnalysis || "N/A"}

## Organization Structure
${plan.organizationStructure || "N/A"}

## Marketing Strategy
${plan.marketingStrategy || "N/A"}

## Operational Plan
${plan.operationalPlan || "N/A"}

## Funding Requirements
${plan.fundingRequirements || "N/A"}

## Risk Analysis
${plan.riskAnalysis || "N/A"}

## Financial Projections

### Year 1
- Revenue: $${((plan.financialProjections as any)?.year1?.revenue || 0).toLocaleString()}
- Expenses: $${((plan.financialProjections as any)?.year1?.expenses || 0).toLocaleString()}
- Profit: $${((plan.financialProjections as any)?.year1?.profit || 0).toLocaleString()}

### Year 2
- Revenue: $${((plan.financialProjections as any)?.year2?.revenue || 0).toLocaleString()}
- Expenses: $${((plan.financialProjections as any)?.year2?.expenses || 0).toLocaleString()}
- Profit: $${((plan.financialProjections as any)?.year2?.profit || 0).toLocaleString()}

### Year 3
- Revenue: $${((plan.financialProjections as any)?.year3?.revenue || 0).toLocaleString()}
- Expenses: $${((plan.financialProjections as any)?.year3?.expenses || 0).toLocaleString()}
- Profit: $${((plan.financialProjections as any)?.year3?.profit || 0).toLocaleString()}

## Break-Even Analysis
- Break-Even Point: $${((plan.breakEvenAnalysis as any)?.breakEvenPoint || 0).toLocaleString()} monthly
- Months to Break-Even: ${((plan.breakEvenAnalysis as any)?.monthsToBreakEven || 0)}
    `;

    const blob = new Blob([planContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${business?.name || "business"}-plan.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Business Plan & Financial Model</p>
        </div>
      </div>

      {/* Generation Button */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Generate Business Plan</CardTitle>
          <CardDescription>Create a comprehensive 10-15 page business plan with 3-year financial projections</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => generatePlanMutation.mutate({ businessId })}
            disabled={generatePlanMutation.isPending}
            className="w-full sm:w-auto"
          >
            {generatePlanMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Business Plan"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Plan Content */}
      {planLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : plan ? (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 bg-card border border-border">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="financial" className="text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs sm:text-sm">
              Market
            </TabsTrigger>
            <TabsTrigger value="operations" className="text-xs sm:text-sm">
              Operations
            </TabsTrigger>
            <TabsTrigger value="risk" className="text-xs sm:text-sm">
              Risk
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{plan.executiveSummary || "N/A"}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Company Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{plan.companyDescription || "N/A"}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Organization Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{plan.organizationStructure || "N/A"}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  3-Year Financial Projections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.financialProjections ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {["year1", "year2", "year3"].map((year, idx) => {
                        const yearData = (plan.financialProjections as any)?.[year];
                        return (
                          <div key={year} className="bg-muted p-4 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">Year {idx + 1}</p>
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Revenue</p>
                                <p className="font-semibold text-sm">
                                  ${(yearData?.revenue || 0).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Expenses</p>
                                <p className="font-semibold text-sm">
                                  ${(yearData?.expenses || 0).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Profit</p>
                                                <p className={`font-semibold text-sm ${((yearData?.profit as number) || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                                  ${(yearData?.profit || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No financial projections available</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Break-Even Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plan.breakEvenAnalysis ? (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Break-Even Point</p>
                      <p className="font-semibold text-lg">
                        ${((plan.breakEvenAnalysis as any)?.breakEvenPoint || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Months to Break-Even</p>
                      <p className="font-semibold text-lg">{((plan.breakEvenAnalysis as any)?.monthsToBreakEven || 0)} months</p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">No break-even analysis available</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Funding Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{plan.fundingRequirements || "N/A"}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Market Tab */}
          <TabsContent value="market" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Market Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{plan.marketAnalysis || "N/A"}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Marketing Strategy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{plan.marketingStrategy || "N/A"}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base">Operational Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{plan.operationalPlan || "N/A"}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Tab */}
          <TabsContent value="risk" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{plan.riskAnalysis || "N/A"}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No business plan generated yet. Click the button above to get started!</p>
          </CardContent>
        </Card>
      )}

      {/* Download Button */}
      {plan && (
        <div className="flex gap-2">
          <Button onClick={handleDownloadPlan} variant="outline" className="flex-1 sm:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Download Plan
          </Button>
        </div>
      )}
    </div>
  );
}
