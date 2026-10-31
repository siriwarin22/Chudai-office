'use strict';
/* ================= modals ================= */
const chips = (name, ids, checked = [], extra = '') => `<div class="chips">${ids.map(id => `<label class="chipsel"><input type="checkbox" name="${name}" value="${id}" ${checked.includes(id) ? 'checked' : ''} ${extra}>${av(id, 'sm', false)}${esc(uname(id))}</label>`).join('')}</div>`;
function taskForm(t, preset = {}) {
  const v = Object.assign({ title: '', desc: '', project: UI.proj || '', priority: 'medium', due: now() + 3 * DAY, assignees: [ME], reviewers: [deptHead(me().dept) || ME], deps: [] }, preset, t || {});
  const assignable = can('task.assign') ? S.users.map(u => u.id) : [ME];
  if (!t && !can('task.assign')) v.assignees = [ME];
  const due = new Date(v.due);
  openModal(t ? `Edit ${t.id}` : 'New task', `<div class="form">
    <label class="f">Title<input class="in" name="title" value="${esc(v.title)}" required maxlength="140"></label>
    <label class="f">Description<textarea class="in" name="desc">${esc(v.desc)}</textarea></label>
    <div class="two"><label class="f">Project<select class="in" name="project"><option value="">No project</option>${S.projects.map(p => `<option value="${p.id}" ${v.project === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>
    <label class="f">Priority<select class="in" name="priority">${Object.keys(PRI).map(p => `<option value="${p}" ${v.priority === p ? 'selected' : ''}>${PRI[p].l}</option>`).join('')}</select></label></div>
    <div class="two"><label class="f">Due date<input class="in" type="date" name="dueD" value="${dIn(v.due)}" required></label><label class="f">Due time<input class="in" type="time" name="dueT" value="${pad(due.getHours())}:${pad(due.getMinutes())}"></label></div>
    <div class="f"><b style="font-size:13px">Assignees</b>${can('task.assign') ? '' : '<span class="h">Employees can only assign tasks to themselves.</span>'}${chips('assignees', assignable, v.assignees)}</div>
    <div class="f"><b style="font-size:13px">Reviewers</b>${chips('reviewers', S.users.filter(u => u.role !== 'employee' || u.id === ME).map(u => u.id), v.reviewers)}</div>
    <label class="f">Depends on<span class="h">Hold Ctrl/Cmd to choose several. Blocked tasks cannot start until these are done.</span><select class="in" name="deps" multiple size="4">${S.tasks.filter(x => !t || x.id !== t.id).map(x => `<option value="${x.id}" ${v.deps.includes(x.id) ? 'selected' : ''}>${x.id} · ${esc(x.title)}</option>`).join('')}</select></label>
    ${t ? '' : `<label class="f">Subtasks<span class="h">One per line</span><textarea class="in" name="subtasks" rows="3">${esc((preset.subtasks || []).join('\n'))}</textarea></label>`}
    <input type="hidden" name="fromChat" value="${preset.fromChat ? 1 : ''}"><input type="hidden" name="fromMeeting" value="${esc(preset.fromMeeting || '')}">
  </div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">${t ? 'Save changes' : 'Create & notify'}</button>`, { form: 'task', data: t ? `data-id="${t.id}"` : '', wide: true });
}
function submitForm(tid) {
  const mine = S.tasks.filter(t => t.assignees.includes(ME) && !['done', 'review'].includes(t.status));
  if (!mine.length && !tid) { toast('Nothing to submit', 'You have no open tasks assigned to you.', 'warn'); return; }
  const t = task(tid);
  const prev = t ? S.submissions.filter(s => s.task === t.id).length : 0;
  openModal('Submit work for review', `<div class="form">
    <label class="f">Task<select class="in" name="task" required>${(t && !mine.includes(t) ? [t] : []).concat(mine).map(x => `<option value="${x.id}" ${x.id === tid ? 'selected' : ''}>${x.id} · ${esc(x.title)}${x.status === 'revision' ? ' (revision)' : ''}</option>`).join('')}</select></label>
    ${prev ? `<p class="muted" style="margin:0">This will be version ${prev + 1}. Earlier versions stay in the history.</p>` : ''}
    <label class="f">Links<span class="h">One per line: pull requests, docs, designs</span><textarea class="in" name="links" rows="2" placeholder="https://"></textarea></label>
    <label class="f">Files<input class="in" type="file" name="files" multiple></label>
    <label class="f">Note for the reviewer<textarea class="in" name="note" placeholder="What changed and what to check" required></textarea></label>
  </div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">${ic('submit')}Submit</button>`, { form: 'submit' });
}
function meetingForm(preset = {}) {
  const start = preset.start || (Math.ceil((now() + 30 * MIN) / (30 * MIN)) * 30 * MIN);
  openModal('Schedule meeting', `<div class="form" data-i="avail">
    <label class="f">Title<input class="in" name="title" value="${esc(preset.title || '')}" required></label>
    <div class="two"><label class="f">Date<input class="in" type="date" name="d" value="${dIn(start)}" required></label><label class="f">Start<input class="in" type="time" name="t" value="${fTime(start)}" required></label></div>
    <div class="two"><label class="f">Duration<select class="in" name="dur">${[15, 30, 45, 60, 90].map(n => `<option value="${n}" ${n === 30 ? 'selected' : ''}>${n} min</option>`).join('')}</select></label>
    <label class="f">Voice room<select class="in" name="room">${ROOMS.map(r => `<option value="${r.id}" ${r.id === 'meeting' ? 'selected' : ''}>${r.name}</option>`).join('')}</select></label></div>
    <label class="f">Agenda<textarea class="in" name="agenda" rows="3"></textarea></label>
    <div class="f"><b style="font-size:13px">Invite</b>${chips('inv', S.users.filter(u => u.id !== ME).map(u => u.id), preset.inv || [])}</div>
    <div class="sec"><div class="row" style="justify-content:space-between"><span class="tag">Availability</span><button type="button" class="btn sm" data-a="suggestTime">${ic('clock')}Find a free time</button></div><div id="avail">${availHTML(null)}</div></div>
  </div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Schedule & invite</button>`, { form: 'meeting', wide: true });
  updateAvail();
}
function conflictsFor(uid, s, e) {
  const out = [];
  S.meetings.forEach(m => { const me_ = m.attendees.find(a => a.id === uid); if (me_ && me_.rsvp !== 'no' && m.start < e && m.start + m.dur * MIN > s) out.push('Meeting: ' + m.title); });
  S.schedules.forEach(b => { if (b.user === uid && b.start < e && b.end > s) out.push(b.title); });
  S.leaves.forEach(l => { if (l.user === uid && l.status === 'approved' && sod(l.from) <= sod(s) && sod(l.to) >= sod(s)) out.push(l.type + ' leave'); });
  const u = user(uid); if (u && ['dnd', 'focus'].includes(u.status) && u.statusUntil && u.statusUntil > s) out.push(PRES[u.status].l + ' until ' + fTime(u.statusUntil));
  return out;
}
function availHTML(f) {
  if (!f) return '<span class="faint">Pick people to check their calendars.</span>';
  const fd = new FormData(f); const s = parseDT(fd.get('d'), fd.get('t')), e = s + (+fd.get('dur')) * MIN;
  const ids = [ME].concat(fd.getAll('inv'));
  if (ids.length < 2) return '<span class="faint">Pick people to check their calendars.</span>';
  const h = new Date(s).getHours();
  return (h < 9 || h >= 18 ? '<p class="pill orange" style="margin:0 0 6px">Outside working hours</p>' : '') + ids.map(id => { const c = conflictsFor(id, s, e); return `<div class="row" style="flex-wrap:nowrap;padding:3px 0">${av(id, 'sm')}<span style="flex:1">${esc(uname(id))}</span>${c.length ? `<span class="pill red" title="${esc(c.join(', '))}">Busy · ${esc(c[0])}</span>` : '<span class="pill green">Free</span>'}</div>`; }).join('');
}
function updateAvail() { const f = $('#overlay form'); const el = $('#avail'); if (f && el) el.innerHTML = availHTML(f); }

/* ================= AI ================= */
const ctxTasks = (list) => list.map(t => ({ id: t.id, title: t.title, status: STAT[t.status].l, priority: t.priority, due: dIn(t.due), progress: t.progress, assignees: t.assignees.map(uname), lastUpdateDaysAgo: Math.floor((now() - t.lastUpdate) / DAY), blockedBy: t.deps.filter(d => task(d)?.status !== 'done') }));
async function runAI(label, prompt, fallback, json) {
  UI.ai.busy = true; UI.ai.tasks = null; UI.ai.src = label; if (!UI.drawer || UI.drawer.type !== 'ai') UI.drawer = { type: 'ai' }; render();
  let r = await askAI(prompt, json);
  if (!r || r.error) { r = fallback(); UI.ai.src = label + (CAP.sample ? ' (Claude unavailable, rule-based)' : ' · rule-based'); }
  else UI.ai.src = label + ' · Claude';
  UI.ai.busy = false;
  return r;
}
function riskList() {
  const t0 = now();
  return S.tasks.filter(t => t.status !== 'done').map(t => {
    let score = 0; const why = [];
    if (t.status === 'overdue') { score += 5; why.push(`overdue by ${Math.floor((t0 - t.due) / DAY)}d`); }
    const dd = dayDiff(t.due);
    if (dd >= 0 && dd <= 3 && t.progress < 50 && t.status !== 'review') { score += 3; why.push(`due ${dueTxt(t.due).toLowerCase()} at ${t.progress}%`); }
    if (t0 - t.lastUpdate > S.followup.staleDays * DAY) { score += 2; why.push(`no update for ${Math.floor((t0 - t.lastUpdate) / DAY)}d`); }
    if (isBlocked(t) && dd <= 5) { score += 2; why.push('blocked by ' + t.deps.filter(d => task(d)?.status !== 'done').join(', ')); }
    if (t.status === 'revision') { score += 1; why.push('revision requested'); }
    return { t, score, why };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
}
const A_AI = {
  async aiRisk() {
    const risks = riskList();
    const r = await runAI('Tasks at risk', `You are an operations assistant inside an office app. Today is ${fDate(now())}. From these open tasks, list the 5 most at risk of slipping. For each: ID, one-line reason, one concrete next step and who should take it. Plain text, no markdown headings, under 170 words.\n${JSON.stringify(ctxTasks(S.tasks.filter(t => t.status !== 'done')))}`,
      () => risks.slice(0, 6).map((x, i) => `${i + 1}. ${x.t.id} ${x.t.title}\n   ${x.why.join('; ')} · ${x.t.assignees.map(uname).join(', ')}`).join('\n') || 'No tasks look at risk right now.');
    UI.ai.out = typeof r === 'string' ? r : JSON.stringify(r); render();
  },
  async aiWeekly() {
    const t0 = now(), wk = t0 - 7 * DAY;
    const doneT = S.tasks.filter(t => t.completedAt && t.completedAt > wk), arch = S.archive.filter(a => a.completedAt > wk);
    const subs = S.submissions.filter(s => s.at > wk), appr = subs.filter(s => s.status === 'approved').length;
    const od = S.tasks.filter(t => t.status === 'overdue'), mt = S.meetings.filter(m => m.start > wk && m.start < t0);
    const contrib = {}; doneT.forEach(t => t.assignees.forEach(a => contrib[a] = (contrib[a] || 0) + 1));
    const stats = { week: `${fDay(wk)} – ${fDay(t0)}`, completed: doneT.length + arch.length, completedTasks: doneT.map(t => t.id + ' ' + t.title), submissions: subs.length, approved: appr, revisionsRequested: subs.filter(s => s.status === 'revision').length, overdueNow: od.map(t => t.id + ' ' + t.title + ' (' + t.assignees.map(uname).join(', ') + ')'), meetingsHeld: mt.map(m => m.title), topContributors: Object.entries(contrib).map(([k, v]) => uname(k) + ': ' + v) };
    const r = await runAI('Weekly productivity report', `Write a short weekly team report (wins, risks, next week focus) from this data. Be specific, use names and task IDs, under 200 words, plain text with short sections. Do not judge individuals' productivity harshly; focus on work.\n${JSON.stringify(stats)}`,
      () => `Week ${stats.week}\n\nDone: ${stats.completed} tasks completed, ${stats.submissions} submissions, ${stats.approved} approved, ${stats.revisionsRequested} sent back for revision.\n${stats.completedTasks.length ? 'Highlights: ' + stats.completedTasks.slice(0, 4).join('; ') + '\n' : ''}\nRisks: ${stats.overdueNow.length ? stats.overdueNow.join('; ') : 'nothing overdue'}.\n\nMeetings: ${stats.meetingsHeld.join(', ') || 'none'}.\n\nNext week: clear overdue items first, then the next milestones: ${S.projects.map(p => { const m = p.milestones.find(x => x.date > t0); return m ? p.name + ' → ' + m.name + ' ' + fDay(m.date) : null; }).filter(Boolean).join('; ')}.`);
    UI.ai.out = typeof r === 'string' ? r : JSON.stringify(r); render();
  },
  async aiChatTasks() {
    const c = S.chats.find(x => x.id === UI.chat) || S.chats[0];
    const msgs = S.messages.filter(m => m.chat === c.id).slice(-30);
    const people = S.users.map(u => ({ id: u.id, name: u.name }));
    const r = await runAI(`Tasks from ${chatName(c)}`, `Extract concrete follow-up tasks from this team chat. Return JSON: an array of up to 5 objects {"title": string (imperative, under 70 chars), "assignee": one id from the people list, "due_in_days": integer 1-14, "priority": "low"|"medium"|"high"|"urgent"}. Skip anything already done or purely social. Return [] if none.\nPeople: ${JSON.stringify(people)}\nMessages: ${JSON.stringify(msgs.map(m => ({ from: uname(m.from), text: m.text })))}`,
      () => msgs.filter(m => /\b(can you|could you|please|need|will|let us|let's|todo|by (mon|tue|wed|thu|fri))/i.test(m.text)).slice(-5).map(m => { const ment = S.users.find(u => m.text.includes(u.name.split(' ')[0]) && u.id !== m.from); return { title: m.text.replace(/\s+/g, ' ').slice(0, 70), assignee: ment ? ment.id : m.from, due_in_days: 3, priority: 'medium' }; }), true);
    const arr = Array.isArray(r) ? r : [];
    UI.ai.tasks = arr.filter(x => x && x.title).map(x => ({ title: String(x.title).slice(0, 140), assignee: user(x.assignee) ? x.assignee : ME, due: now() + (Math.min(14, Math.max(1, +x.due_in_days || 3))) * DAY, priority: PRI[x.priority] ? x.priority : 'medium', src: chatName(c) }));
    UI.ai.out = UI.ai.tasks.length ? `Found ${UI.ai.tasks.length} possible task${UI.ai.tasks.length > 1 ? 's' : ''} in ${chatName(c)}. Untick any you do not want.` : `No clear tasks in ${chatName(c)}.`;
    render();
  },
  aiCreateTasks() {
    const pick = (UI.ai.tasks || []).filter(t => t.pick !== false);
    pick.forEach(x => createTask({ title: x.title, assignees: can('task.assign') ? [x.assignee] : [ME], due: x.due, priority: x.priority, desc: `Generated by the assistant from ${x.src}.`, fromChat: true }));
    toast(`${pick.length} task${pick.length === 1 ? '' : 's'} created`, 'Assignees were notified.', 'ok');
    UI.ai.tasks = null; UI.ai.out = ''; commit();
  },
  async aiMeeting(d) {
    const m = meeting(d.id); if (!m) return;
    if (!m.consent) { toast('Consent needed', 'Tick the consent box before using AI on meeting notes.', 'warn'); return; }
    if (!m.notes.trim()) { toast('Add notes first', '', 'warn'); return; }
    const people = m.attendees.map(a => ({ id: a.id, name: uname(a.id) }));
    let r = await askAI(`Summarize these meeting notes in 2-4 sentences and extract action items. Return JSON {"summary": string, "actions": [{"text": string, "owner": attendee id, "due_in_days": integer 1-14}]}.\nMeeting: ${m.title}\nAttendees: ${JSON.stringify(people)}\nNotes:\n${m.notes}`, true);
    let src = 'Claude';
    if (!r || r.error || !r.summary) {
      src = 'rule-based';
      const lines = m.notes.split('\n').map(s => s.trim()).filter(Boolean);
      r = { summary: lines.slice(0, 3).join(' '), actions: lines.filter(l => /\b(will|to check|to send|to review|should|needs? to)\b/i.test(l)).map(l => { const o = m.attendees.find(a => l.includes(first(a.id))); return { text: l.replace(/^[-*•\d.\s]+/, ''), owner: o ? o.id : m.host, due_in_days: 3 }; }) };
    }
    m.summary = r.summary + `\n\n(${src} summary · ${fDT(now())})`;
    let added = 0;
    (r.actions || []).forEach(a => { if (!a || !a.text || m.actions.some(x => x.text.toLowerCase() === String(a.text).toLowerCase())) return; m.actions.push({ text: String(a.text).slice(0, 140), owner: user(a.owner) ? a.owner : m.host, due: now() + Math.min(14, Math.max(1, +a.due_in_days || 3)) * DAY, task: null }); added++; });
    toast('Summary ready', `${added} new action item${added === 1 ? '' : 's'} found.`, 'ok');
    commit();
  },
  aiMeetingPick() {
    const m = S.meetings.filter(x => x.start < now() && x.notes).sort((a, b) => b.start - a.start)[0];
    if (!m) { toast('No past meeting with notes', '', 'warn'); return; }
    openDrawer('meeting', m.id);
    if (m.consent) A_AI.aiMeeting({ id: m.id }); else toast('Tick the consent box', 'Then press Summarize.', 'info');
  },
};
function smartSearch(q) {
  const words = q.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const score = s => words.reduce((a, w) => a + (s.toLowerCase().includes(w) ? 1 : 0), 0);
  const hits = [];
  S.kb.forEach(k => { const sc = score(k.title + ' ' + k.body + ' ' + k.tags.join(' ')); if (sc) hits.push({ sc: sc + 1, t: `Article · ${k.title}\n${k.body}` }); });
  S.tasks.forEach(t => { const sc = score(t.id + ' ' + t.title + ' ' + t.desc); if (sc) hits.push({ sc, t: `Task ${t.id} · ${t.title} · ${STAT[t.status].l}, due ${fDay(t.due)}, ${t.assignees.map(uname).join(', ')}` }); });
  S.files.forEach(f => { const sc = score(f.name + ' ' + f.folder); if (sc) hits.push({ sc, t: `File · ${f.name} (${f.folder})` }); });
  S.messages.forEach(m => { const sc = score(m.text); if (sc > 1) hits.push({ sc: sc - 0.5, t: `Message from ${uname(m.from)}: ${m.text}` }); });
  return hits.sort((a, b) => b.sc - a.sc).slice(0, 5).map(h => h.t).join('\n\n') || 'No matching documents, tasks or messages.';
}

/* ================= click actions ================= */
let PICK = null;
const A = {
  closeModal, closeDrawer,
  toggleSide() { UI.sideOpen = !UI.sideOpen; render(); },
  tab(d, el) { UI.tabs[d.k] = d.v; if (el.tagName === 'A') go('employees'); render(); },
  confirm(d) { UI.confirm = d.v || null; render(); },
  link(d) { try { followLink(JSON.parse(d.l)); } catch (e) {} },
  kpi(d) { UI.tf = { status: d.v || '', priority: '', project: '', q: '' }; UI.taskScope = defaultScope(); UI.taskView = 'list'; go('tasks'); },
  taskView(d) { UI.taskView = d.v; render(); }, taskScope(d) { UI.taskScope = d.v; render(); }, projView(d) { UI.projView = d.v; render(); },
  clearTf() { UI.tf = { status: '', priority: '', project: '', q: '' }; DROP.add('tfq'); render(); },
  presTab(d) { UI.presTab = d.v; render(); }, notifTab(d) { UI.notifTab = d.v; render(); }, folder(d) { UI.folder = d.v; render(); },
  calView(d) { UI.cal.view = d.v; render(); }, calScope(d) { UI.cal.scope = d.v; render(); },
  calDay(d) { UI.cal.view = 'day'; UI.cal.date = +d.v; render(); },
  calNav(d) { const v = +d.v, c = UI.cal; if (!v) c.date = now(); else { const x = new Date(c.date); if (c.view === 'month') x.setMonth(x.getMonth() + v, 1); else x.setDate(x.getDate() + v * (c.view === 'week' ? 7 : 1)); c.date = +x; } render(); },
  openTask(d) { closePop(); openDrawer('task', d.id); }, openSub(d) { openDrawer('sub', d.id); }, openMeeting(d) { openDrawer('meeting', d.id); }, openUser(d) { closePop(); openDrawer('user', d.id); },
  openNotifs() { UI.notifTab = 'all'; openDrawer('notifs'); }, openAI() { openDrawer('ai'); },
  openProject(d) { UI.proj = d.id; UI.drawer = null; go('projects'); render(); },
  openChat(d) { UI.chat = d.id; UI.pending = []; render(); },
  notif(d) { const n = S.notifs.find(x => x.id === d.id); if (!n) return; n.read = true; persist(); if (n.link && n.link.route !== 'notifs') { UI.drawer = null; followLink(n.link); } else render(); },
  readAll() { myNotifs().forEach(n => { if (!n.held) n.read = true; }); commit(); },
  statusMenu(d, el) {
    const m = me();
    openPop(el, `${['online', 'busy', 'away', 'meeting', 'offline'].map(s => `<button class="mi" data-a="setStatus" data-v="${s}">${pdot(s)}${PRES[s].l}${m.status === s ? ' ✓' : ''}</button>`).join('')}<hr>
      <div class="tag" style="padding:4px 9px">Do Not Disturb</div><div class="row" style="padding:2px 9px 6px">${[[30, '30m'], [60, '1h'], [120, '2h']].map(([v, l]) => `<button class="btn sm" data-a="dnd" data-v="${v}">${l}</button>`).join('')}<button class="btn sm" data-a="dndTomorrow">Until tomorrow</button></div>
      <div class="tag" style="padding:4px 9px">Focus</div><div class="row" style="padding:2px 9px 6px">${[25, 50, 90].map(v => `<button class="btn sm" data-a="focus" data-v="${v}">${v}m</button>`).join('')}</div>
      <hr><div class="tag" style="padding:4px 9px">What are you doing?</div><form data-form="doing" class="row" style="padding:2px 9px 6px;flex-wrap:nowrap"><input class="in" id="doingInput" name="text" maxlength="40" placeholder="e.g. Designing the login screen" value="${esc((m.doing && m.doing.text) || '')}" style="flex:1;min-width:0"><button class="btn sm primary">Set</button></form>${m.doing ? `<button class="mi" data-a="clearDoing">${ic('x')}Clear activity</button>` : ''}
      ${['dnd', 'focus'].includes(m.status) ? `<hr><button class="mi" data-a="endQuiet">${ic('x')}End ${PRES[m.status].l}</button>` : ''}<hr><a class="mi" href="#availability" style="display:flex;gap:9px;padding:7px 9px;text-decoration:none;color:var(--text)">${ic('moon')}Availability settings</a>`);
  },
  focusMenu(d, el) { openPop(el, `<div class="tag" style="padding:4px 9px">Start a focus session</div>${[25, 50, 90].map(v => `<button class="mi" data-a="focus" data-v="${v}">${ic('target')}${v} minutes</button>`).join('')}<a class="mi" href="#availability" style="display:flex;gap:9px;padding:7px 9px;text-decoration:none;color:var(--text)">${ic('clock')}Custom length</a>`); },
  setStatus(d) { closePop(); setStatus(d.v); },
  dnd(d) { closePop(); startDND(+d.v); },
  dndTomorrow() { closePop(); const t = new Date(); t.setDate(t.getDate() + 1); t.setHours(9, 0, 0, 0); startDND(Math.round((+t - now()) / MIN)); },
  focus(d) { closePop(); startFocus(+d.v); },
  endQuiet() { closePop(); endQuiet(); },
  joinRoom(d) {
    const r = ROOMS.find(x => x.id === d.id), m = me();
    if (r.locked && role() === 'employee') { notify(S.users.filter(u => u.room === r.id || u.role === 'manager').map(u => u.id), { type: 'call', title: `${m.name} knocked on the Private room`, from: ME }); toast('Knock sent', 'People in the Private room have been notified.', 'info'); commit(); return; }
    m.room = r.id; S.voice = { room: r.id, muted: !!S.voice.muted, deafened: !!S.voice.deafened, sharing: false, since: now() };
    log(ME, `joined ${r.name}`);
    if (r.id === 'focus' && m.status !== 'focus') { startFocus(50); }
    else if (r.id === 'meeting' && ['online', 'busy', 'away'].includes(m.status)) setTemp(m, 'meeting', null, 'room');
    if (UI.route !== 'voice') toast(`Joined ${r.name}`, 'Mic and headphone controls are at the bottom left.', 'ok');
    commit();
  },
  leaveRoom() { const m = me(); const r = ROOMS.find(x => x.id === m.room); m.room = null; S.voice = { room: null, muted: !!S.voice.muted, deafened: !!S.voice.deafened, sharing: false, since: null }; if (m.auto === 'room' || m.auto === 'meeting') restore(m); if (r) log(ME, `left ${r.name}`); commit(); },
  vMute() { S.voice.muted = !S.voice.muted; if (!S.voice.muted && S.voice.deafened) S.voice.deafened = false; const l = S.voice.muted ? 'Microphone off' : 'Microphone on'; PX.flash(t(l)); toast(l, S.voice.muted ? 'Others see a muted mic above your head.' : 'People in range can hear you.', S.voice.muted ? 'warn' : 'ok'); commit(); },
  vDeaf() { S.voice.deafened = !S.voice.deafened; if (S.voice.deafened) S.voice.muted = true; const l = S.voice.deafened ? 'Headphones off' : 'Headphones on'; PX.flash(t(l)); toast(l, S.voice.deafened ? 'You will not hear anyone. Your mic is off too.' : 'You can hear people again.', S.voice.deafened ? 'warn' : 'ok'); commit(); },
  workOn(d) { me().doing = { task: d.id }; const k = task(d.id); if (k && k.status === 'todo' && !isBlocked(k)) changeTaskStatus(k, 'progress'); toast('Status updated', 'Everyone sees what you are working on above your head.', 'ok'); log(ME, `is working on ${d.id}`, { task: d.id }); commit(); },
  clearDoing() { me().doing = null; closePop(); toast('Activity cleared', '', 'info'); commit(); },
  vShare() { S.voice.sharing = !S.voice.sharing; if (S.voice.sharing) toast('Screen sharing started', 'Simulated: others in the room see a placeholder.', 'info'); commit(); },
  huddle(d) { const c = S.chats.find(x => x.id === d.id); const rid_ = ROOMS.find(r => r.id === c.name) ? c.name : 'general'; A.joinRoom({ id: rid_ }); go('voice'); },
  testCall() { const u = pick(S.users.filter(x => x.id !== ME && x.status !== 'offline')); incomingCall(u.id); },
  call(d) { outgoingCall(d.id); },
  acceptCall() { clearTimeout(UI.callT); UI.call.state = 'active'; UI.call.at = now(); renderCall(); },
  declineCall() { clearTimeout(UI.callT); const f = UI.call.from; UI.call = null; renderCall(); toast('Call declined', `${uname(f)} will see you are unavailable.`, 'info'); },
  hangUp() { clearTimeout(UI.callT); const c = UI.call; UI.call = null; renderCall(); if (c && c.state === 'active') { toast('Call ended', mmss(now() - c.at), 'info'); log(ME, `had a call with ${uname(c.from)}`); commit(); } },
  callMute() { UI.call.muted = !UI.call.muted; renderCall(); },
  dm(d) { UI.chat = dmId(d.id); UI.drawer = null; go('chat'); commit(); },
  newChat() { openModal('New message', `<div class="form"><div class="f"><b style="font-size:13px">To</b>${chips('to', S.users.filter(u => u.id !== ME).map(u => u.id))}</div><label class="f">Group name<span class="h">Only used when you pick more than one person</span><input class="in" name="name" placeholder="Project crew"></label></div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Open chat</button>`, { form: 'newChat' }); },
  taskFromMsg(d) { const m = S.messages.find(x => x.id === d.id); const c = S.chats.find(x => x.id === m.chat); const ment = S.users.find(u => u.id !== m.from && m.text.includes('@' + u.name.split(' ')[0])); taskForm(null, { title: m.text.replace(/\s+/g, ' ').slice(0, 90), desc: `From ${chatName(c)}, ${uname(m.from)} wrote: "${m.text}"`, assignees: ment && can('task.assign') ? [ment.id] : [ME], fromChat: true }); },
  attachChat(d) { PICK = { kind: d.room ? 'voice' : 'chat' }; $('#filepick').click(); },
  attachTask(d) { PICK = { kind: 'task', id: d.id }; $('#filepick').click(); },
  upload() { PICK = { kind: 'files' }; $('#filepick').click(); },
  unattach(d) { UI.pending = (UI.pending || []).filter(f => f.id !== d.id); render(); },
  newTask(d) { taskForm(null, d.project ? { project: d.project } : {}); },
  editTask(d) { taskForm(task(d.id)); },
  startTask(d) { const t = task(d.id); if (changeTaskStatus(t, 'progress')) { me().doing = { task: t.id }; commit(); } },
  delTask(d) { S.tasks = S.tasks.filter(t => t.id !== d.id); S.tasks.forEach(t => t.deps = t.deps.filter(x => x !== d.id)); log(ME, `deleted ${d.id}`); UI.confirm = null; UI.drawer = null; toast(`${d.id} deleted`, '', 'info'); commit(); },
  submitWork(d) { submitForm(d.id); },
  newMeeting() { if (!can('meeting.schedule')) { toast('You cannot schedule meetings', 'Ask an admin to grant the permission.', 'warn'); return; } meetingForm(); },
  suggestTime() {
    const f = $('#overlay form'); const fd = new FormData(f); const ids = [ME].concat(fd.getAll('inv')); const dur = (+fd.get('dur')) * MIN;
    let s = Math.ceil((now() + 15 * MIN) / (30 * MIN)) * 30 * MIN;
    for (let i = 0; i < 5 * 48; i++, s += 30 * MIN) {
      const d = new Date(s), h = d.getHours(), wd = d.getDay();
      if (wd === 0 || wd === 6 || h < 9 || h + dur / HOUR > 18) continue;
      if (ids.every(id => !conflictsFor(id, s, s + dur).length)) { f.elements.d.value = dIn(s); f.elements.t.value = fTime(s); updateAvail(); toast('Free slot found', `${fDT(s)} works for everyone.`, 'ok'); return; }
    }
    toast('No common free slot', 'Nothing in the next 5 working days. Try fewer people or a shorter meeting.', 'warn');
  },
  rsvp(d) { const m = meeting(d.id); const a = m.attendees.find(x => x.id === ME); a.rsvp = d.v; notify(m.host, { type: 'meeting', title: `${uname(ME)} ${{ yes: 'accepted', no: 'declined', maybe: 'might join' }[d.v]}: ${m.title}`, link: { meeting: m.id }, from: ME }); commit(); },
  joinMeeting(d) { const m = meeting(d.id); A.joinRoom({ id: m.room }); const u = me(); setTemp(u, 'meeting', m.start + m.dur * MIN, 'meeting'); const a = m.attendees.find(x => x.id === ME); if (a) { a.attended = true; a.rsvp = 'yes'; } UI.drawer = null; commit(); go('voice'); },
  actionToTask(d) { const m = meeting(d.id), a = m.actions[+d.k]; const t = createTask({ title: a.text, assignees: [a.owner], due: a.due, desc: `Action item from "${m.title}" on ${fDay(m.start)}.\n\n${m.summary ? 'Summary: ' + m.summary.split('\n')[0] : ''}`, fromMeeting: m.title, reviewers: [m.host] }); a.task = t.id; toast(`${t.id} created`, `${uname(a.owner)} was notified.`, 'ok'); commit(); },
  allActions(d) { const m = meeting(d.id); m.actions.forEach((a, i) => { if (!a.task) A.actionToTask({ id: d.id, k: i }); }); },
  copy(d) { const done = () => toast('Copied', d.v, 'ok'); try { navigator.clipboard.writeText(d.v).then(done, () => toast('Copy this link', d.v, 'info')); } catch (e) { toast('Copy this link', d.v, 'info'); } },
  nudge(d) { const t = task(d.id); notify(t.assignees, { type: 'reminder', title: `${uname(ME)} nudged you about ${t.id}`, body: t.title, link: { task: t.id }, from: ME, tone: 'warn' }); t.activity.push({ at: now(), who: ME, text: 'sent a nudge' }); toast('Nudge sent', `${t.assignees.map(first).join(', ')} will get a reminder${t.assignees.some(isQuiet) ? ' when their quiet time ends' : ''}.`, 'ok'); commit(); },
  escalate(d) { const t = task(d.id); const lead = deptHead(t.dept); t.escalated = true; t.flags.esc = dateKey(); notify(lead, { type: 'overdue', title: `${uname(ME)} escalated ${t.id}`, body: t.title, link: { task: t.id }, from: ME, tone: 'bad' }); t.activity.push({ at: now(), who: ME, text: `escalated to ${uname(lead)}` }); log(ME, `escalated ${t.id}`, { task: t.id }); toast('Escalated', `${uname(lead)} was notified.`, 'ok'); commit(); },
  runFollow() { const n = runFollowups(true); toast(n ? `${n} reminder${n > 1 ? 's' : ''} sent` : 'No new reminders', n ? 'Respecting each person’s DND and preferences.' : 'Everyone already has the reminders they need.', n ? 'ok' : 'info'); commit(); },
  checkIn() { S.attendance.push({ user: ME, in: now(), out: null }); log(ME, 'checked in'); if (me().status === 'offline') me().status = 'online'; toast('Checked in', fTime(now()), 'ok'); commit(); },
  checkOut() { const a = S.attendance.find(x => x.user === ME && sod(x.in) === sod(now())); a.out = now(); log(ME, 'checked out'); toast('Checked out', fTime(now()), 'ok'); commit(); },
  newLeave() { openModal('Request leave', `<div class="form"><label class="f">Type<select class="in" name="type"><option>Vacation</option><option>Sick</option><option>Personal</option><option>Work from home</option></select></label><div class="two"><label class="f">From<input class="in" type="date" name="from" value="${dIn(now() + 7 * DAY)}" required></label><label class="f">To<input class="in" type="date" name="to" value="${dIn(now() + 7 * DAY)}" required></label></div><label class="f">Reason<input class="in" name="reason" required></label><p class="muted" style="margin:0;font-size:12.5px">${esc(uname(deptHead(me().dept)))} will be asked to approve.</p></div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Send request</button>`, { form: 'leave' }); },
  leaveDecide(d) { const l = S.leaves.find(x => x.id === d.id); l.status = d.v; l.approver = ME; notify(l.user, { type: 'leave', title: `Leave ${d.v}: ${fDay(l.from)}${sod(l.to) !== sod(l.from) ? ' – ' + fDay(l.to) : ''}`, body: `${uname(ME)} ${d.v} your ${l.type.toLowerCase()} request.`, from: ME, tone: d.v === 'approved' ? 'ok' : 'warn', link: { route: 'employees' } }); log(ME, `${d.v} leave for ${uname(l.user)}`); commit(); },
  newRequest() { openModal('New internal request', `<div class="form"><label class="f">What do you need?<input class="in" name="title" required></label><label class="f">Category<select class="in" name="cat"><option>IT</option><option>Facilities</option><option>HR</option><option>Finance</option></select></label><label class="f">Details<textarea class="in" name="notes"></textarea></label></div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Submit request</button>`, { form: 'request' }); },
  newAnn() { openModal('New announcement', `<div class="form"><label class="f">Title<input class="in" name="title" required></label><label class="f">Message<textarea class="in" name="body" rows="5" required></textarea></label><label class="check"><input type="checkbox" name="pinned">Pin to top</label><label class="check"><input type="checkbox" name="urgent">Urgent: notify everyone even during Do Not Disturb</label></div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Post & notify</button>`, { form: 'ann' }); },
  readAnn(d) { const a = S.announcements.find(x => x.id === d.id); if (!a.reads.includes(ME)) a.reads.push(ME); commit(); },
  pinAnn(d) { const a = S.announcements.find(x => x.id === d.id); a.pinned = !a.pinned; commit(); },
  newKb() { openModal('New article', `<div class="form"><label class="f">Title<input class="in" name="title" required></label><label class="f">Tags<input class="in" name="tags" placeholder="hr, policy"></label><label class="f">Body<textarea class="in" name="body" rows="7" required></textarea></label></div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Publish article</button>`, { form: 'kb' }); },
  kbSel(d) { UI.kb = d.id; render(); },
  aiSearch() { const q = $('#kbq')?.value || ''; UI.drawer = { type: 'ai' }; render(); setTimeout(() => { const el = $('#aiq'); if (el) { el.value = q || 'Where is the leave policy?'; el.focus(); } }, 50); },
  newProject() { openModal('New project', `<div class="form"><label class="f">Name<input class="in" name="name" required></label><label class="f">Description<textarea class="in" name="desc"></textarea></label><div class="two"><label class="f">Department<select class="in" name="dept">${S.departments.map(d => `<option value="${d.id}" ${d.id === me().dept ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></label><label class="f">Target end<input class="in" type="date" name="end" value="${dIn(now() + 30 * DAY)}"></label></div><label class="f">Milestones<span class="h">One per line as "Name, YYYY-MM-DD"</span><textarea class="in" name="ms" rows="3" placeholder="Kick-off, ${dIn(now() + 7 * DAY)}"></textarea></label></div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Create project</button>`, { form: 'project' }); },
  newEmployee() { openModal('Add employee', `<div class="form"><div class="two"><label class="f">Full name<input class="in" name="name" required></label><label class="f">Job title<input class="in" name="title" required></label></div><div class="two"><label class="f">Department<select class="in" name="dept">${S.departments.map(d => `<option value="${d.id}">${esc(d.name)}</option>`).join('')}</select></label><label class="f">Role<select class="in" name="role"><option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option></select></label></div><label class="f">Work email<input class="in" type="email" name="email" required placeholder="name@northdesk.example"></label></div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Add employee</button>`, { form: 'employee' }); },
  newDept() { openModal('Add department', `<div class="form"><label class="f">Name<input class="in" name="name" required></label><label class="f">Head<select class="in" name="head">${S.users.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select></label></div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Add</button>`, { form: 'dept' }); },
  newBlock() { openModal('Add to my schedule', `<div class="form"><label class="f">Title<input class="in" name="title" required placeholder="Deep work, school pickup, client visit"></label><div class="two"><label class="f">Date<input class="in" type="date" name="d" value="${dIn(now() + DAY)}" required></label><span></span></div><div class="two"><label class="f">From<input class="in" type="time" name="from" value="09:00" required></label><label class="f">To<input class="in" type="time" name="to" value="10:00" required></label></div><p class="muted" style="margin:0;font-size:12.5px">Blocks show as busy when colleagues schedule meetings.</p></div>`, `<button type="button" class="btn" data-a="closeModal">Cancel</button><button class="btn primary">Add block</button>`, { form: 'block' }); },
  delBlock(d) { const b = S.schedules.find(x => x.id === d.id); if (!b) return; openModal(b.title, `<p style="margin:0">${esc(uname(b.user))} · ${fDT(b.start)} – ${fTime(b.end)}</p>`, b.user === ME ? `<button type="button" class="btn danger" data-a="delBlockYes" data-id="${b.id}">Delete block</button><button type="button" class="btn" data-a="closeModal">Close</button>` : `<button type="button" class="btn" data-a="closeModal">Close</button>`); },
  delBlockYes(d) { S.schedules = S.schedules.filter(x => x.id !== d.id); closeModal(); commit(); },
  gsync() {
    const g = S.gsync || {};
    openModal('Google Calendar', `<div class="form"><p style="margin:0"><span class="sim">Simulated</span> This demo cannot reach Google. The controls show how sync would behave. To move events for real, use <b>Export .ics</b> and import the file into Google Calendar.</p>${g.connected ? `<p style="margin:0">Connected as <b>${esc(me().email)}</b> · last sync ${rel(g.last)}</p>` : ''}</div>`,
      g.connected ? `<button type="button" class="btn" data-a="gsyncOff">Disconnect</button><button type="button" class="btn primary" data-a="gsyncNow">Sync now</button>` : `<button type="button" class="btn" data-a="closeModal">Cancel</button><button type="button" class="btn primary" data-a="gsyncNow">Connect</button>`);
  },
  gsyncNow() { S.gsync = { connected: true, last: now() }; closeModal(); toast('Calendar synced', `${calItems(now(), now() + 30 * DAY).length} events up to date (simulated).`, 'ok'); commit(); },
  gsyncOff() { S.gsync = { connected: false }; closeModal(); commit(); },
  exportIcs() {
    const items = calItems(sod(now()) - 7 * DAY, now() + 60 * DAY);
    const z = t => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Northdesk//Office//EN'];
    items.forEach((e, i) => lines.push('BEGIN:VEVENT', `UID:nd-${i}-${e.t}@northdesk`, `DTSTAMP:${z(now())}`, `DTSTART:${z(e.t)}`, `DTEND:${z(e.end || e.t + (e.allDay ? DAY : 30 * MIN))}`, `SUMMARY:${e.title.replace(/[,;]/g, ' ')}`, `CATEGORIES:${e.kind}`, 'END:VEVENT'));
    lines.push('END:VCALENDAR');
    saveFile('northdesk-calendar.ics', lines.join('\r\n'));
  },
  exportCsv() {
    const q = s => '"' + String(s ?? '').replace(/"/g, '""') + '"';
    const rows = [['ID', 'Title', 'Project', 'Department', 'Assignees', 'Reviewers', 'Priority', 'Status', 'Due', 'Progress', 'Completed']].concat(S.tasks.map(t => [t.id, t.title, proj(t.project)?.name || '', dept(t.dept)?.name || '', t.assignees.map(uname).join('; '), t.reviewers.map(uname).join('; '), PRI[t.priority].l, STAT[t.status].l, dIn(t.due), t.progress, t.completedAt ? dIn(t.completedAt) : '']));
    saveFile(`northdesk-tasks-${dIn(now())}.csv`, rows.map(r => r.map(q).join(',')).join('\n'));
  },
  resetDemo() { S = NDSeed(); UI.confirm = null; UI.drawer = null; toast('Demo data reset', '', 'ok'); commit(); },
  aiRisk: () => A_AI.aiRisk(), aiWeekly: () => A_AI.aiWeekly(), aiChatTasks: () => A_AI.aiChatTasks(), aiCreateTasks: () => A_AI.aiCreateTasks(),
  aiMeeting: (d) => A_AI.aiMeeting(d), aiMeetingPick: () => A_AI.aiMeetingPick(),
};

/* ================= change handlers ================= */
const C = {
  role(el) { if (!user(el.value)) return; ME = el.value; try { localStorage.setItem(MEKEY, ME); } catch (e) {} UI.taskScope = null; UI.drawer = null; UI.tabs = {}; toast(`Now viewing as ${me().name}`, `${cap(me().role)} · ${dept(me().dept).name}`, 'info'); render(); },
  tf(el) { UI.tf[el.dataset.k] = el.value; render(); },
  taskStatus(el) { const t = task(el.dataset.id); if (el.value === 'review' && t.assignees.includes(ME)) { render(); submitForm(t.id); return; } if (changeTaskStatus(t, el.value)) commit(); else render(); },
  progress(el) { const t = task(el.dataset.id); me().doing = me().doing && me().doing.text ? me().doing : { task: t.id }; t.progress = +el.value; t.lastUpdate = now(); delete t.flags.stale; if (t.status === 'todo' && t.progress > 0 && !isBlocked(t)) t.status = 'progress'; t.activity.push({ at: now(), who: ME, text: `updated progress to ${t.progress}%` }); log(ME, `updated ${t.id} to ${t.progress}%`, { task: t.id }); commit(); },
  subtask(el) { const t = task(el.dataset.id); const s = t.subtasks.find(x => x.id === el.dataset.k); s.done = el.checked; t.lastUpdate = now(); t.activity.push({ at: now(), who: ME, text: `${s.done ? 'completed' : 'reopened'} subtask "${s.t}"` }); if (t.status === 'todo' && s.done && !isBlocked(t)) t.status = 'progress'; const n = t.subtasks.length; if (n && t.status !== 'done') t.progress = Math.max(t.progress, Math.round(t.subtasks.filter(x => x.done).length / n * 90)); commit(); },
  calKind(el) { UI.cal.kinds[el.dataset.k] = el.checked ? 1 : 0; render(); },
  insertTask(el) { const i = $('#msgInput'); if (el.value && i) { i.value = (i.value ? i.value.replace(/\s*$/, ' ') : '') + el.value + ' '; i.focus(); } el.value = ''; },
  fu(el) { const k = el.dataset.k; S.followup[k] = el.type === 'checkbox' ? el.checked : (isNaN(+el.value) ? el.value : +el.value); commit(); },
  dirDept(el) { UI.dir.dept = el.value; render(); },
  deptHead(el) { dept(el.dataset.id).head = el.value; log(ME, `made ${uname(el.value)} head of ${dept(el.dataset.id).name}`); commit(); },
  reqStatus(el) { const r = S.requests.find(x => x.id === el.dataset.id); r.status = el.value; if (!r.assignee) r.assignee = ME; notify(r.by, { type: 'request', title: `Request ${r.id}: ${{ open: 'reopened', progress: 'in progress', resolved: 'resolved' }[r.status]}`, body: r.title, from: ME, link: { route: 'employees' } }); commit(); },
  pref(el) { prefs(ME)[el.dataset.k] = el.checked; commit(); },
  sched(el) { const s = prefs(ME).dndSched; s[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.value; me().flagSched = null; commit(); },
  schedDay(el) { const s = prefs(ME).dndSched, k = +el.dataset.k; s.days = el.checked ? uniq(s.days.concat(k)) : s.days.filter(x => x !== k); commit(); },
  emerg(el) { const p = prefs(ME); p.emergency = el.checked ? uniq(p.emergency.concat(el.dataset.k)) : p.emergency.filter(x => x !== el.dataset.k); commit(); },
  visibility(el) { me().visibility = el.value; toast('Visibility updated', el.selectedOptions[0].textContent, 'ok'); commit(); },
  ntype(el) { prefs(ME).types[el.dataset.k] = el.checked; commit(); },
  perm(el) { S.perms[el.dataset.k][el.dataset.r] = el.checked; log(ME, `${el.checked ? 'granted' : 'removed'} "${S.perms[el.dataset.k].label}" for ${el.dataset.r}s`); commit(); },
  attend(el) { const a = meeting(el.dataset.id).attendees.find(x => x.id === el.dataset.k); a.attended = el.checked; commit(); },
  consent(el) { meeting(el.dataset.id).consent = el.checked; commit(); },
  userRole(el) { user(el.dataset.id).role = el.value; log(ME, `changed ${uname(el.dataset.id)}'s role to ${el.value}`); commit(); },
  userDept(el) { user(el.dataset.id).dept = el.value; commit(); },
  aiTaskPick(el) { UI.ai.tasks[+el.dataset.k].pick = el.checked; },
};

/* ================= input handlers ================= */
const I = {
  edColor(el) { PX.colorInput(el); },
  tfq(el) { UI.tf.q = el.value; render(); },
  rerender() { render(); },
  avail() { updateAvail(); },
  composer(el) { el.style.height = 'auto'; el.style.height = Math.min(140, el.scrollHeight) + 'px'; },
  gsearch(el) {
    const q = el.value.trim().toLowerCase(); if (q.length < 2) { closePop(); return; }
    const res = [];
    S.tasks.filter(t => (t.id + ' ' + t.title).toLowerCase().includes(q)).slice(0, 4).forEach(t => res.push(`<button class="mi" data-a="openTask" data-id="${t.id}">${ic('tasks')}<span class="ell"><span class="mono faint">${t.id}</span> ${esc(t.title)}</span></button>`));
    S.users.filter(u => (u.name + ' ' + u.title).toLowerCase().includes(q)).slice(0, 3).forEach(u => res.push(`<button class="mi" data-a="openUser" data-id="${u.id}">${av(u.id, 'sm')}<span>${esc(u.name)} <span class="muted">· ${esc(u.title)}</span></span></button>`));
    S.files.filter(f => f.name.toLowerCase().includes(q)).slice(0, 3).forEach(f => res.push(`<a class="mi" href="#files" style="display:flex;gap:9px;padding:7px 9px;text-decoration:none;color:var(--text)">${ic('files')}<span class="ell">${esc(f.name)}</span></a>`));
    S.kb.filter(k => (k.title + k.body).toLowerCase().includes(q)).slice(0, 2).forEach(k => res.push(`<button class="mi" data-a="kbGo" data-id="${k.id}">${ic('book')}<span class="ell">${esc(k.title)}</span></button>`));
    S.messages.filter(m => m.text.toLowerCase().includes(q)).slice(-3).forEach(m => res.push(`<button class="mi" data-a="openChat2" data-id="${m.chat}">${ic('chat')}<span class="ell"><b>${esc(first(m.from))}:</b> ${esc(m.text)}</span></button>`));
    openPop(el, res.join('') || `<div class="muted" style="padding:8px">No results for “${esc(q)}”</div>`);
    $('#pop .pop').style.width = Math.min(460, innerWidth - 16) + 'px';
  },
};
A.kbGo = d => { UI.kb = d.id; UI.tabs.files = 'kb'; closePop(); go('files'); render(); };
A.openChat2 = d => { UI.chat = d.id; closePop(); go('chat'); };

/* ================= forms ================= */
const F = {
  doing(f, fd) { const v = (fd.get('text') || '').trim(); me().doing = v ? { text: v } : null; closePop(); toast(v ? 'Status updated' : 'Activity cleared', v ? 'Everyone sees it above your head.' : '', 'ok'); commit(); },
  task(f, fd) {
    const id = f.dataset.id, t = id && task(id);
    const d = { title: fd.get('title').trim(), desc: fd.get('desc').trim(), project: fd.get('project') || null, priority: fd.get('priority'), due: parseDT(fd.get('dueD'), fd.get('dueT') || '17:00'), assignees: fd.getAll('assignees'), reviewers: fd.getAll('reviewers'), deps: fd.getAll('deps') };
    if (!d.assignees.length) { toast('Pick at least one assignee', '', 'warn'); return; }
    if (d.project) d.dept = proj(d.project).dept;
    if (d.assignees[0]) d.dept = user(d.assignees[0]).dept;
    if (t) {
      const added = d.assignees.filter(a => !t.assignees.includes(a));
      const changes = [];
      if (t.due !== d.due) changes.push(`due date to ${fDay(d.due)}`); if (t.priority !== d.priority) changes.push(`priority to ${PRI[d.priority].l}`);
      Object.assign(t, d); t.lastUpdate = now();
      if (t.status === 'overdue' && t.due > now()) { t.status = 'progress'; t.flags = {}; t.escalated = false; changes.push('cleared Overdue'); }
      t.activity.push({ at: now(), who: ME, text: 'edited the task' + (changes.length ? ': ' + changes.join(', ') : '') });
      if (added.length) notify(added, { type: 'assigned', title: `You were added to ${t.id}`, body: t.title, link: { task: t.id }, from: ME });
      if (changes.length) notify(t.assignees.filter(a => !added.includes(a)), { type: 'assigned', title: `${t.id} changed`, body: changes.join(', '), link: { task: t.id }, from: ME });
      closeModal(); toast('Task updated', '', 'ok'); commit(); return;
    }
    d.subtasks = (fd.get('subtasks') || '').split('\n').map(s => s.trim()).filter(Boolean);
    d.fromChat = !!fd.get('fromChat'); d.fromMeeting = fd.get('fromMeeting') || null;
    const nt = createTask(d);
    closeModal(); toast(`${nt.id} created`, `${nt.assignees.map(first).join(', ')} notified · added to the calendar for ${fDay(nt.due)}.`, 'ok');
    UI.drawer = { type: 'task', id: nt.id }; commit();
  },
  submit(f, fd) {
    const t = task(fd.get('task'));
    const links = (fd.get('links') || '').split('\n').map(s => s.trim()).filter(Boolean);
    const files = [...(f.elements.files.files || [])].map(file => { const id = rid('f'); try { BLOBS[id] = URL.createObjectURL(file); } catch (e) {} S.files.push({ id, name: file.name, size: file.size, folder: dept(t.dept)?.name === 'Operations & HR' ? 'HR' : (dept(t.dept)?.name || 'Shared'), by: ME, at: now(), task: t.id }); return { id, name: file.name, size: file.size }; });
    if (!links.length && !files.length && !fd.get('note').trim()) { toast('Add a link, file or note', '', 'warn'); return; }
    if (isBlocked(t)) { toast(`${t.id} is blocked`, 'Finish its dependencies first.', 'warn'); return; }
    const s = submitWork(t, { note: fd.get('note').trim(), links, files });
    closeModal(); toast(`Submitted ${t.id} v${s.version}`, `${t.reviewers.map(first).join(', ')} will review it.`, 'ok'); commit();
  },
  review(f, fd, ev) {
    const decision = ev.submitter?.value || 'approved'; const comment = (fd.get('comment') || '').trim();
    if (decision === 'revision' && !comment) { toast('Add feedback', 'Tell them what to change.', 'warn'); return; }
    const s = S.submissions.find(x => x.id === f.dataset.id); reviewSub(s, decision, comment);
    DROP.add('rev-' + s.id);
    toast(decision === 'approved' ? `${s.task} approved and completed` : 'Revision requested', decision === 'approved' ? 'Assignees notified, dependent tasks unblocked.' : 'The assignee was notified.', decision === 'approved' ? 'ok' : 'info'); commit();
  },
  meeting(f, fd) {
    const start = parseDT(fd.get('d'), fd.get('t')); const inv = fd.getAll('inv');
    if (!inv.length) { toast('Invite at least one person', '', 'warn'); return; }
    const id = 'M-' + (S.meetings.length + 1 + Math.floor(Math.random() * 900));
    const m = { id, title: fd.get('title').trim(), start, dur: +fd.get('dur'), room: fd.get('room'), host: ME, agenda: fd.get('agenda').trim(), link: 'https://meet.northdesk.example/' + id.toLowerCase(), attendees: [{ id: ME, rsvp: 'yes' }].concat(inv.map(i => ({ id: i, rsvp: 'pending' }))), notes: '', actions: [], consent: false, summary: '' };
    S.meetings.push(m);
    notify(inv, { type: 'meeting', title: `${uname(ME)} invited you: ${m.title}`, body: `${fDT(start)} · ${m.dur} min`, link: { meeting: id }, from: ME });
    log(ME, `scheduled "${m.title}"`, { meeting: id });
    closeModal(); toast('Meeting scheduled', `Invites sent and added to ${inv.length + 1} calendars.`, 'ok'); UI.drawer = { type: 'meeting', id }; commit();
  },
  notes(f, fd) { const m = meeting(f.dataset.id); m.notes = fd.get('notes'); toast('Notes saved', '', 'ok'); commit(); },
  addAction(f, fd) { const m = meeting(f.dataset.id); m.actions.push({ text: fd.get('text').trim(), owner: fd.get('owner'), due: parseDT(fd.get('due'), '17:00'), task: null }); DROP.add('act-' + m.id); commit(); },
  send(f) {
    const i = $('#msgInput'); const text = (i.value || '').trim(); const files = UI.pending || [];
    if (!text && !files.length) return;
    const c = S.chats.find(x => x.id === UI.chat);
    S.messages.push({ id: rid('msg'), chat: c.id, from: ME, at: now(), text, files });
    UI.pending = []; DROP.add('msgInput'); i.value = '';
    const mentioned = S.users.filter(u => u.id !== ME && new RegExp('@' + u.name.split(' ')[0] + '\\b').test(text)).map(u => u.id);
    notify(mentioned, { type: 'chat', title: `${uname(ME)} mentioned you in ${chatName(c)}`, body: text.slice(0, 120), link: { chat: c.id }, from: ME });
    if (c.kind !== 'channel') notify(c.members.filter(x => x !== ME && !mentioned.includes(x)), { type: 'chat', title: c.kind === 'dm' ? `Message from ${uname(ME)}` : `${uname(ME)} in ${c.name}`, body: text.slice(0, 120), link: { chat: c.id }, from: ME });
    if (c.kind === 'dm') {
      const o = user(c.members.find(x => x !== ME));
      if (['dnd', 'focus'].includes(o.status)) toast(`${o.name} is in ${PRES[o.status].l}`, `Your message is saved. They will see it${o.statusUntil ? ' after ' + fTime(o.statusUntil) : ' later'}.`, 'info');
      else if (o.status !== 'offline' && S.workspace.simulate) setTimeout(() => { S.messages.push({ id: rid('msg'), chat: c.id, from: o.id, at: now(), text: pick(DM_REPLIES) }); if (UI.route !== 'chat' || UI.chat !== c.id) notify(ME, { type: 'chat', title: `Message from ${o.name}`, link: { chat: c.id }, from: o.id }); commit(); }, 2500 + Math.random() * 3000);
    }
    commit();
  },
  newChat(f, fd) {
    const to = fd.getAll('to'); if (!to.length) { toast('Pick someone', '', 'warn'); return; }
    if (to.length === 1) UI.chat = dmId(to[0]);
    else { const id = rid('g-'); S.chats.push({ id, kind: 'group', name: fd.get('name').trim() || to.map(first).concat(first(ME)).join(', '), members: [ME].concat(to) }); UI.chat = id; notify(to, { type: 'chat', title: `${uname(ME)} added you to a group chat`, link: { chat: id }, from: ME }); }
    closeModal(); go('chat'); commit();
  },
  addSub(f, fd) { const t = task(f.dataset.id); t.subtasks.push({ id: rid('s'), t: fd.get('t').trim(), done: false }); t.lastUpdate = now(); DROP.add('newsub-' + t.id); commit(); },
  addLink(f, fd) { const t = task(f.dataset.id); const url = fd.get('url').trim(); t.attachments.push({ id: rid('a'), url, name: url.replace(/^https?:\/\//, '').slice(0, 60) }); t.activity.push({ at: now(), who: ME, text: 'added a link' }); DROP.add('newlink-' + t.id); commit(); },
  comment(f, fd) {
    const t = task(f.dataset.id); const text = fd.get('text').trim(); if (!text) return;
    t.comments.push({ id: rid('c'), who: ME, at: now(), text }); t.lastUpdate = now();
    const ment = S.users.filter(u => u.id !== ME && text.includes('@' + u.name.split(' ')[0])).map(u => u.id);
    notify(uniq(t.assignees.concat(t.reviewers, ment)), { type: ment.length ? 'chat' : 'assigned', title: `${uname(ME)} commented on ${t.id}`, body: text.slice(0, 120), link: { task: t.id }, from: ME });
    DROP.add('cmt-' + t.id); commit();
  },
  profile(f, fd) { const u = me(); ['name', 'title', 'phone', 'tz', 'bio'].forEach(k => u[k] = (fd.get(k) || '').trim() || u[k]); if (fd.get('color')) u.color = fd.get('color'); toast('Profile saved', '', 'ok'); commit(); },
  dndCustom(f, fd) { const n = +fd.get('mins'); if (n > 0) { DROP.add('dndMin'); startDND(n); } },
  focusCustom(f, fd) { const n = +fd.get('mins'); if (n > 0) { DROP.add('focusMin'); startFocus(n); } },
  workspace(f, fd) { if (!can('workspace.manage')) return; Object.assign(S.workspace, { name: fd.get('name').trim() || S.workspace.name, hours: fd.get('hours'), autoAway: +fd.get('autoAway'), simulate: !!fd.get('simulate') }); toast('Workspace saved', '', 'ok'); commit(); },
  leave(f, fd) { const l = { id: 'L-' + (S.leaves.length + 1 + Math.floor(Math.random() * 90)), user: ME, type: fd.get('type'), from: parseDT(fd.get('from')), to: parseDT(fd.get('to')), reason: fd.get('reason'), status: 'pending', at: now(), approver: null }; if (l.to < l.from) { toast('End date is before start date', '', 'warn'); return; } S.leaves.push(l); notify(S.users.filter(u => u.role === 'admin' || u.id === deptHead(me().dept)).map(u => u.id), { type: 'leave', title: `Leave request from ${uname(ME)}`, body: `${l.type}, ${fDay(l.from)} – ${fDay(l.to)}`, from: ME, link: { route: 'employees' } }); closeModal(); UI.tabs.emp = 'leave'; toast('Leave requested', 'Your manager was notified.', 'ok'); commit(); },
  request(f, fd) { const r = { id: 'R-' + (S.requests.length + 1 + Math.floor(Math.random() * 90)), title: fd.get('title').trim(), cat: fd.get('cat'), by: ME, at: now(), status: 'open', assignee: null, notes: fd.get('notes').trim() }; S.requests.push(r); notify(S.users.filter(u => u.role === 'admin' || (r.cat === 'HR' && u.dept === 'ops')).map(u => u.id), { type: 'request', title: `New ${r.cat} request`, body: r.title, from: ME, link: { route: 'employees' } }); closeModal(); UI.tabs.emp = 'requests'; toast('Request submitted', 'You will be notified when it moves.', 'ok'); commit(); },
  ann(f, fd) { const a = { id: 'A-' + (S.announcements.length + 1 + Math.floor(Math.random() * 90)), title: fd.get('title').trim(), body: fd.get('body').trim(), by: ME, at: now(), pinned: !!fd.get('pinned'), urgent: !!fd.get('urgent'), reads: [ME] }; S.announcements.push(a); notify(S.users.map(u => u.id), { type: 'announce', title: (a.urgent ? 'Urgent: ' : '') + a.title, body: a.body.slice(0, 120), from: ME, essential: a.urgent, link: { route: 'announcements' } }); log(ME, `posted "${a.title}"`, { route: 'announcements' }); closeModal(); toast('Announcement posted', `${S.users.length - 1} people notified.`, 'ok'); commit(); },
  kb(f, fd) { const k = { id: 'K-' + (S.kb.length + 1 + Math.floor(Math.random() * 90)), title: fd.get('title').trim(), tags: fd.get('tags').split(',').map(s => s.trim()).filter(Boolean), by: ME, at: now(), body: fd.get('body').trim() }; S.kb.push(k); UI.kb = k.id; closeModal(); commit(); },
  project(f, fd) { const id = rid('p'); const ms = (fd.get('ms') || '').split('\n').map(l => l.split(',')).filter(x => x[0] && x[1]).map(x => ({ id: rid('m'), name: x[0].trim(), date: parseDT(x[1].trim()) })).filter(m => !isNaN(m.date)); S.projects.push({ id, name: fd.get('name').trim(), dept: fd.get('dept'), owner: ME, color: pick(['#2457d6', '#0f8a8a', '#d97b1a', '#7a4fd0', '#1b8f4e', '#d0569a']), start: now(), end: parseDT(fd.get('end')), desc: fd.get('desc').trim(), milestones: ms }); UI.proj = id; log(ME, `created project ${fd.get('name')}`); closeModal(); commit(); },
  employee(f, fd) { const n = S.users.length + 1; let id = 'u' + n; while (user(id)) id = 'u' + (++n); S.users.push({ id, name: fd.get('name').trim(), title: fd.get('title').trim(), dept: fd.get('dept'), role: fd.get('role'), color: pick(['#2457d6', '#0f8a8a', '#c2410c', '#7a4fd0', '#15803d', '#be185d']), status: 'offline', prevStatus: null, statusUntil: null, auto: null, room: null, email: fd.get('email').trim(), phone: '', tz: 'Asia/Bangkok', joined: now(), bio: '', visibility: 'everyone', focus: null }); log(ME, `added ${fd.get('name')} to ${dept(fd.get('dept')).name}`); closeModal(); toast('Employee added', 'They appear offline until they sign in.', 'ok'); commit(); },
  dept(f, fd) { const name = fd.get('name').trim(); S.departments.push({ id: rid('d'), name, head: fd.get('head'), color: pick(['#0f8a8a', '#7a4fd0', '#b45309']) }); closeModal(); commit(); },
  block(f, fd) { const s = parseDT(fd.get('d'), fd.get('from')), e = parseDT(fd.get('d'), fd.get('to')); if (e <= s) { toast('End time must be after start', '', 'warn'); return; } S.schedules.push({ id: rid('B-'), user: ME, title: fd.get('title').trim(), start: s, end: e }); closeModal(); toast('Added to your schedule', '', 'ok'); commit(); },
  async ask(f, fd) {
    const q = (fd.get('q') || '').trim(); if (!q) return;
    const m = me();
    const ctx = { today: fDT(now()), me: { name: m.name, role: m.role, dept: dept(m.dept).name, status: PRES[m.status].l }, myTasks: ctxTasks(S.tasks.filter(t => t.assignees.includes(ME) || t.reviewers.includes(ME))), teamOpenTasks: ctxTasks(scopeTasks(role() === 'employee' ? 'team' : defaultScope()).filter(t => t.status !== 'done')).slice(0, 25), meetingsNext7d: S.meetings.filter(x => x.start > now() && x.start < now() + 7 * DAY).map(x => ({ title: x.title, when: fDT(x.start), attendees: x.attendees.map(a => uname(a.id)) })), people: S.users.map(u => ({ name: u.name, title: u.title, dept: dept(u.dept)?.name, status: PRES[shownStatus(u)].l, openTasks: S.tasks.filter(t => t.assignees.includes(u.id) && t.status !== 'done').length })), knowledgeBase: S.kb.map(k => ({ title: k.title, body: k.body })), files: S.files.map(x => x.name) };
    const r = await runAI('Answer', `You are the work assistant inside Northdesk, an office app. Answer the user's question using only this workspace data. Be concise (under 150 words), concrete, and cite task IDs or article titles. If the data does not contain the answer, say so.\nWorkspace: ${JSON.stringify(ctx)}\nQuestion: ${q}`, () => smartSearch(q));
    UI.ai.out = typeof r === 'string' ? r : JSON.stringify(r); render();
  },
};

/* ================= global listeners ================= */
document.addEventListener('click', e => {
  const inPop = e.target.closest('#pop'), a = e.target.closest('[data-a]');
  if (!inPop && !(a && ['statusMenu', 'focusMenu'].includes(a.dataset.a)) && $('#pop').innerHTML && !e.target.closest('#gsearch')) closePop();
  if (UI.sideOpen && !e.target.closest('#side') && !e.target.closest('.hamb')) { UI.sideOpen = false; render(); }
  if (e.target.matches('.scrim')) { closeModal(); return; }
  if (e.target.closest('#side a')) { UI.sideOpen = false; }
  if (!a) return;
  if (a.closest('form') && a.tagName === 'BUTTON' && a.type === 'submit' && !a.dataset.a) return;
  const fn = A[a.dataset.a]; if (!fn) return;
  e.preventDefault(); e.stopPropagation();
  fn(a.dataset, a, e);
});
document.addEventListener('submit', e => { const f = e.target; const fn = F[f.dataset.form]; if (!fn) return; e.preventDefault(); fn(f, new FormData(f), e); });
document.addEventListener('change', e => { const el = e.target.closest('[data-c]'); if (el && C[el.dataset.c]) C[el.dataset.c](el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if (el && I[el.dataset.i]) I[el.dataset.i](el, e); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if ($('#pop').innerHTML) closePop(); else if ($('#overlay').innerHTML) closeModal(); else if (UI.drawer) closeDrawer(); else if (UI.route !== 'floor' && !OB.open) A.closeWin(); }
  if (e.key === 'Enter' && !e.shiftKey && e.target.id === 'msgInput') { e.preventDefault(); e.target.form.requestSubmit(); }
  if (e.key === 'Enter' && e.target.classList.contains('tcard')) A.openTask({ id: e.target.dataset.id });
  if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { const s = $('#gsearch'); if (s && s.offsetParent) { e.preventDefault(); s.focus(); } }
});
// kanban drag and drop
document.addEventListener('dragstart', e => { const c = e.target.closest && e.target.closest('[data-drag]'); if (c) { e.dataTransfer.setData('text/plain', c.dataset.drag); e.dataTransfer.effectAllowed = 'move'; } });
document.addEventListener('dragover', e => { const col = e.target.closest && e.target.closest('[data-drop]'); if (col) { e.preventDefault(); $$('.kcol.over').forEach(x => x !== col && x.classList.remove('over')); col.classList.add('over'); } });
document.addEventListener('dragleave', e => { const col = e.target.closest && e.target.closest('[data-drop]'); if (col && !col.contains(e.relatedTarget)) col.classList.remove('over'); });
document.addEventListener('drop', e => {
  const col = e.target.closest && e.target.closest('[data-drop]'); if (!col) return; e.preventDefault();
  const t = task(e.dataTransfer.getData('text/plain')), s = col.dataset.drop; if (!t) return;
  const editable = t.assignees.includes(ME) || canReview(t) || can('task.assign');
  if (!editable) { toast('You cannot move this task', 'Only assignees, reviewers and managers can.', 'warn'); render(); return; }
  if (s === 'overdue') { toast('Overdue is set automatically', 'Northdesk marks tasks overdue when the deadline passes.', 'info'); render(); return; }
  if (s === 'review' && t.assignees.includes(ME)) { render(); submitForm(t.id); return; }
  if (s === 'review') { toast('Assignees submit work', 'The task moves to Pending Review when they submit.', 'info'); render(); return; }
  if (changeTaskStatus(t, s)) commit(); else render();
});
$('#filepick').addEventListener('change', e => {
  const files = [...e.target.files]; e.target.value = ''; if (!files.length || !PICK) return;
  const metas = files.map(file => { const id = rid('f'); try { BLOBS[id] = URL.createObjectURL(file); } catch (err) {} return { id, name: file.name, size: file.size }; });
  const folderOf = () => UI.folder === 'All' ? 'Shared' : UI.folder;
  if (PICK.kind === 'chat') { UI.pending = (UI.pending || []).concat(metas); metas.forEach(m => S.files.push({ id: m.id, name: m.name, size: m.size, folder: 'Shared', by: ME, at: now(), task: null })); }
  else if (PICK.kind === 'voice') { const room = S.voice.room; const ch = S.chats.find(c => c.id === 'c-' + room) || S.chats[0]; S.messages.push({ id: rid('msg'), chat: ch.id, from: ME, at: now(), text: 'Shared from the voice room', files: metas }); metas.forEach(m => S.files.push({ id: m.id, name: m.name, size: m.size, folder: 'Shared', by: ME, at: now(), task: null })); toast(`Shared in ${chatName(ch)}`, metas.map(m => m.name).join(', '), 'ok'); }
  else if (PICK.kind === 'task') { const t = task(PICK.id); metas.forEach(m => { t.attachments.push(m); S.files.push({ id: m.id, name: m.name, size: m.size, folder: 'Shared', by: ME, at: now(), task: t.id }); }); t.activity.push({ at: now(), who: ME, text: `attached ${metas.length} file${metas.length > 1 ? 's' : ''}` }); t.lastUpdate = now(); }
  else { metas.forEach(m => S.files.push({ id: m.id, name: m.name, size: m.size, folder: folderOf(), by: ME, at: now(), task: null })); toast(`${metas.length} file${metas.length > 1 ? 's' : ''} uploaded`, `To ${folderOf()}`, 'ok'); }
  PICK = null; commit();
});
// simulated speaking indicator for voice rooms
setInterval(() => {
  const tiles = $$('[data-speaker]'); tiles.forEach(t => t.classList.remove('speaking'));
  if (!tiles.length || S.voice.deafened) return;
  const cand = tiles.filter(t => !(t.dataset.speaker === ME && S.voice.muted));
  if (cand.length && Math.random() < 0.8) pick(cand).classList.add('speaking');
}, 1300);

Object.assign(A, OBA, {
  pxZoom(d) { PX.mode = d.v; render(); },
  lang() { setLang(LANG === 'th' ? 'en' : 'th'); },
  dressing() { PX.openEditor('look'); },
  deskEdit() { PX.openEditor('desk'); },
  edSet(d) { PX.setOpt(d.kind, d.k, d.v); },
  edStep(d) { PX.stepOpt(d.kind, d.k, +d.v); },
  edRot(d) { PX.rotate(+d.v); },
  placeDesk() { PX.startPlacing(); },
  pxRemoveDesk(d) { PX.removeDesk(d.id); },
  vMode(d) { S.voice.mode = d.v; toast(d.v === 'shout' ? 'Shout mode' : 'Nearby mode', d.v === 'shout' ? 'Everyone in the office hears you.' : 'Only people inside the dotted circle hear you.', 'info'); commit(); },
  edSave(d) { PX.saveEd(d.kind); },
  edShuffle(d) { PX.shuffleEd(d.kind); },
  openWin(d) { closePop(); if (UI.route === d.v) go('floor'); else go(d.v); },
  closeWin() { go('floor'); setTimeout(() => document.querySelector('.pxcv')?.focus(), 30); },
});
Object.assign(A, DJ.actions); Object.assign(C, DJ.changes); Object.assign(F, DJ.forms);
F.say = (f, fd) => { PX.say(fd.get('t')); const i = document.getElementById('sayInput'); if (i) { i.value = ''; i.blur(); } DROP.add('sayInput'); document.querySelector('.pxcv')?.focus(); };
// touch d-pad
document.addEventListener('pointerdown', e => { const b = e.target.closest('[data-pad]'); if (!b) return; e.preventDefault(); if (b.dataset.pad === 'act') { PX.interact(); return; } PX.padKey(b.dataset.pad, true); try { b.setPointerCapture(e.pointerId); } catch (err) {} });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => document.addEventListener(t, e => { const b = e.target.closest && e.target.closest('[data-pad]'); if (b && b.dataset.pad !== 'act') PX.padKey(b.dataset.pad, false); }));
// hotbar number keys
document.addEventListener('keydown', e => {
  if (!user(ME) || OB.open || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '') || $('#overlay').innerHTML) return;
  if (/^Digit[0-9]$/.test(e.code) && !e.metaKey && !e.ctrlKey && !e.altKey) { const n = (+e.code.slice(5) + 9) % 10; const it = HOTBAR[n]; if (it) { e.preventDefault(); A.openWin({ v: it[0] }); } }
});

/* ================= boot ================= */
(function init() {
  const how = loadState();
  document.body.insertAdjacentHTML('beforeend', '<div id="drawer"></div>');
  if (!user(ME)) ME = 'u4';
  const r = (location.hash || '').slice(1); UI.route = VIEWS[r] ? r : 'floor';
  addEventListener('hashchange', () => { const r = location.hash.slice(1); UI.route = VIEWS[r] ? r : 'floor'; UI.sideOpen = false; UI.confirm = null; if (!UI.keepDrawer) UI.drawer = null; UI.keepDrawer = false; closePop(); doRender(); $('#content').scrollTop = 0; });
  initCaps();
  doRender();
  setTimeout(tick, 1500); setInterval(tick, 8000);
  DJ.boot();
  if (user(ME)) { const u = me(); if (u.status === 'offline') { u.status = 'online'; commit(); } }
})();
