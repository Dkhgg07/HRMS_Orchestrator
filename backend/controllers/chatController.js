const asyncHandler = require('express-async-handler');
const fetch = require('node-fetch');
const { MongoDataHandler, DemoDataHandler } = require('../data/DataHandler');
const { MyAgent } = require('../ai/Agent');

// Decide which data handler to use. For now, default to Mongo.
function buildDataHandler() {
  // Env flag to use demo handler (useful for tests): AI_DEMO=1
  if (process.env.AI_DEMO === '1') {
    return new DemoDataHandler({ employees: [], projects: [] });
  }
  return new MongoDataHandler();
}

// POST /api/chat
// body: { message: string }
const chat = asyncHandler(async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, message: 'message is required' });
  }

  // If Python AI service URL is configured, proxy the request there
  const aiBase = process.env.AI_SERVICE_URL;
  if (aiBase) {
    try {
      const url = new URL('/api/chat', aiBase).toString();
      // Add a timeout to avoid hanging requests
      const AbortController = global.AbortController || (await import('abort-controller')).default;
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal: controller.signal
      });
      clearTimeout(t);
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ success: false, message: data?.detail || 'AI service error' });
      }
      // Normalize to our expected shape
      return res.status(200).json({ success: true, data: { session_id: data.session_id, response: data.response } });
    } catch (err) {
      // Fall through to local agent on error
      console.error('AI proxy error:', err.message || err);
    }
  }

  // Fallback: use local Node agent implementation
  const handler = buildDataHandler();
  const agent = new MyAgent(handler);
  const result = await agent.handleChat(message, { user: req.user });
  res.status(200).json({ success: true, data: result });
});

module.exports = { chat };
