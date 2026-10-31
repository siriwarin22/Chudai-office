'use strict';
/* ================= utilities ================= */
const MIN = 6e4, HOUR = 36e5, DAY = 864e5;
const now = () => Date.now();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rid = p => p + Math.random().toString(36).slice(2, 8);
const pad = n => String(n).padStart(2, '0');
const sod = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return +d; };
const dayDiff = t => Math.round((sod(t) - sod(now())) / DAY);
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fTime = t => { const d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
const fDay = t => { const d = new Date(t); return LANG === 'th' ? d.getDate() + ' ' + MON[d.getMonth()] : MON[d.getMonth()] + ' ' + d.getDate(); };
const fDate = t => WD[new Date(t).getDay()] + (LANG === 'th' ? ' ' : ', ') + fDay(t);
const fDT = t => fDate(t) + ' · ' + fTime(t);
const rel = t => {
  const s = (now() - t) / 1000, a = Math.abs(s), th = LANG === 'th';
  if (a < 45) return th ? 'เมื่อสักครู่' : 'just now';
  const v = a < 3600 ? Math.round(a / 60) + (th ? ' นาที' : 'm') : a < 86400 ? Math.round(a / 3600) + (th ? ' ชม.' : 'h') : Math.round(a / 86400) + (th ? ' วัน' : 'd');
  return th ? (s > 0 ? v + 'ที่แล้ว' : 'อีก ' + v) : (s > 0 ? v + ' ago' : 'in ' + v);
};
const dueTxt = t => { const d = dayDiff(t); if (LANG === 'th') return d === 0 ? 'วันนี้' : d === 1 ? 'พรุ่งนี้' : d === -1 ? 'เมื่อวาน' : d > 0 ? 'อีก ' + d + ' วัน' : 'เลยกำหนด ' + (-d) + ' วัน'; return d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : d === -1 ? 'Yesterday' : d > 0 ? 'in ' + d + ' days' : (-d) + ' days late'; };
const fSize = b => b >= 1e6 ? (b / 1e6).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1e3)) + ' KB';
const dIn = t => { const d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
const parseDT = (d, t = '09:00') => +new Date(d + 'T' + (t || '09:00'));
const mmss = ms => { ms = Math.max(0, ms); const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + ':' + pad(m) : m) + ':' + pad(s % 60); };
const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const pick = a => a[Math.floor(Math.random() * a.length)];
const uniq = a => [...new Set(a)];

const STAT = {
  todo: { l: 'To Do', c: '' }, progress: { l: 'In Progress', c: 'blue' }, review: { l: 'Pending Review', c: 'violet' },
  revision: { l: 'Revision Required', c: 'orange' }, done: { l: 'Completed', c: 'green' }, overdue: { l: 'Overdue', c: 'red' },
};
const STAT_ORDER = ['todo', 'progress', 'review', 'revision', 'done', 'overdue'];
const PRI = { urgent: { l: 'Urgent', c: 'red', w: 4 }, high: { l: 'High', c: 'orange', w: 3 }, medium: { l: 'Medium', c: 'blue', w: 2 }, low: { l: 'Low', c: '', w: 1 } };
const PRES = {
  online: { l: 'Online', c: 'var(--ok)' }, busy: { l: 'Busy', c: 'var(--warn)' }, dnd: { l: 'Do Not Disturb', c: 'var(--bad)' },
  focus: { l: 'Focus', c: 'var(--violet)' }, meeting: { l: 'In Meeting', c: 'var(--primary)' }, away: { l: 'Away', c: 'var(--amber)' }, offline: { l: 'Offline', c: 'var(--faint)' },
};
const TEMP = ['dnd', 'focus', 'meeting', 'away'];
const ROOMS = [
  { id: 'general', name: 'General', icon: 'office', desc: 'Open floor for everyone' },
  { id: 'design', name: 'Design', icon: 'pen', desc: 'Crits, pairing and asset reviews' },
  { id: 'dev', name: 'Development', icon: 'code', desc: 'Engineering co-working' },
  { id: 'marketing', name: 'Marketing', icon: 'megaphone', desc: 'Campaign war room' },
  { id: 'meeting', name: 'Meeting Room', icon: 'video', desc: 'Scheduled meetings join here' },
  { id: 'private', name: 'Private', icon: 'lock', desc: 'Managers and invited guests', locked: true },
  { id: 'focus', name: 'Focus Room', icon: 'target', desc: 'Silent co-working. Joining starts Focus.' },
];
const NTYPES = {
  assigned: 'Task assigned to me', reminder: 'Deadline reminders', overdue: 'Overdue tasks', stale: 'Tasks without updates (managers)',
  review: 'Submissions to review', result: 'Review results', chat: 'Mentions and direct messages', meeting: 'Meeting invites and reminders',
  announce: 'Announcements', call: 'Calls and missed calls', leave: 'Leave requests', request: 'Internal requests', system: 'Status and focus',
};

