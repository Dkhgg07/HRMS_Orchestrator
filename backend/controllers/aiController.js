const asyncHandler = require('express-async-handler');
const { toAIProfile } = require('../utils/aiTransform');
const { MongoDataHandler, DemoDataHandler } = require('../data/DataHandler');

function buildDataHandler() {
  if (process.env.AI_DEMO === '1') {
    return new DemoDataHandler({ employees: [], projects: [] });
  }
  return new MongoDataHandler();
}

// GET /api/ai/people
// Optional filters: ?department=Design&location=Remote&skills=React,Figma
const getAIProfiles = asyncHandler(async (req, res) => {
  const { department, location, skills } = req.query;
  const filter = { department, location };
  if (skills) {
    filter.skills = String(skills)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const handler = buildDataHandler();
  const profiles = await handler.get_employees(filter);
  res.status(200).json({ success: true, data: profiles });
});

// GET /api/ai/people/:employeeId  (supports EMP003 or emp003)
const getAIProfileByEmployeeId = asyncHandler(async (req, res) => {
  const employeeIdParam = String(req.params.employeeId || '');
  const handler = buildDataHandler();
  const profile = await handler.get_employee_by_employeeID(employeeIdParam);

  if (!profile) {
    return res.status(404).json({ success: false, message: 'AI profile not found' });
  }
  res.status(200).json({ success: true, data: profile });
});

module.exports = { getAIProfiles, getAIProfileByEmployeeId };
