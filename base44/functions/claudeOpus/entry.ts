import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, system_prompt, max_tokens = 1024 } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const messages = [{ role: "user", content: prompt }];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: max_tokens,
      system: system_prompt || "You are a helpful assistant.",
      messages: messages
    });

    return Response.json({ 
      response: response.content[0].text,
      model: response.model,
      usage: response.usage
    });

  } catch (error) {
    console.error('Claude API error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});