/* ================= icons ================= */
const IC = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  office: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  tasks: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  projects: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9L9.6 3.9A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M8 10v4M12 10v2M16 10v6"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  voice: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  submit: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 15l2 2 4-4"/>',
  alarm: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3 2 6M22 6l-3-3"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  files: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  reports: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  micoff: '<path d="m2 2 20 20M18.9 13.4A7 7 0 0 0 19 12v-2M5 10v2a7 7 0 0 0 12 5M15 9.3V5a3 3 0 0 0-5.7-1.3M9 9v3a3 3 0 0 0 5.1 2.1M12 19v3"/>',
  headoff: '<path d="m2 2 20 20"/><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 2.6-6.4M21 17v-5a9 9 0 0 0-12.4-8.3"/>',
  screen: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  spark: '<path d="M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  clip: '<path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  alert: '<path d="m10.3 3.9-8.2 14a2 2 0 0 0 1.7 3h16.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
};
const ic = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ================= state ================= */
const KEY = 'northdesk.v2', MEKEY = 'northdesk.me';
let S, ME = '';
try { ME = localStorage.getItem(MEKEY) || ''; } catch (e) {}
function loadState() {
  try { const j = localStorage.getItem(KEY); if (j) { const s = JSON.parse(j); if (s && s.v === 2) { S = s; return 'restored'; } } } catch (e) {}
  S = NDSeed(); return 'seeded';
}
const BLOBS = {}; // object URLs for files picked in this session
const UI = {
  route: 'dashboard', drawer: null, tabs: {}, taskView: 'list', taskScope: null, tf: { status: '', priority: '', project: '' },
  proj: null, projView: 'kanban', cal: { view: 'month', date: now(), scope: 'my', kinds: { meeting: 1, task: 1, milestone: 1, company: 1, personal: 1, leave: 1 } },
  chat: 'c-general', folder: 'All', kb: 'K-1', dir: { dept: '', status: '' }, notifTab: 'all', ai: { out: '', busy: false, tasks: null, src: '' },
  call: null, sideOpen: false, presTab: 'all', confirm: null, subTab: null, lastSearch: '',
};
const tabId = rid('tab');
let LEADER = true;
const peers = new Map();
const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('northdesk-sync') : null;
let persistT = null;
function persist() {
  clearTimeout(persistT);
  persistT = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    try { bc && bc.postMessage({ t: 'state', s: S, from: tabId }); } catch (e) {}
  }, 120);
}
function commit() { persist(); render(); }
if (bc) bc.onmessage = (e) => {
  const d = e.data || {};
  if (d.t === 'state' && d.s) { S = d.s; render(); }
  if (d.t === 'hb') { peers.set(d.from, now()); electLeader(); }
};
function electLeader() {
  for (const [k, v] of peers) if (now() - v > 7000) peers.delete(k);
  LEADER = [...peers.keys(), tabId].sort()[0] === tabId;
}
setInterval(() => { try { bc && bc.postMessage({ t: 'hb', from: tabId }); } catch (e) {} electLeader(); }, 3000);

