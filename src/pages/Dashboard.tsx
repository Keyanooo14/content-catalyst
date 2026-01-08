import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, 
  Sparkles, 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook,
  Copy,
  Check,
  RefreshCw
} from "lucide-react";

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-500" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
  { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "text-foreground" },
];

const tones = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "viral", label: "Viral" },
  { value: "friendly", label: "Friendly" },
];

interface GenerationResult {
  [platform: string]: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [tone, setTone] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const [generationsRemaining, setGenerationsRemaining] = useState<number | string>(5);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_pro, generations_today, last_generation_date")
      .eq("user_id", user!.id)
      .single();

    if (!error && data) {
      const today = new Date().toISOString().split("T")[0];
      const isNewDay = data.last_generation_date !== today;
      const remaining = data.is_pro 
        ? "unlimited" 
        : isNewDay ? 5 : Math.max(0, 5 - data.generations_today);
      setGenerationsRemaining(remaining);
    }
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content to repurpose.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select platforms",
        description: "Please select at least one platform.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setResults(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await supabase.functions.invoke("generate-content", {
        body: {
          content,
          platforms: selectedPlatforms,
          tone,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate content");
      }

      const data = response.data;

      if (data.error) {
        if (data.limitReached) {
          toast({
            title: "Daily limit reached",
            description: "Upgrade to Pro for unlimited generations.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setResults(data.results);
      setGenerationsRemaining(data.generationsRemaining);
      
      toast({
        title: "Content generated!",
        description: `Successfully created posts for ${selectedPlatforms.length} platform(s).`,
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (platform: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2000);
    toast({
      title: "Copied!",
      description: `${platform} content copied to clipboard.`,
    });
  };

  const handleRegenerate = () => {
    setResults(null);
    handleGenerate();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Content Repurposer</h1>
            <p className="text-muted-foreground">
              Paste your content, select platforms and tone, then let AI do the rest.
              <span className="ml-2 text-sm">
                ({typeof generationsRemaining === "number" 
                  ? `${generationsRemaining} generations remaining today`
                  : "Unlimited generations (Pro)"})
              </span>
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Your Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste your blog post, article, script, or any long-form content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {content.length}/10,000 characters
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Select Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {platforms.map((platform) => (
                      <div
                        key={platform.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlatforms.includes(platform.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => togglePlatform(platform.id)}
                      >
                        <Checkbox
                          checked={selectedPlatforms.includes(platform.id)}
                          onCheckedChange={() => togglePlatform(platform.id)}
                        />
                        <platform.icon className={`h-5 w-5 ${platform.color}`} />
                        <Label className="cursor-pointer">{platform.name}</Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Select Tone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Button
                onClick={handleGenerate}
                disabled={generating || !content.trim() || selectedPlatforms.length === 0}
                className="w-full gap-2"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              {results ? (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Generated Content</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRegenerate}
                      disabled={generating}
                      className="gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate
                    </Button>
                  </div>
                  
                  {selectedPlatforms.map((platformId) => {
                    const platform = platforms.find((p) => p.id === platformId);
                    if (!platform || !results[platformId]) return null;
                    
                    return (
                      <Card key={platformId} className="border-border">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <platform.icon className={`h-5 w-5 ${platform.color}`} />
                              <CardTitle className="text-base">{platform.name}</CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(platform.name, results[platformId])}
                              className="gap-2"
                            >
                              {copiedPlatform === platform.name ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap text-sm">
                            {results[platformId]}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              ) : (
                <Card className="border-border border-dashed h-full min-h-[400px] flex items-center justify-center">
                  <CardContent className="text-center text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your generated content will appear here</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
