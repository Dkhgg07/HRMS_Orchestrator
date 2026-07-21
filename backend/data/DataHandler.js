// DataHandler abstraction and implementations
// Always use methods on a dataHandler instance to access/modify data.

const User = require('../models/User');
const { toAIProfile } = require('../utils/aiTransform');

// Interface (documentation-only)
// Methods:
// - get_employees(filter)
// - get_projects(filter)
// - add_employee(employee)
// - update_employee(idOrEmployeeID, updates)
// - get_employee_by_employeeID(employeeID)

// Demo (in-memory) implementation
class DemoDataHandler {
  constructor(seed = {}) {
    this.employees = Array.isArray(seed.employees) ? seed.employees.slice() : [];
    this.projects = Array.isArray(seed.projects) ? seed.projects.slice() : [];
    try {
      const fs = require('fs');
      const path = require('path');
      const seedPath = process.env.AI_DEMO_SEED || path.join(__dirname, '..', 'data', 'demo', 'ai_people.json');
      if (process.env.AI_DEMO === '1' && fs.existsSync(seedPath) && this.employees.length === 0) {
        const raw = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
        if (Array.isArray(raw)) this.employees = raw;
      }
    } catch (_) {}
  }

  async get_employees(filter = {}) {
    const list = this.employees.filter((e) => {
      // Basic filter by department/location/skills if provided
      if (filter.department && e.workInfo?.department !== filter.department) return false;
      if (filter.location && e.personalInfo?.location !== filter.location) return false;
      if (filter.skills && Array.isArray(filter.skills) && filter.skills.length) {
        const s = Array.isArray(e.workInfo?.skills) ? e.workInfo.skills : [];
        if (!filter.skills.some((x) => s.includes(x))) return false;
      }
      return true;
    });
    return list.map(toAIProfile);
  }

  async get_projects(filter = {}) {
    // Minimal demo: return stored projects, optionally filter by name/status
    const list = this.projects.filter((p) => {
      if (filter.name && p.name !== filter.name) return false;
      if (filter.status && p.status !== filter.status) return false;
      return true;
    });
    return list;
  }

  async add_employee(employee) {
    this.employees.push(employee);
    return toAIProfile(employee);
  }

  async update_employee(idOrEmployeeID, updates) {
    const idx = this.employees.findIndex(
      (e) => e._id === idOrEmployeeID || e.workInfo?.employeeID === idOrEmployeeID
    );
    if (idx === -1) return null;
    this.employees[idx] = { ...this.employees[idx], ...updates };
    return toAIProfile(this.employees[idx]);
  }

  async get_employee_by_employeeID(employeeID) {
    const e = this.employees.find((x) => x.workInfo?.employeeID === employeeID);
    return e ? toAIProfile(e) : null;
  }
}

// MongoDB implementation (uses Mongoose models)
class MongoDataHandler {
  async get_employees(filter = {}) {
    const query = {};
    if (filter.department) query['workInfo.department'] = filter.department;
    if (filter.location) query['personalInfo.location'] = filter.location;
    if (Array.isArray(filter.skills) && filter.skills.length) {
      query['workInfo.skills'] = { $in: filter.skills };
    }
    const users = await User.find(query).select('-password');
    return users.map((u) => toAIProfile(u));
  }

  async get_projects(filter = {}) {
    // Placeholder: no Project model defined in repo; return empty array for now
    // Extend later when a Project schema exists.
    return [];
  }

  async add_employee(employee) {
    const doc = await User.create(employee);
    return toAIProfile(doc);
  }

  async update_employee(idOrEmployeeID, updates) {
    // Try to resolve by employeeID first, then by _id
    let doc = await User.findOneAndUpdate(
      { 'workInfo.employeeID': idOrEmployeeID },
      updates,
      { new: true }
    ).select('-password');
    if (!doc) {
      doc = await User.findByIdAndUpdate(idOrEmployeeID, updates, { new: true }).select('-password');
    }
    return doc ? toAIProfile(doc) : null;
  }

  async get_employee_by_employeeID(employeeID) {
    const doc = await User.findOne({ 'workInfo.employeeID': new RegExp(`^${employeeID}$`, 'i') }).select('-password');
    return doc ? toAIProfile(doc) : null;
  }
}

module.exports = { DemoDataHandler, MongoDataHandler };