/* ================= lookups ================= */
const user = id => S.users.find(u => u.id === id);
const me = () => user(ME) || S.users[0] || GHOST;
const GHOST = { id: '', name: 'Guest', title: '', dept: 'ops', role: 'employee', color: '#7b8796', status: 'online', room: null, visibility: 'everyone', email: '', phone: '', tz: '', bio: '' };
const uname = id => id === 'system' ? 'Northdesk' : (user(id)?.name || 'Someone');
const first = id => uname(id).split(' ')[0];
const dept = id => S.departments.find(d => d.id === id);
const task = id => S.tasks.find(t => t.id === id);
const proj = id => S.projects.find(p => p.id === id);
const meeting = id => S.meetings.find(m => m.id === id);
const role = () => me().role;
const can = p => !!(S.perms[p] && S.perms[p][role()]);
const prefs = uid => {
  S.prefs[uid] = S.prefs[uid] || { types: {}, toasts: true, emergency: [], dndSched: { on: false, from: '12:00', to: '13:00', days: [1, 2, 3, 4, 5] }, breaks: true, autoMeeting: true };
  return S.prefs[uid];
};
const initials = n => n.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
function shownStatus(u) {
  if (!u) return 'offline';
  if (u.id === ME) return u.status;
  const v = u.visibility || 'everyone', m = me();
  if (v === 'hidden') return 'offline';
  if (v === 'dept' && m.dept !== u.dept) return 'offline';
  if (v === 'managers' && m.role === 'employee') return 'offline';
  return u.status;
}
const pdot = s => `<span class="dot" style="background:${PRES[s]?.c || 'var(--faint)'}"></span>`;
function av(id, size = '', presence = true) {
  const u = user(id); if (!u) return '';
  const s = shownStatus(u);
  return `<span class="av ${size}" style="background:${u.color}" title="${esc(u.name)} · ${PRES[s].l}">${initials(u.name)}${presence ? `<span class="pd" style="background:${PRES[s].c}"></span>` : ''}</span>`;
}
const avs = (ids, size = 'sm', max = 4) => `<span class="stack">${ids.slice(0, max).map(i => av(i, size, false)).join('')}${ids.length > max ? `<span class="av ${size}" style="background:var(--slate)">+${ids.length - max}</span>` : ''}</span>`;
const spill = s => `<span class="pill ${STAT[s]?.c || ''}">${STAT[s]?.l || s}</span>`;
const ppill = p => `<span class="pill ${PRI[p]?.c || ''}">${PRI[p]?.l || p}</span>`;
const presPill = (u) => { const s = shownStatus(u); return `<span class="pill" style="color:${PRES[s].c}">${pdot(s)}${PRES[s].l}${u.statusUntil && s === u.status && TEMP.includes(s) ? ' · until ' + fTime(u.statusUntil) : ''}</span>`; };
const taskChip = id => { const t = task(id); return `<button type="button" class="tlink" data-a="openTask" data-id="${esc(id)}" title="${esc(t?.title || 'Task not found')}">${ic('tasks')}${esc(id)}</button>`; };
const empty = (title, body = '', action = '') => `<div class="empty"><b>${esc(title)}</b>${esc(body)}${action ? '<div style="margin-top:10px">' + action + '</div>' : ''}</div>`;

function isBlocked(t) { return (t.deps || []).some(d => task(d) && task(d).status !== 'done'); }
function projProgress(p) {
  const ts = S.tasks.filter(t => t.project === p.id); if (!ts.length) return 0;
  return Math.round(ts.reduce((a, t) => a + (t.status === 'done' ? 100 : t.progress || 0), 0) / ts.length);
}
function scopeTasks(scope) {
  const m = me();
  if (scope === 'mine') return S.tasks.filter(t => t.assignees.includes(ME));
  if (scope === 'review') return S.tasks.filter(t => t.reviewers.includes(ME));
  if (scope === 'team') return S.tasks.filter(t => t.dept === m.dept || t.assignees.some(a => user(a)?.dept === m.dept) || t.reviewers.includes(ME));
  return S.tasks.slice();
}
function defaultScope() { const r = role(); return r === 'employee' ? 'mine' : r === 'manager' ? 'team' : 'all'; }
const deptHead = d => dept(d)?.head;

/* ================= activity & notifications ================= */
function log(who, text, link) { S.activity.unshift({ at: now(), who, text, link }); S.activity.length = Math.min(S.activity.length, 200); }
function isQuiet(uid) { const u = user(uid); return !!u && (u.status === 'dnd' || u.status === 'focus'); }
function notify(to, n) {
  uniq([].concat(to).filter(Boolean)).forEach(uid => {
    if (n.from && uid === n.from) return;
    const p = prefs(uid);
    const muted = p.types[n.type] === false && !n.essential;
    const bypass = n.from && (p.emergency || []).includes(n.from);
    const held = isQuiet(uid) && !n.essential && !bypass;
    const item = { id: rid('n'), to: uid, type: n.type, title: n.title, body: n.body || '', at: now(), read: false, link: n.link || null, held, muted, from: n.from || null, essential: !!n.essential };
    S.notifs.unshift(item);
    if (uid === ME && !held && !muted && p.toasts !== false) toast(n.title, n.body, n.tone || 'info', n.link);
  });
  if (S.notifs.length > 400) S.notifs.length = 400;
}
const myNotifs = () => S.notifs.filter(n => n.to === ME);
const unreadCount = () => myNotifs().filter(n => !n.read && !n.held).length;

