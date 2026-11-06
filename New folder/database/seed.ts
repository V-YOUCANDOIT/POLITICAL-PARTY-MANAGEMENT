import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.ts';

export function seedDatabase() {
  initDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count > 0) {
    console.log('Database already contains data. Skipping initial seeding.');
    return;
  }

  console.log('Seeding initial demonstration data into SQLite database...');

  // Hash standard demo password
  const defaultPasswordHash = bcrypt.hashSync('politix2026', 10);

  // 1. ROLES
  const insertRole = db.prepare(`
    INSERT INTO roles (id, name, description, permissions)
    VALUES (?, ?, ?, ?)
  `);

  const roles = [
    {
      id: 'role-superadmin',
      name: 'Super Administrator',
      description: 'Unrestricted control over system configuration, roles, database, and all party units.',
      permissions: JSON.stringify(['all', 'admin', 'manage_users', 'manage_units', 'manage_campaigns', 'manage_finances', 'manage_surveys', 'approve_expenses', 'export_reports'])
    },
    {
      id: 'role-centraladmin',
      name: 'Central Administrator',
      description: 'National party governance, state oversight, global campaigns, financial approvals.',
      permissions: JSON.stringify(['admin', 'manage_users', 'manage_units', 'manage_campaigns', 'manage_finances', 'manage_surveys', 'approve_expenses', 'export_reports'])
    },
    {
      id: 'role-statecoord',
      name: 'State Coordinator',
      description: 'Statewide campaign coordination, district unit management, local resource allocation.',
      permissions: JSON.stringify(['view_state', 'manage_districts', 'manage_campaigns', 'manage_events', 'submit_expenses', 'view_reports'])
    },
    {
      id: 'role-districtcoord',
      name: 'District Coordinator',
      description: 'District level oversight, constituency management, field volunteer deployment.',
      permissions: JSON.stringify(['view_district', 'manage_constituencies', 'manage_events', 'assign_tasks', 'submit_expenses'])
    },
    {
      id: 'role-constituencymgr',
      name: 'Constituency Manager',
      description: 'Constituency level operations, voter outreach, door-to-door coordination.',
      permissions: JSON.stringify(['view_constituency', 'manage_local_teams', 'manage_surveys', 'assign_tasks'])
    },
    {
      id: 'role-campaignmgr',
      name: 'Campaign Manager',
      description: 'Dedicated campaign lead handling task boards, logistics, budgets, and milestone delivery.',
      permissions: JSON.stringify(['manage_campaigns', 'manage_tasks', 'manage_events', 'submit_expenses', 'view_reports'])
    },
    {
      id: 'role-volunteer',
      name: 'Volunteer / Ground Worker',
      description: 'Ground worker executing field activities, canvassing, rally support, and survey distribution.',
      permissions: JSON.stringify(['view_assigned_tasks', 'attend_events', 'distribute_surveys'])
    }
  ];

  for (const r of roles) {
    insertRole.run(r.id, r.name, r.description, r.permissions);
  }

  // 2. ORGANIZATIONAL UNITS
  const insertUnit = db.prepare(`
    INSERT INTO organizational_units (id, name, type, parent_id, coordinator_id, state_name, district_name, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const units = [
    { id: 'unit-central', name: 'Central National Headquarters', type: 'Central', parent_id: null, coordinator_id: 'user-centraladmin', state_name: 'National', district_name: 'Central', address: '100 Constitution Plaza, Suite 900' },
    
    // States
    { id: 'unit-state-north', name: 'North Province Directorate', type: 'State', parent_id: 'unit-central', coordinator_id: 'user-statecoord-1', state_name: 'North Province', district_name: null, address: '45 Aurora Avenue, North City' },
    { id: 'unit-state-central', name: 'Central State Directorate', type: 'State', parent_id: 'unit-central', coordinator_id: 'user-statecoord-2', state_name: 'Central State', district_name: null, address: '88 Midtown Boulevard, Capital' },
    { id: 'unit-state-coastal', name: 'Coastal Region Directorate', type: 'State', parent_id: 'unit-central', coordinator_id: 'user-statecoord-3', state_name: 'Coastal Region', district_name: null, address: '12 Harbor Road, Bay City' },

    // Districts
    { id: 'unit-dist-metro-north', name: 'Metro North District Unit', type: 'District', parent_id: 'unit-state-north', coordinator_id: 'user-districtcoord-1', state_name: 'North Province', district_name: 'Metro North', address: '12 Pioneer Way, North City' },
    { id: 'unit-dist-highland', name: 'Highland District Unit', type: 'District', parent_id: 'unit-state-north', coordinator_id: null, state_name: 'North Province', district_name: 'Highland', address: '3 Ridge Road, Highland' },
    { id: 'unit-dist-capital', name: 'Capital City District Unit', type: 'District', parent_id: 'unit-state-central', coordinator_id: 'user-districtcoord-2', state_name: 'Central State', district_name: 'Capital City', address: '55 Republic Square, Capital' },
    { id: 'unit-dist-river', name: 'River Valley District Unit', type: 'District', parent_id: 'unit-state-central', coordinator_id: null, state_name: 'Central State', district_name: 'River Valley', address: '202 Riverfront Drive, Green Valley' },
    { id: 'unit-dist-port', name: 'Port Bay District Unit', type: 'District', parent_id: 'unit-state-coastal', coordinator_id: null, state_name: 'Coastal Region', district_name: 'Port Bay', address: '9 Oceanic Street, Port City' },
    { id: 'unit-dist-suncoast', name: 'Sun Coast District Unit', type: 'District', parent_id: 'unit-state-coastal', coordinator_id: null, state_name: 'Coastal Region', district_name: 'Sun Coast', address: '77 Marina Walk, Sun Coast' },

    // Constituencies / Local
    { id: 'unit-const-central-east', name: 'Central East Constituency Unit', type: 'Constituency', parent_id: 'unit-dist-capital', coordinator_id: 'user-constituency-1', state_name: 'Central State', district_name: 'Capital City', address: '404 Heritage Lane' }
  ];

  for (const u of units) {
    insertUnit.run(u.id, u.name, u.type, u.parent_id, u.coordinator_id, u.state_name, u.district_name, u.address);
  }

  // 3. USERS (30 Fictional Members)
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password_hash, full_name, role, phone, unit_id, status, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    // 7 Core Demo Accounts
    { id: 'user-superadmin', email: 'superadmin@politix.org', full_name: 'Eleanor Vance', role: 'Super Administrator', phone: '+1 (555) 019-2001', unit_id: 'unit-central', status: 'Active' },
    { id: 'user-centraladmin', email: 'centraladmin@politix.org', full_name: 'Marcus Sterling', role: 'Central Administrator', phone: '+1 (555) 019-2002', unit_id: 'unit-central', status: 'Active' },
    { id: 'user-statecoord-1', email: 'statecoord@politix.org', full_name: 'Sarah Chen-Morales', role: 'State Coordinator', phone: '+1 (555) 019-2003', unit_id: 'unit-state-north', status: 'Active' },
    { id: 'user-districtcoord-1', email: 'districtcoord@politix.org', full_name: 'David O\'Connor', role: 'District Coordinator', phone: '+1 (555) 019-2004', unit_id: 'unit-dist-metro-north', status: 'Active' },
    { id: 'user-constituency-1', email: 'constituency@politix.org', full_name: 'Amara Diallo', role: 'Constituency Manager', phone: '+1 (555) 019-2005', unit_id: 'unit-const-central-east', status: 'Active' },
    { id: 'user-campaignmgr-1', email: 'campaignmgr@politix.org', full_name: 'Julian Hayes', role: 'Campaign Manager', phone: '+1 (555) 019-2006', unit_id: 'unit-central', status: 'Active' },
    { id: 'user-volunteer-1', email: 'volunteer@politix.org', full_name: 'Maya Patel', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2007', unit_id: 'unit-dist-metro-north', status: 'Active' },

    // Additional Coordinators & Leaders
    { id: 'user-statecoord-2', email: 'state.central@politix.org', full_name: 'Robert Langdon', role: 'State Coordinator', phone: '+1 (555) 019-2008', unit_id: 'unit-state-central', status: 'Active' },
    { id: 'user-statecoord-3', email: 'state.coastal@politix.org', full_name: 'Elena Rostova', role: 'State Coordinator', phone: '+1 (555) 019-2009', unit_id: 'unit-state-coastal', status: 'Active' },
    { id: 'user-districtcoord-2', email: 'dist.capital@politix.org', full_name: 'Keith Washington', role: 'District Coordinator', phone: '+1 (555) 019-2010', unit_id: 'unit-dist-capital', status: 'Active' },
    { id: 'user-campaignmgr-2', email: 'campaign.greene@politix.org', full_name: 'Rachel Greene', role: 'Campaign Manager', phone: '+1 (555) 019-2011', unit_id: 'unit-state-coastal', status: 'Active' },
    { id: 'user-campaignmgr-3', email: 'campaign.thornton@politix.org', full_name: 'Liam Thornton', role: 'Campaign Manager', phone: '+1 (555) 019-2012', unit_id: 'unit-state-north', status: 'Active' },

    // 18 Fictional Volunteers & Field Workers
    { id: 'user-vol-2', email: 'vol.james@politix.org', full_name: 'James Wilson', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2013', unit_id: 'unit-dist-metro-north', status: 'Active' },
    { id: 'user-vol-3', email: 'vol.clara@politix.org', full_name: 'Clara Oswald', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2014', unit_id: 'unit-dist-metro-north', status: 'Active' },
    { id: 'user-vol-4', email: 'vol.ananya@politix.org', full_name: 'Ananya Sharma', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2015', unit_id: 'unit-dist-capital', status: 'Active' },
    { id: 'user-vol-5', email: 'vol.mateo@politix.org', full_name: 'Mateo Hernandez', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2016', unit_id: 'unit-dist-capital', status: 'Active' },
    { id: 'user-vol-6', email: 'vol.fatima@politix.org', full_name: 'Fatima Al-Mansoor', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2017', unit_id: 'unit-dist-capital', status: 'Active' },
    { id: 'user-vol-7', email: 'vol.ethan@politix.org', full_name: 'Ethan Cole', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2018', unit_id: 'unit-dist-river', status: 'Active' },
    { id: 'user-vol-8', email: 'vol.chloe@politix.org', full_name: 'Chloe Bennett', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2019', unit_id: 'unit-dist-river', status: 'Active' },
    { id: 'user-vol-9', email: 'vol.kenji@politix.org', full_name: 'Kenji Sato', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2020', unit_id: 'unit-dist-port', status: 'Active' },
    { id: 'user-vol-10', email: 'vol.leila@politix.org', full_name: 'Leila Touré', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2021', unit_id: 'unit-dist-port', status: 'Active' },
    { id: 'user-vol-11', email: 'vol.samuel@politix.org', full_name: 'Samuel Adebayo', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2022', unit_id: 'unit-dist-suncoast', status: 'Active' },
    { id: 'user-vol-12', email: 'vol.nina@politix.org', full_name: 'Nina Kowalski', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2023', unit_id: 'unit-dist-suncoast', status: 'Active' },
    { id: 'user-vol-13', email: 'vol.tariq@politix.org', full_name: 'Tariq Habib', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2024', unit_id: 'unit-dist-highland', status: 'Active' },
    { id: 'user-vol-14', email: 'vol.grace@politix.org', full_name: 'Grace Hopper-Lee', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2025', unit_id: 'unit-dist-highland', status: 'Active' },
    { id: 'user-vol-15', email: 'vol.gabriel@politix.org', full_name: 'Gabriel Silva', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2026', unit_id: 'unit-const-central-east', status: 'Active' },
    { id: 'user-vol-16', email: 'vol.olivia@politix.org', full_name: 'Olivia Martinez', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2027', unit_id: 'unit-const-central-east', status: 'Active' },
    { id: 'user-vol-17', email: 'vol.lucas@politix.org', full_name: 'Lucas Meyer', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2028', unit_id: 'unit-state-north', status: 'Active' },
    { id: 'user-vol-18', email: 'vol.priya@politix.org', full_name: 'Priya Nambiar', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2029', unit_id: 'unit-state-coastal', status: 'Active' },
    { id: 'user-vol-19', email: 'vol.aaron@politix.org', full_name: 'Aaron Brooks', role: 'Volunteer / Ground Worker', phone: '+1 (555) 019-2030', unit_id: 'unit-state-central', status: 'Inactive' }
  ];

  for (const u of users) {
    insertUser.run(u.id, u.email, defaultPasswordHash, u.full_name, u.role, u.phone, u.unit_id, u.status, null);
  }

  // 4. CAMPAIGNS (5 Sample Campaigns)
  const insertCampaign = db.prepare(`
    INSERT INTO campaigns (id, title, description, objectives, start_date, end_date, location, status, manager_id, budget_allocated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const campaigns = [
    {
      id: 'camp-1',
      title: 'Clean River & Watershed Initiative 2026',
      description: 'Community-led ecological cleanup, water safety awareness, and environmental policy townhalls across River Valley and Coastal districts.',
      objectives: '1. Mobilize 2,000 community volunteers.\n2. Collect 15 tons of riverbank refuse.\n3. Host 4 policy forums with municipal water boards.',
      start_date: '2026-03-01',
      end_date: '2026-06-30',
      location: 'River Valley & Coastal Region',
      status: 'Active',
      manager_id: 'user-campaignmgr-1',
      budget_allocated: 45000.00
    },
    {
      id: 'camp-2',
      title: 'Youth Tech & Employment Outreach',
      description: 'Vocational workshops, digital skills training bootcamps, and career mentorship for under-represented youth across urban districts.',
      objectives: '1. Conduct 12 free weekend tech seminars.\n2. Partner with 30 local tech employers.\n3. Engage 1,500 young job seekers.',
      start_date: '2026-02-15',
      end_date: '2026-08-30',
      location: 'Metro North & Capital City',
      status: 'Active',
      manager_id: 'user-campaignmgr-2',
      budget_allocated: 65000.00
    },
    {
      id: 'camp-3',
      title: 'Accessible Community Healthcare Tour',
      description: 'Mobile preventative health checkup clinics, health literacy workshops, and listening sessions on regional hospital access.',
      objectives: '1. Deploy mobile clinics to 8 rural townships.\n2. Provide screenings for over 3,000 citizens.\n3. Compile healthcare access whitepaper.',
      start_date: '2026-04-10',
      end_date: '2026-09-15',
      location: 'Highland & Sun Coast Districts',
      status: 'Planned',
      manager_id: 'user-campaignmgr-3',
      budget_allocated: 80000.00
    },
    {
      id: 'camp-4',
      title: 'Civic Education & Voter Literacy Drive',
      description: 'Non-partisan civic participation, ballot awareness, and high school civics workshops.',
      objectives: '1. Distribute 25,000 civic educational booklets.\n2. Hold 40 student mock town halls.\n3. Assist with first-time registration guides.',
      start_date: '2026-01-10',
      end_date: '2026-05-30',
      location: 'All States & Districts',
      status: 'Active',
      manager_id: 'user-campaignmgr-1',
      budget_allocated: 35000.00
    },
    {
      id: 'camp-5',
      title: 'Rural Small Business & Farmer Dialogue',
      description: 'Agricultural supply chain roundtables, localized grant application assistance, and cooperative market feasibility study.',
      objectives: '1. Convene 10 farmer and artisan roundtables.\n2. Provide direct bookkeeping & grant guidance to 200 small businesses.\n3. Publish rural economy action paper.',
      start_date: '2025-09-01',
      end_date: '2025-12-20',
      location: 'Highland & River Valley',
      status: 'Completed',
      manager_id: 'user-campaignmgr-3',
      budget_allocated: 30000.00
    }
  ];

  for (const c of campaigns) {
    insertCampaign.run(c.id, c.title, c.description, c.objectives, c.start_date, c.end_date, c.location, c.status, c.manager_id, c.budget_allocated);
  }

  // 5. CAMPAIGN MEMBERS
  const insertMember = db.prepare(`
    INSERT INTO campaign_members (id, campaign_id, user_id, role_in_campaign)
    VALUES (?, ?, ?, ?)
  `);
  insertMember.run('cm-1', 'camp-1', 'user-campaignmgr-1', 'Lead Director');
  insertMember.run('cm-2', 'camp-1', 'user-volunteer-1', 'Field Organizer');
  insertMember.run('cm-3', 'camp-1', 'user-vol-2', 'Logistics Lead');
  insertMember.run('cm-4', 'camp-2', 'user-campaignmgr-2', 'Lead Director');
  insertMember.run('cm-5', 'camp-2', 'user-vol-4', 'Registration Desk');
  insertMember.run('cm-6', 'camp-3', 'user-campaignmgr-3', 'Lead Director');
  insertMember.run('cm-7', 'camp-4', 'user-campaignmgr-1', 'Lead Director');
  insertMember.run('cm-8', 'camp-4', 'user-vol-5', 'Campus Ambassador');

  // 6. TASKS (20 Tasks across 4 Kanban columns)
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, campaign_id, title, description, status, priority, due_date, assigned_to_id, created_by_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tasks = [
    // To Do
    { id: 'tsk-1', campaign_id: 'camp-1', title: 'Order biodegradable cleanup collection bags & safety gloves', description: 'Procure 2,500 heavy duty biodegradable waste bags and nitrile protective gloves for volunteers.', status: 'To Do', priority: 'High', due_date: '2026-04-15', assigned_to_id: 'user-vol-2' },
    { id: 'tsk-2', campaign_id: 'camp-1', title: 'Secure municipal permits for riverbank assembly zone', description: 'Submit environmental staging permit to City Parks & Recreation Department.', status: 'To Do', priority: 'Urgent', due_date: '2026-04-12', assigned_to_id: 'user-volunteer-1' },
    { id: 'tsk-3', campaign_id: 'camp-2', title: 'Finalize mentor onboarding deck for tech workshops', description: 'Review slide decks on Intro to Web Development and Cloud Essentials with volunteer instructors.', status: 'To Do', priority: 'Medium', due_date: '2026-04-20', assigned_to_id: 'user-vol-4' },
    { id: 'tsk-4', campaign_id: 'camp-3', title: 'Contact local medical associations for volunteer nurses', description: 'Draft invitation email to county nursing board for the upcoming health clinic tour.', status: 'To Do', priority: 'High', due_date: '2026-04-25', assigned_to_id: 'user-vol-13' },
    { id: 'tsk-5', campaign_id: 'camp-4', title: 'Design high school civics info poster printable flyers', description: 'Create 2-page infographic on civic processes and local council functions.', status: 'To Do', priority: 'Low', due_date: '2026-05-01', assigned_to_id: 'user-vol-5' },

    // In Progress
    { id: 'tsk-6', campaign_id: 'camp-1', title: 'Coordinate with local recycling plant for sorting logistics', description: 'Arrange truck pickup times for recyclable plastics vs compostable river debris.', status: 'In Progress', priority: 'Urgent', due_date: '2026-04-18', assigned_to_id: 'user-vol-2' },
    { id: 'tsk-7', campaign_id: 'camp-1', title: 'Distribute volunteer check-in QR codes via SMS & email', description: 'Send digital pass tokens and parking map coordinates to registered participants.', status: 'In Progress', priority: 'High', due_date: '2026-04-16', assigned_to_id: 'user-volunteer-1' },
    { id: 'tsk-8', campaign_id: 'camp-2', title: 'Audit venue internet bandwidth at Capital Community Hub', description: 'Test WiFi routers to support 80 concurrent laptops for code lab sessions.', status: 'In Progress', priority: 'Medium', due_date: '2026-04-22', assigned_to_id: 'user-vol-5' },
    { id: 'tsk-9', campaign_id: 'camp-2', title: 'Sponsor outreach to 15 local IT firms for hardware donations', description: 'Follow up with engineering firms willing to loan laptops for students without devices.', status: 'In Progress', priority: 'High', due_date: '2026-04-24', assigned_to_id: 'user-campaignmgr-2' },
    { id: 'tsk-10', campaign_id: 'camp-4', title: 'Schedule campus mock townhall dates with University Student Union', description: 'Confirm auditorium bookings for May 14 and May 21 civic panels.', status: 'In Progress', priority: 'Medium', due_date: '2026-04-30', assigned_to_id: 'user-vol-6' },

    // Under Review
    { id: 'tsk-11', campaign_id: 'camp-1', title: 'Environmental impact assessment draft for Phase 1', description: 'Review report authored by green coalition consultants evaluating water quality test points.', status: 'Under Review', priority: 'Medium', due_date: '2026-04-14', assigned_to_id: 'user-campaignmgr-1' },
    { id: 'tsk-12', campaign_id: 'camp-2', title: 'Curriculum syllabus for Data Science & AI Literacy module', description: 'Under review by educational committee for age-appropriate civic and workforce topics.', status: 'Under Review', priority: 'Medium', due_date: '2026-04-15', assigned_to_id: 'user-campaignmgr-2' },
    { id: 'tsk-13', campaign_id: 'camp-3', title: 'Health insurance waiver forms legal clearance', description: 'Party legal counsel reviewing participant waiver forms for mobile screening clinic.', status: 'Under Review', priority: 'Urgent', due_date: '2026-04-10', assigned_to_id: 'user-campaignmgr-3' },
    { id: 'tsk-14', campaign_id: 'camp-4', title: 'Civic literacy survey questionnaire design review', description: 'Audit questions to ensure 100% compliance with non-partisan survey standards.', status: 'Under Review', priority: 'Low', due_date: '2026-04-17', assigned_to_id: 'user-volunteer-1' },
    { id: 'tsk-15', campaign_id: 'camp-1', title: 'Press advisory release for Earth Week kickoff', description: 'Media communications team reviewing draft for regional news outlets.', status: 'Under Review', priority: 'High', due_date: '2026-04-13', assigned_to_id: 'user-campaignmgr-1' },

    // Completed
    { id: 'tsk-16', campaign_id: 'camp-1', title: 'Map 6 riverbank sectors and mark emergency access exits', description: 'Field scouting completed; GIS map printed with safe entrance gates.', status: 'Completed', priority: 'High', due_date: '2026-03-25', assigned_to_id: 'user-volunteer-1' },
    { id: 'tsk-17', campaign_id: 'camp-1', title: 'Hydration station logistics contract signed', description: 'Water tank refill truck contracted for 3 major volunteer staging areas.', status: 'Completed', priority: 'Medium', due_date: '2026-03-28', assigned_to_id: 'user-vol-2' },
    { id: 'tsk-18', campaign_id: 'camp-2', title: 'Launch workshop registration portal and flyer campaign', description: 'Over 400 registrations received in the first 72 hours.', status: 'Completed', priority: 'Urgent', due_date: '2026-03-10', assigned_to_id: 'user-vol-4' },
    { id: 'tsk-19', campaign_id: 'camp-5', title: 'Compile Rural Agricultural Dialogue Final Summary Report', description: 'Transcripts from all 10 farmer roundtables indexed and published to secretariat.', status: 'Completed', priority: 'Medium', due_date: '2025-12-15', assigned_to_id: 'user-campaignmgr-3' },
    { id: 'tsk-20', campaign_id: 'camp-4', title: 'Distribute 5,000 civic guides to high school libraries', description: 'Delivery completed across Metro North and Capital City educational districts.', status: 'Completed', priority: 'Medium', due_date: '2026-02-28', assigned_to_id: 'user-vol-5' }
  ];

  for (const t of tasks) {
    insertTask.run(t.id, t.campaign_id, t.title, t.description, t.status, t.priority, t.due_date, t.assigned_to_id, 'user-centraladmin');
  }

  // 7. SURVEYS & QUESTIONS (Strictly compliant with civic/privacy rules)
  const insertSurvey = db.prepare(`
    INSERT INTO surveys (id, title, description, category, status, is_anonymous, created_by_id, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertQuestion = db.prepare(`
    INSERT INTO survey_questions (id, survey_id, question_text, question_type, options, order_index, is_required)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertResponse = db.prepare(`
    INSERT INTO survey_responses (id, survey_id, respondent_token, submitted_at)
    VALUES (?, ?, ?, ?)
  `);

  const insertAnswer = db.prepare(`
    INSERT INTO survey_answers (id, response_id, question_id, answer_value)
    VALUES (?, ?, ?, ?)
  `);

  const surveys = [
    {
      id: 'srv-1',
      title: 'Public Transit & Commuter Priorities Survey',
      description: 'Voluntary anonymous community feedback on bus schedule frequency, train connectivity, and bike lane safety.',
      category: 'Infrastructure',
      status: 'Published',
      is_anonymous: 1,
      created_by_id: 'user-centraladmin',
      expires_at: '2026-08-01',
      questions: [
        { id: 'sq-1-1', text: 'Which mode of transportation do you use most frequently for daily commute?', type: 'single', options: JSON.stringify(['Public Bus', 'Commuter Rail', 'Bicycle / Walking', 'Personal Car', 'Carpool / Rideshare']) },
        { id: 'sq-1-2', text: 'How satisfied are you with the frequency and punctuality of local transit services?', type: 'rating', options: JSON.stringify(['1 - Very Dissatisfied', '2 - Dissatisfied', '3 - Neutral', '4 - Satisfied', '5 - Very Satisfied']) },
        { id: 'sq-1-3', text: 'Which improvements should local municipal budgets prioritize first?', type: 'mcq', options: JSON.stringify(['Weekend and late-night bus routes', 'Modernized contactless ticketing', 'Protected bike corridors', 'Cleaner stations & waiting shelters', 'Electric bus fleet transition']) },
        { id: 'sq-1-4', text: 'What is one specific transit pain point or suggestion you would share with local planners?', type: 'text', options: null }
      ]
    },
    {
      id: 'srv-2',
      title: 'Local Parks, Green Spaces & Recreation Feedback',
      description: 'Help the community development working group prioritize maintenance and recreational facilities in public parks.',
      category: 'Environment',
      status: 'Published',
      is_anonymous: 1,
      created_by_id: 'user-statecoord-1',
      expires_at: '2026-07-15',
      questions: [
        { id: 'sq-2-1', text: 'How often do you or your family visit public parks or recreational trails?', type: 'single', options: JSON.stringify(['Daily', '2-3 times a week', 'Once a week', 'Once a month', 'Rarely']) },
        { id: 'sq-2-2', text: 'Rate overall park cleanliness and maintenance in your neighborhood:', type: 'rating', options: JSON.stringify(['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent']) },
        { id: 'sq-2-3', text: 'What community amenities would you like added to local parks?', type: 'mcq', options: JSON.stringify(['Children playground upgrades', 'Community vegetable gardens', 'Sports courts (basketball / pickleball)', 'Shaded picnic pavilions', 'Fenced dog park areas']) }
      ]
    },
    {
      id: 'srv-3',
      title: 'Small Business Support & Town Center Vitality',
      description: 'Understanding challenges facing neighborhood merchants, artisan shops, and local service providers.',
      category: 'Economy',
      status: 'Published',
      is_anonymous: 1,
      created_by_id: 'user-constituency-1',
      expires_at: '2026-09-01',
      questions: [
        { id: 'sq-3-1', text: 'What is the biggest operational challenge for your neighborhood commercial district?', type: 'single', options: JSON.stringify(['Commercial lease / rent affordability', 'Customer foot traffic', 'Parking & pedestrian access', 'Permitting & municipal paperwork', 'Attracting skilled workers']) },
        { id: 'sq-3-2', text: 'How would you rate the responsiveness of local business liaison offices?', type: 'rating', options: JSON.stringify(['1 - Very Slow', '2 - Slow', '3 - Adequate', '4 - Helpful', '5 - Outstanding']) }
      ]
    },
    {
      id: 'srv-4',
      title: 'Civic Awareness & Youth Volunteer Engagement',
      description: 'Gauging student and young adult interest in community volunteer programs and municipal advisory boards.',
      category: 'Youth & Civic',
      status: 'Published',
      is_anonymous: 1,
      created_by_id: 'user-campaignmgr-1',
      expires_at: '2026-06-30',
      questions: [
        { id: 'sq-4-1', text: 'What types of community service activities are you most interested in participating in?', type: 'mcq', options: JSON.stringify(['Environmental & park cleanups', 'Senior citizen technology assistance', 'Youth tutoring & reading clubs', 'Food bank & community pantry packing', 'Civic awareness workshops']) },
        { id: 'sq-4-2', text: 'What times work best for volunteer shifts?', type: 'single', options: JSON.stringify(['Saturday mornings', 'Sunday afternoons', 'Weekday evenings', 'Flexible remote / digital tasks']) }
      ]
    },
    {
      id: 'srv-5',
      title: 'Annual Party Volunteer Experience & Support Survey',
      description: 'Internal organizational feedback on training quality, coordinator communication, and field support equipment.',
      category: 'Internal',
      status: 'Closed',
      is_anonymous: 1,
      created_by_id: 'user-superadmin',
      expires_at: '2026-01-31',
      questions: [
        { id: 'sq-5-1', text: 'Did you feel well-equipped and briefed before your field assignments?', type: 'rating', options: JSON.stringify(['1 - Not at all', '2 - Somewhat', '3 - Adequately', '4 - Well prepared', '5 - Exceptionally well prepared']) },
        { id: 'sq-5-2', text: 'How prompt was communication from your district or unit coordinator?', type: 'rating', options: JSON.stringify(['1 - Unresponsive', '2 - Delayed', '3 - Acceptable', '4 - Prompt', '5 - Immediate']) }
      ]
    }
  ];

  for (const s of surveys) {
    insertSurvey.run(s.id, s.title, s.description, s.category, s.status, s.is_anonymous, s.created_by_id, s.expires_at);
    let order = 1;
    for (const q of s.questions) {
      insertQuestion.run(q.id, s.id, q.text, q.type, q.options, order++, 1);
    }
  }

  // Populate sample responses for srv-1 (Transit) to render rich analytics
  const sampleResponsesSrv1 = [
    { trans: 'Public Bus', rate: '3', mcq: 'Weekend and late-night bus routes', text: 'Bus #14 needs 15-minute headway during morning rush.' },
    { trans: 'Commuter Rail', rate: '4', mcq: 'Modernized contactless ticketing', text: 'Contactless phone tap payments at ticket turnstiles would save 5 minutes.' },
    { trans: 'Bicycle / Walking', rate: '2', mcq: 'Protected bike corridors', text: 'Main street bike lane has cars parked in it constantly.' },
    { trans: 'Public Bus', rate: '4', mcq: 'Cleaner stations & waiting shelters', text: 'More rain shelters at transfer hubs.' },
    { trans: 'Personal Car', rate: '3', mcq: 'Electric bus fleet transition', text: 'Expand park-and-ride lot capacity near station 5.' },
    { trans: 'Public Bus', rate: '5', mcq: 'Weekend and late-night bus routes', text: 'Love the weekend express service, keep it up.' },
    { trans: 'Commuter Rail', rate: '4', mcq: 'Weekend and late-night bus routes', text: 'Need night trains past 11:30 PM on Fridays.' },
    { trans: 'Bicycle / Walking', rate: '3', mcq: 'Protected bike corridors', text: 'Physical concrete dividers for safety on boulevard.' },
    { trans: 'Public Bus', rate: '2', mcq: 'Weekend and late-night bus routes', text: 'Buses run too infrequently on Sundays.' },
    { trans: 'Carpool / Rideshare', rate: '4', mcq: 'Modernized contactless ticketing', text: 'Good coordination overall.' }
  ];

  let rIdx = 1;
  for (const sr of sampleResponsesSrv1) {
    const respId = `resp-1-${rIdx++}`;
    insertResponse.run(respId, 'srv-1', `anon-tok-${Math.random().toString(36).substring(2, 9)}`, '2026-03-20 14:30:00');
    insertAnswer.run(`ans-${respId}-1`, respId, 'sq-1-1', sr.trans);
    insertAnswer.run(`ans-${respId}-2`, respId, 'sq-1-2', sr.rate);
    insertAnswer.run(`ans-${respId}-3`, respId, 'sq-1-3', sr.mcq);
    insertAnswer.run(`ans-${respId}-4`, respId, 'sq-1-4', sr.text);
  }

  // Populate responses for srv-2 (Parks)
  const sampleResponsesSrv2 = [
    { freq: 'Daily', rate: '4', amen: 'Children playground upgrades' },
    { freq: '2-3 times a week', rate: '5', amen: 'Community vegetable gardens' },
    { freq: 'Once a week', rate: '3', amen: 'Sports courts (basketball / pickleball)' },
    { freq: '2-3 times a week', rate: '4', amen: 'Shaded picnic pavilions' },
    { freq: 'Once a month', rate: '4', amen: 'Fenced dog park areas' },
    { freq: 'Daily', rate: '5', amen: 'Children playground upgrades' }
  ];
  let rIdx2 = 1;
  for (const sr of sampleResponsesSrv2) {
    const respId = `resp-2-${rIdx2++}`;
    insertResponse.run(respId, 'srv-2', `anon-tok-${Math.random().toString(36).substring(2, 9)}`, '2026-03-22 10:15:00');
    insertAnswer.run(`ans-${respId}-1`, respId, 'sq-2-1', sr.freq);
    insertAnswer.run(`ans-${respId}-2`, respId, 'sq-2-2', sr.rate);
    insertAnswer.run(`ans-${respId}-3`, respId, 'sq-2-3', sr.amen);
  }

  // 8. EVENTS (3 Sample Events with logistics checklists)
  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, description, category, date_time, venue, coordinator_id, expected_attendance, actual_attendance, budget, status, logistics_checklist)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const events = [
    {
      id: 'evt-1',
      title: 'Annual State Convention & Policy Gala 2026',
      description: 'Keynote addresses, election of state executive officers, platform discussion, and civic service awards banquet.',
      category: 'Convention',
      date_time: '2026-05-18 09:00:00',
      venue: 'Metropolitan Convention Hall, Capital City',
      coordinator_id: 'user-statecoord-2',
      expected_attendance: 1200,
      actual_attendance: 0,
      budget: 35000.00,
      status: 'Upcoming',
      logistics_checklist: JSON.stringify([
        { id: '1', item: 'Audio-visual and live streaming crew contract', done: true },
        { id: '2', item: 'Delegate badge badges and digital RFID check-in tablets', done: true },
        { id: '3', item: 'Catering menu finalized for luncheon and coffee breaks', done: false },
        { id: '4', item: 'Security and emergency first aid station staffed', done: false },
        { id: '5', item: 'Print 1,200 copies of Party Policy Platform 2026', done: false }
      ])
    },
    {
      id: 'evt-2',
      title: 'Town Hall on Environmental & River Safety',
      description: 'Open public forum with hydrology specialists, municipal water engineers, and community residents.',
      category: 'Town Hall',
      date_time: '2026-04-26 18:30:00',
      venue: 'Green Valley Community Pavilion, River Valley',
      coordinator_id: 'user-campaignmgr-1',
      expected_attendance: 350,
      actual_attendance: 0,
      budget: 4500.00,
      status: 'Upcoming',
      logistics_checklist: JSON.stringify([
        { id: '1', item: 'Stage micro-PA system and microphones for audience Q&A', done: true },
        { id: '2', item: 'Directional signage from highway parking lot', done: true },
        { id: '3', item: 'Survey printed QR feedback display stands', done: false },
        { id: '4', item: 'Local press credentials and reserved media row', done: true }
      ])
    },
    {
      id: 'evt-3',
      title: 'Spring Volunteer Rally & Canvassing Boot Camp',
      description: 'Comprehensive ground campaign skills training, digital tablet canvassing walk-through, and team spirit breakfast.',
      category: 'Volunteer Training',
      date_time: '2026-03-14 10:00:00',
      venue: 'Aurora Sports & Cultural Center, North City',
      coordinator_id: 'user-statecoord-1',
      expected_attendance: 200,
      actual_attendance: 235,
      budget: 6200.00,
      status: 'Completed',
      logistics_checklist: JSON.stringify([
        { id: '1', item: 'Breakfast bagels and coffee station for 250 attendees', done: true },
        { id: '2', item: 'Printed volunteer handbook and code of ethics', done: true },
        { id: '3', item: 'T-shirt distribution table organized by size', done: true },
        { id: '4', item: 'Breakout room assignments for interactive roleplay', done: true }
      ])
    }
  ];

  for (const e of events) {
    insertEvent.run(e.id, e.title, e.description, e.category, e.date_time, e.venue, e.coordinator_id, e.expected_attendance, e.actual_attendance, e.budget, e.status, e.logistics_checklist);
  }

  // 9. BUDGETS & EXPENSES (10 Expense Records)
  const insertBudget = db.prepare(`
    INSERT INTO budgets (id, campaign_id, unit_id, title, fiscal_year, allocated_amount, spent_amount, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const budgets = [
    { id: 'bgt-1', campaign_id: 'camp-1', unit_id: 'unit-central', title: 'Clean River Campaign Q1-Q2 Budget', fiscal_year: '2026', allocated_amount: 45000.00, spent_amount: 14250.00, notes: 'Allocated for cleanup logistics, protective gear, disposal fees' },
    { id: 'bgt-2', campaign_id: 'camp-2', unit_id: 'unit-central', title: 'Youth Tech Outreach Annual Allocation', fiscal_year: '2026', allocated_amount: 65000.00, spent_amount: 22100.00, notes: 'Workshops, computer lab rentals, mentoring materials' },
    { id: 'bgt-3', campaign_id: null, unit_id: 'unit-state-north', title: 'North Province Operations & Office Fund', fiscal_year: '2026', allocated_amount: 50000.00, spent_amount: 18400.00, notes: 'Rent, utilities, district coordinator travel' },
    { id: 'bgt-4', campaign_id: null, unit_id: 'unit-central', title: 'Party National Convention 2026 Fund', fiscal_year: '2026', allocated_amount: 75000.00, spent_amount: 28500.00, notes: 'Venue deposit, AV production, security' }
  ];

  for (const b of budgets) {
    insertBudget.run(b.id, b.campaign_id, b.unit_id, b.title, b.fiscal_year, b.allocated_amount, b.spent_amount, b.notes);
  }

  const insertExpense = db.prepare(`
    INSERT INTO expenses (id, campaign_id, budget_id, title, description, category, amount, transaction_date, receipt_url, submitted_by_id, status, approval_notes, reviewed_by_id, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const expenses = [
    { id: 'exp-1', campaign_id: 'camp-1', budget_id: 'bgt-1', title: 'Biodegradable Waste Sacks & Nitrile Safety Gloves', description: 'Bulk order of 3,000 extra heavy duty eco-sacks and 500 pairs of puncture-resistant gloves.', category: 'Logistics', amount: 3250.00, date: '2026-03-05', receipt: '/uploads/receipts/receipt-eco-supplies.pdf', sub: 'user-campaignmgr-1', status: 'Approved', notes: 'Approved. Vendor provides certified recycled materials.', rev: 'user-centraladmin', rev_at: '2026-03-07 11:20:00' },
    { id: 'exp-2', campaign_id: 'camp-1', budget_id: 'bgt-1', title: 'Hydration Tanker & Water Station Rental', description: 'Potable water tanker truck and paper cups for the volunteer staging ground.', category: 'Catering', amount: 1450.00, date: '2026-03-12', receipt: null, sub: 'user-volunteer-1', status: 'Approved', notes: 'Essential volunteer safety item.', rev: 'user-centraladmin', rev_at: '2026-03-13 09:15:00' },
    { id: 'exp-3', campaign_id: 'camp-2', budget_id: 'bgt-2', title: 'Capital Tech Hub Classroom & High-Speed WiFi Rental', description: 'Weekend venue deposit for 4 coding bootcamps with 80 workstations.', category: 'Venue & Rentals', amount: 6800.00, date: '2026-03-18', receipt: '/uploads/receipts/venue-deposit-hub.pdf', sub: 'user-campaignmgr-2', status: 'Approved', notes: 'Verified against venue lease agreement.', rev: 'user-centraladmin', rev_at: '2026-03-19 14:00:00' },
    { id: 'exp-4', campaign_id: 'camp-2', budget_id: 'bgt-2', title: 'Printed Workbook Guides & Flash Drives', description: '500 study booklets and USB drives preloaded with offline programming compilers.', category: 'Printing & Materials', amount: 2400.00, date: '2026-03-24', receipt: null, sub: 'user-campaignmgr-2', status: 'Approved', notes: 'Educational materials approved.', rev: 'user-centraladmin', rev_at: '2026-03-25 16:30:00' },
    { id: 'exp-5', campaign_id: null, budget_id: 'bgt-3', title: 'Inter-District Field Inspection Travel & Rail Tickets', description: 'Travel expenses for 4 state organizers visiting Highland and Metro North branches.', category: 'Travel', amount: 1120.00, date: '2026-03-28', receipt: null, sub: 'user-statecoord-1', status: 'Approved', notes: 'Standard per diem travel.', rev: 'user-superadmin', rev_at: '2026-03-29 10:00:00' },
    { id: 'exp-6', campaign_id: 'camp-1', budget_id: 'bgt-1', title: 'Recycling Facility Tipping Fees for River Debris', description: 'Municipal weighing scale and authorized environmental disposal processing receipt.', category: 'Logistics', amount: 1850.00, date: '2026-04-01', receipt: null, sub: 'user-campaignmgr-1', status: 'Approved', notes: 'Direct municipal payment.', rev: 'user-centraladmin', rev_at: '2026-04-02 12:45:00' },
    { id: 'exp-7', campaign_id: 'camp-2', budget_id: 'bgt-2', title: 'Catering for Youth Workshop Lunch & Refreshments', description: 'Boxed lunches for 160 students and mentor staff over 2 bootcamp days.', category: 'Catering', amount: 2150.00, date: '2026-04-03', receipt: null, sub: 'user-vol-4', status: 'Pending', notes: null, rev: null, rev_at: null },
    { id: 'exp-8', campaign_id: null, budget_id: 'bgt-4', title: 'Audio/Visual Stage Production Advance Deposit', description: '50% deposit for main stage LED wall, audio console, and backup generators.', category: 'Venue & Rentals', amount: 12500.00, date: '2026-04-04', receipt: '/uploads/receipts/av-production-invoice.pdf', sub: 'user-statecoord-2', status: 'Pending', notes: null, rev: null, rev_at: null },
    { id: 'exp-9', campaign_id: 'camp-1', budget_id: 'bgt-1', title: 'Local Radio Public Service Announcement Airtime', description: 'Community radio station 30-second PSA broadcast for upcoming river cleanup weekend.', category: 'Media & Advertising', amount: 950.00, date: '2026-04-05', receipt: null, sub: 'user-campaignmgr-1', status: 'Pending', notes: null, rev: null, rev_at: null },
    { id: 'exp-10', campaign_id: 'camp-3', budget_id: 'bgt-1', title: 'Expedited First-Aid Kit Restock & Paramedic Bags', description: 'Comprehensive field medical response kits for mobile outreach vans.', category: 'Miscellaneous', amount: 840.00, date: '2026-04-05', receipt: null, sub: 'user-campaignmgr-3', status: 'Pending', notes: null, rev: null, rev_at: null }
  ];

  for (const exp of expenses) {
    insertExpense.run(exp.id, exp.campaign_id, exp.budget_id, exp.title, exp.description, exp.category, exp.amount, exp.date, exp.receipt, exp.sub, exp.status, exp.notes, exp.rev, exp.rev_at);
  }

  // 10. ANNOUNCEMENTS
  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (id, title, content, target_type, target_id, priority, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const announcements = [
    {
      id: 'anc-1',
      title: '2026 Annual Party Convention Notice & Delegate Registration Open',
      content: 'Official credentials for the May 18 State Convention are now available. All District Coordinators are requested to confirm delegate rosters by April 30. Digital check-in badges will be dispatched to accredited attendees.',
      target_type: 'All',
      target_id: null,
      priority: 'Urgent',
      author_id: 'user-centraladmin'
    },
    {
      id: 'anc-2',
      title: 'River Cleanup Volunteer Mobilization Update',
      content: 'Volunteer registration for the Clean River Initiative has surpassed 800 participants! Please check the Task Board for logistics assignments. Field kits will be distributed this Friday.',
      target_type: 'All',
      target_id: null,
      priority: 'Important',
      author_id: 'user-campaignmgr-1'
    },
    {
      id: 'anc-3',
      title: 'Fiscal Year 2026 Expense Documentation Guidelines',
      content: 'Please ensure all expense claims exceeding $500 include attached vendor invoice receipts. The Central Treasury processes reimbursement batches on the 1st and 15th of each month.',
      target_type: 'All',
      target_id: null,
      priority: 'Normal',
      author_id: 'user-superadmin'
    }
  ];

  for (const a of announcements) {
    insertAnnouncement.run(a.id, a.title, a.content, a.target_type, a.target_id, a.priority, a.author_id);
  }

  // 11. NOTIFICATIONS
  const insertNotification = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, link, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const notifications = [
    { id: 'notif-1', user_id: 'user-centraladmin', title: 'New Expense Claim Pending Approval', message: 'AV Production invoice for $12,500 submitted by Robert Langdon.', type: 'expense', link: '/finances', is_read: 0 },
    { id: 'notif-2', user_id: 'user-centraladmin', title: 'Convention Logistics Milestone', message: 'Audio-visual contractor confirmed setup dates for May 17.', type: 'event', link: '/events', is_read: 0 },
    { id: 'notif-3', user_id: 'user-campaignmgr-1', title: 'Permit Approval Pending', message: 'Riverbank assembly permit requires signed parks department affidavit.', type: 'task', link: '/campaigns/camp-1', is_read: 0 },
    { id: 'notif-4', user_id: 'user-volunteer-1', title: 'New Task Assignment', message: 'You were assigned to: Distribute volunteer check-in QR codes.', type: 'task', link: '/campaigns/camp-1', is_read: 0 },
    { id: 'notif-5', user_id: 'user-superadmin', title: 'System Audit Check Clean', message: 'Weekly database integrity check completed with zero foreign key violations.', type: 'system', link: '/audit-logs', is_read: 1 }
  ];

  for (const n of notifications) {
    insertNotification.run(n.id, n.user_id, n.title, n.message, n.type, n.link, n.is_read);
  }

  // 12. AUDIT LOGS
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertAudit.run('aud-1', 'user-superadmin', 'INITIALIZE_SYSTEM', 'Database', 'politix.db', JSON.stringify({ version: '1.0.0', engine: 'better-sqlite3' }), '127.0.0.1');
  insertAudit.run('aud-2', 'user-centraladmin', 'APPROVE_EXPENSE', 'Expense', 'exp-1', JSON.stringify({ amount: 3250, vendor: 'Eco-Supplies' }), '127.0.0.1');
  insertAudit.run('aud-3', 'user-campaignmgr-1', 'CREATE_CAMPAIGN', 'Campaign', 'camp-1', JSON.stringify({ title: 'Clean River Initiative 2026' }), '127.0.0.1');
  insertAudit.run('aud-4', 'user-statecoord-1', 'DEPLOY_SURVEY', 'Survey', 'srv-2', JSON.stringify({ title: 'Local Parks Feedback' }), '127.0.0.1');

  console.log('Seeding completed successfully with 30 members, 5 campaigns, 20 tasks, 5 surveys, 3 events, and 10 expenses!');
}
