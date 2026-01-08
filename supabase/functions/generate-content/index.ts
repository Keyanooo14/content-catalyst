import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const FREE_DAILY_LIMIT = 5;

interface GenerateRequest {
  content: string;
  platforms: string[];
  tone: string;
}

const platformPrompts: Record<string, string> = {
  instagram: "Instagram (use emojis, hashtags, engaging captions, keep it visual-friendly, max 2200 characters)",
  facebook: "Facebook (conversational, can be longer, encourage engagement and shares)",
  linkedin: "LinkedIn (professional, insightful, thought leadership, use line breaks for readability)",
  twitter: "X/Twitter (concise, punchy, max 280 characters, use relevant hashtags sparingly)",
};

const toneDescriptions: Record<string, string> = {
  professional: "Professional: formal, authoritative, credible, and business-appropriate",
  casual: "Casual: relaxed, friendly, conversational, like talking to a friend",
  viral: "Viral: attention-grabbing, shareable, uses hooks and curiosity gaps",
  friendly: "Friendly: warm, approachable, positive, and engaging",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { content, platforms, tone }: GenerateRequest = await req.json();

    if (!content || !platforms?.length || !tone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (content.length > 10000) {
      return new Response(JSON.stringify({ error: 'Content too long (max 10,000 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check user limits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      return new Response(JSON.stringify({ error: 'Could not fetch user profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const lastGenDate = profile.last_generation_date;
    let generationsToday = profile.generations_today;

    // Reset counter if it's a new day
    if (lastGenDate !== today) {
      generationsToday = 0;
    }

    // Check limits for free users
    if (!profile.is_pro && generationsToday >= FREE_DAILY_LIMIT) {
      return new Response(JSON.stringify({ 
        error: 'Daily limit reached. Upgrade to Pro for unlimited generations.',
        limitReached: true 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate content for each platform
    const results: Record<string, string> = {};
    
    for (const platform of platforms) {
      const systemPrompt = `You are a professional social media strategist and content creator. 
Your task is to repurpose the given content for ${platformPrompts[platform] || platform}.
Tone: ${toneDescriptions[tone] || tone}

Guidelines:
- Optimize for engagement, clarity, and platform-specific norms
- Maintain the core message while adapting the format
- Use appropriate formatting (emojis, line breaks, hashtags) based on the platform
- Make it compelling and shareable
- Only output the final post content, nothing else`;

      const userPrompt = `Please repurpose this content:\n\n${content}`;

      console.log(`Generating content for ${platform}...`);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://ai-content-repurposer.lovable.app',
          'X-Title': 'AI Content Repurposer',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenRouter error for ${platform}:`, errorText);
        throw new Error(`Failed to generate content for ${platform}`);
      }

      const data = await response.json();
      results[platform] = data.choices[0]?.message?.content || 'Failed to generate';
    }

    // Save generation to history
    const { error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        original_content: content,
        tone,
        platforms,
        results,
      });

    if (insertError) {
      console.error('Insert error:', insertError);
    }

    // Update user generation count
    await supabase
      .from('profiles')
      .update({
        generations_today: generationsToday + 1,
        last_generation_date: today,
      })
      .eq('user_id', user.id);

    console.log('Generation successful for user:', user.id);

    return new Response(JSON.stringify({ 
      results,
      generationsRemaining: profile.is_pro ? 'unlimited' : FREE_DAILY_LIMIT - generationsToday - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