/* ================= toasts, overlays ================= */
function toast(title, body = '', tone = 'info', link = null) {
  const el = document.createElement('div');
  el.className = 'toast ' + (tone === 'info' ? '' : tone);
  el.innerHTML = `<div style="flex:1;min-width:0"><b>${esc(title)}</b>${body ? `<div class="muted" style="font-size:13px">${esc(body)}</div>` : ''}</div><button class="btn ghost icon sm" aria-label="Dismiss">${ic('x')}</button>`;
  el.querySelector('button').onclick = (e) => { e.stopPropagation(); el.remove(); };
  if (link) { el.style.cursor = 'pointer'; el.onclick = () => { followLink(link); el.remove(); }; }
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 5000);
  while ($('#toasts').children.length > 3) $('#toasts').firstChild.remove();
}
function openModal(title, body, foot, opts = {}) {
  $('#overlay').innerHTML = `<div class="scrim" data-scrim="1"><form class="modal ${opts.wide ? 'wide' : ''}" data-form="${opts.form || ''}" ${opts.data || ''} role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="hd"><h2>${esc(title)}</h2><button type="button" class="btn ghost icon" data-a="closeModal" aria-label="Close">${ic('x')}</button></div>
    <div class="bd">${body}</div>${foot ? `<div class="ft">${foot}</div>` : ''}</form></div>`;
  setTimeout(() => { const f = $('#overlay input:not([type=hidden]):not([type=checkbox]), #overlay textarea'); f && f.focus(); }, 30);
}
function closeModal() { $('#overlay').innerHTML = ''; }
function openDrawer(type, id) { UI.drawer = { type, id }; render(); }
function closeDrawer() { UI.drawer = null; UI.confirm = null; render(); }
function openPop(anchor, html) {
  const r = anchor.getBoundingClientRect();
  const pop = $('#pop');
  pop.innerHTML = `<div class="pop" role="menu">${html}</div>`;
  const el = pop.firstChild; const w = Math.max(250, el.offsetWidth);
  el.style.top = Math.min(r.bottom + 6, innerHeight - el.offsetHeight - 8) + 'px';
  el.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + 'px';
}
const closePop = () => { $('#pop').innerHTML = ''; };

/* ================= status engine ================= */
function setTemp(u, s, until, auto) {
  if (!TEMP.includes(u.status)) u.prevStatus = u.status;
  else if (!u.prevStatus) u.prevStatus = 'online';
  u.status = s; u.statusUntil = until || null; u.auto = auto || null;
}
function restore(u) {
  const was = u.status, f = u.focus;
  u.status = u.prevStatus && !TEMP.includes(u.prevStatus) ? u.prevStatus : 'online';
  u.prevStatus = null; u.statusUntil = null; u.auto = null; u.focus = null;
  if (u.id === ME) {
    if (was === 'dnd' || was === 'focus') releaseHeld(was);
    if (was === 'focus' && f && prefs(ME).breaks) notify(ME, { type: 'system', title: 'Focus session complete', body: `${f.mins} minutes done. Take a 5 minute break before the next one.`, tone: 'ok', essential: true });
    if (u.room === 'focus' && was === 'focus') { u.room = null; S.voice.room = null; }
  }
}
function setStatus(s) {
  const u = me();
  if (s === 'dnd' || s === 'focus' || s === 'away' || s === 'meeting') { setTemp(u, s, null, 'manual'); }
  else { if (TEMP.includes(u.status) && (u.status === 'dnd' || u.status === 'focus')) { u.prevStatus = s; restore(u); } u.status = s; u.prevStatus = null; u.statusUntil = null; u.auto = null; u.focus = null; }
  log(ME, 'set status to ' + PRES[s].l); commit();
}
function startDND(mins, label) {
  const u = me(); setTemp(u, 'dnd', mins ? now() + mins * MIN : null, 'manual');
  toast('Do Not Disturb is on', mins ? `Until ${fTime(u.statusUntil)}. Messages are kept for later.` : 'Until you turn it off.', 'info');
  log(ME, 'turned on Do Not Disturb'); commit();
}
function startFocus(mins) {
  const u = me(); setTemp(u, 'focus', now() + mins * MIN, 'focus');
  u.focus = { start: now(), mins };
  toast('Focus mode started', `${mins} minutes. Do Not Disturb is on and teammates can see you are focusing.`, 'ok');
  log(ME, `started a ${mins} min focus session`); commit();
}
function endQuiet() { restore(me()); commit(); }
function releaseHeld(was) {
  const held = S.notifs.filter(n => n.to === ME && n.held);
  held.forEach(n => n.held = false);
  if (held.length) toast(`${held.length} notification${held.length > 1 ? 's' : ''} arrived while you were ${was === 'focus' ? 'focusing' : 'in Do Not Disturb'}`, 'Open the bell to catch up.', 'info', { route: 'notifs' });
  else toast(was === 'focus' ? 'Focus ended' : 'Do Not Disturb ended', 'Your previous status is back.', 'ok');
}

