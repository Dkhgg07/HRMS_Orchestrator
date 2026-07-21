// Shared AI profile transformer used by data handlers and controllers
const titleCase = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : str);

// Transform into the AI agent-friendly profile shape
// Accepts either:
// - Schema-shaped: { personalInfo, workInfo, email, _id }
// - AI-shaped: { _id, name, email, skills, department, position, experience_level, current_projects, capacity_hours, location }
const toAIProfile = (obj) => {
  // Handle AI-shaped directly
  const looksAI = obj && (obj.current_projects || obj.experience_level || obj.position || obj.department) && !obj.workInfo;
  if (looksAI) {
    const id = obj._id || obj.employeeID || '';
    return {
      _id: String(id || '').toLowerCase(),
      name: obj.name || '',
      email: obj.email,
      skills: Array.isArray(obj.skills) ? obj.skills : [],
      department: obj.department || 'Not assigned',
      position: obj.position || 'Not specified',
      experience_level: titleCase(obj.experience_level || ''),
      current_projects: Array.isArray(obj.current_projects) ? obj.current_projects : [],
      capacity_hours: typeof obj.capacity_hours === 'number' ? obj.capacity_hours : 40,
      location: obj.location || 'Not specified',
      performance_score: typeof obj.performance_score === 'number' ? obj.performance_score : undefined,
      last_updated: obj.last_updated || undefined,
    };
  }

  // Fallback: schema-shaped
  const firstName = obj.personalInfo?.firstName || '';
  const lastName = obj.personalInfo?.lastName || '';
  const employeeID = obj.workInfo?.employeeID || String(obj._id || '');
  const skills = Array.isArray(obj.workInfo?.skills) ? obj.workInfo.skills : [];
  const currentProjects = Array.isArray(obj.workInfo?.currentProjects)
    ? obj.workInfo.currentProjects.filter(Boolean)
    : [];
  const legacySingle = obj.workInfo?.currentProject ? [obj.workInfo.currentProject] : [];

  return {
    _id: String(employeeID || '').toLowerCase(),
    name: [firstName, lastName].filter(Boolean).join(' ').trim(),
    email: obj.email,
    skills,
    department: obj.workInfo?.department || 'Not assigned',
    position: obj.workInfo?.title || 'Not specified',
    experience_level: titleCase(obj.workInfo?.experienceLevel || ''),
    current_projects: currentProjects.length ? currentProjects : legacySingle,
    capacity_hours: typeof obj.workInfo?.capacityHours === 'number' ? obj.workInfo.capacityHours : 40,
    location: obj.personalInfo?.location || 'Not specified',
  };
};

module.exports = { toAIProfile, titleCase };
