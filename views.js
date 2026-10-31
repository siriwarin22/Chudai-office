'use strict';
/* ================= render infrastructure ================= */
let rq = 0;
function render() { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; doRender(); }); }
const KEEP_TYPES = ['text', 'search', 'url', 'number', 'date', 'time', 'email', 'tel'];
function captureInputs() {
  const out = {};
  $$('#content [id], #drawer [id]').forEach(el => {
    if (el.dataset.live !== undefined) return;
    if (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && KEEP_TYPES.includes(el.type))) out[el.id] = el.value;
  });
  const a = document.activeElement;
  return { vals: out, focus: a && a.id && (a.closest('#content') || a.closest('#drawer')) ? { id: a.id, s: a.selectionStart, e: a.selectionEnd } : null };
}
const DROP = new Set();
function restoreInputs(k) {
  for (const id in k.vals) { if (DROP.has(id)) continue; const el = document.getElementById(id); if (el && el.dataset.live === undefined) el.value = k.vals[id]; }
  DROP.clear();
  if (k.focus) { const el = document.getElementById(k.focus.id); if (el) { el.focus({ preventScroll: true }); try { if (k.focus.s != null) el.setSelectionRange(k.focus.s, k.focus.e); } catch (e) {} } }
}
let lastChat = null;
function doRender() {
  if (!S) return;
  const has = !!user(ME);
  document.getElementById('app').classList.toggle('onb-on', !has || (typeof OB !== 'undefined' && OB.open));
  if (typeof PX !== 'undefined') PX.mount();
  if (!has) { if (typeof renderOnboarding === 'function') renderOnboarding(); return; }
  const k = captureInputs();
  const sc = $('#content').scrollTop, dbd = $('#drawer .bd'), dsc = dbd ? dbd.scrollTop : 0;
  const ms = $('.msgs'); const atBottom = !ms || ms.scrollHeight - ms.scrollTop - ms.clientHeight < 60; const msTop = ms ? ms.scrollTop : 0;
  $('#side').innerHTML = sideHTML();
  $('#top').innerHTML = topHTML();
  $('#banners').innerHTML = bannersHTML();
  $('#voicebar').innerHTML = voiceHTML();
  const inWin = UI.route !== 'floor' && VIEWS[UI.route];
  $('#win').hidden = !inWin;
  if (inWin) {
    const item = NAV.flatMap(g => g[1]).find(x => x[0] === UI.route) || [UI.route, 'All tools', 'dashboard'];
    $('#wintitle').textContent = item[1]; $('#winicon').innerHTML = ic(item[2]); $('#win').setAttribute('aria-label', item[1]);
    $('#content').innerHTML = '<div class="wrapc">' + VIEWS[UI.route]() + '</div>';
    $('#content').scrollTop = sc;
  } else $('#content').innerHTML = '';
  $('#drawer').innerHTML = UI.drawer ? drawerHTML() : '';
  const nd = $('#drawer .bd'); if (nd) nd.scrollTop = dsc;
  const nm = $('.msgs'); if (nm) nm.scrollTop = (atBottom || lastChat !== UI.chat) ? nm.scrollHeight : msTop;
  lastChat = UI.route === 'chat' ? UI.chat : null;
  const pc = document.getElementById('pfchar'); if (pc) { const g = pc.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 76, 24); ['d', 'l', 'u', 'r'].forEach((d, i) => g.drawImage(PX.sprite(PX.lookOf(me()), d, 0), i * 20, 0)); }
  $$('canvas[data-char]').forEach(c => { const u = user(c.dataset.char); if (!u) return; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 16, 24); g.drawImage(PX.sprite(PX.lookOf(u), 'd', 0), 0, 0); });
  restoreInputs(k);
  tickTimers();
  pushPresence();
}
function tickTimers() {
  $$('[data-countdown]').forEach(el => el.textContent = mmss(+el.dataset.countdown - now()));
  $$('[data-since]').forEach(el => el.textContent = mmss(now() - +el.dataset.since));
  $$('[data-clock]').forEach(el => el.textContent = fTime(now()));
}
setInterval(tickTimers, 1000);

function followLink(l) {
  if (!l) return;
  if (l.task) return openDrawer('task', l.task);
  if (l.sub) return openDrawer('sub', l.sub);
  if (l.meeting) return openDrawer('meeting', l.meeting);
  if (l.chat) { UI.chat = l.chat; go('chat'); return; }
  if (l.dm) { UI.chat = dmId(l.dm); go('chat'); return; }
  if (l.route === 'notifs') return openDrawer('notifs');
  if (l.route) go(l.route);
}
function go(r) { if (location.hash !== '#' + r) location.hash = r; else { UI.route = r; render(); } }
const dmId = uid => { const id = 'dm:' + [ME, uid].sort((a, b) => +a.slice(1) - +b.slice(1)).join(':'); if (!S.chats.find(c => c.id === id)) S.chats.push({ id, kind: 'dm', members: [ME, uid] }); return id; };