/* ================= task workflow ================= */
function changeTaskStatus(t, s, who = ME, silent) {
  if (t.status === s) return true;
  if (['progress', 'review', 'done'].includes(s) && isBlocked(t)) {
    if (!silent) toast(`${t.id} is blocked`, 'Finish its dependencies first: ' + t.deps.filter(d => task(d)?.status !== 'done').join(', '), 'warn');
    return false;
  }
  const isRev = t.reviewers.includes(who) || (user(who)?.role !== 'employee');
  if (s === 'done' && !isRev) { if (!silent) toast('Submit work for review', 'A reviewer approves the task to complete it.', 'warn'); return false; }
  const old = t.status; t.status = s; t.lastUpdate = now();
  if (s === 'done') { S.users.forEach(u => { if (u.doing && u.doing.task === t.id) u.doing = null; }); t.completedAt = now(); t.progress = 100; unblockNotify(t); notify(t.assignees, { type: 'result', title: `${t.id} marked complete`, body: t.title, link: { task: t.id }, from: who, tone: 'ok' }); }
  if (s === 'progress' && old === 'todo' && !t.progress) t.progress = 5;
  t.activity.push({ at: now(), who, text: `moved from ${STAT[old].l} to ${STAT[s].l}` });
  log(who, `moved ${t.id} to ${STAT[s].l}`, { task: t.id });
  return true;
}
function unblockNotify(t) {
  S.tasks.filter(x => (x.deps || []).includes(t.id) && !isBlocked(x)).forEach(x => notify(x.assignees, { type: 'assigned', title: `${x.id} is unblocked`, body: `${t.id} is complete, you can start "${x.title}".`, link: { task: x.id } }));
}
function createTask(d, who = ME) {
  const num = Math.max(100, ...S.tasks.map(t => +t.id.slice(2))) + 1;
  const t = {
    id: 'T-' + num, title: d.title, project: d.project || null, dept: d.dept || user(d.assignees?.[0] || who)?.dept || me().dept,
    assignees: d.assignees?.length ? d.assignees : [who], reviewers: d.reviewers?.length ? d.reviewers : [deptHead(user(who).dept) || who],
    priority: d.priority || 'medium', status: 'todo', due: d.due || now() + 3 * DAY, progress: 0, desc: d.desc || '', subtasks: (d.subtasks || []).map(x => ({ id: rid('s'), t: x, done: false })),
    deps: d.deps || [], attachments: d.attachments || [], comments: [], created: now(), createdBy: who, lastUpdate: now(), completedAt: null, flags: {},
    activity: [{ at: now(), who, text: 'created this task' + (d.fromMeeting ? ' from meeting ' + d.fromMeeting : '') + (d.fromChat ? ' from a chat message' : '') }], fromMeeting: d.fromMeeting || null,
  };
  S.tasks.push(t);
  notify(t.assignees, { type: 'assigned', title: `New task: ${t.id}`, body: `${uname(who)} assigned "${t.title}", due ${fDay(t.due)}.`, link: { task: t.id }, from: who });
  log(who, `created ${t.id} and assigned ${t.assignees.map(first).join(', ')}`, { task: t.id });
  return t;
}
function submitWork(t, d) {
  const prev = S.submissions.filter(s => s.task === t.id);
  const sub = { id: 'S-' + (S.submissions.length + 1 + Math.floor(Math.random() * 0)), task: t.id, version: prev.length + 1, by: ME, at: now(), status: 'pending', note: d.note, links: d.links, files: d.files, reviews: [] };
  while (S.submissions.some(s => s.id === sub.id)) sub.id = 'S-' + (+sub.id.slice(2) + 1);
  prev.forEach(p => { if (p.status === 'pending') p.status = 'superseded'; });
  S.submissions.push(sub);
  const old = t.status; t.status = 'review'; t.lastUpdate = now(); t.progress = Math.max(t.progress, 90);
  t.activity.push({ at: now(), who: ME, text: `submitted version ${sub.version} for review (was ${STAT[old].l})` });
  notify(t.reviewers, { type: 'review', title: `New submission: ${t.id} v${sub.version}`, body: `${uname(ME)} submitted "${t.title}".`, link: { sub: sub.id }, from: ME });
  log(ME, `submitted ${t.id} v${sub.version} for review`, { task: t.id });
  return sub;
}
function reviewSub(sub, decision, comment) {
  const t = task(sub.task);
  sub.reviews.push({ by: ME, at: now(), decision, comment });
  sub.status = decision === 'approved' ? 'approved' : 'revision';
  if (decision === 'approved') {
    t.status = 'done'; t.completedAt = now(); t.progress = 100; t.lastUpdate = now(); S.users.forEach(u => { if (u.doing && u.doing.task === t.id) u.doing = null; });
    t.activity.push({ at: now(), who: ME, text: `approved v${sub.version}. Task completed.` });
    notify(t.assignees, { type: 'result', title: `${t.id} approved`, body: comment || 'Your work was approved and the task is complete.', link: { task: t.id }, from: ME, tone: 'ok' });
    unblockNotify(t);
    log(ME, `approved ${t.id} v${sub.version}`, { task: t.id });
  } else {
    t.status = 'revision'; t.lastUpdate = now();
    t.activity.push({ at: now(), who: ME, text: `requested a revision on v${sub.version}` });
    notify(t.assignees, { type: 'result', title: `Revision requested on ${t.id}`, body: comment, link: { task: t.id }, from: ME, tone: 'warn' });
    log(ME, `requested a revision on ${t.id}`, { task: t.id });
  }
}
const canReview = t => t && (t.reviewers.includes(ME) || (can('review') && (role() === 'admin' || t.dept === me().dept)));

