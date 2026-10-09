import { GoogleGenAI } from '@google/genai';

/**
 * Vercel Serverless Function / Local API Endpoint
 * Handles chat requests with Gemini 3.8 Flash, personal memory context, and structured action proposals.
 */
export default async function handler(req, res) {
  // Enforce POST method only
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method Not Allowed. Only POST requests are accepted.'
    });
  }

  // Check for server-side Gemini API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured or missing on the server.'
    });
  }

  // Parse and validate request body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON request body.' });
    }
  }

  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Missing request body.' });
  }

  const {
    message,
    history = [],
    memories = [],
    reminders = [],
    currentDateTime,
    userTimezone
  } = body;

  // Validate message
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  if (message.length > 2000) {
    return res.status(400).json({ error: 'Message exceeds 2,000 character limit.' });
  }

  // Limit context sizes to prevent payload abuse
  const cappedHistory = Array.isArray(history) ? history.slice(-10) : [];
  const cappedMemories = Array.isArray(memories) ? memories.slice(0, 50) : [];
  const cappedReminders = Array.isArray(reminders) ? reminders.slice(0, 50) : [];

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Format personal memories and reminders context
    const memoriesText = cappedMemories.length > 0
      ? cappedMemories.map(m => `- [ID: ${m.id}] ${m.title}: ${m.content} (Category: ${m.category || 'General'}, Date: ${m.date || 'None'}, Person: ${m.person || 'None'})`).join('\n')
      : 'No saved memories yet.';

    const remindersText = cappedReminders.length > 0
      ? cappedReminders.map(r => `- [ID: ${r.id}] ${r.title} (Due: ${r.date || 'Someday'} ${r.time || ''}, Status: ${r.status}, Priority: ${r.priority}, Category: ${r.category || 'General'})`).join('\n')
      : 'No saved reminders yet.';

    const systemInstruction = `You are Smriti AI, an intelligent, empathetic personal AI memory assistant.
Tagline: "Remember what matters. Let AI handle the rest."

CRITICAL RULES:
1. GROUNDING IN PERSONAL CONTEXT:
   - When answering questions about the user's life, friends, schedule, preferences, or tasks, use ONLY the SAVED MEMORIES and SAVED REMINDERS provided below.
   - NEVER invent, assume, or hallucinate a personal fact, birthday, date, person, or reminder.
   - If the user asks for a personal fact not in the context, explicitly say that it is not saved yet (e.g. "I don't have Rahul's phone number saved in your memories yet. Would you like me to remember it?").
   - Clearly distinguish between saved facts and helpful suggestions or assumptions.

2. TEMPORAL CONTEXT:
   - The user's current date and time is: ${currentDateTime || new Date().toISOString()}
   - The user's timezone is: ${userTimezone || 'local'}
   - Interpret relative dates (like "tomorrow", "in 2 days", "next Monday", "two days before Rahul's birthday") strictly based on the current date and context.
   - For annual birthdays or events without a year, if the month/day is known, support the upcoming date or clarify the year.

3. ACTION PROPOSALS:
   - When the user asks you to remember, save, or set a reminder, or when saving a fact/reminder is a natural follow-up, propose a structured action.
   - Valid action types:
     a) "create_memory":
        {
          "type": "create_memory",
          "title": "Title of the memory (concise)",
          "content": "Full description of what to remember",
          "category": "Birthday" | "People" | "Personal Goal" | "Important Event" | "Preference" | "Other",
          "date": "YYYY-MM-DD" (or "" if not date-specific),
          "person": "Name of person or entity" (or "")
        }
     b) "create_reminder":
        {
          "type": "create_reminder",
          "title": "Clear reminder title",
          "description": "Details or notes",
          "date": "YYYY-MM-DD",
          "time": "HH:MM" (24-hour format, e.g. "09:00", "17:30"),
          "category": "Personal" | "Academic" | "Work" | "Project" | "Health" | "Other",
          "priority": "Low" | "Medium" | "High",
          "linkedMemoryId": "ID of memory if linked" (or null)
        }
   - If no new memory or reminder needs to be created, "action" MUST be null.

4. RESPONSE FORMAT:
   - You MUST respond strictly in valid JSON matching this structure:
   {
     "reply": "Your conversational answer to the user in clean text (or standard markdown if listing items).",
     "action": null | { ...action object... }
   }
   - Do NOT wrap in markdown code blocks like \`\`\`json. Output raw JSON directly.

---
CURRENT SAVED MEMORIES:
${memoriesText}

CURRENT SAVED REMINDERS:
${remindersText}
---`;

    // Construct conversation history contents
    const contents = [];

    // Add prior session turns if present
    for (const item of cappedHistory) {
      if (item.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: item.content }] });
      } else if (item.role === 'model' || item.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: item.content }] });
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Gemini API returned an empty response.');
    }

    // Parse and validate JSON structure
    let parsedResult;
    try {
      // Clean possible markdown code fences if model enclosed them
      const cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsedResult = JSON.parse(cleaned);
    } catch {
      // Fallback: treat responseText as plain text reply with null action
      parsedResult = {
        reply: responseText,
        action: null
      };
    }

    // Sanitize response
    if (typeof parsedResult.reply !== 'string') {
      parsedResult.reply = String(parsedResult.reply || 'Here is what I found.');
    }

    // Validate action object if present
    if (parsedResult.action) {
      const act = parsedResult.action;
      if (act.type !== 'create_memory' && act.type !== 'create_reminder') {
        parsedResult.action = null; // discard invalid action types
      } else {
        // Enforce required fields
        if (!act.title || typeof act.title !== 'string') {
          parsedResult.action = null;
        } else {
          // Normalize action fields
          act.title = act.title.trim().slice(0, 150);
          if (act.type === 'create_memory') {
            act.content = typeof act.content === 'string' ? act.content.trim().slice(0, 1000) : act.title;
            act.category = act.category || 'Other';
            act.date = typeof act.date === 'string' ? act.date.trim() : '';
            act.person = typeof act.person === 'string' ? act.person.trim() : '';
          } else if (act.type === 'create_reminder') {
            act.description = typeof act.description === 'string' ? act.description.trim().slice(0, 500) : '';
            act.date = typeof act.date === 'string' ? act.date.trim() : '';
            act.time = typeof act.time === 'string' ? act.time.trim() : '';
            act.category = act.category || 'Personal';
            act.priority = ['Low', 'Medium', 'High'].includes(act.priority) ? act.priority : 'Medium';
          }
        }
      }
    }

    return res.status(200).json({
      reply: parsedResult.reply,
      action: parsedResult.action,
      model: modelName
    });

  } catch (error) {
    const errorMessage = error?.message || 'An error occurred while calling the AI model.';
    const isQuota = errorMessage.includes('429') || errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('rate');
    const isAuth = errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.toLowerCase().includes('api key');

    let userFriendlyError = 'API Error: Failed to process request.';
    let statusCode = 500;

    if (isAuth) {
      statusCode = 401;
      userFriendlyError = 'API Error: Invalid or expired API key.';
    } else if (isQuota) {
      statusCode = 429;
      userFriendlyError = 'API Error: Rate limit or quota exceeded.';
    } else {
      userFriendlyError = `API Error: ${errorMessage}`;
    }

    return res.status(statusCode).json({
      error: userFriendlyError
    });
  }
}
