import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const VAPI_API_KEY = Deno.env.get('VAPI_API_KEY');
    if (!VAPI_API_KEY) {
      throw new Error('VAPI_API_KEY is not configured');
    }

    const { assistantConfig } = await req.json();

    // Create a Vapi web call
    const response = await fetch('https://api.vapi.ai/call/web', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistant: {
          name: "Interview AI",
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: assistantConfig?.systemPrompt || 
                  "You are a professional interviewer. Ask interview questions one by one, wait for the candidate's response, provide brief feedback, then move to the next question. Be encouraging but honest. After all questions, give a summary score out of 100 and key feedback points.",
              },
            ],
          },
          voice: {
            provider: "11labs",
            voiceId: "21m00Tcm4TlvDq8ikWAM",
          },
          firstMessage: assistantConfig?.firstMessage || "Hello! I'm your AI interviewer. Let's begin the interview. Are you ready?",
          ...(assistantConfig?.endCallMessage && { endCallMessage: assistantConfig.endCallMessage }),
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Vapi API call failed [${response.status}]: ${errorBody}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error("Error creating Vapi session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
