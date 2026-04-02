import BizForgeDashboard from "@/components/BizForgeDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Plus, Zap, Palette, Globe, DollarSign, Megaphone, BarChart3 } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();
  const { data: businesses, isLoading } = trpc.business.list.useQuery();
  const createMutation = trpc.business.create.useMutation();

  const handleCreateBusiness = async () => {
    navigate("/create-business");
  };

  const features = [
    {
      icon: Palette,
      title: "Branding Engine",
      description: "Generate business names, logos, and brand identity",
      path: "/branding",
    },
    {
      icon: Globe,
      title: "Website Generator",
      description: "Create landing pages with AI-written copy",
      path: "/website",
    },
    {
      icon: DollarSign,
      title: "Pricing Calculator",
      description: "Analyze market benchmarks and recommend pricing",
      path: "/pricing",
    },
    {
      icon: Megaphone,
      title: "Lead Generation",
      description: "Generate ad copy and email templates",
      path: "/leads",
    },
  ];

  return (
    <BizForgeDashboard>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-4 sm:p-6 md:p-8 border border-primary/30">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome to BizForge AI</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Build a complete business concept in minutes with AI-powered tools for branding, websites, pricing, and marketing.
          </p>
          <Button
            onClick={handleCreateBusiness}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Business
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Businesses Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{businesses?.length || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Branding Generated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businesses?.filter((b) => b.status !== "draft").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Websites Built
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {businesses?.filter((b) => b.status === "published").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Time Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(businesses?.length || 0) * 8}h
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-4">Available Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(feature.path)}
                >
                  <CardHeader>
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Businesses */}
        {businesses && businesses.length > 0 && (
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4">Your Recent Businesses</h3>
            <div className="space-y-3">
              {businesses.slice(0, 5).map((business) => (
                <Card
                  key={business.id}
                  className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/business/${business.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-sm sm:text-base truncate">{business.name}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm truncate">
                          {business.serviceType} • {business.location}
                        </CardDescription>
                      </div>
                      <div className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded flex-shrink-0">
                        {business.status}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {businesses && businesses.length === 0 && (
          <Card className="bg-card border-border border-dashed">
            <CardHeader className="text-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No businesses yet</CardTitle>
              <CardDescription className="mt-2">
                Create your first business concept to get started
              </CardDescription>
              <Button
                onClick={handleCreateBusiness}
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Business
              </Button>
            </CardHeader>
          </Card>
        )}
      </div>
    </BizForgeDashboard>
  );
}
