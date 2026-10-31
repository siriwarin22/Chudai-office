'use strict';
/* Onboarding: enter office → get dressed (custom or random) → choose position → create character → decorate desk (or random, later) → into the office. */
const OB = { open: false, step: 0, lookMode: null, dept: null, role: 'employee', title: '', name: '', deskMode: null, canCancel: false };
const MY_CHARS_KEY = 'northdesk.myCharacters';
const OB_STEPS = ['Enter office', 'Get dressed', 'Position', 'Create character', 'Desk', 'Into the office'];
const ROLE_INFO = {
  employee: ['Employee', 'Work on your tasks, submit work, join rooms and meetings.'],
  manager: ['Manager', 'Assign tasks, review submissions, run projects and approve leave.'],
  admin: ['Admin', 'Everything a manager can do, plus people, permissions and settings.'],
};
const DEPT_INFO = { design: 'UI, UX, graphics and brand', dev: 'Games, apps and QA', marketing: 'Campaigns, content and growth', product: 'Projects, roadmaps and backlog', ops: 'People, finance and the office' };
const TITLES = { design: ['UI Designer', 'UX Designer', 'Graphic Designer', 'Product Designer', 'UX Researcher', 'Design Lead'], dev: ['Game Developer', 'Frontend Engineer', 'Backend Engineer', 'QA Engineer', 'Engineering Manager'], marketing: ['Content Strategist', 'Growth Marketer', 'Marketing Lead'], product: ['Project Manager', 'Product Owner (PO)', 'Product Manager', 'Scrum Master'], ops: ['HR Specialist', 'Office Manager', 'Operations Director'] };
function myCharacterIds() {
  let ids = [];
  try { const saved = JSON.parse(localStorage.getItem(MY_CHARS_KEY) || '[]'); if (Array.isArray(saved)) ids = saved.filter(id => typeof id === 'string'); } catch (e) {}
  if (ME && user(ME) && !ids.includes(ME)) { ids.push(ME); try { localStorage.setItem(MY_CHARS_KEY, JSON.stringify(ids)); } catch (e) {} }
  return new Set(ids);
}
function rememberMyCharacter(id) {
  const ids = myCharacterIds(); ids.add(id);
  try { localStorage.setItem(MY_CHARS_KEY, JSON.stringify([...ids])); } catch (e) {}
}

