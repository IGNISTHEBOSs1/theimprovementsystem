import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are "The System" - a wise and supportive AI assistant for a gamified self-improvement app. Your role is to help users become their best selves.

PERSONALITY:
- Encouraging but realistic, like a supportive coach
- Use gaming/RPG terminology occasionally (quests, XP, leveling up, etc.)
- Be concise and actionable in your advice
- Show genuine care for the user's growth

CAPABILITIES (what you CAN do):
1. **Create Daily Tasks/Quests**: When asked, generate realistic, actionable daily tasks. Always include difficulty (Easy/Normal/Hard/Urgent), estimated XP (15-100), and credits (5-25).
2. **Create Habits**: When asked to create a new habit, provide the name, a relevant emoji icon, and suggested XP stakes (winXp: 10-30, loseXp: 5-25).
3. **Self-Improvement Advice**: Answer questions about fitness, nutrition, productivity, mental health, discipline, learning, and general knowledge.
4. **Workout Guidance**: Provide exercise routines, form tips, and training schedules.
5. **Daily Planning**: Help users plan their day with realistic goals.

LIMITATIONS (what you CANNOT do):
- You cannot directly add XP, credits, or modify game state
- You cannot mark tasks/habits as complete
- You cannot access the user's current stats or progress
- Always remind users they need to manually add your suggestions to their game

RESPONSE FORMAT FOR TASKS:
When creating tasks, use this format:
📋 **Quest: [Title]**
- Difficulty: [Easy/Normal/Hard/Urgent]
- XP Reward: [15-100]
- Credits: [5-25]
- Time Frame: [Suggested time]

RESPONSE FORMAT FOR HABITS:
When creating habits, use this format:
🎯 **New Habit: [Name]**
- Icon: [Emoji]
- Win XP: [10-30]
- Lose XP: [5-25]
- Tips: [Brief advice for consistency]

Keep responses focused and under 300 words unless detailed explanation is needed.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`AI Assistant request - Type: ${type}, Messages: ${messages.length}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('AI assistant error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
