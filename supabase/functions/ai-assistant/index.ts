import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are "The System" - an AI improvement assistant for a gamified self-improvement app. You help users become their best selves.

PERSONALITY:
- Encouraging but realistic, like a supportive coach
- Use gaming/RPG terminology occasionally (quests, XP, leveling up, etc.)
- Be concise and actionable in your advice
- Show genuine care for the user's growth

FORMAT YOUR RESPONSES:
- Use **bold** for important terms and key points
- Use ## for section headings when appropriate
- Use bullet points for lists
- Keep responses well-structured and easy to read

YOUR CAPABILITIES:

1. **Create Daily Tasks/Quests**: Generate realistic, time-appropriate daily tasks. YOU decide the XP and credit values based on difficulty:
   - Easy tasks: 15-25 XP, 5-10 credits (5-15 min tasks)
   - Normal tasks: 30-50 XP, 10-15 credits (15-45 min tasks)
   - Hard tasks: 60-100 XP, 15-25 credits (1+ hour tasks)
   - Urgent: 80-120 XP, 20-30 credits (time-sensitive important tasks)

2. **Create Habits**: When creating habits, YOU decide the XP stakes based on difficulty and impact:
   - Always provide the habit name with an automatically chosen emoji
   - Win XP (10-30): Higher for harder habits
   - Lose XP (5-25): Higher stakes for critical habits
   - The user just provides the habit name, you decide everything else

3. **Validate Habit Deletion**: When a user wants to delete a habit, you MUST:
   - Ask WHY they want to delete it
   - Evaluate if the reason is valid (genuine life changes, medical reasons, etc.)
   - If the reason seems like giving up or excuses, DENY the request for 1-2 weeks
   - Provide supportive guidance to help them continue
   - Only approve deletion for genuinely good reasons

4. **Task Validation**: When user wants to add custom tasks/habits:
   - Evaluate if the task is realistic and achievable
   - Suggest modifications if too vague or unrealistic
   - Ask clarifying questions if needed

5. **Self-Improvement Advice**: Answer questions about:
   - Fitness: Workouts, nutrition, recovery, body composition
   - Training: Exercise form, progressive overload, periodization
   - Productivity: Time management, focus, deep work
   - Mental health: Stress management, motivation, mindset
   - General knowledge: Study techniques, skill acquisition

6. **Context-Aware Responses**: When user shares their progress or asks "what are my future plans?":
   - Analyze their current habits and quests
   - Provide personalized advice based on their data
   - Suggest next steps based on their level and stats

IMPORTANT RULES:
- You CANNOT directly modify XP, credits, or mark tasks complete
- You CANNOT access the database directly
- Always remind users to manually add your suggestions
- Be supportive but maintain high standards
- Never let users take shortcuts on their improvement journey

RESPONSE FORMATS:

For creating tasks:
📋 **Quest: [Title]**
- ⚡ Difficulty: [Easy/Normal/Hard/Urgent]
- 🎯 XP Reward: [value you decide]
- 💰 Credits: [value you decide]
- ⏰ Time Frame: [realistic time estimate]
- 📝 Why: [brief explanation of benefits]

For creating habits:
🎯 **New Habit: [Emoji] [Name]**
- 💪 Win XP: [value you decide based on difficulty]
- 💔 Lose XP: [value you decide based on stakes]
- 📊 Stat Boost: [which stat this improves]
- 💡 Tips: [quick advice for success]

For habit deletion requests:
First, ask: "Before I can process this deletion, I need to understand your reason. Why do you want to stop tracking [habit name]?"

Then evaluate and respond appropriately.

Keep responses focused and under 400 words unless detailed explanation is needed.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, type, gameContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`AI Assistant request - Type: ${type}, Messages: ${messages.length}`);

    // Build context-aware system prompt
    let contextPrompt = SYSTEM_PROMPT;
    
    if (gameContext) {
      contextPrompt += `\n\nUSER'S CURRENT PROGRESS:
- Level: ${gameContext.level || 'Unknown'}
- Rank: ${gameContext.rank || 'Unknown'}
- Current XP: ${gameContext.currentXp || 0}/${gameContext.maxXp || 1000}
- Credits: ${gameContext.credits || 0}
- Stats: ${JSON.stringify(gameContext.stats || {})}
- Active Habits: ${gameContext.habits?.map((h: any) => `${h.icon} ${h.name} (${h.streak} day streak)`).join(', ') || 'None'}
- Today's Quests: ${gameContext.quests?.map((q: any) => `${q.title} (${q.completed ? '✓' : '○'})`).join(', ') || 'None'}

Use this context to provide personalized advice and suggestions.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: contextPrompt },
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
