import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DeploymentModuleProps {
  params: {
    id: string;
  };
}

export default function DeploymentModule({ params }: DeploymentModuleProps) {
  const businessId = parseInt(params.id);
  const [, navigate] = useLocation();

  const { data: business } = trpc.business.get.useQuery({ businessId });
  const { data: options, isLoading } = trpc.deployment.getDeploymentOptions.useQuery({ businessId });

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
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Deploy Your Website</p>
        </div>
      </div>

      {/* Status */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : options ? (
        <>
          {/* Status Card */}
          <Card className={`border-2 ${options.hasWebsite ? "border-green-500/50 bg-green-500/10" : "border-yellow-500/50 bg-yellow-500/10"}`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {options.hasWebsite ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-semibold text-sm">Website Ready for Deployment</p>
                      <p className="text-xs text-muted-foreground">Your website is generated and ready to deploy</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">!</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Generate Website First</p>
                      <p className="text-xs text-muted-foreground">You need to generate your website before deploying</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {options.nextSteps?.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-sm">
                    <span className="font-semibold text-primary min-w-fit">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Deployment Options */}
          {options.hasWebsite && (
            <>
              <h2 className="text-lg font-semibold">Choose Your Deployment Platform</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {options.deploymentOptions?.map((platform, idx) => (
                  <Card key={idx} className="bg-card border-border hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-3xl mb-2">{platform.icon}</div>
                          <CardTitle className="text-base">{platform.name}</CardTitle>
                          <CardDescription className="text-xs">{platform.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Features:</p>
                        <ul className="space-y-1">
                          {platform.features?.map((feature, fidx) => (
                            <li key={fidx} className="text-xs flex items-center gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {platform.url ? (
                        <Button
                          onClick={() => platform.url && window.open(platform.url, "_blank")}
                          className="w-full bg-primary hover:bg-primary/90"
                          size="sm"
                        >
                          Deploy to {platform.name}
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Button>
                      ) : (
                        <Button disabled className="w-full" size="sm">
                          Generate Website First
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Deployment Guide */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Deployment Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">General Steps:</h3>
                <ol className="space-y-2 ml-4 list-decimal">
                  <li>Choose a deployment platform from above</li>
                  <li>Click the deployment button</li>
                  <li>Sign in with your GitHub account</li>
                  <li>Authorize the platform to access your repositories</li>
                  <li>Your website will be deployed automatically</li>
                  <li>Configure your custom domain (optional)</li>
                </ol>
              </div>

              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-2">Tips:</h3>
                <ul className="space-y-2 ml-4 list-disc">
                  <li>All platforms offer free hosting with custom domain support</li>
                  <li>Deployments are automatic when you push code to your repository</li>
                  <li>SSL certificates are included for free</li>
                  <li>You can rollback to previous versions anytime</li>
                  <li>Consider using a custom domain for a professional appearance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Unable to load deployment options</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