/* ================= shell ================= */
const NAV = [
  ['Workspace', [['dashboard', 'Dashboard', 'dashboard'], ['office', 'Online Office', 'office'], ['tasks', 'My Tasks', 'tasks'], ['projects', 'Projects', 'projects'], ['calendar', 'Calendar', 'calendar']]],
  ['Communication', [['chat', 'Chat', 'chat'], ['voice', 'Voice Rooms', 'voice'], ['meetings', 'Meetings', 'video'], ['dj', 'DJ Booth', 'music']]],
  ['Management', [['submissions', 'Submissions', 'submit'], ['followups', 'Follow-ups', 'alarm'], ['employees', 'Employees', 'users'], ['files', 'File Center', 'files'], ['announcements', 'Announcements', 'megaphone'], ['reports', 'Reports', 'reports']]],
  ['Settings', [['profile', 'Profile', 'user'], ['availability', 'Availability & DND', 'moon'], ['notifications', 'Notifications', 'bell'], ['workspace', 'Workspace Settings', 'gear'], ['permissions', 'Permissions', 'shield']]],
];
function navBadge(r) {
  if (r === 'tasks') { const n = S.tasks.filter(t => t.assignees.includes(ME) && ['overdue', 'revision'].includes(t.status)).length; return n ? `<span class="badge">${n}</span>` : ''; }
  if (r === 'chat') { const n = chatList().reduce((a, c) => a + unread(c), 0); return n ? `<span class="badge">${n}</span>` : ''; }
  if (r === 'submissions') { const n = toReview().length; return n ? `<span class="badge soft">${n}</span>` : ''; }
  if (r === 'voice' && S.voice.room) return `<span class="badge" style="background:var(--ok)">●</span>`;
  return '';
}
const HOTBAR = [['dashboard', 'Overview', 'dashboard'], ['tasks', 'My Tasks', 'tasks'], ['projects', 'Projects', 'projects'], ['calendar', 'Calendar', 'calendar'], ['chat', 'Chat', 'chat'], ['meetings', 'Meetings', 'video'], ['submissions', 'Submissions', 'submit'], ['followups', 'Follow-ups', 'alarm'], ['office', 'People & rooms', 'users'], ['files', 'File Center', 'files'], ['announcements', 'Announcements', 'megaphone'], ['menu', 'All tools & settings', 'menu']];
function sideHTML() {
  return HOTBAR.map(([r, l, i], n) => `<button class="hb ${UI.route === r ? 'on' : ''}" data-a="openWin" data-v="${r}" title="${l}${n < 10 ? ' (' + ((n + 1) % 10) + ')' : ''}" aria-label="${l}">${n < 10 ? `<span class="k">${(n + 1) % 10}</span>` : ''}${ic(i)}${navBadge(r)}</button>`).join('');
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const lookURL = new Map();
function charURL(u) { const k = JSON.stringify(PX.lookOf(u)); if (!lookURL.has(k)) { const c = document.createElement('canvas'); c.width = 16; c.height = 14; const g = c.getContext('2d'); g.drawImage(PX.sprite(PX.lookOf(u), 'd', 0), 0, -1); lookURL.set(k, c.toDataURL()); } return lookURL.get(k); }
function topHTML() {
  const m = me(), s = m.status, n = unreadCount(), d = new Date();
  return `<div class="wbox hud-me"><button class="hud-av" data-a="openWin" data-v="profile" aria-label="Your profile"><img src="${charURL(m)}" alt=""></button><div style="min-width:0"><b class="ell" style="display:block">${esc(m.name)}</b><span class="hud-sub"><span id="hudzone">Office</span> · ${esc(m.title || cap(m.role))}</span></div></div>
  <div class="search hide-sm">${ic('search')}<input id="gsearch" type="search" placeholder="Search (/)" data-i="gsearch" autocomplete="off" aria-label="Search"></div>
  <span class="sp"></span>
  <button class="wbox hud-btn" data-a="statusMenu" aria-haspopup="menu">${pdot(s)}<span class="hide-sm">${PRES[s].l}</span>${m.statusUntil ? `<span class="timer hide-sm" data-countdown="${m.statusUntil}"></span>` : ''}</button>
  <button class="wbox hud-btn" data-a="openNotifs" aria-label="Notifications, ${n} unread">${ic('bell')}${n ? `<span class="badge">${n > 99 ? '99+' : n}</span>` : ''}</button>
  <button class="wbox hud-btn" data-a="openAI" aria-label="Assistant">${ic('spark')}</button>
  <button class="wbox hud-btn" data-a="pxZoom" data-v="${PX.mode === 'fit' ? 'follow' : 'fit'}" aria-label="${PX.mode === 'fit' ? 'Follow my character' : 'Show whole office'} (M)">${ic(PX.mode === 'fit' ? 'target' : 'office')}</button>
  <button class="wbox hud-btn" data-a="lang" aria-label="Language: ${LANG === 'th' ? 'Thai' : 'English'}"><b class="notr">${LANG === 'th' ? 'TH' : 'EN'}</b></button>
  <div class="wbox hud-clock"><div class="t num" data-clock>${fTime(now())}</div><div class="d">${WD[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}</div></div>`;
}
function voiceHTML() {
  const v = S.voice, r = v.room && ROOMS.find(x => x.id === v.room);
  return `<div class="wbox vb"><div class="vb-row"><span class="vb-room">${r ? `<span class="dot" style="background:var(--ok)"></span>${esc(r.name)} <span class="timer" data-since="${v.since || now()}"></span>` : '<span class="faint">Not in a room · walk into one</span>'}</span></div>
  <div class="vb-row"><button class="vbtn ${v.muted ? 'off' : ''}" data-a="vMute" aria-pressed="${!v.muted}" title="${v.muted ? 'Microphone off' : 'Microphone on'}">${ic(v.muted ? 'micoff' : 'mic')}</button>
  <button class="vbtn ${v.deafened ? 'off' : ''}" data-a="vDeaf" aria-pressed="${!v.deafened}" title="${v.deafened ? 'Headphones off' : 'Headphones on'}">${ic(v.deafened ? 'headoff' : 'voice')}</button>
  ${r ? `<button class="vbtn ${v.sharing ? 'on' : ''}" data-a="vShare" title="Share screen">${ic('screen')}</button><button class="vbtn off" data-a="leaveRoom" title="Leave room">${ic('logout')}</button>` : ''}
  </div><div class="vb-row vb-mode"><button class="vmode ${v.mode !== 'shout' ? 'on' : ''}" data-a="vMode" data-v="near" title="Only people near you hear you">Nearby</button><button class="vmode ${v.mode === 'shout' ? 'on' : ''}" data-a="vMode" data-v="shout" title="Everyone in the office hears you">Shout</button><span class="vb-hear" title="People who can hear you"><span id="hearN">0</span> ${ic('users')}</span></div>
  <div class="vb-row"><form data-form="say" class="say"><input id="sayInput" name="t" maxlength="120" placeholder="Press T to talk" autocomplete="off" aria-label="Say something"></form></div>${DJ.miniHTML()}</div>`;
}
function bannersHTML() {
  const m = me(); const held = myNotifs().filter(n => n.held).length;
  if (m.status === 'focus' && m.statusUntil) return `<div class="banner focus">${ic('target')}<span>Focus mode · <span class="timer" data-countdown="${m.statusUntil}"></span> left · notifications and calls are held${held ? ` (${held} waiting)` : ''}</span><span class="sp"></span><button class="btn sm" data-a="endQuiet">End focus</button></div>`;
  if (m.status === 'dnd') return `<div class="banner dnd">${ic('moon')}<span>Do Not Disturb${m.statusUntil ? ' until ' + fTime(m.statusUntil) : ''}${m.auto === 'schedule' ? ' (scheduled)' : ''} · ${held} held</span><span class="sp"></span><button class="btn sm" data-a="endQuiet">Turn off</button></div>`;
  return '';
}
function phead(title, sub, actions = '') { return `<div class="phead"><div class="t"><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="row">${actions}</div></div>`; }
const card = (title, body, opts = {}) => `<section class="card ${opts.cls || ''}" ${opts.style ? `style="${opts.style}"` : ''}><div class="hd"><h2>${title}</h2>${opts.act || ''}</div><div class="bd ${opts.flush ? 'flush' : ''}">${body}</div></section>`;
const tabs = (key, list, def) => { const cur = UI.tabs[key] || def || list[0][0]; return [`<div class="tabs" role="tablist">${list.map(([k, l]) => `<button role="tab" aria-selected="${cur === k}" class="${cur === k ? 'on' : ''}" data-a="tab" data-k="${key}" data-v="${k}">${l}</button>`).join('')}</div>`, cur]; };
const seg = (act, cur, list) => `<div class="seg" role="group">${list.map(([k, l]) => `<button type="button" class="${cur === k ? 'on' : ''}" data-a="${act}" data-v="${k}" aria-pressed="${cur === k}">${l}</button>`).join('')}</div>`;

/* ================= views ================= */
const VIEWS = {};
VIEWS.floor = () => '';
VIEWS.dj = () => DJ.view();
VIEWS.menu = () => phead('All tools', 'Every module of the office. You can also walk to objects on the floor: desks, shelves, printer, reception, clock and more.') + NAV.map(([g, items]) => `<section class="card"><div class="hd"><h2>${g}</h2></div><div class="bd grid g4" style="gap:10px">${items.map(([r, l, i]) => `<button class="btn" style="justify-content:flex-start;padding:12px" data-a="openWin" data-v="${r}">${ic(i)}${l}${navBadge(r)}</button>`).join('')}</div></section>`).join('') + `<section class="card"><div class="hd"><h2>Desks</h2></div><div class="bd row"><button class="btn primary" data-a="placeDesk">${ic('plus')}Place a new desk</button><span class="muted">Sit on any free chair and press E to make it your permanent desk.</span></div></section>`
  + `<section class="card"><div class="hd"><h2>On the floor</h2></div><div class="bd"><div class="grid g3" style="gap:6px 16px;font-size:13px">${[['Your desk', 'My Tasks'], ['Meeting table', 'Meetings'], ['Whiteboard', 'Projects'], ['Wall clock', 'Calendar'], ['Bookshelf', 'Knowledge base'], ['Cabinets', 'File Center'], ['Printer', 'Submit work'], ['Sorting desk', 'Follow-ups'], ['Reception', 'Announcements'], ['Lobby sofa', 'Employees & HR'], ['Director desk', 'Reports'], ['Lounge table', 'Chat'], ['Beanbag', 'Availability & DND'], ['Yoga ball', 'Focus 25 min'], ['Coffee machine', 'Coffee break (Away)'], ['Dressing room', 'Change outfit'], ['Any room', 'Walk in to join its voice room']].map(([a, b]) => `<span><b>${a}</b> <span class="muted">→ ${b}</span></span>`).join('')}</div></div></section>`;

VIEWS.dashboard = () => {
  const m = me(), r = m.role, scope = scopeTasks(defaultScope());
  const c = s => scope.filter(t => t.status === s).length;
  const kp = [['', 'Total tasks', scope.length, ''], ['progress', 'Active', c('progress') + c('revision'), 'blue'], ['done', 'Completed', c('done'), 'green'], ['review', 'Pending review', c('review'), 'orange'], ['overdue', 'Overdue', c('overdue'), 'red']];
  const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const scopeLabel = r === 'employee' ? 'Your tasks' : r === 'manager' ? `${dept(m.dept).name} team` : 'Whole company';
  const upcoming = scope.filter(t => t.status !== 'done' && t.due - now() < 7 * DAY).sort((a, b) => a.due - b.due).slice(0, 6);
  const meets = S.meetings.filter(x => x.start + x.dur * MIN > now() && (r === 'admin' || x.attendees.some(a => a.id === ME))).sort((a, b) => a.start - b.start).slice(0, 4);
  const appr = r === 'employee'
    ? S.submissions.filter(s => s.by === ME).sort((a, b) => b.at - a.at).slice(0, 4)
    : toReview().slice(0, 5);
  const team = r === 'admin' ? S.users : S.users.filter(u => u.dept === m.dept);
  const load = team.map(u => ({ u, n: S.tasks.filter(t => t.assignees.includes(u.id) && t.status !== 'done').length, o: S.tasks.filter(t => t.assignees.includes(u.id) && t.status === 'overdue').length })).sort((a, b) => b.n - a.n);
  const maxL = Math.max(4, ...load.map(x => x.n));
  const online = S.users.filter(u => !['offline'].includes(shownStatus(u)));
  const rooms = ROOMS.map(rm => ({ rm, ppl: S.users.filter(u => u.room === rm.id) })).filter(x => x.ppl.length);
  return phead(`${greet}, ${esc(first(ME))}`, `${fDate(now())} · ${scopeLabel} · ${esc(cap(r))} view`,
    `${can('task.create') ? `<button class="btn primary" data-a="newTask">${ic('plus')}New task</button>` : ''}
     <button class="btn" data-a="newMeeting">${ic('video')}Schedule meeting</button>
     <button class="btn" data-a="submitWork">${ic('submit')}Submit work</button>
     <button class="btn" data-a="focusMenu">${ic('target')}Start focus</button>`)
  + `<div class="grid g5">${kp.map(([s, l, v, cl]) => `<button class="kpi ${cl}" data-a="kpi" data-v="${s}"><span class="l">${l}</span><span class="v">${v}</span></button>`).join('')}</div>`
  + `<div class="grid g3">
    ${card('Upcoming deadlines', upcoming.length ? `<div class="list">${upcoming.map(t => `<div class="li click" data-a="openTask" data-id="${t.id}"><span class="mono faint">${t.id}</span><div class="grow"><div class="ell" style="font-weight:600">${esc(t.title)}</div><div class="muted" style="font-size:12px">${t.assignees.map(first).join(', ')}</div></div><span class="pill ${t.status === 'overdue' ? 'red' : dayDiff(t.due) <= 1 ? 'orange' : ''}">${dueTxt(t.due)}</span></div>`).join('')}</div>` : empty('Nothing due this week', 'New deadlines show up here.'), { flush: true, act: `<a class="btn ghost sm" href="#tasks">All tasks</a>` })}
    ${card('Upcoming meetings', meets.length ? `<div class="list">${meets.map(x => { const live = now() >= x.start; return `<div class="li click" data-a="openMeeting" data-id="${x.id}"><div style="width:52px" class="num"><b>${fTime(x.start)}</b><div class="muted" style="font-size:12px">${dayDiff(x.start) === 0 ? 'Today' : fDay(x.start)}</div></div><div class="grow"><div class="ell" style="font-weight:600">${esc(x.title)}</div>${avs(x.attendees.map(a => a.id))}</div>${live ? '<span class="pill green">Live</span>' : `<span class="muted" style="font-size:12px">${rel(x.start)}</span>`}</div>`; }).join('')}</div>` : empty('No meetings coming up', '', `<button class="btn sm" data-a="newMeeting">Schedule one</button>`), { flush: true, act: `<a class="btn ghost sm" href="#meetings">All</a>` })}
    ${card(r === 'employee' ? 'My submissions' : 'Pending approvals', appr.length ? `<div class="list">${appr.map(s => { const t = task(s.task); return `<div class="li click" data-a="openSub" data-id="${s.id}">${av(s.by, 'sm', false)}<div class="grow"><div class="ell" style="font-weight:600">${esc(t?.title)}</div><div class="muted" style="font-size:12px">${s.task} · v${s.version} · ${rel(s.at)}</div></div>${subPill(s.status)}</div>`; }).join('')}</div>` : empty(r === 'employee' ? 'No submissions yet' : 'Nothing waiting for you', r === 'employee' ? 'Submit work from any task.' : 'New submissions appear here.'), { flush: true, act: `<a class="btn ghost sm" href="#submissions">Open</a>` })}
    ${card('Team workload', `<div style="display:flex;flex-direction:column;gap:9px">${load.slice(0, 7).map(x => `<div class="row" style="flex-wrap:nowrap">${av(x.u.id, 'sm')}<span class="ell" style="width:110px">${esc(x.u.name.split(' ')[0])}</span><div class="bar ${x.n >= 4 ? 'warn' : ''}"><i style="width:${pct(x.n, maxL)}%"></i></div><span class="num" style="width:56px;text-align:right;font-size:12px">${x.n} open${x.o ? ` <b style="color:var(--bad)">${x.o}!</b>` : ''}</span></div>`).join('')}</div>`, { act: `<a class="btn ghost sm" href="#employees" data-a="tab" data-k="emp" data-v="workload">Details</a>` })}
    ${card('Project progress', `<div style="display:flex;flex-direction:column;gap:12px">${S.projects.map(p => { const pr = projProgress(p); const nm = p.milestones.filter(x => x.date > now()).sort((a, b) => a.date - b.date)[0]; return `<div class="click" data-a="openProject" data-id="${p.id}" style="cursor:pointer"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b class="ell">${esc(p.name)}</b><span class="num muted">${pr}%</span></div><div class="bar" style="margin:5px 0"><i style="width:${pr}%;background:${p.color}"></i></div><div class="muted" style="font-size:12px">${nm ? `Next: ${esc(nm.name)} · ${fDay(nm.date)}` : 'All milestones reached'}</div></div>`; }).join('')}</div>`)}
    ${card(`Online now <span class="muted num">· ${online.length}</span>`, `<div class="chips" style="margin-bottom:12px">${online.slice(0, 12).map(u => `<span title="${esc(u.name)}" data-a="openUser" data-id="${u.id}" style="cursor:pointer">${av(u.id)}</span>`).join('')}</div>
      <div class="tag" style="margin-bottom:6px">Active rooms</div>${rooms.length ? rooms.map(({ rm, ppl }) => `<div class="row" style="justify-content:space-between;padding:4px 0;flex-wrap:nowrap"><span class="row" style="flex-wrap:nowrap">${ic(rm.icon, 'muted')}<span style="width:6px"></span>${rm.name}</span><span class="row" style="flex-wrap:nowrap">${avs(ppl.map(u => u.id), 'sm', 3)}<button class="btn sm" data-a="joinRoom" data-id="${rm.id}">${m.room === rm.id ? 'Joined' : 'Join'}</button></span></div>`).join('') : '<span class="muted">No one in a room.</span>'}`, { act: `<a class="btn ghost sm" href="#office">Office</a>` })}
    ${card('Recent activity', `<div class="list feed">${S.activity.slice(0, 7).map(a => `<div class="li ${a.link ? 'click' : ''}" ${a.link ? `data-a="link" data-l='${esc(JSON.stringify(a.link))}'` : ''}>${a.who === 'system' ? `<span class="av sm" style="background:var(--slate)">${ic('gear')}</span>` : av(a.who, 'sm', false)}<div class="grow"><b>${a.who === 'system' ? 'Northdesk' : esc(uname(a.who))}</b> ${esc(a.text)}<div class="muted" style="font-size:12px">${rel(a.at)}</div></div></div>`).join('')}</div>`, { flush: true, cls: 'span2' })}
    ${card('Notifications', (() => { const ns = myNotifs().filter(n => !n.held).slice(0, 5); return ns.length ? `<div class="list">${ns.map(notifRow).join('')}</div>` : empty('You are all caught up'); })(), { flush: true, act: `<button class="btn ghost sm" data-a="openNotifs">View all</button>` })}
  </div>`;
};
function notifRow(n) {
  const tone = { overdue: 'red', stale: 'orange', reminder: 'orange', review: 'violet', result: 'green', call: 'red', meeting: 'blue' }[n.type] || '';
  return `<div class="li click" data-a="notif" data-id="${n.id}" style="${n.read ? '' : 'background:var(--primary-soft)'}"><span class="pill ${tone}" style="padding:4px">${ic({ overdue: 'alert', stale: 'clock', reminder: 'alarm', review: 'submit', result: 'check', call: 'phone', meeting: 'video', chat: 'chat', announce: 'megaphone', assigned: 'tasks', leave: 'calendar', request: 'inbox' }[n.type] || 'bell')}</span><div class="grow"><div style="font-weight:${n.read ? 500 : 700}">${esc(n.title)}</div>${n.body ? `<div class="muted ell" style="font-size:12.5px">${esc(n.body)}</div>` : ''}<div class="faint" style="font-size:11.5px">${rel(n.at)}${n.held ? ' · held during quiet time' : ''}${n.muted ? ' · muted by your settings' : ''}</div></div></div>`;
}
const subPill = s => `<span class="pill ${{ pending: 'violet', approved: 'green', revision: 'orange', superseded: '' }[s]}">${{ pending: 'Pending', approved: 'Approved', revision: 'Revision', superseded: 'Superseded' }[s]}</span>`;
function toReview() { return S.submissions.filter(s => s.status === 'pending' && canReview(task(s.task))).sort((a, b) => a.at - b.at); }

/* ---------- Online Office ---------- */
VIEWS.office = () => {
  const m = me();
  const live = CAP.room ? `<section class="card"><div class="bd row" style="justify-content:space-between"><span class="row"><span class="live">Live</span><b>${CAP.peers.length} ${CAP.peers.length === 1 ? 'person has' : 'people have'} this workspace open right now</b></span><span class="row">${CAP.peers.slice(0, 10).map(p => { const pr = p.by && CAP.profiles[p.by]; return `<span class="row" style="gap:6px" title="${esc((pr && pr.name) || 'Viewer')}${p.isMe ? ' (you)' : ''}">${pr && pr.avatarUrl ? `<img src="${esc(pr.avatarUrl)}" alt="" style="width:26px;height:26px;border-radius:50%">` : `<span class="av sm" style="background:var(--slate)">?</span>`}<span style="font-size:12.5px">${esc((pr && pr.name) || 'Viewer')}${p.isMe ? ' (you)' : ''}${p.presence && p.presence.status ? ' · ' + esc((PRES[p.presence.status] || {}).l || '') : ''}</span></span>`; }).join('')}</span></div></section>` : '';
  const groups = { all: 'Everyone', available: 'Available', busy: 'Busy & focused', away: 'Away & offline' };
  const filt = UI.presTab;
  const people = S.users.filter(u => { const s = shownStatus(u); return filt === 'all' || (filt === 'available' && s === 'online') || (filt === 'busy' && ['busy', 'dnd', 'focus', 'meeting'].includes(s)) || (filt === 'away' && ['away', 'offline'].includes(s)); });
  return phead('Online Office', 'See who is around, drop into a room, and keep your own availability honest.',
    `<button class="statusbtn" data-a="statusMenu">${pdot(m.status)}${PRES[m.status].l}</button>${m.room ? `<button class="btn" data-a="leaveRoom">${ic('logout')}Leave ${esc(ROOMS.find(r => r.id === m.room)?.name)}</button>` : ''}`)
  + live
  + `<div class="grid g4">${ROOMS.map(r => { const ppl = S.users.filter(u => u.room === r.id); const mine = m.room === r.id; return `<section class="card room ${mine ? 'mine' : ''}"><div class="rh"><span class="ricon">${ic(r.icon)}</span><div style="flex:1;min-width:0"><b>${r.name}</b><div class="muted ell" style="font-size:12.5px">${r.desc}</div></div></div>
      <div class="row" style="min-height:30px">${ppl.length ? ppl.slice(0, 6).map(u => `<span data-a="openUser" data-id="${u.id}" style="cursor:pointer">${av(u.id)}</span>`).join('') + (ppl.length > 6 ? `<span class="muted">+${ppl.length - 6}</span>` : '') : '<span class="faint">Empty</span>'}</div>
      <div class="row" style="justify-content:space-between"><span class="muted num" style="font-size:12.5px">${ppl.length} here</span>${mine ? `<button class="btn sm" data-a="leaveRoom">Leave</button>` : `<button class="btn sm primary" data-a="joinRoom" data-id="${r.id}">${r.locked && role() === 'employee' ? ic('lock') + 'Knock' : 'Join'}</button>`}</div></section>`; }).join('')}
    <section class="card room"><div class="rh"><span class="ricon" style="background:var(--violet-soft);color:var(--violet)">${ic('moon')}</span><div><b>Quick availability</b><div class="muted" style="font-size:12.5px">Auto status is on</div></div></div>
      <div class="row"><button class="btn sm" data-a="dnd" data-v="60">DND 1h</button><button class="btn sm" data-a="focus" data-v="25">Focus 25m</button><a class="btn sm ghost" href="#availability">More</a></div></section></div>`
  + `<section class="card"><div class="hd"><h2>People</h2>${seg('presTab', filt, Object.entries(groups))}<span class="sim" title="Teammates' status changes come from a demo generator">Simulated teammates</span></div><div class="bd flush tbl-wrap"><table><thead><tr><th>Name</th><th class="hide-sm">Department</th><th>Status</th><th class="hide-sm">Room</th><th></th></tr></thead><tbody>
    ${people.map(u => `<tr><td><span class="row" style="flex-wrap:nowrap;cursor:pointer" data-a="openUser" data-id="${u.id}">${av(u.id)}<span><b>${esc(u.name)}</b>${u.id === ME ? ' <span class="muted">(you)</span>' : ''}<div class="muted" style="font-size:12px">${esc(u.title)}</div></span></span></td><td class="hide-sm">${esc(dept(u.dept)?.name)}</td><td>${presPill(u)}${u.focus && shownStatus(u) === 'focus' ? '' : ''}</td><td class="hide-sm">${u.room ? esc(ROOMS.find(r => r.id === u.room)?.name) : '<span class="faint">—</span>'}</td>
      <td style="text-align:right;white-space:nowrap">${u.id !== ME ? `<button class="btn sm ghost" data-a="dm" data-id="${u.id}" aria-label="Message ${esc(u.name)}">${ic('chat')}</button><button class="btn sm ghost" data-a="call" data-id="${u.id}" aria-label="Call ${esc(u.name)}">${ic('phone')}</button>` : ''}</td></tr>`).join('')}
  </tbody></table></div></section>`;
};

/* ---------- Tasks ---------- */
function taskFilters(list) {
  const f = UI.tf;
  return list.filter(t => (!f.status || t.status === f.status) && (!f.priority || t.priority === f.priority) && (!f.project || t.project === f.project) && (!f.q || (t.id + ' ' + t.title).toLowerCase().includes(f.q.toLowerCase())));
}
VIEWS.tasks = () => {
  const scope = UI.taskScope || (role() === 'employee' ? 'mine' : 'team');
  const opts = [['mine', 'Assigned to me'], ['review', 'I review'], ['team', 'My team']].concat(role() !== 'employee' ? [['all', 'All']] : []);
  const list = taskFilters(scopeTasks(scope));
  const f = UI.tf;
  return phead('My Tasks', `${list.length} tasks · statuses update automatically from deadlines, submissions and reviews`,
    `${seg('taskView', UI.taskView, [['list', 'List'], ['kanban', 'Kanban'], ['timeline', 'Timeline']])}${can('task.create') ? `<button class="btn primary" data-a="newTask">${ic('plus')}New task</button>` : ''}`)
  + `<div class="row">${seg('taskScope', scope, opts)}
     <select class="in" style="width:auto" data-c="tf" data-k="status" data-live aria-label="Status"><option value="">All statuses</option>${STAT_ORDER.map(s => `<option value="${s}" ${f.status === s ? 'selected' : ''}>${STAT[s].l}</option>`).join('')}</select>
     <select class="in" style="width:auto" data-c="tf" data-k="priority" data-live aria-label="Priority"><option value="">All priorities</option>${Object.keys(PRI).map(p => `<option value="${p}" ${f.priority === p ? 'selected' : ''}>${PRI[p].l}</option>`).join('')}</select>
     <select class="in" style="width:auto" data-c="tf" data-k="project" data-live aria-label="Project"><option value="">All projects</option>${S.projects.map(p => `<option value="${p.id}" ${f.project === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>
     <input id="tfq" class="in" style="width:200px" type="search" placeholder="Filter by title or ID" data-i="tfq" value="${esc(f.q || '')}">
     ${f.status || f.priority || f.project || f.q ? `<button class="btn ghost sm" data-a="clearTf">Clear filters</button>` : ''}</div>`
  + taskViewHTML(list, UI.taskView);
};
function taskViewHTML(list, view) {
  if (view === 'kanban') return kanbanHTML(list);
  if (view === 'timeline') return timelineHTML(list);
  if (!list.length) return `<section class="card">${empty('No tasks match', 'Try another filter or create a task.', can('task.create') ? `<button class="btn sm primary" data-a="newTask">New task</button>` : '')}</section>`;
  return `<section class="card"><div class="bd flush tbl-wrap"><table><thead><tr><th>ID</th><th>Task</th><th class="hide-sm">Project</th><th>Assignees</th><th>Priority</th><th>Status</th><th>Due</th><th class="hide-sm">Progress</th></tr></thead><tbody>
  ${list.sort((a, b) => (a.status === 'done') - (b.status === 'done') || a.due - b.due).map(t => `<tr class="click" data-a="openTask" data-id="${t.id}"><td class="mono faint">${t.id}</td><td style="min-width:200px"><b>${esc(t.title)}</b>${isBlocked(t) ? ' <span class="pill orange">Blocked</span>' : ''}${t.escalated && t.status === 'overdue' ? ' <span class="pill red">Escalated</span>' : ''}</td><td class="hide-sm muted">${esc(proj(t.project)?.name || '—')}</td><td>${avs(t.assignees)}</td><td>${ppill(t.priority)}</td><td>${spill(t.status)}</td><td class="num" style="white-space:nowrap;${t.status === 'overdue' ? 'color:var(--bad);font-weight:600' : ''}">${fDay(t.due)}<div class="muted" style="font-size:11.5px">${t.status === 'done' ? 'done' : dueTxt(t.due)}</div></td><td class="hide-sm" style="min-width:110px"><div class="row" style="flex-wrap:nowrap"><div class="bar ${t.status === 'done' ? 'ok' : ''}"><i style="width:${t.status === 'done' ? 100 : t.progress}%"></i></div><span class="num muted" style="font-size:12px">${t.status === 'done' ? 100 : t.progress}%</span></div></td></tr>`).join('')}
  </tbody></table></div></section>`;
}
function kanbanHTML(list) {
  return `<div class="kb" aria-label="Kanban board. Drag cards between columns or open a card to change status.">${STAT_ORDER.map(s => { const items = list.filter(t => t.status === s).sort((a, b) => a.due - b.due); return `<div class="kcol" data-drop="${s}"><div class="kh"><span class="dot" style="background:${{ todo: 'var(--slate)', progress: 'var(--primary)', review: 'var(--violet)', revision: 'var(--warn)', done: 'var(--ok)', overdue: 'var(--bad)' }[s]}"></span>${STAT[s].l}<span class="muted num" style="margin-left:auto">${items.length}</span></div><div class="kb-list">
    ${items.map(t => `<article class="tcard" draggable="true" data-drag="${t.id}" data-a="openTask" data-id="${t.id}" tabindex="0"><div class="row" style="justify-content:space-between"><span class="mono faint">${t.id}</span>${ppill(t.priority)}</div><div class="ttl">${esc(t.title)}</div>${t.status !== 'done' && t.progress ? `<div class="bar"><i style="width:${t.progress}%"></i></div>` : ''}<div class="row" style="justify-content:space-between">${avs(t.assignees)}<span class="muted num" style="font-size:12px;${t.status === 'overdue' ? 'color:var(--bad)' : ''}">${ic('clock', '').replace('<svg ', '<svg width="12" height="12" ')} ${fDay(t.due)}</span></div>${isBlocked(t) ? '<span class="pill orange">Blocked by ' + t.deps.filter(d => task(d)?.status !== 'done').join(', ') + '</span>' : ''}</article>`).join('') || '<div class="faint" style="padding:8px;font-size:12.5px">Drop tasks here</div>'}
  </div></div>`; }).join('')}</div>`;
}
function timelineHTML(list) {
  const start = sod(now()) - 7 * DAY, days = 35, end = start + days * DAY;
  const x = t => Math.max(0, Math.min(100, (t - start) / (end - start) * 100));
  const weeks = []; for (let i = 0; i < days; i += 7) weeks.push(start + i * DAY);
  if (!list.length) return `<section class="card">${empty('No tasks to plot')}</section>`;
  return `<section class="card"><div class="bd flush tbl-wrap"><div class="tl"><div class="tlr" style="min-height:30px;background:var(--surface-2)"><div class="nm tag">Task</div><div class="lane" style="height:30px">${weeks.map(w => `<span class="tag" style="position:absolute;left:${x(w)}%;top:8px;padding-left:6px;border-left:1px solid var(--line)">${fDay(w)}</span>`).join('')}</div></div>
  ${list.sort((a, b) => a.due - b.due).map(t => { const s = Math.max(start, t.created), e = Math.max(s + DAY / 2, t.due); const col = { done: 'var(--ok)', overdue: 'var(--bad)', review: 'var(--violet)', revision: 'var(--warn)', todo: 'var(--slate)' }[t.status] || 'var(--primary)'; return `<div class="tlr"><div class="nm"><div class="ell"><span class="mono faint">${t.id}</span> ${esc(t.title)}</div></div><div class="lane"><span class="today" style="left:${x(now())}%"></span>${e > start ? `<span class="tb" data-a="openTask" data-id="${t.id}" style="left:${x(s)}%;width:${Math.max(2, x(e) - x(s))}%;background:${col}" title="${esc(t.title)} · ${fDay(s)} → ${fDay(t.due)}">${t.assignees.map(first).join(', ')}</span>` : ''}</div></div>`; }).join('')}
  ${S.projects.flatMap(p => p.milestones.map(m => ({ p, m }))).filter(({ m }) => m.date > start && m.date < end).map(({ p, m }) => `<div class="tlr"><div class="nm"><span class="pill violet">Milestone</span> <span class="ell">${esc(m.name)}</span></div><div class="lane"><span style="position:absolute;left:calc(${x(m.date)}% - 7px);top:12px;width:14px;height:14px;background:${p.color};transform:rotate(45deg);border-radius:2px" title="${esc(p.name)}: ${esc(m.name)} · ${fDay(m.date)}"></span></div></div>`).join('')}
  </div></div></section>`;
}

/* ---------- Projects ---------- */
VIEWS.projects = () => {
  const sel = UI.proj && proj(UI.proj);
  const cards = `<div class="grid g4">${S.projects.map(p => { const ts = S.tasks.filter(t => t.project === p.id), pr = projProgress(p), od = ts.filter(t => t.status === 'overdue').length; const members = uniq(ts.flatMap(t => t.assignees)); return `<button class="card kpi" style="gap:10px;${sel && sel.id === p.id ? 'border-color:var(--primary)' : ''}" data-a="openProject" data-id="${p.id}"><span class="row" style="justify-content:space-between;width:100%"><span class="row"><span class="sw" style="background:${p.color}"></span><b style="font-size:15px">${esc(p.name)}</b></span><span class="num muted">${pr}%</span></span><div class="bar" style="width:100%"><i style="width:${pr}%;background:${p.color}"></i></div><span class="muted" style="font-size:12.5px">${ts.filter(t => t.status !== 'done').length} open · ${ts.filter(t => t.status === 'done').length} done${od ? ` · <b style="color:var(--bad)">${od} overdue</b>` : ''}</span><span class="row" style="justify-content:space-between;width:100%">${avs(members, 'sm', 5)}<span class="muted" style="font-size:12px">Ends ${fDay(p.end)}</span></span></button>`; }).join('')}</div>`;
  let detail = '';
  if (sel) {
    const ts = S.tasks.filter(t => t.project === sel.id);
    detail = `<section class="card"><div class="hd"><span class="sw" style="background:${sel.color}"></span><h2>${esc(sel.name)}</h2>${seg('projView', UI.projView, [['kanban', 'Kanban'], ['list', 'List'], ['timeline', 'Timeline']])}${can('task.create') ? `<button class="btn primary sm" data-a="newTask" data-project="${sel.id}">${ic('plus')}Task</button>` : ''}</div>
      <div class="bd"><p style="margin:0 0 10px;max-width:70ch">${esc(sel.desc)}</p><div class="row">${sel.milestones.map(m => `<span class="pill ${m.date < now() ? 'green' : 'violet'}">${m.date < now() ? ic('check').replace('<svg ', '<svg width="12" height="12" ') : '◆'} ${esc(m.name)} · ${fDay(m.date)}</span>`).join('')}<span class="muted">Owner ${esc(uname(sel.owner))} · ${esc(dept(sel.dept)?.name)}</span></div></div></section>` + taskViewHTML(ts, UI.projView);
  }
  return phead('Projects', 'Progress rolls up from tasks automatically.', can('task.assign') ? `<button class="btn" data-a="newProject">${ic('plus')}New project</button>` : '') + cards + (detail || `<p class="muted">Select a project to see its board.</p>`);
};

/* ---------- Calendar ---------- */
function calItems(from, to) {
  const c = UI.cal, m = me(), K = c.kinds, out = [];
  const inScope = ids => c.scope === 'company' || (c.scope === 'my' ? ids.includes(ME) : ids.some(i => user(i)?.dept === m.dept));
  if (K.meeting) S.meetings.forEach(x => { if (x.start >= from && x.start < to && inScope(x.attendees.map(a => a.id))) out.push({ t: x.start, end: x.start + x.dur * MIN, title: x.title, kind: 'meeting', a: 'openMeeting', id: x.id }); });
  if (K.task) S.tasks.forEach(t => { if (t.due >= from && t.due < to && t.status !== 'done' && inScope(t.assignees)) out.push({ t: t.due, title: `${t.id} due · ${t.title}`, kind: 'task', a: 'openTask', id: t.id }); });
  if (K.milestone) S.projects.forEach(p => p.milestones.forEach(ms => { if (ms.date >= from && ms.date < to && (c.scope !== 'my' || S.tasks.some(t => t.project === p.id && t.assignees.includes(ME)))) out.push({ t: ms.date, title: `◆ ${p.name}: ${ms.name}`, kind: 'milestone', a: 'openProject', id: p.id, allDay: true }); }));
  if (K.company) S.events.forEach(e => { for (let i = 0; i < (e.days || 1); i++) { const d = e.date + i * DAY; if (d >= from && d < to) out.push({ t: d, title: e.title, kind: 'company', allDay: true }); } });
  if (K.personal) S.schedules.forEach(b => { if (b.start >= from && b.start < to && inScope([b.user])) out.push({ t: b.start, end: b.end, title: (b.user === ME ? '' : first(b.user) + ': ') + b.title, kind: 'personal', a: 'delBlock', id: b.id }); });
  if (K.leave) S.leaves.filter(l => l.status === 'approved').forEach(l => { for (let d = sod(l.from); d <= sod(l.to); d += DAY) if (d >= from && d < to && inScope([l.user])) out.push({ t: d, title: `${first(l.user)} · ${l.type} leave`, kind: 'leave', allDay: true }); });
  return out.sort((a, b) => (b.allDay ? 1 : 0) - (a.allDay ? 1 : 0) || a.t - b.t);
}
const evHTML = e => `<div class="ev ${e.kind}" ${e.a ? `data-a="${e.a}" data-id="${e.id}"` : ''} title="${esc(e.title)}${e.allDay ? '' : ' · ' + fTime(e.t) + (e.end ? '–' + fTime(e.end) : '')}">${e.allDay ? '' : `<span class="num">${fTime(e.t)}</span> `}${esc(e.title)}</div>`;
VIEWS.calendar = () => {
  const c = UI.cal, d = new Date(c.date); let body = '', label = '';
  if (c.view === 'month') {
    const f = new Date(d.getFullYear(), d.getMonth(), 1); const startDay = new Date(f); startDay.setDate(1 - ((f.getDay() + 6) % 7));
    label = MON[d.getMonth()] + ' ' + d.getFullYear();
    const s0 = +startDay, items = calItems(s0, s0 + 42 * DAY);
    body = `<div class="tbl-wrap"><div class="cal-m" style="min-width:640px">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(x => `<div class="dh">${x}</div>`).join('')}${Array.from({ length: 42 }, (_, i) => { const day = new Date(startDay); day.setDate(startDay.getDate() + i); const ds = +day; const its = items.filter(e => sod(e.t) === ds); return `<div class="dc ${day.getMonth() !== d.getMonth() ? 'out' : ''} ${ds === sod(now()) ? 'today' : ''}"><span class="dn" data-a="calDay" data-v="${ds}" style="cursor:pointer">${day.getDate()}</span>${its.slice(0, 3).map(evHTML).join('')}${its.length > 3 ? `<span class="faint" style="font-size:11px;cursor:pointer" data-a="calDay" data-v="${ds}">+${its.length - 3} more</span>` : ''}</div>`; }).join('')}</div></div>`;
  } else if (c.view === 'week') {
    const s = new Date(sod(+d)); s.setDate(s.getDate() - ((s.getDay() + 6) % 7)); const s0 = +s; const items = calItems(s0, s0 + 7 * DAY);
    label = `${fDay(s0)} – ${fDay(s0 + 6 * DAY)}`;
    body = `<div class="cal-w">${Array.from({ length: 7 }, (_, i) => { const ds = s0 + i * DAY; const its = items.filter(e => sod(e.t) === sod(ds)); return `<div class="wc ${sod(ds) === sod(now()) ? 'today' : ''}"><b data-a="calDay" data-v="${sod(ds)}" style="cursor:pointer">${fDate(ds)}</b>${its.map(evHTML).join('') || '<span class="faint" style="font-size:12px">Free</span>'}</div>`; }).join('')}</div>`;
  } else {
    const s0 = sod(+d), items = calItems(s0, s0 + DAY); label = fDate(s0) + ' ' + d.getFullYear();
    const allDay = items.filter(e => e.allDay);
    body = `${allDay.length ? `<div class="row" style="margin-bottom:8px">${allDay.map(evHTML).join('')}</div>` : ''}<div class="cal-d">${Array.from({ length: 12 }, (_, i) => i + 8).map(h => `<div class="hr"><span>${pad(h)}:00</span><div>${items.filter(e => !e.allDay && new Date(e.t).getHours() === h).map(evHTML).join('')}</div></div>`).join('')}</div>`;
  }
  const kinds = [['meeting', 'Meetings'], ['task', 'Deadlines'], ['milestone', 'Milestones'], ['company', 'Company'], ['personal', 'Schedules'], ['leave', 'Time off']];
  const g = S.gsync || {};
  return phead('Calendar', 'Meetings, deadlines, milestones, company events, schedules and leave in one place.',
    `<button class="btn" data-a="newBlock">${ic('plus')}Schedule block</button><button class="btn" data-a="exportIcs">${ic('download')}Export .ics</button><button class="btn" data-a="gsync">${ic('calendar')}${g.connected ? 'Google: synced ' + rel(g.last) : 'Connect Google Calendar'}</button>`)
  + `<section class="card"><div class="hd" style="flex-wrap:wrap"><div class="row"><button class="btn sm" data-a="calNav" data-v="-1" aria-label="Previous">‹</button><button class="btn sm" data-a="calNav" data-v="0">Today</button><button class="btn sm" data-a="calNav" data-v="1" aria-label="Next">›</button><h2 style="margin-left:6px">${label}</h2></div><span style="flex:1"></span>${seg('calScope', c.scope, [['my', 'My calendar'], ['team', 'Team'], ['company', 'Company']])}${seg('calView', c.view, [['day', 'Day'], ['week', 'Week'], ['month', 'Month']])}</div>
    <div class="bd"><div class="row" style="margin-bottom:12px">${kinds.map(([k, l]) => `<label class="check" style="font-size:13px"><input type="checkbox" data-c="calKind" data-k="${k}" ${c.kinds[k] ? 'checked' : ''}><span class="ev ${k}" style="border-left-width:3px">${l}</span></label>`).join('')}</div>${body}</div></section>`;
};

/* ---------- Chat ---------- */
function chatList() {
  const m = me();
  return S.chats.filter(c => c.kind === 'channel' || (Array.isArray(c.members) && c.members.includes(ME)));
}
function chatName(c) { if (c.kind === 'channel') return '#' + c.name; if (c.kind === 'group') return c.name; const o = c.members.find(x => x !== ME) || ME; return uname(o); }
function unread(c) { const r = S.reads[ME + ':' + c.id] || 0; return S.messages.filter(x => x.chat === c.id && x.at > r && x.from !== ME).length; }
function fmtMsg(t) {
  let h = esc(t);
  h = h.replace(/\bT-\d{3}\b/g, m => taskChip(m));
  h = h.replace(/(https?:\/\/[^\s<]+)/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
  h = h.replace(/@([A-Z][a-z]+)/g, (m, n) => S.users.some(u => u.name.startsWith(n)) ? `<b style="color:var(--primary)">${m}</b>` : m);
  return h;
}
VIEWS.chat = () => {
  const list = chatList();
  let c = list.find(x => x.id === UI.chat) || list[0]; UI.chat = c.id;
  S.reads[ME + ':' + c.id] = now();
  const msgs = S.messages.filter(x => x.chat === c.id).sort((a, b) => a.at - b.at).slice(-120);
  const other = c.kind === 'dm' ? c.members.find(x => x !== ME) : null;
  const members = c.kind === 'channel' ? S.users.filter(u => c.members === 'all' || u.dept === c.members).map(u => u.id) : c.members;
  const sec = (title, items) => `<div class="tag" style="padding:12px 14px 4px">${title}</div>` + items.map(x => { const n = unread(x); const o = x.kind === 'dm' ? x.members.find(y => y !== ME) : null; return `<div class="li click" data-a="openChat" data-id="${x.id}" style="padding:7px 14px;${x.id === c.id ? 'background:var(--primary-soft)' : ''}">${o ? av(o, 'sm') : `<span class="av sm" style="background:var(--slate-soft);color:var(--muted)">${x.kind === 'channel' ? '#' : ic('users').replace('<svg ', '<svg width="13" height="13" ')}</span>`}<span class="grow ell" style="${n ? 'font-weight:700' : ''}">${esc(chatName(x))}</span>${n ? `<span class="badge">${n}</span>` : ''}</div>`; }).join('');
  return phead('Chat', 'Channels, group chats and direct messages. Type T-123 to link a task.', `<button class="btn primary" data-a="newChat">${ic('plus')}New message</button>`)
  + `<section class="card chat"><div class="cl">${sec('Channels', list.filter(x => x.kind === 'channel'))}${sec('Groups', list.filter(x => x.kind === 'group'))}${sec('Direct messages', list.filter(x => x.kind === 'dm'))}</div>
  <div class="cm"><div class="hd" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--line)">${other ? av(other) : ''}<div style="flex:1;min-width:0"><b>${esc(chatName(c))}</b><div class="muted ell" style="font-size:12.5px">${other ? presPill(user(other)) : esc(c.topic || members.length + ' members')}</div></div>${avs(members, 'sm', 5)}
    ${other ? `<button class="btn sm" data-a="call" data-id="${other}">${ic('phone')}Call</button>` : `<button class="btn sm" data-a="huddle" data-id="${c.id}">${ic('voice')}Huddle</button>`}</div>
    <div class="msgs" aria-live="polite">${msgs.length ? msgs.map((x, i) => { const prev = msgs[i - 1]; const cont = prev && prev.from === x.from && x.at - prev.at < 5 * MIN; return `<div class="msg" style="${cont ? 'margin-top:-8px' : ''}">${cont ? '<span style="width:30px;flex:none"></span>' : av(x.from)}<div class="bub">${cont ? '' : `<div class="meta"><b>${esc(uname(x.from))}</b><span class="faint" style="font-size:11.5px">${fTime(x.at)} · ${dayDiff(x.at) === 0 ? 'today' : fDay(x.at)}</span></div>`}<div class="txt">${fmtMsg(x.text)}</div>${(x.files || []).map(f => `<div class="file">${ic('clip').replace('<svg ', '<svg width="14" height="14" ')}${BLOBS[f.id] ? `<a href="${BLOBS[f.id]}" target="_blank" rel="noopener">${esc(f.name)}</a>` : esc(f.name)}<span class="faint">${fSize(f.size)}</span></div>`).join('')}${x.system ? '' : ''}</div><div class="acts"><button class="btn ghost sm" data-a="taskFromMsg" data-id="${x.id}" title="Create a task from this message">${ic('plus')}Task</button></div></div>`; }).join('') : empty('No messages yet', 'Say hello.')}</div>
    <form class="composer" data-form="send"><button type="button" class="btn ghost icon" data-a="attachChat" aria-label="Attach files">${ic('clip')}</button>
      <select class="in" style="width:auto" data-c="insertTask" data-live aria-label="Link a task"><option value="">Link task</option>${S.tasks.filter(t => t.status !== 'done').map(t => `<option value="${t.id}">${t.id} ${esc(t.title.slice(0, 30))}</option>`).join('')}</select>
      <textarea id="msgInput" class="in" rows="1" placeholder="Message ${esc(chatName(c))}" data-i="composer" aria-label="Message"></textarea><button class="btn primary" aria-label="Send">${ic('send')}</button></form>
    ${UI.pending && UI.pending.length ? `<div class="row" style="padding:0 10px 10px">${UI.pending.map(f => `<span class="file">${esc(f.name)} <button type="button" class="btn ghost sm" data-a="unattach" data-id="${f.id}" aria-label="Remove">${ic('x')}</button></span>`).join('')}</div>` : ''}
  </div></section>`;
};

/* ---------- Voice ---------- */
VIEWS.voice = () => {
  const v = S.voice, m = me();
  const room = v.room && ROOMS.find(r => r.id === v.room);
  const roomsList = `<div class="grid g4">${ROOMS.map(r => { const ppl = S.users.filter(u => u.room === r.id); return `<section class="card room ${v.room === r.id ? 'mine' : ''}"><div class="rh"><span class="ricon">${ic(r.icon)}</span><div style="flex:1;min-width:0"><b>${r.name}</b><div class="muted" style="font-size:12.5px">${ppl.length} connected</div></div>${v.room === r.id ? '<span class="live">You</span>' : `<button class="btn sm" data-a="joinRoom" data-id="${r.id}">Join</button>`}</div><div class="list">${ppl.map(u => `<div class="row" style="padding:3px 0;flex-wrap:nowrap">${av(u.id, 'sm')}<span class="ell" style="font-size:13px">${esc(u.name)}</span>${u.id === ME && v.muted ? ic('micoff', 'muted').replace('<svg ', '<svg width="13" height="13" ') : ''}</div>`).join('') || '<span class="faint" style="font-size:12.5px">Nobody here</span>'}</div></section>`; }).join('')}</div>`;
  const stage = room ? (() => {
    const ppl = S.users.filter(u => u.room === room.id);
    return `<section class="card"><div class="hd"><span class="ricon">${ic(room.icon)}</span><h2>${room.name} <span class="muted num" style="font-weight:500">· <span class="timer" data-since="${v.since || now()}"></span></span></h2><span class="sim">Simulated audio</span></div>
    <div class="bd"><div class="vstage">${v.sharing ? `<div class="tile screen"><span class="pill blue">${ic('screen')} You are sharing your screen</span><span class="muted" style="font-size:12.5px">Others see your window here</span></div>` : ''}
    ${ppl.map(u => `<div class="tile" data-speaker="${u.id}">${av(u.id, 'xl', false)}<b style="font-size:13px">${esc(u.name)}${u.id === ME ? ' (you)' : ''}</b><span class="mic">${(u.id === ME && v.muted) ? `<span class="pill red">${ic('micoff').replace('<svg ', '<svg width="12" height="12" ')}</span>` : ''}</span></div>`).join('')}</div></div>
    <div class="ctrls"><button class="btn ${v.muted ? 'redon' : ''}" data-a="vMute" aria-pressed="${v.muted}">${ic(v.muted ? 'micoff' : 'mic')}${v.muted ? 'Unmute' : 'Mute'}</button>
      <button class="btn ${v.deafened ? 'redon' : ''}" data-a="vDeaf" aria-pressed="${v.deafened}">${ic(v.deafened ? 'headoff' : 'voice')}${v.deafened ? 'Undeafen' : 'Deafen'}</button>
      <button class="btn ${v.sharing ? 'on' : ''}" data-a="vShare" aria-pressed="${v.sharing}">${ic('screen')}${v.sharing ? 'Stop sharing' : 'Share screen'}</button>
      <button class="btn" data-a="attachChat" data-room="1">${ic('clip')}Share file</button>
      <button class="btn redon" data-a="leaveRoom">${ic('logout')}Leave</button></div></section>`;
  })() : '';
  const callable = S.users.filter(u => u.id !== ME).sort((a, b) => (shownStatus(a) === 'online' ? 0 : 1) - (shownStatus(b) === 'online' ? 0 : 1));
  return phead('Voice Rooms', 'Drop-in rooms like a shared office. Audio is simulated in this demo: there is no microphone access here.', `<button class="btn" data-a="testCall">${ic('phone')}Simulate incoming call</button>`)
  + stage + roomsList
  + card('Call a colleague', `<div class="list">${callable.map(u => `<div class="li">${av(u.id)}<div class="grow"><b>${esc(u.name)}</b><div>${presPill(u)}</div></div><button class="btn sm" data-a="dm" data-id="${u.id}">${ic('chat')}</button><button class="btn sm" data-a="call" data-id="${u.id}">${ic('phone')}Call</button></div>`).join('')}</div>`, { flush: true });
};

/* ---------- Meetings ---------- */
VIEWS.meetings = () => {
  const mine = S.meetings.filter(x => role() === 'admin' || x.attendees.some(a => a.id === ME));
  const t0 = now();
  const live = mine.filter(x => t0 >= x.start && t0 < x.start + x.dur * MIN);
  const up = mine.filter(x => x.start > t0).sort((a, b) => a.start - b.start);
  const past = mine.filter(x => x.start + x.dur * MIN <= t0).sort((a, b) => b.start - a.start);
  const row = x => { const my = x.attendees.find(a => a.id === ME); return `<div class="li click" data-a="openMeeting" data-id="${x.id}"><div style="width:82px" class="num"><b>${fTime(x.start)}</b><div class="muted" style="font-size:12px">${dayDiff(x.start) === 0 ? 'Today' : fDay(x.start)} · ${x.dur}m</div></div><div class="grow"><div class="ell" style="font-weight:600">${esc(x.title)}</div><div class="row" style="gap:6px">${avs(x.attendees.map(a => a.id), 'sm', 6)}<span class="muted" style="font-size:12px">${x.attendees.filter(a => a.rsvp === 'yes').length}/${x.attendees.length} going</span>${x.actions.length ? `<span class="pill">${x.actions.length} action items</span>` : ''}</div></div>${my ? `<span class="pill ${{ yes: 'green', no: 'red', maybe: 'orange', pending: '' }[my.rsvp]}">${{ yes: 'Going', no: 'Declined', maybe: 'Maybe', pending: 'RSVP' }[my.rsvp]}</span>` : ''}${t0 >= x.start - 10 * MIN && t0 < x.start + x.dur * MIN ? `<button class="btn sm primary" data-a="joinMeeting" data-id="${x.id}">Join</button>` : ''}</div>`; };
  return phead('Meetings', 'Schedule, RSVP, take notes and turn decisions into tasks.', can('meeting.schedule') ? `<button class="btn primary" data-a="newMeeting">${ic('plus')}Schedule meeting</button>` : '')
  + (live.length ? card('Happening now', `<div class="list">${live.map(row).join('')}</div>`, { flush: true }) : '')
  + card('Upcoming', up.length ? `<div class="list">${up.map(row).join('')}</div>` : empty('No upcoming meetings'), { flush: true })
  + card('Past meetings', past.length ? `<div class="list">${past.map(row).join('')}</div>` : empty('No past meetings'), { flush: true });
};

/* ---------- Submissions ---------- */
VIEWS.submissions = () => {
  const tr = toReview();
  const def = can('review') || tr.length ? 'review' : 'mine';
  const [tb, cur] = tabs('subs', [['review', `To review (${tr.length})`], ['mine', 'My submissions'], ['all', 'All']], def);
  const list = cur === 'review' ? tr : cur === 'mine' ? S.submissions.filter(s => s.by === ME) : S.submissions.filter(s => role() !== 'employee' || s.by === ME || task(s.task)?.assignees.includes(ME));
  return phead('Submissions', 'Upload → review → approve or request changes → resubmit. Approval completes the task.', `<button class="btn primary" data-a="submitWork">${ic('submit')}Submit work</button>`)
  + `<section class="card">${tb}<div class="bd flush tbl-wrap">${list.length ? `<table><thead><tr><th>ID</th><th>Task</th><th>Version</th><th>Submitted by</th><th>When</th><th>Status</th></tr></thead><tbody>${list.slice().sort((a, b) => b.at - a.at).map(s => { const t = task(s.task); return `<tr class="click" data-a="openSub" data-id="${s.id}"><td class="mono faint">${s.id}</td><td><b>${esc(t?.title)}</b><div class="mono faint">${s.task}</div></td><td class="num">v${s.version}</td><td><span class="row" style="flex-wrap:nowrap">${av(s.by, 'sm', false)}${esc(uname(s.by))}</span></td><td class="num" style="white-space:nowrap">${fDT(s.at)}</td><td>${subPill(s.status)}</td></tr>`; }).join('')}</tbody></table>` : empty(cur === 'review' ? 'Nothing waiting for your review' : 'No submissions yet', cur === 'mine' ? 'Submit work from a task when it is ready.' : '')}</div></section>`;
};

/* ---------- Follow-ups ---------- */
function followItems() {
  const t0 = now(), f = S.followup, out = [];
  const pool = role() === 'employee' ? S.tasks.filter(t => t.assignees.includes(ME) || t.reviewers.includes(ME)) : role() === 'manager' ? scopeTasks('team') : S.tasks;
  pool.forEach(t => {
    if (t.status === 'done') return;
    if (t.status === 'overdue') out.push({ t, kind: t.escalated ? 'Escalated' : 'Overdue', tone: 'red', days: Math.floor((t0 - t.due) / DAY), sort: 0 });
    else if (t.status !== 'review' && dayDiff(t.due) <= 3) out.push({ t, kind: 'Due soon', tone: 'orange', days: dayDiff(t.due), sort: 2 });
    if (['progress', 'overdue', 'revision'].includes(t.status) && t0 - t.lastUpdate > f.staleDays * DAY) out.push({ t, kind: 'No updates', tone: 'orange', days: Math.floor((t0 - t.lastUpdate) / DAY), sort: 1 });
    if (t.status === 'review') { const s = S.submissions.find(x => x.task === t.id && x.status === 'pending'); if (s && t0 - s.at > DAY) out.push({ t, kind: 'Review waiting', tone: 'violet', days: Math.floor((t0 - s.at) / DAY), sort: 3 }); }
  });
  return out.sort((a, b) => a.sort - b.sort || b.days - a.days);
}
VIEWS.followups = () => {
  const items = followItems(), f = S.followup;
  const cnt = k => items.filter(i => i.kind === k).length;
  return phead('Follow-ups', 'Northdesk checks deadlines every few seconds and nudges the right people. Notifications respect Do Not Disturb.', `<button class="btn" data-a="runFollow">${ic('alarm')}Run check now</button>`)
  + `<div class="grid g4">${[['Overdue', 'red'], ['Escalated', 'red'], ['No updates', 'orange'], ['Due soon', 'orange']].map(([k, c]) => `<div class="kpi ${c}" style="cursor:default"><span class="l">${k}</span><span class="v">${cnt(k)}</span></div>`).join('')}</div>`
  + `<div class="grid g3"><section class="card span2"><div class="hd"><h2>Needs attention</h2></div><div class="bd flush tbl-wrap">${items.length ? `<table><thead><tr><th>Reason</th><th>Task</th><th>Assignee</th><th>Due</th><th></th></tr></thead><tbody>${items.map(i => `<tr><td><span class="pill ${i.tone}">${i.kind}</span><div class="muted" style="font-size:12px">${i.kind === 'Due soon' ? dueTxt(i.t.due) : i.kind === 'No updates' ? i.days + ' days without progress' : i.kind === 'Review waiting' ? 'waiting ' + i.days + 'd' : i.days + ' days late'}</div></td><td class="click" data-a="openTask" data-id="${i.t.id}" style="cursor:pointer"><span class="mono faint">${i.t.id}</span> <b>${esc(i.t.title)}</b></td><td>${avs(i.t.assignees)}</td><td class="num">${fDay(i.t.due)}</td><td style="white-space:nowrap;text-align:right"><button class="btn sm" data-a="nudge" data-id="${i.t.id}">Nudge</button>${can('followup.escalate') && !i.t.escalated && i.t.status === 'overdue' ? ` <button class="btn sm danger" data-a="escalate" data-id="${i.t.id}">Escalate</button>` : ''}</td></tr>`).join('')}</tbody></table>` : empty('Everything is on track', 'Nothing is overdue, stale or due in the next 3 days.')}</div></section>
  <section class="card"><div class="hd"><h2>Reminder rules</h2></div><div class="bd form">
    <div class="sec"><span class="tag">Deadline reminders</span>${[['d3', '3 days before'], ['d1', '1 day before'], ['d0', 'On the due date']].map(([k, l]) => `<label class="check"><input type="checkbox" data-c="fu" data-k="${k}" ${f[k] ? 'checked' : ''} ${can('workspace.manage') || role() === 'manager' ? '' : 'disabled'}>${l}</label>`).join('')}</div>
    <label class="f">Flag tasks with no progress after<select class="in" data-c="fu" data-k="staleDays" data-live ${role() === 'employee' ? 'disabled' : ''}>${[2, 3, 5, 7].map(n => `<option value="${n}" ${f.staleDays === n ? 'selected' : ''}>${n} days</option>`).join('')}</select></label>
    <label class="f">Escalate to team lead after<select class="in" data-c="fu" data-k="escalateAfter" data-live ${role() === 'employee' ? 'disabled' : ''}>${[1, 2, 3, 5].map(n => `<option value="${n}" ${f.escalateAfter === n ? 'selected' : ''}>${n} day${n > 1 ? 's' : ''} overdue</option>`).join('')}</select></label>
    <label class="f">Overdue reminder frequency<select class="in" data-c="fu" data-k="frequency" data-live ${role() === 'employee' ? 'disabled' : ''}><option value="once" ${f.frequency === 'once' ? 'selected' : ''}>Once</option><option value="daily" ${f.frequency === 'daily' ? 'selected' : ''}>Every day until done</option></select></label>
    <label class="check"><input type="checkbox" data-c="fu" data-k="notifyManagers" ${f.notifyManagers ? 'checked' : ''} ${role() === 'employee' ? 'disabled' : ''}>Notify reviewers and managers about delayed work</label>
    ${role() === 'employee' ? '<p class="muted" style="margin:0;font-size:12.5px">Managers and admins can change these rules.</p>' : ''}
  </div></section></div>`;
};

/* ---------- Employees ---------- */
VIEWS.employees = () => {
  const [tb, cur] = tabs('emp', [['directory', 'Directory'], ['departments', 'Departments'], ['attendance', 'Attendance'], ['leave', 'Time off'], ['workload', 'Workload'], ['requests', 'Requests']]);
  let body = '';
  if (cur === 'directory') {
    const q = ($('#dirq')?.value || '').toLowerCase();
    const list = S.users.filter(u => (!UI.dir.dept || u.dept === UI.dir.dept) && (!q || (u.name + u.title).toLowerCase().includes(q)));
    body = `<div class="bd"><div class="row" style="margin-bottom:12px"><input id="dirq" class="in" type="search" style="width:240px" placeholder="Search people" data-i="rerender"><select class="in" style="width:auto" data-c="dirDept" data-live aria-label="Department"><option value="">All departments</option>${S.departments.map(d => `<option value="${d.id}" ${UI.dir.dept === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select>${can('employees.manage') ? `<button class="btn primary" data-a="newEmployee" style="margin-left:auto">${ic('plus')}Add employee</button>` : ''}</div>
      <div class="grid g4">${list.map(u => `<div class="card" style="padding:14px;display:flex;flex-direction:column;gap:8px;cursor:pointer" data-a="openUser" data-id="${u.id}"><div class="row" style="flex-wrap:nowrap">${av(u.id, 'lg')}<div style="min-width:0"><b class="ell" style="display:block">${esc(u.name)}</b><span class="muted" style="font-size:12.5px">${esc(u.title)}</span></div></div><div class="row"><span class="pill" style="color:${dept(u.dept)?.color}">${esc(dept(u.dept)?.name)}</span>${presPill(u)}</div></div>`).join('')}</div></div>`;
  } else if (cur === 'departments') {
    body = `<div class="bd flush tbl-wrap"><table><thead><tr><th>Department</th><th>Head</th><th>Members</th><th>Open tasks</th><th>Overdue</th></tr></thead><tbody>${S.departments.map(d => { const ts = S.tasks.filter(t => t.dept === d.id); return `<tr><td><span class="row"><span class="sw" style="background:${d.color}"></span><b>${esc(d.name)}</b></span></td><td>${can('employees.manage') ? `<select class="in" style="width:auto" data-c="deptHead" data-id="${d.id}" data-live>${S.users.map(u => `<option value="${u.id}" ${d.head === u.id ? 'selected' : ''}>${esc(u.name)}</option>`).join('')}</select>` : esc(uname(d.head))}</td><td>${avs(S.users.filter(u => u.dept === d.id).map(u => u.id), 'sm', 6)}</td><td class="num">${ts.filter(t => t.status !== 'done').length}</td><td class="num" style="color:var(--bad)">${ts.filter(t => t.status === 'overdue').length || ''}</td></tr>`; }).join('')}</tbody></table></div>${can('employees.manage') ? `<div class="bd"><button class="btn" data-a="newDept">${ic('plus')}Add department</button></div>` : ''}`;
  } else if (cur === 'attendance') {
    const today = sod(now()); const mine = S.attendance.find(a => a.user === ME && sod(a.in) === today);
    body = `<div class="bd row" style="justify-content:space-between"><span>${mine ? `Checked in at <b class="num">${fTime(mine.in)}</b>${mine.out ? ` · out at <b class="num">${fTime(mine.out)}</b>` : ''}` : 'You have not checked in today.'}</span>${!mine ? `<button class="btn primary" data-a="checkIn">${ic('clock')}Check in</button>` : !mine.out ? `<button class="btn" data-a="checkOut">${ic('logout')}Check out</button>` : ''}</div>
    <div class="bd flush tbl-wrap"><table><thead><tr><th>Employee</th><th>Today in</th><th>Out</th><th>Last 2 weeks</th></tr></thead><tbody>${S.users.filter(u => role() !== 'employee' || u.dept === me().dept).map(u => { const a = S.attendance.find(x => x.user === u.id && sod(x.in) === today); const past = S.attendance.filter(x => x.user === u.id && x.in < today); const wd = workdays(13); const rate = pct(past.length, wd); return `<tr><td><span class="row" style="flex-wrap:nowrap">${av(u.id, 'sm')}${esc(u.name)}</span></td><td class="num">${a ? fTime(a.in) : '<span class="faint">—</span>'}</td><td class="num">${a && a.out ? fTime(a.out) : '<span class="faint">—</span>'}</td><td style="min-width:140px"><div class="row" style="flex-wrap:nowrap"><div class="bar ${rate < 85 ? 'warn' : 'ok'}"><i style="width:${rate}%"></i></div><span class="num muted" style="font-size:12px">${rate}%</span></div></td></tr>`; }).join('')}</tbody></table></div>`;
  } else if (cur === 'leave') {
    const used = S.leaves.filter(l => l.user === ME && l.status === 'approved' && l.type === 'Vacation').reduce((a, l) => a + Math.round((sod(l.to) - sod(l.from)) / DAY) + 1, 0);
    const vis = S.leaves.filter(l => l.user === ME || role() === 'admin' || (role() === 'manager' && user(l.user)?.dept === me().dept));
    body = `<div class="bd row" style="justify-content:space-between"><span>Vacation balance: <b class="num">${15 - used} of 15 days</b></span><button class="btn primary" data-a="newLeave">${ic('plus')}Request leave</button></div>
    <div class="bd flush tbl-wrap"><table><thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>${vis.sort((a, b) => b.at - a.at).map(l => `<tr><td><span class="row" style="flex-wrap:nowrap">${av(l.user, 'sm', false)}${esc(uname(l.user))}</span></td><td>${esc(l.type)}</td><td class="num" style="white-space:nowrap">${fDay(l.from)}${sod(l.to) !== sod(l.from) ? ' – ' + fDay(l.to) : ''}</td><td class="muted">${esc(l.reason)}</td><td><span class="pill ${{ pending: 'orange', approved: 'green', declined: 'red' }[l.status]}">${cap(l.status)}</span>${l.approver ? `<div class="faint" style="font-size:11.5px">by ${esc(first(l.approver))}</div>` : ''}</td><td style="white-space:nowrap">${l.status === 'pending' && can('leave.approve') && l.user !== ME ? `<button class="btn sm ok" data-a="leaveDecide" data-id="${l.id}" data-v="approved">Approve</button> <button class="btn sm danger" data-a="leaveDecide" data-id="${l.id}" data-v="declined">Decline</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
  } else if (cur === 'workload') {
    const pool = role() === 'employee' ? S.users.filter(u => u.dept === me().dept) : role() === 'manager' ? S.users.filter(u => u.dept === me().dept) : S.users;
    const data = pool.map(u => { const ts = S.tasks.filter(t => t.assignees.includes(u.id) && t.status !== 'done'); const pts = ts.reduce((a, t) => a + PRI[t.priority].w, 0); return { u, ts, pts }; }).sort((a, b) => b.pts - a.pts);
    body = `<div class="bd"><p class="muted" style="margin:0 0 12px">Load points weight each open task by priority (urgent 4, high 3, medium 2, low 1). Over 8 points is flagged.</p><div class="list">${data.map(d => `<div class="li" style="flex-wrap:wrap">${av(d.u.id)}<div style="width:170px"><b>${esc(d.u.name)}</b><div class="muted" style="font-size:12px">${esc(d.u.title)}</div></div><div class="bar ${d.pts > 8 ? 'bad' : d.pts > 5 ? 'warn' : 'ok'}" style="min-width:120px"><i style="width:${Math.min(100, d.pts / 12 * 100)}%"></i></div><span class="num" style="width:80px">${d.pts} pts${d.pts > 8 ? ' <span class="pill red">High</span>' : ''}</span><div class="chips" style="flex-basis:100%;padding-left:40px">${d.ts.map(t => taskChip(t.id)).join('') || '<span class="faint">No open tasks</span>'}</div></div>`).join('')}</div></div>`;
  } else {
    const list = S.requests.filter(r => role() !== 'employee' || r.by === ME);
    body = `<div class="bd row" style="justify-content:space-between"><span class="muted">IT, facilities, HR and finance requests in one queue.</span><button class="btn primary" data-a="newRequest">${ic('plus')}New request</button></div>
    <div class="bd flush tbl-wrap"><table><thead><tr><th>ID</th><th>Request</th><th>Category</th><th>From</th><th>Assignee</th><th>Status</th></tr></thead><tbody>${list.sort((a, b) => b.at - a.at).map(r => `<tr><td class="mono faint">${r.id}</td><td><b>${esc(r.title)}</b>${r.notes ? `<div class="muted" style="font-size:12px">${esc(r.notes)}</div>` : ''}</td><td><span class="pill">${esc(r.cat)}</span></td><td>${esc(uname(r.by))}<div class="faint" style="font-size:11.5px">${rel(r.at)}</div></td><td>${r.assignee ? esc(first(r.assignee)) : '<span class="faint">Unassigned</span>'}</td><td>${role() === 'employee' ? `<span class="pill ${{ open: 'blue', progress: 'orange', resolved: 'green' }[r.status]}">${{ open: 'Open', progress: 'In progress', resolved: 'Resolved' }[r.status]}</span>` : `<select class="in" style="width:auto" data-c="reqStatus" data-id="${r.id}" data-live><option value="open" ${r.status === 'open' ? 'selected' : ''}>Open</option><option value="progress" ${r.status === 'progress' ? 'selected' : ''}>In progress</option><option value="resolved" ${r.status === 'resolved' ? 'selected' : ''}>Resolved</option></select>`}</td></tr>`).join('') || `<tr><td colspan="6">${empty('No requests')}</td></tr>`}</tbody></table></div>`;
  }
  return phead('Employees', 'Directory, departments, attendance, leave, workload and internal requests.') + `<section class="card">${tb}${body}</section>`;
};
function workdays(n) { let c = 0; for (let i = 1; i <= n; i++) { const d = new Date(now() - i * DAY).getDay(); if (d !== 0 && d !== 6) c++; } return c; }

/* ---------- File Center ---------- */
VIEWS.files = () => {
  const [tb, cur] = tabs('files', [['files', 'Files'], ['kb', 'Knowledge Base']]);
  if (cur === 'kb') {
    const q = ($('#kbq')?.value || '').toLowerCase();
    const list = S.kb.filter(a => !q || (a.title + ' ' + a.body + ' ' + a.tags.join(' ')).toLowerCase().includes(q));
    const sel = S.kb.find(a => a.id === UI.kb) || list[0];
    return phead('File Center', 'Shared files and the company knowledge base.', can('announce') ? `<button class="btn" data-a="newKb">${ic('plus')}New article</button>` : '')
    + `<section class="card">${tb}<div class="bd"><div class="row" style="margin-bottom:12px"><input id="kbq" class="in" type="search" style="max-width:360px" placeholder="Search articles" data-i="rerender"><button class="btn" data-a="aiSearch">${ic('spark')}Ask the assistant</button></div>
      <div class="grid g3"><div class="list" style="border:1px solid var(--line);border-radius:9px">${list.map(a => `<div class="li click" data-a="kbSel" data-id="${a.id}" style="${sel && sel.id === a.id ? 'background:var(--primary-soft)' : ''}">${ic('book', 'muted').replace('<svg ', '<svg width="16" height="16" ')}<div class="grow"><b class="ell" style="display:block">${esc(a.title)}</b><span class="muted" style="font-size:12px">${a.tags.map(esc).join(' · ')}</span></div></div>`).join('') || empty('No articles match')}</div>
      <article class="span2" style="max-width:70ch">${sel ? `<h2 style="font-size:18px">${esc(sel.title)}</h2><p class="muted" style="font-size:12.5px">By ${esc(uname(sel.by))} · updated ${rel(sel.at)}</p><p style="line-height:1.65">${esc(sel.body)}</p>` : ''}</article></div></div></section>`;
  }
  const folders = ['All', 'Design', 'Development', 'Marketing', 'HR', 'Shared'];
  const q = ($('#fq')?.value || '').toLowerCase();
  const list = S.files.filter(f => (UI.folder === 'All' || f.folder === UI.folder) && (!q || f.name.toLowerCase().includes(q)));
  const total = S.files.reduce((a, f) => a + f.size, 0);
  return phead('File Center', `${S.files.length} files · ${fSize(total)} used`, `<button class="btn primary" data-a="upload">${ic('plus')}Upload</button>`)
  + `<section class="card">${tb}<div class="bd"><div class="row" style="margin-bottom:12px">${seg('folder', UI.folder, folders.map(f => [f, f]))}<input id="fq" class="in" type="search" style="width:220px" placeholder="Search files" data-i="rerender"></div></div>
    <div class="bd flush tbl-wrap">${list.length ? `<table><thead><tr><th>Name</th><th>Folder</th><th>Size</th><th>Owner</th><th>Linked task</th><th>Updated</th><th></th></tr></thead><tbody>${list.sort((a, b) => b.at - a.at).map(f => `<tr><td><span class="row" style="flex-wrap:nowrap">${ic('files', 'muted').replace('<svg ', '<svg width="16" height="16" ')}<b>${esc(f.name)}</b></span></td><td>${esc(f.folder)}</td><td class="num">${fSize(f.size)}</td><td>${esc(uname(f.by))}</td><td>${f.task ? taskChip(f.task) : '<span class="faint">—</span>'}</td><td class="num">${rel(f.at)}</td><td>${BLOBS[f.id] ? `<a class="btn sm" href="${BLOBS[f.id]}" target="_blank" rel="noopener">Open</a>` : '<span class="faint" style="font-size:12px" title="Sample files have no content in this demo">Sample</span>'}</td></tr>`).join('')}</tbody></table>` : empty('No files here', 'Upload a file or pick another folder.')}</div>
    <div class="bd"><span class="sim">Storage</span> <span class="muted" style="font-size:12.5px">Uploaded files open during this session only. File names and details are kept in this browser.</span></div></section>`;
};

/* ---------- Announcements ---------- */
VIEWS.announcements = () => {
  const list = S.announcements.slice().sort((a, b) => (b.pinned - a.pinned) || b.at - a.at);
  return phead('Announcements', 'Company news. Urgent posts reach people even during Do Not Disturb.', can('announce') ? `<button class="btn primary" data-a="newAnn">${ic('plus')}New announcement</button>` : '')
  + list.map(a => { const read = a.reads.includes(ME); return `<article class="card"><div class="bd" style="display:flex;flex-direction:column;gap:8px"><div class="row">${a.pinned ? '<span class="pill blue">Pinned</span>' : ''}${a.urgent ? '<span class="pill red">Urgent</span>' : ''}<h2 style="font-size:16px;flex:1">${esc(a.title)}</h2></div><p style="margin:0;max-width:72ch;line-height:1.6">${esc(a.body)}</p><div class="row" style="justify-content:space-between"><span class="row muted" style="font-size:12.5px">${av(a.by, 'sm', false)}${esc(uname(a.by))} · ${rel(a.at)} · read by ${a.reads.length} of ${S.users.length}</span><span class="row">${can('announce') ? `<button class="btn sm ghost" data-a="pinAnn" data-id="${a.id}">${a.pinned ? 'Unpin' : 'Pin'}</button>` : ''}${read ? '<span class="pill green">Read</span>' : `<button class="btn sm" data-a="readAnn" data-id="${a.id}">${ic('check')}Mark as read</button>`}</span></div></div></article>`; }).join('');
};

/* ---------- Reports ---------- */
VIEWS.reports = () => {
  const full = can('reports.view');
  const t0 = now();
  const pool = full ? (role() === 'admin' ? S.tasks : scopeTasks('team')) : S.tasks.filter(t => t.assignees.includes(ME));
  const done = pool.filter(t => t.status === 'done');
  const arch = full ? S.archive.filter(a => role() === 'admin' || a.dept === me().dept) : [];
  const onTimeAll = arch.filter(a => a.onTime).length + done.filter(t => t.completedAt <= t.due + DAY).length;
  const totalDone = arch.length + done.length;
  const revs = S.submissions.filter(s => s.reviews.length && pool.some(t => t.id === s.task));
  const avgRev = revs.length ? revs.reduce((a, s) => a + (s.reviews[0].at - s.at), 0) / revs.length / HOUR : 0;
  const weeks = Array.from({ length: 8 }, (_, i) => { const end = sod(t0) + DAY - i * 7 * DAY, start = end - 7 * DAY; return { start, n: arch.filter(a => a.completedAt >= start && a.completedAt < end).length + done.filter(t => t.completedAt >= start && t.completedAt < end).length }; }).reverse();
  const maxW = Math.max(1, ...weeks.map(w => w.n));
  const W = 560, Hh = 170, bw = W / weeks.length;
  const ticks = [0, Math.ceil(maxW / 2), maxW];
  const chart = `<svg viewBox="0 0 ${W + 30} ${Hh + 26}" class="chart" style="width:100%;max-width:100%;height:auto" role="img" aria-label="Tasks completed per week">
    ${ticks.map(v => { const y = Hh - v / maxW * (Hh - 10); return `<line x1="28" x2="${W + 30}" y1="${y}" y2="${y}" /><text x="22" y="${y + 4}" text-anchor="end" font-size="10">${v}</text>`; }).join('')}
    ${weeks.map((w, i) => { const h = w.n / maxW * (Hh - 10); const last = i === weeks.length - 1; return `<rect x="${30 + i * bw + 8}" y="${Hh - h}" width="${bw - 16}" height="${h}" rx="3" class="${last ? 'last' : ''}"><title>Week of ${fDay(w.start)}: ${w.n}</title></rect><text x="${30 + i * bw + bw / 2}" y="${Hh + 16}" text-anchor="middle" font-size="10">${fDay(w.start)}</text>${last ? `<text x="${30 + i * bw + bw / 2}" y="${Hh - h - 5}" text-anchor="middle" font-size="11" font-weight="700" class="v">${w.n}</text>` : ''}`; }).join('')}</svg>`;
  const att = (() => { const wd = workdays(13); const us = full ? S.users : [me()]; return pct(us.reduce((a, u) => a + S.attendance.filter(x => x.user === u.id && x.in < sod(t0)).length, 0), us.length * wd); })();
  const byDept = S.departments.filter(d => role() === 'admin' || d.id === me().dept || !full).map(d => { const ts = S.tasks.filter(t => t.dept === d.id); const ar = S.archive.filter(a => a.dept === d.id); return { d, open: ts.filter(t => t.status !== 'done').length, od: ts.filter(t => t.status === 'overdue').length, done30: ar.filter(a => a.completedAt > t0 - 30 * DAY).length + ts.filter(t => t.status === 'done' && t.completedAt > t0 - 30 * DAY).length, ot: pct(ar.filter(a => a.onTime).length, ar.length) }; });
  return phead('Reports', full ? (role() === 'admin' ? 'Company-wide numbers from tasks, reviews and attendance.' : `${esc(dept(me().dept).name)} team numbers.`) : 'Your personal numbers. Team reports need the View team reports permission.',
    `<button class="btn" data-a="exportCsv">${ic('download')}Export CSV</button><button class="btn" data-a="aiWeekly">${ic('spark')}Weekly AI report</button>`)
  + `<div class="grid g4">${[['Completion rate', pct(pool.filter(t => t.status === 'done').length, pool.length) + '%', 'of current tasks are done'], ['On-time delivery', pct(onTimeAll, totalDone) + '%', `${totalDone} tasks completed`], ['Avg review time', avgRev ? avgRev.toFixed(1) + ' h' : '—', 'submission to first decision'], ['Attendance', att + '%', 'last 2 working weeks']].map(([l, v, s]) => `<div class="kpi" style="cursor:default"><span class="l">${l}</span><span class="v">${v}</span><span class="faint" style="font-size:12px">${s}</span></div>`).join('')}</div>`
  + `<div class="grid g3"><section class="card span2"><div class="hd"><h2>Tasks completed per week</h2><span class="muted" style="font-size:12px">Last 8 weeks</span></div><div class="bd">${chart}</div></section>
     ${card('Status mix', `<div style="display:flex;flex-direction:column;gap:9px">${STAT_ORDER.map(s => { const n = pool.filter(t => t.status === s).length; return `<div class="row" style="flex-wrap:nowrap"><span style="width:130px">${spill(s)}</span><div class="bar"><i style="width:${pct(n, pool.length)}%;background:${{ todo: 'var(--slate)', progress: 'var(--primary)', review: 'var(--violet)', revision: 'var(--warn)', done: 'var(--ok)', overdue: 'var(--bad)' }[s]}"></i></div><span class="num" style="width:24px;text-align:right">${n}</span></div>`; }).join('')}</div>`)}</div>`
  + (full ? card('By department', `<table><thead><tr><th>Department</th><th>Open</th><th>Overdue</th><th>Done (30d)</th><th>On time</th></tr></thead><tbody>${byDept.map(x => `<tr><td><span class="row"><span class="sw" style="background:${x.d.color}"></span>${esc(x.d.name)}</span></td><td class="num">${x.open}</td><td class="num" style="${x.od ? 'color:var(--bad);font-weight:600' : ''}">${x.od}</td><td class="num">${x.done30}</td><td class="num">${x.ot}%</td></tr>`).join('')}</tbody></table>`, { flush: true, cls: 'tbl-wrap' }) : '');
};

/* ---------- Settings ---------- */
VIEWS.profile = () => {
  const u = me();
  const colors = ['#2457d6', '#7a4fd0', '#0f8a8a', '#1b8f4e', '#c2410c', '#d0569a', '#b45309', '#4b5563'];
  return phead('Profile', 'How colleagues see you across Northdesk.') + `<form class="card" data-form="profile"><div class="bd form" style="max-width:640px">
    <div class="row">${av(ME, 'xl')}<div><b style="font-size:16px">${esc(u.name)}</b><div class="muted">${esc(u.email)} · ${cap(u.role)} · ${esc(dept(u.dept)?.name)}</div></div></div>
    <div class="two"><label class="f">Full name<input class="in" name="name" id="pf-name" value="${esc(u.name)}" required></label><label class="f">Job title<input class="in" name="title" id="pf-title" value="${esc(u.title)}"></label></div>
    <div class="two"><label class="f">Phone<input class="in" name="phone" id="pf-phone" value="${esc(u.phone)}"></label><label class="f">Time zone<input class="in" name="tz" id="pf-tz" value="${esc(u.tz)}"></label></div>
    <label class="f">About<textarea class="in" name="bio" id="pf-bio">${esc(u.bio)}</textarea></label>
    <div class="sec"><span class="tag">Avatar color</span><div class="row">${colors.map(c => `<label style="cursor:pointer"><input type="radio" name="color" value="${c}" ${u.color === c ? 'checked' : ''} style="accent-color:${c}"><span class="sw" style="background:${c};width:22px;height:22px;border-radius:50%"></span></label>`).join('')}</div></div>
    <div><button class="btn primary">Save profile</button></div></div></form>`
  + card('Characters on this device', `<p class="muted" style="margin:0 0 10px">Make extra characters to test the flow from another role, for example an employee who submits work and a manager who approves it.</p><div class="list">${S.users.map(x => `<div class="li"><canvas data-char="${x.id}" width="16" height="24" style="width:32px;image-rendering:pixelated"></canvas><div class="grow"><b>${esc(x.name)}</b>${x.id === ME ? ' <span class="pill blue">Playing</span>' : ''}<div class="muted" style="font-size:12.5px">${esc(x.title)} · ${cap(x.role)} · ${esc(dept(x.dept)?.name)}</div></div>${x.id === ME ? '' : `<button class="btn sm" data-a="switchChar" data-id="${x.id}">Play as</button>`}</div>`).join('')}</div><div style="margin-top:10px"><button class="btn primary" data-a="newChar">${ic('plus')}Create another character</button></div>`)
  + card('Office character', `<div class="row" style="gap:16px"><canvas id="pfchar" width="76" height="24" style="width:228px;max-width:100%;image-rendering:pixelated;background:#e9dcc4;border-radius:8px;padding:8px"></canvas><div><p class="muted" style="margin:0 0 10px;max-width:46ch">This is how you appear in the Online Office floor view. Pick hair, skin tone, clothes and accessories so nobody looks the same.</p><button class="btn primary" data-a="dressing">${ic('user')}Open dressing room</button> <button class="btn" data-a="deskEdit">Decorate desk</button> <button class="btn" data-a="placeDesk">${ic('plus')}Place a new desk</button></div></div>`);
};
VIEWS.availability = () => {
  const u = me(), p = prefs(ME);
  const quiet = ['dnd', 'focus'].includes(u.status);
  return phead('Availability & DND', 'Control interruptions. Northdesk never records keystrokes, screenshots or app activity.')
  + `<div class="grid g2">
  ${card('Current status', `<div class="row" style="margin-bottom:12px">${presPill(u)}${u.auto ? `<span class="muted" style="font-size:12.5px">set automatically (${{ idle: 'idle', meeting: 'calendar', schedule: 'DND schedule', focus: 'focus timer', manual: 'by you', room: 'room' }[u.auto] || u.auto})</span>` : ''}</div><div class="chips">${['online', 'busy', 'away', 'dnd', 'meeting', 'offline'].map(s => `<button class="btn sm ${u.status === s ? 'on' : ''}" data-a="setStatus" data-v="${s}">${pdot(s)}${PRES[s].l}</button>`).join('')}</div>
    ${u.prevStatus ? `<p class="muted" style="font-size:12.5px;margin:10px 0 0">Returns to ${PRES[u.prevStatus].l} ${u.statusUntil ? 'at ' + fTime(u.statusUntil) : 'when you end it'}.</p>` : ''}`)}
  ${card('Do Not Disturb', `<p class="muted" style="margin:0 0 10px">Silences notifications and declines calls. Messages are kept and shown when DND ends.</p>
    <div class="chips">${[[30, '30 min'], [60, '1 hour'], [120, '2 hours'], [240, '4 hours']].map(([m, l]) => `<button class="btn sm" data-a="dnd" data-v="${m}">${l}</button>`).join('')}<button class="btn sm" data-a="dndTomorrow">Until tomorrow 09:00</button></div>
    <form class="row" data-form="dndCustom" style="margin-top:10px"><input class="in" id="dndMin" name="mins" type="number" min="5" max="720" placeholder="Minutes" style="width:110px" required><button class="btn sm">Start custom</button>${quiet ? `<button type="button" class="btn sm danger" data-a="endQuiet">Turn off now</button>` : ''}</form>`)}
  ${card('Focus mode', `<p class="muted" style="margin:0 0 10px">A timer that turns on DND, shows Focus to colleagues and restores your status at the end.</p>
    ${u.status === 'focus' && u.statusUntil ? `<div class="row" style="margin-bottom:10px"><span class="timer" style="font-size:28px;font-weight:600;color:var(--violet)" data-countdown="${u.statusUntil}"></span><button class="btn" data-a="endQuiet">End session</button></div>` : ''}
    <div class="chips">${[25, 50, 90].map(m => `<button class="btn sm" data-a="focus" data-v="${m}">${ic('target')}${m} min</button>`).join('')}</div>
    <form class="row" data-form="focusCustom" style="margin-top:10px"><input class="in" id="focusMin" name="mins" type="number" min="5" max="240" placeholder="Minutes" style="width:110px" required><button class="btn sm">Start custom</button></form>
    <label class="check" style="margin-top:10px"><input type="checkbox" data-c="pref" data-k="breaks" ${p.breaks ? 'checked' : ''}>Remind me to take a break when a session ends</label>`)}
  ${card('Scheduled DND', `<div class="form"><label class="check"><input type="checkbox" data-c="sched" data-k="on" ${p.dndSched.on ? 'checked' : ''}>Turn on DND automatically</label>
    <div class="two"><label class="f">From<input class="in" type="time" data-c="sched" data-k="from" data-live value="${p.dndSched.from}"></label><label class="f">To<input class="in" type="time" data-c="sched" data-k="to" data-live value="${p.dndSched.to}"></label></div>
    <div class="row">${WD.map((d, i) => `<label class="chipsel" style="padding:4px 10px"><input type="checkbox" data-c="schedDay" data-k="${i}" ${p.dndSched.days.includes(i) ? 'checked' : ''}>${d}</label>`).join('')}</div></div>`)}
  ${card('Emergency contacts', `<p class="muted" style="margin:0 0 10px">These people can reach you during DND and Focus. Their messages and calls come through.</p><div class="chips">${S.users.filter(x => x.id !== ME).map(x => `<label class="chipsel"><input type="checkbox" data-c="emerg" data-k="${x.id}" ${p.emergency.includes(x.id) ? 'checked' : ''}>${av(x.id, 'sm', false)}${esc(x.name.split(' ')[0])}</label>`).join('')}</div>`)}
  ${card('Privacy & automatic status', `<div class="form"><label class="f">Who can see my status<select class="in" data-c="visibility" data-live><option value="everyone" ${u.visibility === 'everyone' ? 'selected' : ''}>Everyone in the workspace</option><option value="dept" ${u.visibility === 'dept' ? 'selected' : ''}>My department only</option><option value="managers" ${u.visibility === 'managers' ? 'selected' : ''}>Managers and admins only</option><option value="hidden" ${u.visibility === 'hidden' ? 'selected' : ''}>Nobody (appear offline)</option></select></label>
    <label class="check"><input type="checkbox" data-c="pref" data-k="autoMeeting" ${p.autoMeeting ? 'checked' : ''}>Set In Meeting automatically from my calendar</label>
    <p class="muted" style="margin:0;font-size:12.5px">Away is set after ${S.workspace.autoAway} minutes without activity in this tab, and cleared when you come back. Nothing else is tracked.</p></div>`)}
  </div>`;
};
VIEWS.notifications = () => {
  const p = prefs(ME);
  return phead('Notifications', 'Choose what reaches you. Do Not Disturb and Focus hold everything except urgent items and your emergency contacts.')
  + card('Notify me about', `<div class="list">${Object.entries(NTYPES).map(([k, l]) => `<label class="li check" style="justify-content:space-between"><span>${l}</span><input type="checkbox" data-c="ntype" data-k="${k}" ${p.types[k] !== false ? 'checked' : ''}></label>`).join('')}</div>`, { flush: true })
  + card('Delivery', `<label class="check"><input type="checkbox" data-c="pref" data-k="toasts" ${p.toasts !== false ? 'checked' : ''}>Show pop-up notifications</label><p class="muted" style="font-size:12.5px;margin:8px 0 0">Muted types still land in the notification center so nothing is lost.</p>`);
};
VIEWS.workspace = () => {
  const ok = can('workspace.manage'), w = S.workspace;
  const rows = [
    ['Tasks, projects, submissions, approvals', 'live', 'Saved in this browser; every change syncs instantly to other open tabs.'],
    ['Automated reminders, overdue, escalation', 'live', 'Runs every few seconds while a tab is open.'],
    ['Presence, DND, Focus, auto Away / In Meeting', 'live', 'Status timers restore your previous status.'],
    ['People viewing right now', CAP.room ? 'live' : 'off', CAP.room ? 'Real viewers of this page, shown in Online Office.' : 'Available when opened on claude.ai.'],
    ['AI assistant', CAP.sample ? 'live' : 'sim', CAP.sample ? 'Answers come from Claude.' : 'Offline mode uses built-in rules.'],
    ['Calendar export (.ics), report CSV', CAP.dl ? 'live' : 'off', 'Uses the download prompt on claude.ai.'],
    ['Teammates’ activity', 'sim', 'Generated so the office feels alive. Turn off below.'],
    ['Voice, calls, screen sharing', 'sim', 'Controls work; there is no real audio or video.'],
    ['Google Calendar sync', 'sim', 'Connection is simulated; use .ics export for real import.'],
    ['File storage', 'sim', 'Files open in this session only; metadata is kept.'],
  ];
  return phead('Workspace Settings', ok ? 'Admin settings for the whole workspace.' : 'Only admins can change these settings.')
  + `<div class="grid g2"><form class="card" data-form="workspace"><div class="hd"><h2>General</h2></div><div class="bd form"><label class="f">Workspace name<input class="in" id="ws-name" name="name" value="${esc(w.name)}" ${ok ? '' : 'disabled'}></label><label class="f">Working hours<input class="in" id="ws-hours" name="hours" value="${esc(w.hours)}" ${ok ? '' : 'disabled'}></label>
    <label class="f">Set Away after<select class="in" name="autoAway" data-live ${ok ? '' : 'disabled'}>${[2, 5, 10, 15].map(n => `<option value="${n}" ${w.autoAway === n ? 'selected' : ''}>${n} minutes idle</option>`).join('')}</select></label>
    <label class="check"><input type="checkbox" name="simulate" ${w.simulate ? 'checked' : ''} ${ok ? '' : 'disabled'}>Simulate teammates' activity</label>${ok ? '<div><button class="btn primary">Save</button></div>' : ''}</div></form>
    ${card('System status', `<div class="list">${rows.map(([n, s, d]) => `<div class="li"><div class="grow"><b>${n}</b><div class="muted" style="font-size:12.5px">${d}</div></div><span class="${s === 'live' ? 'live' : 'sim'}">${s === 'live' ? 'Working' : s === 'sim' ? 'Simulated' : 'Not here'}</span></div>`).join('')}</div>`, { flush: true })}</div>`
  + (ok ? card('Demo data', `<div class="row" style="justify-content:space-between"><span class="muted">Reset every task, message and setting to the sample workspace.</span>${UI.confirm === 'reset' ? `<span class="row"><b style="color:var(--bad)">Erase all changes?</b><button class="btn danger" data-a="resetDemo">Yes, reset</button><button class="btn" data-a="confirm" data-v="">Cancel</button></span>` : `<button class="btn danger" data-a="confirm" data-v="reset">Reset demo data</button>`}</div>`) : '');
};
VIEWS.permissions = () => {
  const ok = can('permissions.manage');
  return phead('Permissions', ok ? 'Toggle what each role can do. Changes apply immediately.' : 'Read only. Admins can change role permissions.')
  + `<section class="card"><div class="bd flush tbl-wrap"><table class="matrix"><thead><tr><th>Permission</th><th>Admin</th><th>Manager</th><th>Employee</th></tr></thead><tbody>${Object.entries(S.perms).map(([k, p]) => `<tr><td>${esc(p.label)}</td>${['admin', 'manager', 'employee'].map(r => `<td><input type="checkbox" aria-label="${esc(p.label)} for ${r}" data-c="perm" data-k="${k}" data-r="${r}" ${p[r] ? 'checked' : ''} ${ok && !(r === 'admin' && k === 'permissions.manage') ? '' : 'disabled'} style="width:16px;height:16px;accent-color:var(--primary)"></td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`
  + card('Roles', `<div class="grid g3"><div><b>Admin</b><p class="muted" style="margin:4px 0 0">Employees, departments, permissions, settings and company reports.</p></div><div><b>Manager</b><p class="muted" style="margin:4px 0 0">Assign tasks, run projects, review submissions, schedule meetings and monitor the team.</p></div><div><b>Employee</b><p class="muted" style="margin:4px 0 0">Work on assigned tasks, communicate, join rooms, submit work and manage their schedule.</p></div></div>`);
};

/* ================= drawers ================= */
function drawerHTML() {
  const d = UI.drawer; let title = '', body = '', act = '';
  if (d.type === 'task') [title, body, act] = taskDrawer(task(d.id));
  else if (d.type === 'sub') [title, body] = subDrawer(S.submissions.find(s => s.id === d.id));
  else if (d.type === 'meeting') [title, body] = meetingDrawer(meeting(d.id));
  else if (d.type === 'user') [title, body] = userDrawer(user(d.id));
  else if (d.type === 'notifs') [title, body, act] = notifDrawer();
  else if (d.type === 'ai') [title, body] = aiDrawer();
  if (!title) return '';
  return `<div class="dscrim" data-a="closeDrawer"></div><aside class="drawer" role="dialog" aria-label="${esc(title)}"><div class="hd"><h2 class="ell">${title}</h2>${act}<button class="btn ghost icon" data-a="closeDrawer" aria-label="Close">${ic('x')}</button></div><div class="bd">${body}</div></aside>`;
}
function taskDrawer(t) {
  if (!t) return ['Task not found', empty('This task was deleted.'), ''];
  const isA = t.assignees.includes(ME), isR = canReview(t), subs = S.submissions.filter(s => s.task === t.id).sort((a, b) => b.version - a.version);
  const pending = subs.find(s => s.status === 'pending');
  const editable = isA || isR || can('task.assign');
  const blocked = isBlocked(t);
  const statusOpts = STAT_ORDER.filter(s => s !== 'overdue' || t.status === 'overdue');
  const body = `
  <div class="row"><span class="mono faint">${t.id}</span>${spill(t.status)}${ppill(t.priority)}${blocked ? '<span class="pill orange">Blocked</span>' : ''}${t.escalated && t.status === 'overdue' ? '<span class="pill red">Escalated</span>' : ''}${t.fromMeeting ? `<span class="pill">From meeting</span>` : ''}</div>
  <h2 style="font-size:19px">${esc(t.title)}</h2>
  <div class="row">${isA && !['done', 'review'].includes(t.status) ? `<button class="btn primary" data-a="submitWork" data-id="${t.id}">${ic('submit')}Submit work</button>` : ''}${pending && isR ? `<button class="btn primary" data-a="openSub" data-id="${pending.id}">Review v${pending.version}</button>` : ''}${isA && t.status === 'todo' ? `<button class="btn" data-a="startTask" data-id="${t.id}">Start working</button>` : ''}${isA && t.status !== 'done' ? (me().doing && me().doing.task === t.id ? `<span class="pill blue">Showing above your head</span>` : `<button class="btn" data-a="workOn" data-id="${t.id}">Work on this now</button>`) : ''}${editable ? `<button class="btn" data-a="editTask" data-id="${t.id}">${ic('pen')}Edit</button>` : ''}</div>
  <div class="kv">
    <span>Status</span><span>${editable ? `<select class="in" style="width:auto" data-c="taskStatus" data-id="${t.id}" data-live>${statusOpts.map(s => `<option value="${s}" ${t.status === s ? 'selected' : ''}>${STAT[s].l}</option>`).join('')}</select>` : spill(t.status)}</span>
    <span>Project</span><span>${t.project ? `<a href="#projects" data-a="openProject" data-id="${t.project}">${esc(proj(t.project)?.name)}</a>` : '—'} · ${esc(dept(t.dept)?.name || '')}</span>
    <span>Assignees</span><span class="row">${t.assignees.map(a => `<span class="row" style="gap:5px">${av(a, 'sm')}${esc(first(a))}</span>`).join('')}</span>
    <span>Reviewers</span><span class="row">${t.reviewers.map(a => `<span class="row" style="gap:5px">${av(a, 'sm')}${esc(first(a))}</span>`).join('')}</span>
    <span>Due</span><span class="num" style="${t.status === 'overdue' ? 'color:var(--bad);font-weight:600' : ''}">${fDT(t.due)} · ${t.status === 'done' ? 'completed ' + rel(t.completedAt) : dueTxt(t.due)}</span>
    <span>Progress</span><span class="row" style="flex-wrap:nowrap">${isA && t.status !== 'done' ? `<input type="range" min="0" max="100" step="5" value="${t.progress}" data-c="progress" data-id="${t.id}" data-live style="flex:1;accent-color:var(--primary)" aria-label="Progress">` : `<div class="bar"><i style="width:${t.status === 'done' ? 100 : t.progress}%"></i></div>`}<b class="num" style="width:40px;text-align:right">${t.status === 'done' ? 100 : t.progress}%</b></span>
    <span>Last update</span><span class="muted">${rel(t.lastUpdate)}</span>
  </div>
  ${t.desc ? `<div class="sec"><span class="tag">Description</span><p style="margin:0;line-height:1.6">${esc(t.desc)}</p></div>` : ''}
  ${t.deps.length ? `<div class="sec"><span class="tag">Depends on</span>${t.deps.map(dd => { const x = task(dd); return `<div class="row">${taskChip(dd)}<span class="ell" style="flex:1">${esc(x?.title || '')}</span>${x ? spill(x.status) : ''}</div>`; }).join('')}</div>` : ''}
  ${(() => { const dependents = S.tasks.filter(x => x.deps.includes(t.id)); return dependents.length ? `<div class="sec"><span class="tag">Blocking</span><div class="chips">${dependents.map(x => taskChip(x.id)).join('')}</div></div>` : ''; })()}
  <div class="sec"><span class="tag">Subtasks · ${t.subtasks.filter(s => s.done).length}/${t.subtasks.length}</span>${t.subtasks.map(s => `<label class="sub check ${s.done ? 'done' : ''}"><input type="checkbox" data-c="subtask" data-id="${t.id}" data-k="${s.id}" ${s.done ? 'checked' : ''} ${editable ? '' : 'disabled'}><span>${esc(s.t)}</span></label>`).join('')}
    ${editable ? `<form class="row" data-form="addSub" data-id="${t.id}"><input class="in" id="newsub-${t.id}" name="t" placeholder="Add a subtask" style="flex:1" required><button class="btn sm">Add</button></form>` : ''}</div>
  <div class="sec"><span class="tag">Attachments</span>${t.attachments.map(a => `<div class="file">${ic(a.url ? 'link' : 'clip').replace('<svg ', '<svg width="14" height="14" ')}${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name || a.url)}</a>` : (BLOBS[a.id] ? `<a href="${BLOBS[a.id]}" target="_blank" rel="noopener">${esc(a.name)}</a>` : esc(a.name))}${a.size ? `<span class="faint">${fSize(a.size)}</span>` : ''}</div>`).join('') || '<span class="faint">None</span>'}
    ${editable ? `<div class="row"><form class="row" data-form="addLink" data-id="${t.id}" style="flex:1"><input class="in" id="newlink-${t.id}" name="url" type="url" placeholder="https://" style="flex:1" required><button class="btn sm">Add link</button></form><button class="btn sm" data-a="attachTask" data-id="${t.id}">${ic('clip')}File</button></div>` : ''}</div>
  ${subs.length ? `<div class="sec"><span class="tag">Submissions</span>${subs.map(s => `<div class="li click" data-a="openSub" data-id="${s.id}" style="border:1px solid var(--line);border-radius:8px;padding:8px 10px"><b>v${s.version}</b><span class="grow muted" style="font-size:12.5px">${esc(first(s.by))} · ${fDT(s.at)}</span>${subPill(s.status)}</div>`).join('')}</div>` : ''}
  <div class="sec"><span class="tag">Comments</span>${t.comments.map(c => `<div class="msg">${av(c.who, 'sm', false)}<div class="bub"><div class="meta"><b>${esc(uname(c.who))}</b><span class="faint" style="font-size:11.5px">${rel(c.at)}</span></div><div class="txt">${fmtMsg(c.text)}</div></div></div>`).join('') || '<span class="faint">No comments yet</span>'}
    <form class="row" data-form="comment" data-id="${t.id}" style="align-items:flex-end"><textarea class="in" id="cmt-${t.id}" name="text" rows="2" placeholder="Write a comment. Use @Name to mention." style="flex:1" required></textarea><button class="btn">Post</button></form></div>
  <div class="sec"><span class="tag">Activity</span>${t.activity.slice().reverse().map(a => `<div class="row" style="font-size:12.5px;flex-wrap:nowrap;align-items:flex-start"><span class="faint num" style="width:68px;flex:none">${rel(a.at)}</span><span><b>${a.who === 'system' ? 'Northdesk' : esc(uname(a.who))}</b> ${esc(a.text)}</span></div>`).join('')}</div>
  ${can('task.delete') ? `<div>${UI.confirm === 'del:' + t.id ? `<span class="row"><b style="color:var(--bad)">Delete ${t.id}?</b><button class="btn danger" data-a="delTask" data-id="${t.id}">Delete</button><button class="btn" data-a="confirm" data-v="">Cancel</button></span>` : `<button class="btn ghost danger" data-a="confirm" data-v="del:${t.id}">${ic('trash')}Delete task</button>`}</div>` : ''}`;
  return [esc(t.title), body, ''];
}
function subDrawer(s) {
  if (!s) return ['Submission not found', ''];
  const t = task(s.task), all = S.submissions.filter(x => x.task === s.task).sort((a, b) => b.version - a.version);
  const reviewable = s.status === 'pending' && canReview(t) && s.by !== ME;
  const body = `<div class="row">${taskChip(s.task)}<b style="flex:1">${esc(t?.title)}</b>${spill(t?.status)}</div>
  ${reviewable ? `<form class="card" data-form="review" data-id="${s.id}" style="border-color:var(--primary-line)"><div class="bd form"><b>Review v${s.version}</b><textarea class="in" id="rev-${s.id}" name="comment" placeholder="Feedback for ${esc(first(s.by))} (required when requesting a revision)"></textarea><div class="row"><button class="btn primary" name="decision" value="approved">${ic('check')}Approve & complete task</button><button class="btn" name="decision" value="revision">Request revision</button></div></div></form>` : ''}
  ${all.map(x => `<div class="card" style="${x.id === s.id ? 'border-color:var(--primary)' : ''}"><div class="bd" style="display:flex;flex-direction:column;gap:8px"><div class="row"><b>Version ${x.version}</b>${subPill(x.status)}<span class="muted" style="font-size:12.5px;margin-left:auto">${esc(uname(x.by))} · ${fDT(x.at)}</span></div>${x.note ? `<p style="margin:0">${esc(x.note)}</p>` : ''}<div class="chips">${x.links.map(l => `<a class="file" href="${esc(l)}" target="_blank" rel="noopener">${ic('link').replace('<svg ', '<svg width="14" height="14" ')}${esc(l.replace(/^https?:\/\//, '').slice(0, 48))}</a>`).join('')}${x.files.map(f => `<span class="file">${ic('clip').replace('<svg ', '<svg width="14" height="14" ')}${BLOBS[f.id] ? `<a href="${BLOBS[f.id]}" target="_blank" rel="noopener">${esc(f.name)}</a>` : esc(f.name)}<span class="faint">${fSize(f.size)}</span></span>`).join('')}</div>
    ${x.reviews.map(r => `<div class="msg" style="background:var(--surface-2);border-radius:8px;padding:8px">${av(r.by, 'sm', false)}<div class="bub"><div class="meta"><b>${esc(uname(r.by))}</b><span class="pill ${r.decision === 'approved' ? 'green' : 'orange'}">${r.decision === 'approved' ? 'Approved' : 'Revision requested'}</span><span class="faint" style="font-size:11.5px">${fDT(r.at)}</span></div>${r.comment ? `<div class="txt">${esc(r.comment)}</div>` : ''}</div></div>`).join('')}</div></div>`).join('')}
  ${t && t.assignees.includes(ME) && ['revision', 'progress', 'overdue', 'todo'].includes(t.status) ? `<button class="btn primary" data-a="submitWork" data-id="${t.id}">${ic('submit')}Submit version ${all.length + 1}</button>` : ''}`;
  return [`${s.id} · ${esc(s.task)} v${s.version}`, body];
}
function meetingDrawer(m) {
  if (!m) return ['Meeting not found', ''];
  const t0 = now(), end = m.start + m.dur * MIN, my = m.attendees.find(a => a.id === ME), host = m.host === ME || role() !== 'employee';
  const status = t0 < m.start ? 'Starts ' + rel(m.start) : t0 < end ? 'Live now' : 'Ended ' + rel(end);
  const body = `<div class="row"><span class="pill ${t0 >= m.start && t0 < end ? 'green' : ''}">${status}</span><span class="muted">${fDT(m.start)} – ${fTime(end)} · ${m.dur} min</span></div>
  <div class="row">${t0 < end ? `<button class="btn primary" data-a="joinMeeting" data-id="${m.id}">${ic('voice')}Join ${esc(ROOMS.find(r => r.id === m.room)?.name || 'room')}</button>` : ''}${m.link ? `<button class="btn" data-a="copy" data-v="${esc(m.link)}">${ic('link')}Copy link</button>` : ''}</div>
  ${my && t0 < end ? `<div class="sec"><span class="tag">Your RSVP</span><div class="seg">${[['yes', 'Going'], ['maybe', 'Maybe'], ['no', 'Decline']].map(([k, l]) => `<button class="${my.rsvp === k ? 'on' : ''}" data-a="rsvp" data-id="${m.id}" data-v="${k}">${l}</button>`).join('')}</div></div>` : ''}
  ${m.agenda ? `<div class="sec"><span class="tag">Agenda</span><p style="margin:0;white-space:pre-wrap">${esc(m.agenda)}</p></div>` : ''}
  <div class="sec"><span class="tag">Participants · ${m.attendees.filter(a => a.rsvp === 'yes').length} going</span>${m.attendees.map(a => `<div class="row" style="flex-wrap:nowrap">${av(a.id, 'sm')}<span style="flex:1">${esc(uname(a.id))}${a.id === m.host ? ' <span class="faint">(host)</span>' : ''}</span><span class="pill ${{ yes: 'green', no: 'red', maybe: 'orange', pending: '' }[a.rsvp]}">${{ yes: 'Going', no: 'Declined', maybe: 'Maybe', pending: 'No reply' }[a.rsvp]}</span>${t0 >= m.start ? `<label class="check" style="font-size:12.5px"><input type="checkbox" data-c="attend" data-id="${m.id}" data-k="${a.id}" ${a.attended ? 'checked' : ''} ${host ? '' : 'disabled'}>Attended</label>` : ''}</div>`).join('')}</div>
  <form class="sec" data-form="notes" data-id="${m.id}"><span class="tag">Notes</span><textarea class="in" id="notes-${m.id}" name="notes" rows="6" placeholder="Decisions, open questions, who does what">${esc(m.notes)}</textarea><div class="row"><button class="btn sm">Save notes</button></div></form>
  <div class="sec"><span class="tag">AI summary</span><label class="check"><input type="checkbox" data-c="consent" data-id="${m.id}" ${m.consent ? 'checked' : ''}>All participants agreed to AI processing of these notes</label>
    <div class="row"><button class="btn sm" data-a="aiMeeting" data-id="${m.id}" ${m.consent && m.notes ? '' : 'disabled'}>${ic('spark')}Summarize & extract action items</button><span class="${CAP.sample ? 'live' : 'sim'}">${CAP.sample ? 'Claude' : 'Rule-based'}</span></div>
    ${m.summary ? `<div class="ai-out">${esc(m.summary)}</div>` : ''}</div>
  <div class="sec"><span class="tag">Action items</span>${m.actions.map((a, i) => `<div class="row" style="flex-wrap:nowrap;border:1px solid var(--line);border-radius:8px;padding:8px">${av(a.owner, 'sm', false)}<div style="flex:1;min-width:0"><b>${esc(a.text)}</b><div class="muted" style="font-size:12px">${esc(first(a.owner))} · due ${fDay(a.due)}</div></div>${a.task ? taskChip(a.task) : `<button class="btn sm primary" data-a="actionToTask" data-id="${m.id}" data-k="${i}">Create task</button>`}</div>`).join('') || '<span class="faint">None yet</span>'}
    <form class="row" data-form="addAction" data-id="${m.id}"><input class="in" id="act-${m.id}" name="text" placeholder="Action item" style="flex:2;min-width:140px" required><select class="in" name="owner" style="flex:1;min-width:110px">${m.attendees.map(a => `<option value="${a.id}">${esc(first(a.id))}</option>`).join('')}</select><input class="in" name="due" type="date" style="width:150px" value="${dIn(now() + 3 * DAY)}"><button class="btn sm">Add</button></form>
    ${m.actions.some(a => !a.task) ? `<button class="btn sm" data-a="allActions" data-id="${m.id}">Create tasks for all open items</button>` : ''}</div>`;
  return [esc(m.title), body];
}
function userDrawer(u) {
  if (!u) return ['', ''];
  const ts = S.tasks.filter(t => t.assignees.includes(u.id) && t.status !== 'done');
  const body = `<div class="row">${av(u.id, 'xl')}<div><h2 style="font-size:18px">${esc(u.name)}</h2><div class="muted">${esc(u.title)} · ${esc(dept(u.dept)?.name)}</div><div style="margin-top:4px">${presPill(u)}</div></div></div>
  ${u.id !== ME ? `<div class="row"><button class="btn primary" data-a="dm" data-id="${u.id}">${ic('chat')}Message</button><button class="btn" data-a="call" data-id="${u.id}">${ic('phone')}Call</button></div>` : ''}
  ${u.bio ? `<p style="margin:0">${esc(u.bio)}</p>` : ''}
  <div class="kv"><span>Email</span><span>${esc(u.email)}</span><span>Phone</span><span>${esc(u.phone)}</span><span>Role</span><span>${can('employees.manage') && u.id !== ME ? `<select class="in" style="width:auto" data-c="userRole" data-id="${u.id}" data-live>${['admin', 'manager', 'employee'].map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${cap(r)}</option>`).join('')}</select>` : cap(u.role)}</span>
  <span>Department</span><span>${can('employees.manage') ? `<select class="in" style="width:auto" data-c="userDept" data-id="${u.id}" data-live>${S.departments.map(d => `<option value="${d.id}" ${u.dept === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select>` : esc(dept(u.dept)?.name)}</span>
  <span>Time zone</span><span>${esc(u.tz)}</span><span>Room</span><span>${u.room ? esc(ROOMS.find(r => r.id === u.room)?.name) : '—'}</span></div>
  <div class="sec"><span class="tag">Open tasks · ${ts.length}</span>${ts.map(t => `<div class="row">${taskChip(t.id)}<span class="ell" style="flex:1">${esc(t.title)}</span>${spill(t.status)}</div>`).join('') || '<span class="faint">None</span>'}</div>`;
  return [esc(u.name), body];
}
function notifDrawer() {
  const all = myNotifs();
  const list = UI.notifTab === 'unread' ? all.filter(n => !n.read && !n.held) : UI.notifTab === 'held' ? all.filter(n => n.held) : all;
  const body = `${seg('notifTab', UI.notifTab, [['all', 'All'], ['unread', `Unread (${all.filter(n => !n.read && !n.held).length})`], ['held', `Held (${all.filter(n => n.held).length})`]])}
  ${UI.notifTab === 'held' && all.some(n => n.held) ? '<p class="muted" style="margin:0;font-size:12.5px">These arrived during Do Not Disturb or Focus. They are released when your quiet time ends.</p>' : ''}
  <div class="list" style="margin:0 -16px">${list.slice(0, 80).map(notifRow).join('') || empty('Nothing here')}</div>`;
  return ['Notifications', body, `<button class="btn sm ghost" data-a="readAll">Mark all read</button>`];
}
function aiDrawer() {
  const a = UI.ai;
  const body = `<div class="row"><span class="${CAP.sample ? 'live' : 'sim'}">${CAP.sample ? 'Connected to Claude' : 'Offline rules'}</span><span class="muted" style="font-size:12.5px">${CAP.sample ? 'Your workspace data is sent to Claude only when you ask.' : 'Open on claude.ai to use Claude. Rule-based answers for now.'}</span></div>
  <div class="grid g2" style="gap:8px"><button class="btn" data-a="aiRisk">${ic('alert')}Find tasks at risk</button><button class="btn" data-a="aiWeekly">${ic('reports')}Weekly report</button>
  <button class="btn" data-a="aiChatTasks">${ic('chat')}Tasks from #${esc((S.chats.find(c => c.id === UI.chat) || {}).name || 'chat')}</button><button class="btn" data-a="aiMeetingPick">${ic('video')}Summarize last meeting</button></div>
  <form class="sec" data-form="ask"><label class="f">Ask about your workspace<textarea class="in" id="aiq" name="q" rows="3" placeholder="What should I focus on today? Who can pick up T-104? Find the leave policy."></textarea></label><div><button class="btn primary" ${a.busy ? 'disabled' : ''}>${ic('spark')}${a.busy ? 'Thinking…' : 'Ask'}</button></div></form>
  ${a.busy ? '<div class="skel"></div><div class="skel" style="width:70%"></div>' : a.out ? `<div class="sec"><span class="tag">${esc(a.src || 'Answer')}</span><div class="ai-out">${esc(a.out)}</div></div>` : ''}
  ${a.tasks && a.tasks.length ? `<div class="sec"><span class="tag">Suggested tasks</span>${a.tasks.map((t, i) => `<label class="check" style="border:1px solid var(--line);border-radius:8px;padding:8px"><input type="checkbox" data-c="aiTaskPick" data-k="${i}" ${t.pick !== false ? 'checked' : ''}><span style="flex:1"><b>${esc(t.title)}</b><span class="muted" style="font-size:12px;display:block">${esc(uname(t.assignee))} · due ${fDay(t.due)} · ${PRI[t.priority]?.l || 'Medium'}</span></span></label>`).join('')}<button class="btn primary" data-a="aiCreateTasks">Create selected tasks</button></div>` : ''}`;
  return ['Assistant', body];
}
