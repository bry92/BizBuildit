import BizBuildItDashboard from "@/components/BizForgeDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";

export default function LeadsModule() {
  const [, navigate] = useLocation();

  const { data: businesses } = trpc.business.list.useQuery();
  const selectedBusiness = businesses?.[0];

  const { data: leads, isLoading: leadsLoading } = trpc.business.getLeads.useQuery(
    { businessId: selectedBusiness?.id || 0 },
    { enabled: !!selectedBusiness }
  );

  const generateMutation = trpc.business.generateLeads.useMutation({
    onSuccess: () => {
      toast.success("Lead templates generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate leads");
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
          <p className="text-muted-foreground mt-1">Lead Generation Templates</p>
        </div>

        {/* Leads Results */}
        {leadsLoading ? (
          <Card className="bg-card border-border">
            <CardContent className="py-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Loading leads templates...</p>
            </CardContent>
          </Card>
        ) : leads ? (
          <Tabs defaultValue="ads" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
              <TabsTrigger value="ads">Ad Copy</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            {/* Ad Copy Tab */}
            <TabsContent value="ads" className="space-y-4">
              {leads.facebookAdCopy ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Facebook Ad Copy</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(leads.facebookAdCopy || "")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed bg-muted p-4 rounded">
                      {leads.facebookAdCopy}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {leads.googleAdCopy ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Google Ads Copy</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(leads.googleAdCopy || "")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed bg-muted p-4 rounded">
                      {leads.googleAdCopy}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {leads.linkedinAdCopy ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">LinkedIn Ad Copy</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(leads.linkedinAdCopy || "")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed bg-muted p-4 rounded">
                      {leads.linkedinAdCopy}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-4">
              {leads.emailSequence ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Email Sequence</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(String(leads.emailSequence || ""))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>Follow-up email templates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed bg-muted p-4 rounded whitespace-pre-wrap">
                      {String(leads.emailSequence)}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            {/* Other Tab */}
            <TabsContent value="other" className="space-y-4">
              {leads.smsScript ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">SMS Script</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(leads.smsScript || "")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed bg-muted p-4 rounded">
                      {leads.smsScript}
                    </p>
                  </CardContent>
                </Card>
              ) : null}

              {leads.leadMagnetIdeas ? (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Lead Magnet Ideas</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(leads.leadMagnetIdeas || "")}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed bg-muted p-4 rounded">
                      {leads.leadMagnetIdeas}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground">No lead templates generated yet</p>
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
                    "Generate Lead Templates"
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