/* ================= automation loop ================= */
let lastAct = now();
['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => {
  lastAct = now();
  const u = S && user(ME); if (u && u.status === 'away' && u.auto === 'idle') { restore(u); toast('Welcome back', 'Status set to ' + PRES[u.status].l, 'ok'); commit(); }
}, { passive: true }));

function dateKey(t = now()) { return dIn(t); }
function runFollowups(force) {
  const f = S.followup, t0 = now(), dk = dateKey(); let n = 0;
  S.tasks.forEach(t => {
    if (t.status === 'done') return;
    t.flags = t.flags || {};
    const dd = dayDiff(t.due);
    [[3, 'd3'], [1, 'd1'], [0, 'd0']].forEach(([k, key]) => {
      if (f[key] && dd === k && t.due > t0 && t.status !== 'review' && !t.flags['r' + k]) {
        t.flags['r' + k] = dk; n++;
        notify(t.assignees, { type: 'reminder', title: k === 0 ? `${t.id} is due today at ${fTime(t.due)}` : `${t.id} is due in ${k} day${k > 1 ? 's' : ''}`, body: t.title, link: { task: t.id }, tone: 'warn' });
      }
    });
    if (t.due < t0 && ['todo', 'progress', 'revision', 'overdue'].includes(t.status)) {
      if (t.status !== 'overdue') { t.activity.push({ at: t0, who: 'system', text: 'marked Overdue automatically' }); t.status = 'overdue'; }
      const again = f.frequency === 'daily' ? t.flags.overdue !== dk : !t.flags.overdue;
      if (again) {
        t.flags.overdue = dk; n++;
        notify(t.assignees, { type: 'overdue', title: `${t.id} is overdue`, body: `"${t.title}" was due ${fDay(t.due)}.`, link: { task: t.id }, tone: 'bad' });
        if (f.notifyManagers) notify(uniq(t.reviewers.concat(deptHead(t.dept) || [])), { type: 'overdue', title: `Delayed: ${t.id} (${t.assignees.map(first).join(', ')})`, body: t.title, link: { task: t.id }, tone: 'bad' });
      }
      const late = (t0 - t.due) / DAY;
      if (late >= f.escalateAfter && !t.flags.esc) {
        t.flags.esc = dk; t.escalated = true; n++;
        const lead = deptHead(t.dept);
        notify(lead, { type: 'overdue', title: `Escalated: ${t.id} is ${Math.floor(late)} day(s) late`, body: `Assigned to ${t.assignees.map(uname).join(', ')}. Escalated automatically.`, link: { task: t.id }, tone: 'bad' });
        t.activity.push({ at: t0, who: 'system', text: `escalated to ${uname(lead)} (team lead)` });
        log('system', `escalated ${t.id} to ${uname(lead)}`, { task: t.id });
      }
    }
    if (['progress', 'overdue', 'revision'].includes(t.status) && t0 - t.lastUpdate > f.staleDays * DAY && t.flags.stale !== dk && (!t.flags.stale || f.frequency === 'daily' || force)) {
      t.flags.stale = dk; n++;
      notify(uniq(t.reviewers.concat(deptHead(t.dept) || [])), { type: 'stale', title: `No progress on ${t.id} for ${Math.floor((t0 - t.lastUpdate) / DAY)} days`, body: `${t.title} · ${t.assignees.map(uname).join(', ')}`, link: { task: t.id }, tone: 'warn' });
    }
  });
  return n;
}
function tick() {
  if (!S || !user(ME)) return;
  const t0 = now(); let ch = false;
  S.users.forEach(u => { if (u.statusUntil && u.statusUntil <= t0) { restore(u); ch = true; } });
  const m = me(), p = prefs(ME);
  // scheduled DND
  if (p.dndSched.on && p.dndSched.days.includes(new Date().getDay())) {
    const d = dIn(t0), from = parseDT(d, p.dndSched.from), to = parseDT(d, p.dndSched.to);
    if (t0 >= from && t0 < to && !['dnd', 'focus'].includes(m.status) && m.flagSched !== d) {
      m.flagSched = d; setTemp(m, 'dnd', to, 'schedule'); ch = true;
      toast('Scheduled Do Not Disturb', `On until ${p.dndSched.to}.`, 'info');
    }
  }
  // meetings: reminders + automatic In Meeting
  S.meetings.forEach(mt => {
    const end = mt.start + mt.dur * MIN;
    if (!mt.reminded && mt.start > t0 && mt.start - t0 <= 10 * MIN && LEADER) {
      mt.reminded = true; ch = true;
      notify(mt.attendees.filter(a => a.rsvp !== 'no').map(a => a.id), { type: 'meeting', title: `${mt.title} starts at ${fTime(mt.start)}`, body: 'Join from Meetings or the Meeting Room.', link: { meeting: mt.id } });
    }
    mt.attendees.forEach(a => {
      const u = user(a.id); if (!u || a.rsvp === 'no') return;
      if (u.id === ME && !prefs(ME).autoMeeting) return;
      if (t0 >= mt.start && t0 < end && ['online', 'busy', 'away'].includes(u.status) && (u.id === ME || LEADER)) { setTemp(u, 'meeting', end, 'meeting'); ch = true; }
    });
  });
  // auto away
  if (m.status === 'online' && t0 - lastAct > (S.workspace.autoAway || 5) * MIN) { setTemp(m, 'away', null, 'idle'); ch = true; }
  if (LEADER) { if (runFollowups()) ch = true; if (S.workspace.simulate && simulate()) ch = true; }
  if (ch) commit();
}

