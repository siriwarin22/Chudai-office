'use strict';
/* Supabase sync for the hosted version.
   - Shared data: every item of the workspace (users, tasks, messages, desks…) is one row in office_docs, kept live with Realtime.
   - Live floor: walking, status, mic, speech bubbles and the DJ booth go over a Realtime channel with presence and broadcast. */
const SUPA_URL = 'https://nvzpznjwbkyuykjscqei.supabase.co';
const SUPA_KEY = 'sb_publishable_r5XG0onZOBJ4Wcf5qfpYoA_c942GCRF';
window.ND_HOSTED = true;
window.NET_LEADER = true;

const NET = (() => {
  const LOCAL_ONLY = new Set(['v', 'seededAt', 'voice', 'calls', 'gsync', 'reads']);
  const MAPS = new Set(['prefs']);
  const TABLE = 'office_docs';
  let db = null, ch = null, snap = new Map(), pushT = null, ready = false, applying = false, status = 'connecting';
  const recent = new Map(); // rows this tab just wrote: ignore their echo so a late echo cannot undo a newer local edit
  const keyOf = it => it.id || it._k || (it._k = rid('k'));

  function flatten() {
    const out = new Map();
    for (const k in S) {
      if (LOCAL_ONLY.has(k)) continue;
      const v = S[k];
      if (Array.isArray(v)) v.forEach(it => { if (it && typeof it === 'object') out.set(k + '\u0001' + keyOf(it), [k, keyOf(it), it]); });
      else if (MAPS.has(k) && v && typeof v === 'object') for (const id in v) out.set(k + '\u0001' + id, [k, id, v[id]]);
      else if (k === 'dj' && v) { const { vol, near, ...shared } = v; out.set('_\u0001dj', ['_', 'dj', shared]); }
      else out.set('_\u0001' + k, ['_', k, v]);
    }
    return out;
  }
  function schedulePush() { if (!ready || applying) return; clearTimeout(pushT); pushT = setTimeout(push, 350); }
  async function push() {
    if (!ready) return;
    const cur = flatten(), up = [], del = new Map();
    cur.forEach(([c, id, data], k) => { const j = JSON.stringify(data); if (snap.get(k) !== j) { up.push({ collection: c, id, data, updated_at: new Date().toISOString() }); snap.set(k, j); recent.set(k, Date.now()); } });
    for (const k of [...snap.keys()]) if (!cur.has(k)) { const [c, id] = k.split('\u0001'); (del.get(c) || del.set(c, []).get(c)).push(id); snap.delete(k); }
    try {
      for (let i = 0; i < up.length; i += 200) { const { error } = await db.from(TABLE).upsert(up.slice(i, i + 200)); if (error) throw error; }
      for (const [c, ids] of del) { const { error } = await db.from(TABLE).delete().eq('collection', c).in('id', ids); if (error) throw error; }
      setStatus('live');
    } catch (e) { setStatus('error', e.message || String(e)); up.forEach(r => snap.delete(r.collection + '\u0001' + r.id)); }
  }
  function applyRow(c, id, data) {
    const k = c + '\u0001' + id, j = JSON.stringify(data);
    if (snap.get(k) === j) return false;
    snap.set(k, j);
    if (c === '_') { if (id === 'dj') { const loc = S.dj || {}; S.dj = Object.assign({}, data, { vol: loc.vol ?? 60, near: loc.near ?? true }); } else S[id] = data; return true; }
    if (MAPS.has(c)) { (S[c] || (S[c] = {}))[id] = data; return true; }
    const arr = S[c] || (S[c] = []);
    const i = arr.findIndex(x => keyOf(x) === id);
    if (i >= 0) arr[i] = data; else arr.push(data);
    return true;
  }
  function removeRow(c, id) {
    const k = c + '\u0001' + id; if (!snap.has(k)) return false; snap.delete(k);
    if (c === '_') { delete S[id]; return true; }
    if (MAPS.has(c)) { if (S[c]) delete S[c][id]; return true; }
    if (Array.isArray(S[c])) { const i = S[c].findIndex(x => keyOf(x) === id); if (i >= 0) S[c].splice(i, 1); }
    return true;
  }
  let rq = null;
  function refresh() { clearTimeout(rq); rq = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} render(); }, 60); }

  async function loadAll() {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db.from(TABLE).select('collection,id,data').range(from, from + 999);
      if (error) throw error;
      rows.push(...data); if (data.length < 1000) break;
    }
    return rows;
  }
  async function start() {
    if (!window.supabase || !window.supabase.createClient) { setStatus('offline', 'Could not load the realtime library.'); return; }
    db = window.supabase.createClient(SUPA_URL, SUPA_KEY, { auth: { persistSession: false }, realtime: { params: { eventsPerSecond: 20 } } });
    try {
      const rows = await loadAll();
      applying = true;
      if (rows.length) {
        const local = S, fresh = NDSeed();
        // remote is the source of truth; keep this device's private bits
        for (const k in fresh) if (!LOCAL_ONLY.has(k)) { S[k] = Array.isArray(fresh[k]) ? [] : (MAPS.has(k) ? {} : fresh[k]); }
        S.voice = local.voice || fresh.voice; S.reads = local.reads || {}; S.gsync = local.gsync;
        const keepDj = local.dj || {};
        rows.forEach(r => applyRow(r.collection, r.id, r.data));
        if (S.dj) { S.dj.vol = keepDj.vol ?? 60; S.dj.near = keepDj.near ?? true; }
        snap = new Map(); flatten().forEach(([c, id, data], k) => snap.set(k, JSON.stringify(data)));
        // anything this device had that the server did not (e.g. a character made before connecting) gets uploaded
        local.users && local.users.forEach(u => { if (!S.users.some(x => x.id === u.id) && u.id === ME) S.users.push(u); });
      } else snap = new Map();
      applying = false; ready = true;
      if (!user(ME) && typeof OB !== 'undefined') { OB.open = false; document.getElementById('onb').innerHTML = ''; }
      refresh(); await push();
      subscribe();
      setStatus('live');
    } catch (e) { applying = false; setStatus('error', e.message || String(e)); }
  }
  function subscribe() {
    db.channel('office-docs').on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, p => {
      let ch_ = false;
      const row = p.eventType === 'DELETE' ? p.old : p.new; if (!row) return;
      const k = row.collection + '\u0001' + row.id;
      if ((recent.get(k) || 0) > Date.now() - 3000) return;
      const mine = user(ME), myStatus = mine && mine.status;
      if (p.eventType === 'DELETE') ch_ = removeRow(row.collection, row.id);
      else ch_ = applyRow(row.collection, row.id, row.data);
      // nobody else decides that this tab is offline
      if (row.collection === 'users' && row.id === ME && myStatus && myStatus !== 'offline' && user(ME) && user(ME).status === 'offline') { user(ME).status = myStatus; schedulePush(); }
      if (ch_) refresh();
    }).subscribe();
    // live floor
    ch = db.channel('office-floor', { config: { presence: { key: tabId }, broadcast: { self: false } } });
    let cur = {}, tT = null, lastT = 0;
    const track = () => { clearTimeout(tT); const wait = Math.max(0, 150 - (Date.now() - lastT)); tT = setTimeout(() => { lastT = Date.now(); ch.track(cur).catch(() => {}); }, wait); };
    CAP.room = {
      presence(p) { cur = Object.assign({}, cur, p); track(); return Promise.resolve(); },
      emit(topic, data) { return ch.send({ type: 'broadcast', event: topic, payload: { peer: tabId, data } }); },
    };
    ch.on('broadcast', { event: 'say' }, ({ payload }) => { if (payload && typeof PX !== 'undefined') PX.remoteSay({ peer: payload.peer, data: payload.data, isMe: false }); });
    ch.on('broadcast', { event: 'dj' }, ({ payload }) => { if (payload && typeof DJ !== 'undefined') DJ.onMsg({ peer: payload.peer, data: payload.data, isMe: false }); });
    ch.on('broadcast', { event: 'voiceSignal' }, ({ payload }) => { if (payload && typeof VOICE !== 'undefined') VOICE.onSignal(payload.peer, payload.data); });
    let known = new Set(); const seen = new Map(); let presenceReadyAt = 0;
    // Ignore short presence gaps so an active colleague is not sent offline while Realtime reconnects.
    const offlineCheck = () => {
      const tnow = Date.now();
      (CAP.peers || []).forEach(p => { if (p.presence.uid) seen.set(p.presence.uid, tnow); }); seen.set(ME, tnow);
      if (!window.NET_LEADER || !ready || !presenceReadyAt || tnow - presenceReadyAt < 30000) return;
      S.users.forEach(u => { if (!seen.has(u.id)) seen.set(u.id, presenceReadyAt); });
      const live = new Set([...seen].filter(([, at]) => tnow - at < 60000).map(([id]) => id));
      let changed = false;
      S.users.forEach(u => { if (!live.has(u.id) && u.status !== 'offline') { u.status = 'offline'; u.room = null; u.statusUntil = null; u.prevStatus = null; changed = true; } });
      if (changed) commit();
    };
    setInterval(offlineCheck, 10000);
    ch.on('presence', { event: 'sync' }, () => {
      const st = ch.presenceState();
      const keys = Object.keys(st).sort();
      CAP.peers = keys.filter(k => k !== tabId).map(k => { const a = st[k]; return { peer: k, presence: a[a.length - 1] || {}, isMe: false, kind: 'viewer', by: null, guest: false }; });
      if (!presenceReadyAt) { presenceReadyAt = Date.now(); S.users.forEach(u => seen.set(u.id, presenceReadyAt)); }
      window.NET_LEADER = keys[0] === tabId; LEADER = LEADER && window.NET_LEADER;
      const now_ = new Set(keys);
      if ([...now_].some(k => !known.has(k)) && typeof DJ !== 'undefined') DJ.onJoin();
      known = now_;
      offlineCheck();
      if (UI.route === 'office') render();
    });
    ch.subscribe(s => { if (s === 'SUBSCRIBED') { if (typeof PX !== 'undefined') PX.netPush(true); } });
  }
  function setStatus(s, msg) {
    const was = status; status = s;
    if (s === 'error' && was !== 'error') toast('Could not reach the office server', (msg || '') + ' Changes are kept on this device and sent when the connection is back.', 'bad');
    if (s === 'offline') toast('Offline mode', msg || '', 'warn');
    const el = document.getElementById('netdot'); if (el) { el.dataset.s = s; el.title = s; }
  }
  return { start, schedulePush, get status() { return status; }, get ready() { return ready; } };
})();

// every local save also goes to the server
const _persist = persist;
persist = function () { _persist(); NET.schedulePush(); };
NET.start();
