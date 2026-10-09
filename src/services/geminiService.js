// Client-side service for communicating with the serverless /api/chat endpoint

export async function sendChatMessage({
  message,
  history = [],
  memories = [],
  reminders = [],
  currentDateTime = new Date().toISOString(),
  userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}) {
  const payload = {
    message,
    history,
    memories,
    reminders,
    currentDateTime,
    userTimezone
  };

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    reply: data.reply || 'I processed your request.',
    action: data.action || null,
    model: data.model || 'gemini-3.8-flash'
  };
}