/* ================= simulated teammates ================= */
const SIM_LINES = {
  'c-general': ['Lunch run to the noodle place at 12:30, who is in?', 'The meeting room TV works again.', 'Reminder: offsite sign-up closes Friday.', 'Thanks for the cake, Marketing!'],
  'c-dev': ['Staging deploy is green.', 'PR for the limiter middleware is ready for a second pair of eyes.', 'Flaky test in checkout_spec fixed.', 'Anyone seen the new crash in the Android build?'],
  'c-design': ['Uploaded the dark-mode variants.', 'Quick crit at 3pm in the Design room?', 'Updated the icon set to 1.5px strokes.'],
  'c-marketing': ['CTR on the teaser ads is 2.4%, above target.', 'Press list is finalised.', 'Need approval on the email subject lines.'],
  'g-launch': ['Motion set is rendering now.', 'Media plan v3 is in the File Center.'],
};
const DM_REPLIES = ['Got it, thanks!', 'Sure, give me 10 minutes.', 'Sounds good. I will update the task.', 'Can we talk about it after lunch?', 'On it 👍', 'Thanks, looking now.'];
let simCount = 0;
function simulate() {
  if (Math.random() > 0.55) return false;
  simCount++;
  const others = S.users.filter(u => u.id !== ME && u.status !== 'offline');
  const u = pick(others); if (!u) return false;
  const r = Math.random();
  if (r < 0.3) {
    if (TEMP.includes(u.status) && u.statusUntil) return false;
    const s = pick(['online', 'online', 'busy', 'away', 'focus']);
    if (s === 'focus') { setTemp(u, 'focus', now() + 25 * MIN, 'focus'); u.focus = { start: now(), mins: 25 }; u.room = 'focus'; }
    else { u.status = s; u.prevStatus = null; u.statusUntil = null; u.auto = null; }
  } else if (r < 0.55) {
    u.room = pick([null, 'general', u.dept === 'ops' ? 'general' : u.dept, 'meeting', null]);
  } else if (r < 0.8) {
    const chans = S.chats.filter(c => c.kind !== 'dm' && (c.members === 'all' || c.members === u.dept || (Array.isArray(c.members) && c.members.includes(u.id))));
    const c = pick(chans); if (!c || !SIM_LINES[c.id]) return false;
    S.messages.push({ id: rid('msg'), chat: c.id, from: u.id, at: now(), text: pick(SIM_LINES[c.id]) });
  } else if (r < 0.97) {
    const ts = S.tasks.filter(t => t.status === 'progress' && !t.assignees.includes(ME) && t.assignees.includes(u.id));
    const t = pick(ts); if (!t) return false;
    t.progress = Math.min(95, (t.progress || 0) + 5 + Math.floor(Math.random() * 10)); t.lastUpdate = now();
    t.activity.push({ at: now(), who: u.id, text: `updated progress to ${t.progress}%` });
    log(u.id, `updated ${t.id} to ${t.progress}%`, { task: t.id });
  } else if (!UI.call && !S.voice.room) {
    incomingCall(u.id);
  }
  return true;
}

