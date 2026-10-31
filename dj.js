'use strict';
/* DJ booth: a shared YouTube link queue and a now-playing link, synced live to everyone in the office.
   YouTube cannot be embedded in this sandbox, so links open on YouTube. */
const DJ = (() => {
  const STATIONS = [
    { id: 'lofi', name: 'Lo-fi office', bpm: 76, wave: 'triangle', cut: 1500, prog: [[57, 60, 64, 67], [53, 57, 60, 64], [50, 53, 57, 60], [52, 55, 59, 62]], kick: [0, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], bass: [0, 6, 10], mel: 0.32, crackle: true, color: '#e05a8a' },
    { id: 'jazz', name: 'Coffee jazz', bpm: 92, wave: 'sine', cut: 2400, prog: [[50, 53, 57, 60], [55, 59, 62, 65], [48, 52, 55, 59], [57, 61, 64, 67]], kick: [0, 8], snare: [4, 12], hat: [0, 3, 4, 7, 8, 11, 12, 15], bass: [0, 4, 8, 12], walk: true, mel: 0.42, brush: true, color: '#e8b13a' },
    { id: 'synth', name: 'Synthwave focus', bpm: 104, wave: 'sawtooth', cut: 1100, prog: [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [43, 50, 55, 59]], kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], bass: [0, 2, 4, 6, 8, 10, 12, 14], mel: 0.28, color: '#5ad0e0' },
    { id: 'rain', name: 'Rainy café', bpm: 64, wave: 'sine', cut: 900, prog: [[48, 52, 55, 59], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 53]], kick: [], snare: [], hat: [], bass: [0], mel: 0.22, rain: true, color: '#8a5fd0' },
  ];
  const st = id => STATIONS.find(s => s.id === id);
  const LOCKEY = 'northdesk.djlocal';
  const LV = (() => { try { return Object.assign({ vol: 60, near: true }, JSON.parse(localStorage.getItem(LOCKEY) || '{}')); } catch (e) { return { vol: 60, near: true }; } })();
  const saveLV = () => { try { localStorage.setItem(LOCKEY, JSON.stringify(LV)); } catch (e) {} };
  const D = () => { const x = S.dj || (S.dj = { st: null, at: 0, by: '', q: [], yt: null }); x.vol = LV.vol; x.near = LV.near; if (!Array.isArray(x.q)) x.q = []; return x; };
  let AC = null, master = null, noise = null, timer = null, nextT = 0, step = 0, cur = null, needTap = false, rainSrc = null, lastBy = false;
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  const rng = seed => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  function ensure() {
    if (!AC) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      AC = new C(); master = AC.createGain(); master.gain.value = 0;
      const comp = AC.createDynamicsCompressor(); master.connect(comp); comp.connect(AC.destination);
      noise = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  }
  function tone(type, f, t, dur, g, cut) {
    const o = AC.createOscillator(), a = AC.createGain(); o.type = type; o.frequency.value = f;
    let out = o; if (cut) { const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut; o.connect(lp); out = lp; }
    out.connect(a); a.connect(master);
    a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(g, t + Math.min(0.08, dur * 0.2)); a.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function burst(t, dur, g, type, freq) {
    const s = AC.createBufferSource(); s.buffer = noise; const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; const a = AC.createGain();
    s.connect(f); f.connect(a); a.connect(master); a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  function kick(t) { const o = AC.createOscillator(), a = AC.createGain(); o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); a.gain.setValueAtTime(0.5, t); a.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(a); a.connect(master); o.start(t); o.stop(t + 0.32); }
  function schedule(s, n, t) {
    const sd = 60 / s.bpm / 4, bar = Math.floor(n / 16), k = n % 16, ch = s.prog[bar % s.prog.length], r = rng(bar * 131 + k * 7 + s.bpm);
    if (k === 0) ch.forEach(m => tone(s.wave, midi(m), t, sd * 16 * 0.98, 0.035, s.cut));
    if (s.bass.includes(k)) { const root = s.walk ? ch[(k / 4) % ch.length] - 12 : ch[0] - 12; tone('sine', midi(root), t, sd * (s.walk ? 3.6 : 3), 0.16); }
    if (s.kick.includes(k)) kick(t);
    if (s.snare.includes(k)) burst(t, s.brush ? 0.22 : 0.14, s.brush ? 0.05 : 0.11, 'bandpass', s.brush ? 3000 : 1800);
    if (s.hat.includes(k)) burst(t + (k % 4 === 2 && s.id === 'lofi' ? sd * 0.18 : 0), 0.04, 0.035, 'highpass', 7000);
    if (k % 2 === 0 && r() < s.mel) { const pool = ch.concat(ch.map(x => x + 12)); const m = pool[Math.floor(r() * pool.length)] + 12; tone(s.id === 'synth' ? 'square' : 'triangle', midi(m), t, sd * (2 + Math.floor(r() * 3)), s.id === 'synth' ? 0.025 : 0.05, 2600); }
    if (s.crackle && r() < 0.35) burst(t + r() * sd, 0.01, 0.02, 'highpass', 3000);
  }
  function startEngine() {
    const d = D(), s = st(d.st); if (!s) return stopEngine();
    if (!ensure()) return;
    if (AC.state !== 'running') { needTap = true; render(); }
    if (cur === s.id && timer) return;
    stopEngine(true); cur = s.id;
    const sd = 60 / s.bpm / 4, el = Math.max(0, (Date.now() - (d.at || Date.now())) / 1000);
    step = Math.floor(el / sd); nextT = AC.currentTime + (sd - (el % sd)) + 0.05;
    timer = setInterval(() => { if (!AC) return; while (nextT < AC.currentTime + 0.2) { schedule(s, step, nextT); nextT += sd; step++; } }, 40);
    if (s.rain) { rainSrc = AC.createBufferSource(); rainSrc.buffer = noise; rainSrc.loop = true; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200; const g = AC.createGain(); g.gain.value = 0.05; rainSrc.connect(f); f.connect(g); g.connect(master); rainSrc.start(); }
    level();
  }
  function stopEngine(keep) { clearInterval(timer); timer = null; if (rainSrc) { try { rainSrc.stop(); } catch (e) {} rainSrc = null; } if (!keep) { cur = null; if (master) master.gain.setTargetAtTime(0, AC.currentTime, 0.1); } }
  function level() {
    if (!AC || !master) return; const d = D();
    let g = (d.vol / 100) * 0.7;
    if (d.near && typeof PX !== 'undefined') { const a = PX.myPos(), b = PX.boothPos(); if (a) { const dist = Math.hypot(a.x - b.x, a.y - b.y) / 16; g *= Math.max(0.12, Math.min(1, 1.15 - dist / 18)); } }
    if (S.voice && S.voice.deafened) g = 0;
    master.gain.setTargetAtTime(cur ? g : 0, AC.currentTime, 0.25);
  }
  setInterval(level, 300);
  function share() { if (CAP.room) { const d = D(); CAP.room.emit('dj', { st: d.st, at: d.at, by: d.by, q: d.q.slice(-30), yt: d.yt }).catch(() => {}); lastBy = true; } }
  function onMsg(msg) {
    if (msg.isMe) return; const x = msg.data || {}; const d = D();
    d.st = st(x.st) ? x.st : null; d.at = +x.at || Date.now(); d.by = String(x.by || '').slice(0, 40);
    d.q = Array.isArray(x.q) ? x.q.filter(i => i && YT.test(String(i.url))).slice(-30).map(i => ({ id: String(i.id || rid('y')).slice(0, 20), url: String(i.url).slice(0, 200), by: String(i.by || '').slice(0, 40), at: +i.at || Date.now() })) : d.q;
    d.yt = x.yt && YT.test(String(x.yt.url)) ? { url: String(x.yt.url).slice(0, 200), by: String(x.yt.by || '').slice(0, 40), at: +x.yt.at || Date.now() } : null;
    d.st = null; lastBy = false; persist(); render(); player();
  }
  function onJoin() { if (lastBy) setTimeout(share, 600); }
  const YT = /^https?:\/\/(www\.|m\.|music\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[\w-]{6,}/i;
  const ytId = u => { const m = String(u).match(/(?:v=|youtu\.be\/|shorts\/|live\/)([\w-]{6,})/); return m ? m[1] : ''; };
  function play(id) { const d = D(); ensure(); needTap = false; d.st = id; d.at = Date.now(); d.by = me().name; startEngine(); share(); log(ME, `played ${st(id).name} at the DJ booth`); commit(); }
  function stop() { const d = D(); d.st = null; stopEngine(); share(); commit(); }
  function tap() { ensure(); needTap = false; cur = null; startEngine(); render(); }
  const playing = () => !!(S && S.dj && S.dj.yt);
  function bars(color) { return `<span class="eq" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => `<i style="background:${color};animation-delay:${i * 0.13}s"></i>`).join('')}</span>`; }
  function miniHTML() {
    const x = D(); if (!x.yt) return '';
    return `<div class="vb-row dj-mini">${bars('#c4513f')}<a class="dj-name" href="${esc(x.yt.url)}" target="_blank" rel="noopener" title="${t('Open on YouTube')}">${t('Now playing')}: ${esc(ytId(x.yt.url))}</a><button class="vmode" data-a="djSkip" title="${t('Skip')}">⏭</button><button class="vmode" data-a="openWin" data-v="dj">${t('Queue')}</button></div>`;
  }
  function view() {
    const d = D(), q = d.q || [];
    return phead('DJ booth', 'Share music with the office. Paste a YouTube link, then mark what is playing so everyone can listen along.')
    + `<section class="card"><div class="bd dj-now" style="--c:#c4513f">${d.yt ? `${bars('#c4513f')}<div style="flex:1;min-width:0"><span class="tag">Now playing</span><h2 style="font-size:18px" class="ell"><a href="${esc(d.yt.url)}" target="_blank" rel="noopener">${esc(d.yt.url.replace(/^https?:\/\//, ''))}</a></h2><span class="muted">Picked by ${esc(d.yt.by)}</span>${window.ND_HOSTED ? `<label class="row" style="gap:8px;margin-top:8px;max-width:360px"><span style="font-weight:600">Volume</span><input type="range" min="0" max="100" value="${LV.vol}" data-c="djVol" data-live style="flex:1;accent-color:var(--primary)" aria-label="Music volume"><b class="num" style="width:36px">${LV.vol}%</b></label><label class="check" style="margin-top:6px"><input type="checkbox" data-c="djNear" ${LV.near ? 'checked' : ''}>Louder near the DJ booth</label>` : ''}</div><a class="btn primary" href="${esc(d.yt.url)}" target="_blank" rel="noopener">${ic('music')}Open on YouTube</a><button class="btn" data-a="djSkip">⏭ ${q.length ? 'Skip' : 'Stop'}</button>` : `<div><span class="tag">Now playing</span><h2 style="font-size:18px">Nothing yet</h2><span class="muted">Paste a YouTube link below. It starts as the current song right away.</span></div>`}</div></section>`
    + `<section class="card"><div class="hd"><h2>YouTube queue</h2><span class="muted" style="font-size:12.5px">${q.length} links</span></div><div class="bd">
      <form class="row" data-form="djLink" style="flex-wrap:nowrap"><input class="in" id="djUrl" name="url" type="url" placeholder="Paste a YouTube link" style="flex:1;min-width:0" required><button class="btn primary">Add to queue</button></form>
      <p class="muted" style="font-size:12.5px;margin:8px 0 0">${window.ND_HOSTED ? 'Songs play inside the office for everyone at the same time. When a song ends, the next one in the queue starts.' : 'YouTube cannot play inside this office (embedded players are blocked here). Links open on YouTube in a new tab, and everyone sees what is queued and what the DJ is playing.'}</p>
      ${q.length ? '<span class="tag" style="display:block;margin-top:12px">Up next</span>' : ''}<div class="list" style="margin-top:4px">${q.map((i, n) => `<div class="li dj-yt"><b class="num" style="width:22px">${n + 1}</b><a class="grow ell" href="${esc(i.url)}" target="_blank" rel="noopener">${esc(i.url.replace(/^https?:\/\//, ''))}</a><span class="muted" style="font-size:12px">${esc(i.by)}</span><button class="btn sm" data-a="djMove" data-id="${esc(i.id)}" data-v="-1" ${n ? '' : 'disabled'} aria-label="Move up">▲</button><button class="btn sm" data-a="djMove" data-id="${esc(i.id)}" data-v="1" ${n < q.length - 1 ? '' : 'disabled'} aria-label="Move down">▼</button><button class="btn sm" data-a="djNowYT" data-id="${esc(i.id)}">Play now</button><button class="btn sm ghost" data-a="djDel" data-id="${esc(i.id)}" aria-label="Remove">${ic('x')}</button></div>`).join('') || `<div class="empty"><b>No links yet</b>Paste a YouTube link to share a song with the office.</div>`}</div></div></section>`;
  }
  const actions = {
    djClearNow() { const x = D(); x.yt = null; share(); commit(); },
    djSkip(d) { const x = D(); const nx = x.q.shift(); x.yt = nx ? { url: nx.url, by: nx.by, at: Date.now() } : null; if (d && d.auto) { share(); commit(); return; } share(); toast(nx ? 'Skipped to the next song' : 'Queue finished', nx ? '' : 'Paste a link to keep the music going.', 'info'); commit(); },
    djMove(d) { const x = D(), i = x.q.findIndex(q => q.id === d.id), j = i + (+d.v); if (i < 0 || j < 0 || j >= x.q.length) return; [x.q[i], x.q[j]] = [x.q[j], x.q[i]]; share(); commit(); },
    djDel(d) { const x = D(); x.q = x.q.filter(i => i.id !== d.id); share(); commit(); },
    djNowYT(d) { const x = D(); const i = x.q.find(q => q.id === d.id); if (!i) return; x.q = x.q.filter(q => q.id !== d.id); x.yt = { url: i.url, by: i.by, at: Date.now() }; share(); toast('Now playing', 'Everyone sees it in the DJ booth.', 'ok'); commit(); },
  };
  const changes = { djVol(el) { LV.vol = +el.value; saveLV(); level(); const b = el.parentElement && el.parentElement.querySelector('b.num'); if (b) b.textContent = el.value + '%'; }, djNear(el) { LV.near = el.checked; saveLV(); level(); } };
  const forms = { djLink(f, fd) { const url = String(fd.get('url') || '').trim(); if (!YT.test(url)) { toast('That is not a YouTube link', 'Use a link like https://www.youtube.com/watch?v=… or https://youtu.be/…', 'warn'); return; } const x = D(); const item = { id: rid('y'), url, by: me().name, at: Date.now() }; let now = false; if (!x.yt) { x.yt = { url, by: item.by, at: Date.now() }; now = true; } else { x.q.push(item); if (x.q.length > 30) x.q.shift(); } DROP.add('djUrl'); f.reset(); share(); toast(now ? 'Now playing' : 'Added to the queue', now ? (window.ND_HOSTED ? '' : 'Press Open on YouTube to listen.') : `#${x.q.length} ${t('in line')}`, 'ok'); commit(); } };
  /* ---- hosted only: real YouTube playback, synced by start time ---- */
  let yp = null, ypVid = '', apiState = 0, ypBlocked = false;
  function loadApi(cb) {
    if (window.YT && window.YT.Player) return cb();
    if (apiState === 0) { apiState = 1; const s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s); const prev = window.onYouTubeIframeAPIReady; window.onYouTubeIframeAPIReady = () => { apiState = 2; if (prev) prev(); player(); }; }
  }
  function dock() {
    let el = document.getElementById('ytdock');
    if (!el) { el = document.createElement('div'); el.id = 'ytdock'; el.className = 'ytdock wbox'; el.innerHTML = `<div class="ytbar"><span>♪ DJ</span><span id="ytstat" class="ytstat">Loading player…</span><a id="ytopen" target="_blank" rel="noopener" title="Open on YouTube">↗</a><button type="button" data-a="djSkip" title="Skip">⏭</button><button type="button" data-a="djMin" title="Hide video">–</button></div><div class="ytframe"><div id="ytplayer"></div><button type="button" class="yttap" data-a="djTap">🔊 Tap to listen</button></div>`; document.body.appendChild(el); }
    return el;
  }
  const volNow = () => { const d = D(); let g = d.vol; if (d.near && typeof PX !== 'undefined') { const a = PX.myPos(), b = PX.boothPos(); if (a) { const dist = Math.hypot(a.x - b.x, a.y - b.y) / 16; g *= Math.max(0.12, Math.min(1, 1.15 - dist / 18)); } } if (S.voice && S.voice.deafened) g = 0; return Math.round(g); };
  function player() {
    if (!window.ND_HOSTED || !S || !user(ME)) return;
    const d = D(), el = dock(), vid = d.yt ? ytId(d.yt.url) : '';
    el.hidden = !vid; const op = document.getElementById('ytopen'); if (op && d.yt) op.href = d.yt.url;
    if (!vid) { if (yp && yp.stopVideo) try { yp.stopVideo(); } catch (e) {} ypVid = ''; return; }
    const start = Math.max(0, Math.floor((Date.now() - (d.yt.at || Date.now())) / 1000));
    if (fallback) { if (vid !== ypVid) useFallback(vid, start); return; }
    if (!(window.YT && window.YT.Player)) { if (!loadApi.t0) loadApi.t0 = Date.now(); if (Date.now() - loadApi.t0 > 8000) { useFallback(vid, start); return; } stat('Loading player…'); return loadApi(player); }
    if (!yp) {
      ypVid = vid;
      // build the iframe ourselves so YouTube always gets this site's origin as referrer (otherwise: Error 153)
      const box = document.getElementById('ytplayer'); if (!box) return;
      const ifr = document.createElement('iframe');
      ifr.id = 'ytplayer'; ifr.title = 'DJ';
      ifr.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      ifr.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      ifr.src = `https://www.youtube.com/embed/${encodeURIComponent(vid)}?enablejsapi=1&autoplay=1&start=${start}&playsinline=1&rel=0&origin=${encodeURIComponent(location.origin)}&widget_referrer=${encodeURIComponent(location.href)}`;
      box.replaceWith(ifr);
      yp = new YT.Player('ytplayer', {
        events: {
          onReady: e => { stat('Ready'); try { e.target.unMute(); e.target.setVolume(volNow()); e.target.playVideo(); } catch (er) {} setTimeout(checkBlocked, 1800); },
          onStateChange: e => { stat(STATES[e.data] || 'Ready'); if (e.data === 1) { if (e.target.isMuted && e.target.isMuted() && volNow() > 0) { ypBlocked = true; tapBtn(true); } else { ypBlocked = false; tapBtn(false); } } else if (e.data !== 3) tapBtn(true); if (e.data === 0 && window.NET_LEADER !== false) actions.djSkip({ auto: true }); },
          onError: e => { stat(`This video cannot play here (code ${e.data}). Skipping…`); setTimeout(() => { if (window.NET_LEADER !== false) actions.djSkip({ auto: true }); }, 3000); },
        } });
      return;
    }
    if (vid !== ypVid && yp.loadVideoById) { ypVid = vid; tapBtn(true); yp.loadVideoById({ videoId: vid, startSeconds: start }); setTimeout(checkBlocked, 1800); }
  }
  function stat(t_) { const s = document.getElementById('ytstat'); if (s && s.textContent !== t(t_)) s.textContent = t(t_); }
  const STATES = { '-1': 'Ready, waiting to start', 0: 'Song ended', 1: 'Playing', 2: 'Paused', 3: 'Buffering…', 5: 'Ready, waiting to start' };
  let fallback = false;
  function useFallback(vid, start) {
    // the YouTube control script did not load: show YouTube's own player so its play button works
    fallback = true; const box = document.querySelector('#ytdock .ytframe'); if (!box) return;
    box.innerHTML = `<iframe referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/${encodeURIComponent(vid)}?autoplay=1&start=${start}&playsinline=1&rel=0&origin=${encodeURIComponent(location.origin)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="DJ"></iframe>`;
    ypVid = vid; stat('Press ▶ in the video to listen');
  }
  function tapBtn(on) { const b = document.querySelector('#ytdock .yttap'); if (b) b.hidden = !on; }
  function checkBlocked() { if (!yp || !yp.getPlayerState) return; const s = yp.getPlayerState(); const muted = yp.isMuted && yp.isMuted(); if ((s !== 1 || muted) && D().yt) { ypBlocked = true; tapBtn(true); stat(muted ? 'Muted by the browser. Tap to listen' : 'Blocked by the browser. Tap to listen'); } else tapBtn(false); }
  // browsers (Brave, Safari, Chrome) only allow sound after the person interacts: any click or key on the page starts the music
  function resume() {
    if (!yp || !yp.getPlayerState || !D().yt || volNow() === 0) return;
    const s = yp.getPlayerState(), muted = yp.isMuted && yp.isMuted();
    if (s === 1 && !muted) return;
    const d = D(); const start = Math.max(0, (Date.now() - (d.yt.at || Date.now())) / 1000);
    try { yp.unMute(); yp.setVolume(volNow()); if (s !== 1) { yp.seekTo(start, true); yp.playVideo(); } } catch (e) {}
    setTimeout(checkBlocked, 1200);
  }
  ['pointerdown', 'keydown'].forEach(ev => addEventListener(ev, resume, { passive: true }));
  setInterval(() => { if (yp && yp.setVolume) try { yp.setVolume(volNow()); } catch (e) {} }, 400);
  actions.djMin = () => { const el = document.getElementById('ytdock'); if (el) el.classList.toggle('min'); };
  const _tap = actions.djTap;
  actions.djTap = () => { if (yp && yp.playVideo) { const d = D(); const start = Math.max(0, (Date.now() - (d.yt && d.yt.at || Date.now())) / 1000); try { yp.unMute(); yp.seekTo(start, true); yp.setVolume(Math.max(volNow(), 1)); yp.playVideo(); } catch (e) {} setTimeout(checkBlocked, 1500); } else if (_tap) _tap(); };
  function boot() { const d = D(); d.st = null; }
  setInterval(() => { if (window.ND_HOSTED) player(); }, 1500);
  return { player, STATIONS, view, miniHTML, actions, changes, forms, onMsg, onJoin, playing, boot, level };
})();
