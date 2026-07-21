/*
  Seed AI-shaped people into MongoDB.
  Usage (Windows cmd):
    set MONGO_URI=mongodb://localhost:27017/hrms && set AI_DEMO_SEED=d:\\path\\to\\ai_people.json && node backend\scripts\seed_ai_people.js
*/

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

async function main() {
  await connectDB();

  const seedPath = process.env.AI_DEMO_SEED || path.join(__dirname, '..', 'data', 'demo', 'ai_people.json');
  if (!fs.existsSync(seedPath)) {
    console.error('Seed file not found:', seedPath);
    process.exit(1);
  }
  const people = readJSON(seedPath);
  console.log(`Seeding ${people.length} people from ${seedPath}`);

  for (const p of people) {
    const name = String(p.name || '').trim();
    const parts = name.split(' ').filter(Boolean);
    const firstName = parts[0] || 'New';
    const lastName = parts.slice(1).join(' ') || 'Employee';

    let employeeID = p._id || p.employeeID;
    if (!employeeID) {
      const count = await User.countDocuments();
      employeeID = `EMP${String(count + 1).padStart(3, '0')}`;
    }

    const workInfo = {
      employeeID,
      title: p.position,
      department: p.department || 'Not assigned',
      skills: Array.isArray(p.skills) ? p.skills : [],
      experienceLevel: String(p.experience_level || 'junior').toLowerCase(),
      currentProjects: Array.isArray(p.current_projects) ? p.current_projects : [],
      capacityHours: typeof p.capacity_hours === 'number' ? p.capacity_hours : 40,
    };

    const email = p.email || `${employeeID.toLowerCase()}@example.com`;
    const rawPassword = p.password || `${employeeID}@123`;
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(rawPassword, salt);

    const exists = await User.findOne({ 'workInfo.employeeID': new RegExp(`^${employeeID}$`, 'i') });
    if (exists) {
      console.log('Skip existing', employeeID);
      continue;
    }

    await User.create({
      email,
      password,
      role: 'employee',
      personalInfo: {
        firstName,
        lastName,
        location: p.location || 'Not specified',
      },
      workInfo,
      isActive: true,
    });
    console.log('Inserted', employeeID, name);
  }

  console.log('Done');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
