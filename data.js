/* Empty workspace: departments, channels, policies and company events only. People join through onboarding. */
window.NDSeed = function () {
  const H = 36e5, DAY = 864e5, NOW = Date.now();
  const at = (d, h = 9, m = 0) => { const x = new Date(); x.setDate(x.getDate() + d); x.setHours(h, m, 0, 0); return +x; };
  const ago = (days) => NOW - days * DAY;

  const departments = [
    { id: 'design', name: 'Design', head: null, color: '#d0569a' },
    { id: 'dev', name: 'Development', head: null, color: '#2457d6' },
    { id: 'marketing', name: 'Marketing', head: null, color: '#d97b1a' },
    { id: 'product', name: 'Product & Projects', head: null, color: '#7a4fd0' },
    { id: 'ops', name: 'Operations & HR', head: null, color: '#1b8f4e' },
  ];
  const U = (id, name, title, dept, role, color, status, extra = {}) => Object.assign({
    id, name, title, dept, role, color, status, prevStatus: null, statusUntil: null, auto: null, room: null,
    email: name.split(' ')[0].toLowerCase() + '@northdesk.example', phone: '+66 2 555 0' + id.slice(1).padStart(3, '1'),
    tz: 'Asia/Bangkok', joined: at(-400 + id.length * 37), bio: '', visibility: 'everyone', focus: null,
  }, extra);
  const users = [
    U('u1', 'Dana Whitfield', 'Operations Director', 'ops', 'admin', '#1b8f4e', 'online', { room: 'general', bio: 'Runs operations, people and the office itself.' }),
    U('u2', 'Marcus Lee', 'Engineering Manager', 'dev', 'manager', '#2457d6', 'busy', { room: 'dev' }),
    U('u3', 'Sofia Alvarez', 'Design Lead', 'design', 'manager', '#d0569a', 'online', { room: 'design' }),
    U('u4', 'Priya Nair', 'Frontend Engineer', 'dev', 'employee', '#7a4fd0', 'online', { room: 'dev', bio: 'React, accessibility and design systems.' }),
    U('u5', 'Tom Becker', 'Backend Engineer', 'dev', 'employee', '#0f8a8a', 'focus', { room: 'focus', statusUntil: NOW + 38 * 60e3, prevStatus: 'online' }),
    U('u6', 'Aiko Tanaka', 'Product Designer', 'design', 'employee', '#c2410c', 'online', { room: 'design' }),
    U('u7', 'Jordan Reyes', 'Marketing Lead', 'marketing', 'manager', '#d97b1a', 'meeting', { room: 'meeting' }),
    U('u8', 'Lena Fischer', 'Content Strategist', 'marketing', 'employee', '#b45309', 'dnd', { statusUntil: NOW + 50 * 60e3, prevStatus: 'online' }),
    U('u9', 'Samuel Okafor', 'QA Engineer', 'dev', 'employee', '#4b5563', 'away'),
    U('u10', 'Nattaya Wongsa', 'UX Researcher', 'design', 'employee', '#be185d', 'online', { room: 'general' }),
    U('u11', 'Kittipong Srisuk', 'HR Specialist', 'ops', 'employee', '#15803d', 'offline'),
    U('u12', 'Hannah Brooks', 'Growth Marketer', 'marketing', 'employee', '#9333ea', 'meeting', { room: 'meeting' }),
  ];

  const projects = [
    { id: 'p1', name: 'Website Relaunch', dept: 'design', owner: 'u3', color: '#2457d6', start: at(-21), end: at(24),
      desc: 'New marketing site with refreshed brand, faster pages and WCAG 2.2 AA.',
      milestones: [{ id: 'm1', name: 'Design freeze', date: at(4) }, { id: 'm2', name: 'Beta on staging', date: at(13) }, { id: 'm3', name: 'Public launch', date: at(24) }] },
    { id: 'p2', name: 'Mobile App v2.4', dept: 'dev', owner: 'u2', color: '#0f8a8a', start: at(-28), end: at(12),
      desc: 'Checkout reliability, rate limiting and release prep for the v2.4 store build.',
      milestones: [{ id: 'm4', name: 'Code freeze', date: at(6) }, { id: 'm5', name: 'Store submission', date: at(12) }] },
    { id: 'p3', name: 'Winter Launch Campaign', dept: 'marketing', owner: 'u7', color: '#d97b1a', start: at(-14), end: at(30),
      desc: 'Multi-channel campaign for the winter collection launch.',
      milestones: [{ id: 'm6', name: 'Creative sign-off', date: at(7) }, { id: 'm7', name: 'Campaign live', date: at(16) }] },
    { id: 'p4', name: 'Office Ops & Onboarding', dept: 'ops', owner: 'u1', color: '#1b8f4e', start: at(-30), end: at(40),
      desc: 'Onboarding refresh, benefits enrollment and office logistics for Q4.',
      milestones: [{ id: 'm8', name: 'Benefits enrollment closes', date: at(7) }] },
  ];

  let n = 0;
  const T = (id, title, project, dept, assignees, reviewers, priority, status, due, progress, o = {}) => {
    n++;
    const created = o.created ?? ago(14 - (n % 9));
    return Object.assign({
      id, title, project, dept, assignees, reviewers, priority, status, due, progress,
      desc: o.desc || '', subtasks: o.subtasks || [], deps: o.deps || [], attachments: o.attachments || [],
      comments: o.comments || [], created, createdBy: o.by || reviewers[0], lastUpdate: o.lastUpdate ?? ago(0.4),
      completedAt: status === 'done' ? (o.completedAt ?? ago(2 + (n % 4))) : null, flags: {},
      activity: [{ at: created, who: o.by || reviewers[0], text: 'created this task' }].concat(o.activity || []),
      fromMeeting: o.fromMeeting || null,
    }, {});
  };
  const st = (t, done) => ({ id: 's' + Math.random().toString(36).slice(2, 7), t, done: !!done });
  const tasks = [
    T('T-101', 'Homepage hero redesign', 'p1', 'design', ['u6'], ['u3'], 'high', 'progress', at(2, 17), 70, {
      desc: 'Rework the hero for the relaunch: new headline lockup, product shot and a single primary CTA. Must hold up at 360px.',
      subtasks: [st('Explore 3 layout directions', 1), st('Pick direction with Sofia', 1), st('Final desktop + mobile frames')],
      comments: [{ id: 'c1', who: 'u3', at: ago(1), text: 'Direction B is the one. Keep the CTA above the fold on mobile.' }] }),
    T('T-102', 'Design system tokens audit', 'p1', 'design', ['u6', 'u10'], ['u3'], 'medium', 'todo', at(6, 17), 0, {
      desc: 'List every color and spacing value in production and map them to tokens.', subtasks: [st('Export styles from Figma'), st('Diff against CSS variables')] }),
    T('T-103', 'Implement new navigation', 'p1', 'dev', ['u4'], ['u2'], 'high', 'progress', at(3, 17), 45, {
      desc: 'Build the new header and mobile menu from the approved designs. Keyboard and screen reader support required.',
      deps: ['T-101'], subtasks: [st('Desktop header', 1), st('Mobile drawer'), st('Focus management + tests')] }),
    T('T-104', 'API rate limiting for public endpoints', 'p2', 'dev', ['u5'], ['u2'], 'urgent', 'overdue', at(-2, 17), 30, {
      desc: 'Token bucket per API key, 429 responses with Retry-After, dashboards in Grafana.', lastUpdate: ago(5),
      subtasks: [st('Choose limiter library', 1), st('Middleware'), st('Load test at 2k rps')] }),
    T('T-105', 'Fix checkout crash on iOS 17', 'p2', 'dev', ['u4', 'u9'], ['u2'], 'urgent', 'review', at(1, 12), 100, {
      desc: 'Crash when Apple Pay sheet is dismissed during address change. 2.1% of iOS sessions affected.',
      subtasks: [st('Reproduce on device', 1), st('Patch + unit test', 1), st('QA on 3 devices', 1)] }),
    T('T-106', 'Regression test suite for v2.4', 'p2', 'dev', ['u9'], ['u2'], 'high', 'progress', at(4, 17), 20, {
      lastUpdate: ago(4), desc: 'Automate the 46 manual checkout and login cases before code freeze.' }),
    T('T-107', 'Winter launch landing page copy', 'p3', 'marketing', ['u8'], ['u7'], 'high', 'revision', at(1, 17), 80, {
      desc: 'Headline, three benefit blocks and FAQ. Tone: warm, short sentences.' }),
    T('T-108', 'Paid social creative set', 'p3', 'marketing', ['u12', 'u6'], ['u7'], 'medium', 'progress', at(5, 17), 60, {
      desc: '12 static + 4 motion variants for Meta and TikTok.', subtasks: [st('Static set', 1), st('Motion set')] }),
    T('T-109', 'Influencer outreach list', 'p3', 'marketing', ['u12'], ['u7'], 'medium', 'done', at(-3, 17), 100),
    T('T-110', 'Press release draft', 'p3', 'marketing', ['u8'], ['u7'], 'medium', 'todo', at(8, 17), 0),
    T('T-111', 'Update onboarding checklist', 'p4', 'ops', ['u11'], ['u1'], 'low', 'progress', at(9, 17), 50),
    T('T-112', 'Q4 office supplies order', 'p4', 'ops', ['u11'], ['u1'], 'low', 'done', at(-5, 17), 100),
    T('T-113', 'Usability test: new checkout', 'p2', 'design', ['u10'], ['u3'], 'high', 'review', at(0, 18), 100, {
      desc: 'Five moderated sessions on the new checkout prototype. Report with severity ratings.' }),
    T('T-114', 'Accessibility audit (WCAG 2.2)', 'p1', 'dev', ['u4'], ['u2'], 'medium', 'todo', at(12, 17), 0, { deps: ['T-103'] }),
    T('T-115', 'Release notes for v2.4', 'p2', 'marketing', ['u8'], ['u2'], 'low', 'todo', at(10, 17), 0, { deps: ['T-106'] }),
    T('T-116', 'Migrate analytics events to v2 schema', 'p1', 'dev', ['u5'], ['u2'], 'medium', 'overdue', at(-1, 17), 60, { lastUpdate: ago(1) }),
    T('T-117', 'Brand photography shortlist', 'p3', 'design', ['u6'], ['u7'], 'low', 'done', at(-4, 17), 100),
    T('T-118', 'Benefits enrollment reminder email', 'p4', 'ops', ['u11'], ['u1'], 'medium', 'todo', at(3, 12), 0),
    T('T-119', 'Database backup restore drill', 'p2', 'dev', ['u5', 'u9'], ['u2'], 'medium', 'done', at(-6, 17), 100),
    T('T-120', 'Customer interview synthesis', 'p1', 'design', ['u10'], ['u3'], 'medium', 'progress', at(5, 17), 35),
  ];

  // Historical completions for reports (lightweight records, not full tasks)
  const archive = [];
  const depts = ['design', 'dev', 'marketing', 'ops'];
  for (let w = 1; w <= 8; w++) for (let i = 0; i < 4 + ((w * 7) % 5); i++) {
    const d = depts[(w + i) % 4];
    archive.push({ dept: d, completedAt: ago(w * 7 - (i % 6)), onTime: ((w + i) % 6) !== 0 });
  }

  const submissions = [
    { id: 'S-1', task: 'T-105', version: 1, by: 'u4', at: ago(0.5), status: 'pending', note: 'Guarded the sheet dismissal callback and added a regression test. Verified on iPhone 12, 14, 15.',
      links: ['https://git.northdesk.example/app/pull/482'], files: [{ name: 'qa-ios-checkout.mp4', size: 18400000 }], reviews: [] },
    { id: 'S-2', task: 'T-107', version: 1, by: 'u8', at: ago(2), status: 'revision', note: 'First full draft, all sections.',
      links: ['https://docs.northdesk.example/winter-landing-v1'], files: [], reviews: [{ by: 'u7', at: ago(1.5), decision: 'revision', comment: 'Headline is strong. Cut the second section to two sentences and add the pricing line.' }] },
    { id: 'S-3', task: 'T-113', version: 1, by: 'u10', at: ago(0.2), status: 'pending', note: 'Report with 4 critical and 7 minor findings, clips attached.',
      links: [], files: [{ name: 'checkout-usability-report.pdf', size: 2400000 }], reviews: [] },
    { id: 'S-4', task: 'T-109', version: 1, by: 'u12', at: ago(4), status: 'approved', note: '42 creators with rates and contact.', links: [], files: [{ name: 'outreach.xlsx', size: 88000 }],
      reviews: [{ by: 'u7', at: ago(3), decision: 'approved', comment: 'Great list.' }] },
    { id: 'S-5', task: 'T-117', version: 2, by: 'u6', at: ago(5), status: 'approved', note: 'Trimmed to 20 shots.', links: [], files: [{ name: 'shortlist.pdf', size: 9100000 }],
      reviews: [{ by: 'u7', at: ago(4.5), decision: 'approved', comment: 'Approved.' }] },
  ];

  const meetings = [
    { id: 'M-1', title: 'Sprint planning: v2.4', start: NOW + 40 * 60e3, dur: 45, room: 'meeting', host: 'u2',
      agenda: '1. Carry-over from last sprint\n2. Rate limiting scope\n3. Code freeze plan', link: 'https://meet.northdesk.example/sprint-24',
      attendees: [{ id: 'u2', rsvp: 'yes' }, { id: 'u4', rsvp: 'yes' }, { id: 'u5', rsvp: 'maybe' }, { id: 'u9', rsvp: 'pending' }, { id: 'u10', rsvp: 'yes' }],
      notes: '', actions: [], consent: false, summary: '' },
    { id: 'M-2', title: 'Winter launch sync', start: at(1, 11), dur: 60, room: 'meeting', host: 'u7',
      agenda: 'Creative status, media budget, launch checklist.', link: 'https://meet.northdesk.example/winter',
      attendees: [{ id: 'u7', rsvp: 'yes' }, { id: 'u8', rsvp: 'yes' }, { id: 'u12', rsvp: 'yes' }, { id: 'u6', rsvp: 'pending' }, { id: 'u1', rsvp: 'maybe' }],
      notes: '', actions: [], consent: false, summary: '' },
    { id: 'M-3', title: 'Homepage hero design review', start: at(-1, 15), dur: 45, room: 'design', host: 'u3',
      agenda: 'Review three hero directions and pick one.', link: '',
      attendees: [{ id: 'u3', rsvp: 'yes', attended: true }, { id: 'u6', rsvp: 'yes', attended: true }, { id: 'u4', rsvp: 'yes', attended: true }, { id: 'u2', rsvp: 'no', attended: false }],
      notes: 'Team chose direction B (split layout with product shot).\nPriya flagged that the mobile CTA must stay above the fold.\nAiko will deliver final frames by Monday.\nPriya will start the header build once frames are in.\nSofia to check the new photography licence before launch.\nOpen question: do we keep the video background? Decide next review.',
      actions: [{ text: 'Deliver final hero frames', owner: 'u6', due: at(2, 17), task: 'T-101' }, { text: 'Check photography licence terms', owner: 'u3', due: at(4, 17), task: null }],
      consent: true, summary: '' },
    { id: 'M-4', title: 'All-hands: Q4 priorities', start: at(3, 16), dur: 60, room: 'general', host: 'u1',
      agenda: 'Q3 results, Q4 goals, office updates, Q&A.', link: 'https://meet.northdesk.example/allhands',
      attendees: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11', 'u12'].map(id => ({ id, rsvp: id === 'u1' ? 'yes' : 'pending' })),
      notes: '', actions: [], consent: false, summary: '' },
    { id: 'M-5', title: '1:1 Marcus / Priya', start: at(1, 14), dur: 30, room: 'private', host: 'u2', agenda: 'Growth plan, navigation project.', link: '',
      attendees: [{ id: 'u2', rsvp: 'yes' }, { id: 'u4', rsvp: 'yes' }], notes: '', actions: [], consent: false, summary: '' },
  ];

  const events = [
    { id: 'E-1', title: 'Benefits enrollment closes', date: at(7, 9), kind: 'company' },
    { id: 'E-2', title: 'Team offsite (Hua Hin)', date: at(14, 9), kind: 'company', days: 2 },
    { id: 'E-3', title: 'Loy Krathong office party', date: at(24, 17), kind: 'company' },
    { id: 'E-4', title: 'Payroll', date: at(-1, 9), kind: 'company' },
  ];
  const schedules = [
    { id: 'B-1', user: 'u4', title: 'Deep work: navigation', start: at(1, 9), end: at(1, 11) },
    { id: 'B-2', user: 'u4', title: 'Dentist', start: at(2, 16), end: at(2, 17) },
    { id: 'B-3', user: 'u2', title: 'Hiring panel', start: at(2, 10), end: at(2, 12) },
    { id: 'B-4', user: 'u1', title: 'Vendor walkthrough', start: at(1, 15), end: at(1, 16) },
  ];

  const chats = [
    { id: 'c-general', kind: 'channel', name: 'general', members: 'all', topic: 'Company-wide chatter' },
    { id: 'c-design', kind: 'channel', name: 'design', members: 'design', topic: 'Design crit and assets' },
    { id: 'c-dev', kind: 'channel', name: 'dev', members: 'dev', topic: 'Engineering' },
    { id: 'c-marketing', kind: 'channel', name: 'marketing', members: 'marketing', topic: 'Campaigns' },
    { id: 'g-launch', kind: 'group', name: 'Winter launch crew', members: ['u7', 'u8', 'u12', 'u6', 'u1'] },
    { id: 'dm:u2:u4', kind: 'dm', members: ['u2', 'u4'] },
    { id: 'dm:u3:u6', kind: 'dm', members: ['u3', 'u6'] },
  ];
  const M = (chat, from, minsAgo, text, extra = {}) => Object.assign({ id: 'msg' + Math.random().toString(36).slice(2, 9), chat, from, at: NOW - minsAgo * 60e3, text }, extra);
  const messages = [
    M('c-general', 'u1', 300, 'Morning all. The 4th floor coffee machine is fixed. Please log office issues in the Request Center so they get tracked.'),
    M('c-general', 'u10', 240, 'Thanks Dana! Also: usability sessions today in the Focus room from 2pm, please keep it quiet nearby.'),
    M('c-general', 'u12', 95, 'Reminder: winter launch moodboard is in the File Center under Marketing.'),
    M('c-dev', 'u2', 180, 'Heads up: T-104 is now overdue. Tom, can you post where the limiter is blocked?'),
    M('c-dev', 'u5', 160, 'Middleware is in review on my branch. Load test still pending, I need the staging keys.'),
    M('c-dev', 'u4', 70, 'Checkout crash fix is up for review in T-105. Samuel verified on three devices.'),
    M('c-dev', 'u9', 52, 'Confirmed. I will start the regression suite (T-106) today, need about 2 days.'),
    M('c-dev', 'u2', 20, 'Great. Priya can you take the mobile drawer for T-103 after the hero frames land? Let us aim for Thursday.'),
    M('c-design', 'u3', 200, 'Hero direction B approved, see notes from yesterday\'s review.'),
    M('c-design', 'u6', 120, 'Final frames are 80% done. Will share the mobile breakpoints this afternoon.', { files: [{ name: 'hero-B-mobile.fig', size: 4200000 }] }),
    M('c-marketing', 'u7', 150, 'Landing copy needs one more pass (T-107). Lena, see my review comments.'),
    M('c-marketing', 'u8', 90, 'On it. Will resubmit before lunch tomorrow.'),
    M('g-launch', 'u7', 60, 'Budget approved for paid social. Hannah, we need the creative set by Thursday.'),
    M('g-launch', 'u12', 40, 'Statics are ready, motion versions will follow. Aiko is helping with the motion set.'),
    M('dm:u2:u4', 'u2', 45, 'Nice work on the iOS fix. Reviewing now.'),
    M('dm:u2:u4', 'u4', 41, 'Thanks! Let me know if you want me to walk you through the test.'),
    M('dm:u3:u6', 'u3', 30, 'Can you add the dark-mode variant of the hero to the frames?'),
  ];

  const announcements = [
    { id: 'A-1', title: 'Q4 all-hands moved to Thursday 16:00', body: 'We moved the all-hands to make room for the offsite planning. Calendar invites are updated. Bring questions for the Q&A.', by: 'u1', at: ago(1), pinned: true, urgent: false, reads: ['u1', 'u2', 'u3', 'u6'] },
    { id: 'A-2', title: 'Benefits enrollment closes in 7 days', body: 'Please review your health and provident fund choices in the HR portal. Kittipong can help with questions.', by: 'u11', at: ago(3), pinned: false, urgent: false, reads: ['u1', 'u11', 'u7'] },
    { id: 'A-3', title: 'Welcome Nattaya to the Design team', body: 'Nattaya joins us as UX Researcher. Say hi in #general!', by: 'u3', at: ago(9), pinned: false, urgent: false, reads: ['u1', 'u2', 'u3', 'u4', 'u6', 'u7', 'u10'] },
  ];
  const leaves = [
    { id: 'L-1', user: 'u9', type: 'Vacation', from: at(8), to: at(10), reason: 'Family trip to Chiang Mai', status: 'pending', at: ago(1), approver: null },
    { id: 'L-2', user: 'u6', type: 'Sick', from: at(-6), to: at(-6), reason: 'Flu', status: 'approved', at: ago(6), approver: 'u3' },
    { id: 'L-3', user: 'u12', type: 'Vacation', from: at(5), to: at(6), reason: 'Wedding', status: 'approved', at: ago(4), approver: 'u7' },
  ];
  const attendance = [];
  users.forEach((u, i) => {
    for (let d = 13; d >= 1; d--) {
      const day = new Date(at(-d)); const wd = day.getDay(); if (wd === 0 || wd === 6) continue;
      const absent = (i * 3 + d) % 17 === 0; if (absent) continue;
      attendance.push({ user: u.id, in: at(-d, 8, 30 + ((i * 7 + d * 5) % 50)), out: at(-d, 17, 30 + ((i + d) % 40)) });
    }
    if (u.status !== 'offline') attendance.push({ user: u.id, in: at(0, 8, 40 + (i * 4) % 30), out: null });
  });
  const requests = [
    { id: 'R-1', title: 'Second monitor for new hire', cat: 'IT', by: 'u10', at: ago(2), status: 'progress', assignee: 'u1', notes: 'Ordered, arriving Tuesday.' },
    { id: 'R-2', title: 'Meeting room TV not connecting', cat: 'Facilities', by: 'u7', at: ago(1), status: 'open', assignee: null, notes: '' },
    { id: 'R-3', title: 'Employment certificate for visa', cat: 'HR', by: 'u5', at: ago(4), status: 'resolved', assignee: 'u11', notes: 'Sent by email.' },
    { id: 'R-4', title: 'Access to analytics workspace', cat: 'IT', by: 'u8', at: ago(0.3), status: 'open', assignee: null, notes: '' },
  ];
  const files = [
    { id: 'F-1', name: 'Brand guidelines 2026.pdf', size: 12800000, folder: 'Design', by: 'u3', at: ago(20), task: null },
    { id: 'F-2', name: 'hero-B-mobile.fig', size: 4200000, folder: 'Design', by: 'u6', at: ago(0.1), task: 'T-101' },
    { id: 'F-3', name: 'API rate limit RFC.md', size: 24000, folder: 'Development', by: 'u5', at: ago(9), task: 'T-104' },
    { id: 'F-4', name: 'Winter launch moodboard.pdf', size: 31000000, folder: 'Marketing', by: 'u12', at: ago(2), task: null },
    { id: 'F-5', name: 'Onboarding checklist v3.docx', size: 64000, folder: 'HR', by: 'u11', at: ago(12), task: 'T-111' },
    { id: 'F-6', name: 'checkout-usability-report.pdf', size: 2400000, folder: 'Design', by: 'u10', at: ago(0.2), task: 'T-113' },
    { id: 'F-7', name: 'Q4 OKRs.xlsx', size: 140000, folder: 'Shared', by: 'u1', at: ago(15), task: null },
    { id: 'F-8', name: 'Expense policy.pdf', size: 380000, folder: 'HR', by: 'u11', at: ago(60), task: null },
  ];
  const kb = [
    { id: 'K-1', title: 'How to submit work for review', tags: ['tasks', 'review'], by: 'system', at: ago(30),
      body: 'Open the task and choose Submit work. Add links or files and a short note on what changed. The reviewer gets a notification. If they request a revision, update the work and submit again: each submission becomes a new version. Approval marks the task Completed automatically.' },
    { id: 'K-2', title: 'Leave policy', tags: ['hr', 'leave'], by: 'system', at: ago(90),
      body: 'Full-time staff get 15 vacation days and 30 sick days per year. Request vacation at least 5 working days ahead in Employees → Leave. Your manager approves. Approved leave appears on the team calendar.' },
    { id: 'K-3', title: 'Using Focus mode and Do Not Disturb', tags: ['availability'], by: 'system', at: ago(20),
      body: 'Focus mode runs a 25, 50 or 90 minute timer and turns on Do Not Disturb. Messages are kept and shown when you return. Calls are declined and logged as missed. People on your emergency list can still reach you. Your previous status comes back when the timer ends.' },
    { id: 'K-4', title: 'Expense claims', tags: ['finance'], by: 'system', at: ago(45),
      body: 'Submit receipts within 30 days through an internal request (category Finance). Claims over 5,000 THB need manager approval first.' },
    { id: 'K-5', title: 'Release checklist (mobile)', tags: ['dev', 'release'], by: 'system', at: ago(40),
      body: 'Code freeze → regression suite green → release notes → store screenshots → staged rollout at 10%, 50%, 100% with crash rate under 0.5%.' },
  ];
  const notifs = [
    { id: 'n1', to: 'u4', type: 'review', title: 'T-105 is waiting for review', body: 'Marcus will review your iOS crash fix.', at: ago(0.45), read: false, link: { task: 'T-105' } },
    { id: 'n2', to: 'u4', type: 'chat', title: 'Marcus mentioned you in #dev', body: 'Priya can you take the mobile drawer for T-103…', at: ago(0.02), read: false, link: { chat: 'c-dev' } },
    { id: 'n3', to: 'u2', type: 'review', title: 'New submission: T-105 v1', body: 'Priya Nair submitted work for review.', at: ago(0.5), read: false, link: { sub: 'S-1' } },
    { id: 'n4', to: 'u2', type: 'overdue', title: 'T-104 is overdue', body: 'API rate limiting was due 2 days ago.', at: ago(1), read: false, link: { task: 'T-104' } },
    { id: 'n5', to: 'u1', type: 'leave', title: 'Leave request from Samuel Okafor', body: 'Vacation, 3 days.', at: ago(1), read: false, link: { route: 'employees' } },
    { id: 'n6', to: 'u3', type: 'review', title: 'New submission: T-113 v1', body: 'Nattaya Wongsa submitted the usability report.', at: ago(0.2), read: false, link: { sub: 'S-3' } },
  ];
  const activity = [
    { at: ago(0.02), who: 'u2', text: 'posted in #dev', link: { chat: 'c-dev' } },
    { at: ago(0.2), who: 'u10', text: 'submitted T-113 for review', link: { task: 'T-113' } },
    { at: ago(0.5), who: 'u4', text: 'submitted T-105 for review', link: { task: 'T-105' } },
    { at: ago(1.5), who: 'u7', text: 'requested a revision on T-107', link: { task: 'T-107' } },
    { at: ago(3), who: 'u7', text: 'approved T-109', link: { task: 'T-109' } },
  ];

  const perms = {
    'task.create': { label: 'Create tasks', admin: true, manager: true, employee: true },
    'task.assign': { label: 'Assign tasks to others', admin: true, manager: true, employee: false },
    'task.delete': { label: 'Delete tasks', admin: true, manager: true, employee: false },
    'review': { label: 'Review submissions', admin: true, manager: true, employee: false },
    'meeting.schedule': { label: 'Schedule meetings', admin: true, manager: true, employee: true },
    'announce': { label: 'Post announcements', admin: true, manager: true, employee: false },
    'leave.approve': { label: 'Approve leave', admin: true, manager: true, employee: false },
    'followup.escalate': { label: 'Escalate overdue work', admin: true, manager: true, employee: false },
    'reports.view': { label: 'View team reports', admin: true, manager: true, employee: false },
    'employees.manage': { label: 'Manage employees & departments', admin: true, manager: false, employee: false },
    'workspace.manage': { label: 'Workspace settings', admin: true, manager: false, employee: false },
    'permissions.manage': { label: 'Edit permissions', admin: true, manager: false, employee: false },
  };

  return {
    v: 2, seededAt: NOW, workspace: { name: 'Northdesk', hours: '09:00–18:00', simulate: false, autoAway: 5 },
    departments, users: [], projects: [], tasks: [], archive: [], submissions: [], meetings: [], events, schedules: [],
    chats: chats.filter(c => c.kind === 'channel'), messages: [], announcements: [], leaves: [], attendance: [], requests: [], files: [], kb,
    notifs: [], activity: [], perms,
    followup: { d3: true, d1: true, d0: true, staleDays: 3, escalateAfter: 1, notifyManagers: true, frequency: 'once' },
    prefs: {}, voice: { room: null, muted: false, deafened: false, sharing: false, since: null, mode: 'near' },
    calls: [], reads: {}, desks: [],
  };
};