function startOnboarding(fromStep = 0) {
  Object.assign(OB, { open: true, step: fromStep, lookMode: null, dept: null, role: 'employee', title: '', name: '', deskMode: null, canCancel: !!user(ME) });
  PX.startEdit('look', PX.randomLook());
  renderOnboarding(true);
}
function renderOnboarding(force) {
  const el = document.getElementById('onb');
  if (!OB.open) { if (user(ME)) { el.innerHTML = ''; return; } startOnboarding(0); return; }
  if (!force && el.innerHTML) return;
  const keepName = document.getElementById('obName')?.value, keepTitle = document.getElementById('obTitle')?.value;
  if (keepName != null) OB.name = keepName; if (keepTitle != null) OB.title = keepTitle;
  const st = OB.step;
  const steps = `<div class="steps" aria-label="Progress">${OB_STEPS.map((s, i) => `<span class="${i === st ? 'on' : i < st ? 'done' : ''}">${i + 1}. ${s}</span>`).join('')}</div>`;
  let body = '', foot = '';
  const back = st > 0 && st < 4 ? `<button class="btn" data-a="obBack">Back</button>` : '';
  const cancel = OB.canCancel && st < 4 ? `<button class="btn" data-a="obCancel">Cancel</button>` : '';
  if (st === 0) {
    body = `<h1>Welcome to Northdesk</h1><p class="lead">A pixel office for your team. Tasks, meetings, chat and calls all happen on this floor: walk to a desk, the printer or a room to use them.</p>
      <p class="muted">Create your own character to join the shared office. Characters belonging to other people cannot be selected.</p>`;
    foot = `<button class="btn primary" data-a="obNext">Create my character</button>`;
  } else if (st === 1) {
    if (!OB.lookMode) {
      body = `<h1>Get dressed</h1><p class="lead">How do you want your character to look?</p><div class="choice"><button data-a="obLook" data-v="custom"><b>Dress myself</b><span>Pick hair, skin tone, clothes and accessories.</span></button><button data-a="obLook" data-v="random"><b>Random outfit</b><span>Roll a look and shuffle until you like it.</span></button></div>`;
      foot = cancel + back;
    } else if (OB.lookMode === 'custom') {
      body = `<h1>Dress yourself</h1><p class="lead">Changes show on the preview. You can come back any time through the Dressing Room on the floor.</p><div style="margin-top:14px">${PX.editorHTML('look', OB.name || 'You')}</div>`;
      foot = cancel + `<button class="btn" data-a="obLook" data-v="">Back</button><button class="btn primary" data-a="obNext">Next</button>`;
    } else {
      body = `<h1>Random outfit</h1><p class="lead">Shuffle until it feels like you.</p><div class="sv-left" style="margin:14px auto 0;max-width:240px"><div class="sv-frame"><canvas id="ed-look" width="16" height="24"></canvas></div><button type="button" class="sv-dice" data-a="obReroll">Random</button></div>`;
      foot = cancel + `<button class="btn" data-a="obLook" data-v="custom">Customize instead</button><button class="btn primary" data-a="obNext">Next</button>`;
    }
  } else if (st === 2) {
    body = `<h1>Choose your position</h1><p class="lead">Your department decides where your desk is. Your role decides what you can do.</p>
      <div class="sec" style="margin-top:14px"><span class="tag" style="color:#8a6a48">Department</span><div class="choice" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-top:4px">${S.departments.map(d => `<button class="opt ${OB.dept === d.id ? 'on' : ''}" data-a="obDept" data-v="${d.id}" aria-pressed="${OB.dept === d.id}"><b>${esc(d.name)}</b><span>${esc(DEPT_INFO[d.id] || 'Team')} · ${S.users.filter(u => u.dept === d.id).length} people</span></button>`).join('')}</div></div>
      <div class="sec" style="margin-top:14px"><span class="tag" style="color:#8a6a48">Role</span><div class="choice" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));margin-top:4px">${Object.entries(ROLE_INFO).map(([k, [l, dsc]]) => `<button class="opt ${OB.role === k ? 'on' : ''}" data-a="obRole" data-v="${k}" aria-pressed="${OB.role === k}"><b>${l}</b><span>${dsc}</span></button>`).join('')}</div></div>
      ${OB.dept ? `<div class="sec" style="margin-top:14px"><span class="tag" style="color:#8a6a48">Profession</span><div class="chips">${(TITLES[OB.dept] || []).map(x => `<button type="button" class="btn sm ${OB.title === x ? 'on' : ''}" data-a="obTitlePick" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>` : ''}
      <label class="f" style="margin-top:14px">Job title<input class="in" id="obTitle" value="${esc(OB.title)}" placeholder="${esc((TITLES[OB.dept] || ['Team member'])[0])}" maxlength="50"></label>`;
    foot = cancel + back + `<button class="btn primary" data-a="obNext" ${OB.dept ? '' : 'disabled'}>Next</button>`;
  } else if (st === 3) {
    const d = dept(OB.dept);
    body = `<h1>Create your character</h1><p class="lead">What should colleagues call you?</p>
      <div class="row" style="gap:20px;margin-top:16px;align-items:center;flex-wrap:wrap"><div class="sv-left" style="width:180px"><div class="sv-frame"><canvas id="ed-look" width="16" height="24"></canvas></div></div>
      <div class="form" style="flex:1;min-width:220px"><label class="f">Your name<input class="in" id="obName" value="${esc(OB.name)}" placeholder="e.g. Ploy Chaiyaporn" maxlength="40" required></label>
      <div class="kv" style="grid-template-columns:100px 1fr"><span>Department</span><b>${esc(d?.name || '')}</b><span>Position</span><b>${esc(OB.title || (TITLES[OB.dept] || ['Team member'])[0])}</b><span>Role</span><b>${ROLE_INFO[OB.role][0]}</b></div></div></div>`;
    foot = cancel + back + `<button class="btn primary" data-a="obCreate">Create character</button>`;
  } else if (st === 4) {
    if (!OB.deskMode) {
      body = `<h1>Your desk</h1><p class="lead">You have a desk in ${esc(dept(me().dept)?.name || 'the office')}. Make it yours? In the office you can also sit on any free chair and press E to make it your permanent desk, or place a new desk.</p><div class="choice"><button data-a="obDesk" data-v="custom"><b>Decorate my desk</b><span>Choose a plant, mug, desk item and name plate.</span></button><button data-a="obDesk" data-v="random"><b>Random for now</b><span>Get a random setup and decorate later from your Profile.</span></button></div>`;
    } else {
      body = `<h1>Decorate your desk</h1><div style="margin-top:14px">${PX.editorHTML('desk')}</div>`;
      foot = `<button class="btn" data-a="obDesk" data-v="">Back</button><button class="btn primary" data-a="obDeskDone">Next</button>`;
    }
  } else {
    const u = me();
    body = `<h1>You're all set, ${esc(u.name.split(' ')[0])}</h1><p class="lead">Here is how the office works:</p>
      <div class="grid g2" style="gap:8px 18px;margin-top:12px;font-size:14px">${[['Walk', 'WASD or arrow keys, or click the floor'], ['Use things', 'Face an object and press E, or click it'], ['Your desk', 'My Tasks: create, update and submit work'], ['Rooms', 'Walk in to join the voice room; walk out to leave'], ['Mic & headphones', 'Bottom left, works anywhere'], ['Talk', 'Press T to say something out loud'], ['Hotbar', 'Number keys 1–0 open the tools'], ['Dressing Room', 'Change your outfit any time'], ['Permanent desk', 'Sit on a free chair and press E'], ['Mic modes', 'Nearby = whisper range, Shout = everyone hears']].map(([a, b]) => `<div><b>${a}</b><div class="muted">${b}</div></div>`).join('')}</div>`;
    foot = `<button class="btn primary" data-a="obEnter">Enter the office</button>`;
  }
  el.innerHTML = `<div class="onb"><div class="onb-card" role="dialog" aria-modal="true" aria-label="${OB_STEPS[st]}"><div class="row" style="justify-content:space-between;align-items:flex-start;flex-wrap:nowrap">${steps}<button class="btn sm notr" data-a="lang" style="flex:none">${LANG === 'th' ? 'English' : 'ภาษาไทย'}</button></div>${body}<div class="onb-foot">${foot}</div></div></div>`;
  if (st === 1 && OB.lookMode === 'custom') PX.renderEditor('look');
  if ((st === 1 && OB.lookMode === 'random') || st === 3) PX.preview('look');
  if (st === 4 && OB.deskMode === 'custom') PX.renderEditor('desk');
  $$('canvas[data-obchar]').forEach(c => { const u = user(c.dataset.obchar); if (u) { const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(PX.sprite(PX.lookOf(u), 'd', 0), 0, 0); } });
  const f = el.querySelector('#obName, #obTitle'); if (f && st === 3) f.focus();
}
const OBA = {
  obNext() { if (OB.step === 2 && !OB.dept) return; OB.step++; renderOnboarding(true); },
  obBack() { OB.step = Math.max(0, OB.step - 1); renderOnboarding(true); },
  obCancel() { OB.open = false; document.getElementById('onb').innerHTML = ''; render(); },
  obLook(d) { OB.lookMode = d.v || null; if (d.v === 'random') PX.startEdit('look', PX.randomLook()); renderOnboarding(true); },
  obReroll() { PX.startEdit('look', PX.randomLook()); PX.preview('look'); },
  obDept(d) { OB.dept = d.v; OB.title = document.getElementById('obTitle')?.value || ''; renderOnboarding(true); },
  obRole(d) { OB.role = d.v; renderOnboarding(true); },
  obTitlePick(d) { OB.title = d.v; const i = document.getElementById('obTitle'); if (i) i.value = d.v; renderOnboarding(true); },
  obCreate() {
    const name = (document.getElementById('obName')?.value || '').trim();
    if (!name) { toast('Type your name', 'It is shown above your character.', 'warn'); document.getElementById('obName')?.focus(); return; }
    let id = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); while (user(id)) id += 'x';
    const title = OB.title.trim() || (TITLES[OB.dept] || ['Team member'])[0];
    const u = { id, name, title, dept: OB.dept, role: OB.role, color: pick(['#2457d6', '#0f8a8a', '#c2410c', '#7a4fd0', '#15803d', '#be185d', '#b45309', '#4b5563']), status: 'online', prevStatus: null, statusUntil: null, auto: null, room: null,
      email: name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') + '@northdesk.example', phone: '', tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Bangkok'), joined: now(), bio: '', visibility: 'everyone', focus: null, look: Object.assign({}, PX.getEd('look')), desk: null };
    S.users.push(u);
    rememberMyCharacter(id);
    const d = dept(OB.dept); if (d && !d.head && u.role !== 'employee') d.head = id;
    ME = id; try { localStorage.setItem(MEKEY, ME); } catch (e) {}
    S.attendance.push({ user: id, in: now(), out: null });
    log(id, `joined the office as ${title}`);
    OB.step = 4; OB.canCancel = false; commit(); renderOnboarding(true);
  },
  obDesk(d) { OB.deskMode = d.v || null; if (d.v === 'random') { me().desk = PX.randomDesk(); OB.step = 5; commit(); } else if (d.v === 'custom') PX.startEdit('desk', PX.randomDesk()); renderOnboarding(true); },
  obDeskDone() { me().desk = Object.assign({}, PX.getEd('desk')); OB.step = 5; commit(); renderOnboarding(true); },
  obEnter() {
    OB.open = false; document.getElementById('onb').innerHTML = '';
    PX.mode = 'follow'; PX.spawn(ME); go('floor');
    notify(ME, { type: 'system', title: `Welcome, ${me().name.split(' ')[0]}`, body: 'Walk to your desk and press E to open your tasks.', tone: 'ok', essential: true });
    commit(); setTimeout(() => document.querySelector('.pxcv')?.focus(), 50);
  },
  obContinue(d) { if (!myCharacterIds().has(d.id)) { toast('That character belongs to someone else', 'Create your own character to join the office.', 'warn'); return; } ME = d.id; try { localStorage.setItem(MEKEY, ME); } catch (e) {} OB.open = false; document.getElementById('onb').innerHTML = ''; const u = me(); if (u.status === 'offline') u.status = 'online'; PX.spawn(ME); go('floor'); toast(`Welcome back, ${u.name.split(' ')[0]}`, '', 'ok'); commit(); },
  newChar() { UI.drawer = null; go('floor'); startOnboarding(1); render(); },
  switchChar(d) { if (!myCharacterIds().has(d.id)) { toast('That character belongs to someone else', 'You can only switch between characters created in this browser.', 'warn'); return; } ME = d.id; try { localStorage.setItem(MEKEY, ME); } catch (e) {} UI.drawer = null; UI.taskScope = null; const u = me(); if (u.status === 'offline') u.status = 'online'; toast(`Now playing as ${u.name}`, `${cap(u.role)} · ${dept(u.dept)?.name || ''}`, 'info'); go('floor'); commit(); },
  myCharacters() { return [...myCharacterIds()].map(user).filter(Boolean); },
};
