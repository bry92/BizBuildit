import BizForgeDashboard from "@/components/BizForgeDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";

const SERVICE_TYPES = [
  "Pressure Washing",
  "Lawn Care",
  "House Cleaning",
  "Plumbing",
  "Electrical",
  "HVAC",
  "Landscaping",
  "Roofing",
  "Painting",
  "Carpentry",
  "Web Design",
  "Digital Marketing",
  "Consulting",
  "Tutoring",
  "Photography",
  "Videography",
  "Graphic Design",
  "Writing",
  "Social Media Management",
  "Virtual Assistant",
  "Other",
];

export default function CreateBusiness() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    serviceType: "",
    targetMarket: "",
    location: "",
    businessGoals: "",
  });

  const createMutation = trpc.business.create.useMutation({
    onSuccess: () => {
      toast.success("Business created successfully!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create business");
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, serviceType: value }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      toast.error("Please enter a business name");
      return;
    }
    if (step === 2 && !formData.serviceType) {
      toast.error("Please select a service type");
      return;
    }
    if (step === 3 && !formData.location.trim()) {
      toast.error("Please enter a location");
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.serviceType || !formData.location.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    createMutation.mutate({
      name: formData.name,
      serviceType: formData.serviceType,
      targetMarket: formData.targetMarket,
      location: formData.location,
      businessGoals: formData.businessGoals,
    });
  };

  const steps = [
    {
      title: "Business Name",
      description: "What will you call your business?",
    },
    {
      title: "Service Type",
      description: "What service does your business provide?",
    },
    {
      title: "Location",
      description: "Where is your business located?",
    },
    {
      title: "Target Market",
      description: "Who is your target customer?",
    },
    {
      title: "Business Goals",
      description: "What are your main business objectives?",
    },
  ];

  return (
    <BizForgeDashboard>
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, index) => (
              <div key={index} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    index + 1 < step
                      ? "bg-primary text-primary-foreground"
                      : index + 1 === step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1 < step ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      index + 1 < step ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Step {step} of {steps.length}
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>{steps[step - 1].title}</CardTitle>
            <CardDescription>{steps[step - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Business Name */}
            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Crystal Clean Pressure Washing"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  This is the name customers will see
                </p>
              </div>
            )}

            {/* Step 2: Service Type */}
            {step === 2 && (
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={formData.serviceType} onValueChange={handleSelectChange}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Select a service type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the primary service your business offers
                </p>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g., Las Vegas, NV"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  City and state where your business operates
                </p>
              </div>
            )}

            {/* Step 4: Target Market */}
            {step === 4 && (
              <div className="space-y-2">
                <Label htmlFor="targetMarket">Target Market</Label>
                <Textarea
                  id="targetMarket"
                  name="targetMarket"
                  placeholder="e.g., Residential homeowners, small commercial properties, HOAs"
                  value={formData.targetMarket}
                  onChange={handleInputChange}
                  className="bg-input border-border min-h-24"
                />
                <p className="text-xs text-muted-foreground">
                  Describe your ideal customers (optional)
                </p>
              </div>
            )}

            {/* Step 5: Business Goals */}
            {step === 5 && (
              <div className="space-y-2">
                <Label htmlFor="businessGoals">Business Goals</Label>
                <Textarea
                  id="businessGoals"
                  name="businessGoals"
                  placeholder="e.g., Build recurring revenue, expand to commercial clients, establish brand reputation"
                  value={formData.businessGoals}
                  onChange={handleInputChange}
                  className="bg-input border-border min-h-24"
                />
                <p className="text-xs text-muted-foreground">
                  What do you want to achieve? (optional)
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={createMutation.isPending}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {step < steps.length && (
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={createMutation.isPending}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {step === steps.length && (
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Business"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {step === steps.length && (
          <Card className="bg-card border-border mt-6">
            <CardHeader>
              <CardTitle className="text-base">Review Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Business Name</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Service Type</p>
                  <p className="font-medium">{formData.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{formData.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target Market</p>
                  <p className="font-medium text-sm">
                    {formData.targetMarket || "Not specified"}
                  </p>
                </div>
              </div>
              {formData.businessGoals && (
                <div>
                  <p className="text-xs text-muted-foreground">Business Goals</p>
                  <p className="font-medium text-sm">{formData.businessGoals}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </BizForgeDashboard>
  );
}