/* ================= calls (simulated media) ================= */
function incomingCall(from) {
  const p = prefs(ME), m = me();
  if (isQuiet(ME) && !(p.emergency || []).includes(from)) {
    notify(ME, { type: 'call', title: `Missed call from ${uname(from)}`, body: `Declined automatically during ${PRES[m.status].l}.`, link: { dm: from }, from });
    commit(); return;
  }
  UI.call = { from, state: 'ringing', at: now() };
  renderCall();
  clearTimeout(UI.callT);
  UI.callT = setTimeout(() => { if (UI.call && UI.call.state === 'ringing') { UI.call = null; renderCall(); notify(ME, { type: 'call', title: `Missed call from ${uname(from)}`, link: { dm: from }, from, tone: 'warn' }); commit(); } }, 20000);
}
function outgoingCall(to) {
  const u = user(to);
  if (isQuiet(to) && !(prefs(to).emergency || []).includes(ME)) {
    notify(to, { type: 'call', title: `Missed call from ${uname(ME)}`, link: { dm: ME }, from: ME });
    toast(`${u.name} is in ${PRES[u.status].l}`, 'They will see a missed call when they are back. Send a message instead?', 'warn', { dm: to });
    commit(); return;
  }
  if (u.status === 'offline') { toast(`${u.name} is offline`, 'Leave a message and they will see it next time.', 'warn', { dm: to }); return; }
  UI.call = { from: to, state: 'calling', at: now(), out: true };
  renderCall();
  clearTimeout(UI.callT);
  UI.callT = setTimeout(() => { if (UI.call && UI.call.state === 'calling') { UI.call.state = 'active'; UI.call.at = now(); renderCall(); } }, 2500);
}
function renderCall() {
  const c = UI.call, el = $('#call');
  if (!c) { el.innerHTML = ''; return; }
  const u = user(c.from);
  const head = `${av(c.from, 'lg')}<div style="flex:1;min-width:0"><b class="ell" style="display:block">${esc(u.name)}</b><span class="muted" style="font-size:13px">`;
  if (c.state === 'ringing') el.innerHTML = `<div class="callbox" role="alertdialog" aria-label="Incoming call">${head}Incoming voice call <span class="sim">Simulated</span></span></div>
    <button class="btn ok ring" data-a="acceptCall" aria-label="Accept call" style="border-radius:50%;padding:10px">${ic('phone')}</button>
    <button class="btn redon" data-a="declineCall" aria-label="Decline call" style="border-radius:50%;padding:10px">${ic('x')}</button></div>`;
  else el.innerHTML = `<div class="callbox">${head}${c.state === 'calling' ? 'Calling…' : 'On call · <span class="timer" data-since="' + c.at + '">0:00</span>'} <span class="sim">Simulated</span></span></div>
    <button class="btn icon ${c.muted ? 'redon' : ''}" data-a="callMute" aria-label="${c.muted ? 'Unmute' : 'Mute'}">${ic(c.muted ? 'micoff' : 'mic')}</button>
    <button class="btn redon" data-a="hangUp" aria-label="Hang up">${ic('phone')} End</button></div>`;
}

/* ================= runtime capabilities (light up when present) ================= */
const CAP = { sample: null, room: null, user: null, dl: null, peers: [], profiles: {} };
function initCaps() {
  const c = window.claude; if (!c || !c.use) return;
  c.use('sample').then(s => { CAP.sample = s; render(); }).catch(() => {});
  c.use('downloads').then(d => { CAP.dl = d; render(); }).catch(() => {});
  c.use('user').then(u => { CAP.user = u; }).catch(() => {});
  c.use('room').then(r => {
    if (!r) return; CAP.room = r;
    pushPresence();
    r.on('say', m => { if (typeof PX !== 'undefined') PX.remoteSay(m); });
    r.on('dj', m => { if (typeof DJ !== 'undefined') DJ.onMsg(m); });
    r.onPeers(async ({ peers, joined }) => {
      if (joined && joined.length && typeof DJ !== 'undefined') DJ.onJoin();
      CAP.peers = peers.filter(p => p.kind === 'viewer');
      const ids = uniq(CAP.peers.map(p => p.by).filter(Boolean));
      if (CAP.user && ids.length) { try { CAP.profiles = Object.assign(CAP.profiles, await CAP.user.profiles(ids)); } catch (e) {} }
      if (UI.route === 'office') render();
    }, () => { CAP.room = null; });
  }).catch(() => {});
}
function pushPresence() { if (typeof PX !== 'undefined' && user(ME)) PX.netPush(); }
async function askAI(prompt, json) {
  if (!CAP.sample) return null;
  try { return json ? await CAP.sample.json(prompt, { modelTier: 'default' }) : (await CAP.sample(prompt, { modelTier: 'default' })).text; }
  catch (e) { if (e && e.code === 'not_granted') CAP.sample = null; return { error: e && (e.message || e.code) || 'failed' }; }
}
async function saveFile(filename, data) {
  if (!CAP.dl) { toast('Downloads are not available here', 'Open the workspace on claude.ai to save files.', 'warn'); return; }
  try { await CAP.dl.save({ filename, data }); toast('Saved ' + filename, '', 'ok'); }
  catch (e) { if (e && e.code !== 'declined') toast('Could not save the file', e.message || e.code, 'bad'); }
}
