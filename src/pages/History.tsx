import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Loader2,
  Copy,
  Check,
  Trash2,
  Clock,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";

interface Generation {
  id: string;
  original_content: string;
  tone: string;
  platforms: string[];
  results: Record<string, string>;
  created_at: string;
}

const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  twitter: Twitter,
};

const platformColors: Record<string, string> = {
  instagram: "text-pink-500",
  facebook: "text-blue-500",
  linkedin: "text-blue-600",
  twitter: "text-foreground",
};

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("generations")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching history:", error);
      toast({
        title: "Error",
        description: "Failed to load generation history.",
        variant: "destructive",
      });
    } else {
      // Type assertion to handle the results field properly
      const typedData = (data || []).map(item => ({
        ...item,
        results: item.results as Record<string, string>
      }));
      setGenerations(typedData);
    }
    setLoading(false);
  };

  const deleteGeneration = async (id: string) => {
    const { error } = await supabase.from("generations").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete generation.",
        variant: "destructive",
      });
    } else {
      setGenerations((prev) => prev.filter((g) => g.id !== id));
      toast({
        title: "Deleted",
        description: "Generation removed from history.",
      });
    }
  };

  const copyToClipboard = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (authLoading || loading) {
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Generation History</h1>
            <p className="text-muted-foreground">
              View and manage your previous content generations.
            </p>
          </div>

          {generations.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No generations yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start repurposing content to see your history here.
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {generations.map((gen) => {
                const isExpanded = expandedId === gen.id;

                return (
                  <Card key={gen.id} className="border-border">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="capitalize">
                              {gen.tone}
                            </Badge>
                            {gen.platforms.map((platform) => {
                              const Icon = platformIcons[platform];
                              return Icon ? (
                                <Icon
                                  key={platform}
                                  className={`h-4 w-4 ${platformColors[platform]}`}
                                />
                              ) : null;
                            })}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(gen.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteGeneration(gen.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : gen.id)
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Original Content:</p>
                        <p className="text-sm text-muted-foreground">
                          {isExpanded
                            ? gen.original_content
                            : truncateText(gen.original_content)}
                        </p>
                      </div>

                      {isExpanded && (
                        <div className="space-y-3 border-t border-border pt-4">
                          {gen.platforms.map((platform) => {
                            const Icon = platformIcons[platform];
                            const copyKey = `${gen.id}-${platform}`;
                            const content = gen.results[platform];

                            if (!content) return null;

                            return (
                              <div
                                key={platform}
                                className="bg-muted/30 p-4 rounded-lg"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    {Icon && (
                                      <Icon
                                        className={`h-4 w-4 ${platformColors[platform]}`}
                                      />
                                    )}
                                    <span className="text-sm font-medium capitalize">
                                      {platform}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(copyKey, content)}
                                    className="gap-1"
                                  >
                                    {copiedKey === copyKey ? (
                                      <>
                                        <Check className="h-3 w-3" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3" />
                                        Copy
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">
                                  {content}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
