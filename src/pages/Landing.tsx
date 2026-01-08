import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { 
  Sparkles, 
  Zap, 
  Clock, 
  Target, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook,
  Check,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant Repurposing",
    description: "Transform your long-form content into platform-optimized posts in seconds.",
  },
  {
    icon: Target,
    title: "Platform-Specific",
    description: "AI understands each platform's unique style, character limits, and best practices.",
  },
  {
    icon: Clock,
    title: "Save Hours Daily",
    description: "Stop manually rewriting content. Let AI handle the heavy lifting.",
  },
];

const platforms = [
  { icon: Instagram, name: "Instagram", color: "text-pink-500" },
  { icon: Facebook, name: "Facebook", color: "text-blue-500" },
  { icon: Linkedin, name: "LinkedIn", color: "text-blue-600" },
  { icon: Twitter, name: "X (Twitter)", color: "text-foreground" },
];

const pricingPlans = [
  {
    name: "Free",
    price: "৳0",
    description: "Perfect for trying out",
    features: [
      "5 generations per day",
      "All 4 platforms",
      "All tone options",
      "Generation history",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "৳499",
    period: "/month",
    description: "For serious creators",
    features: [
      "Unlimited generations",
      "Priority processing",
      "All 4 platforms",
      "All tone options",
      "Full history access",
      "Email support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI-Powered Content Transformation</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto">
            Turn One Piece of Content Into
            <span className="block text-primary">Multiple Social Posts</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Stop spending hours rewriting your content for each platform. 
            Our AI instantly creates optimized posts for Instagram, Facebook, LinkedIn, and X.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="gap-2 text-base px-8">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="text-base px-8">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Platform Icons */}
          <div className="flex justify-center gap-8 mt-12">
            {platforms.map((platform) => (
              <div key={platform.name} className="flex flex-col items-center gap-2">
                <div className="p-3 bg-card border border-border rounded-lg">
                  <platform.icon className={`h-6 w-6 ${platform.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Creators Love Us</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built specifically for content creators who want to maximize their reach without the extra work.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Start free, upgrade when you need more. Pay via bKash.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`border-border bg-card relative ${
                  plan.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link to="/auth?mode=signup">
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            💳 Pro payments are processed manually via bKash. Contact us after signup to upgrade.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Save Hours Every Week?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join hundreds of creators who are already using AI to repurpose their content.
          </p>
          <Link to="/auth?mode=signup">
            <Button size="lg" className="gap-2">
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 AI Content Repurposer. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
