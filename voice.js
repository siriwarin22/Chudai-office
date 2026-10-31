'use strict';
const VOICE = (() => {
  const peers = new Map();
  const HEAR_DISTANCE = 4.5 * 16;
  let stream = null;
  let micTesting = false, testContext = null, testFrame = 0, testTimer = 0;
  const reported = new Map();
  function report(key, title, detail) {
    const now = Date.now();
    if (now - (reported.get(key) || 0) < 15000) return;
    reported.set(key, now);
    console.warn(`[voice] ${title}: ${detail}`);
    toast(title, detail, 'warn');
  }

  const localVoice = () => S && S.voice ? S.voice : { room: null, muted: true, deafened: false, mode: 'near' };
  const liveTrack = () => stream && stream.getAudioTracks().find(track => track.readyState === 'live') || null;
  const hasMic = () => !!liveTrack();
  const sendSignal = (peer, signal) => {
    if (CAP.room) CAP.room.emit('voiceSignal', { to: peer, room: localVoice().room || null, signal }).catch(e => {
      report(`signal-${peer}`, 'Voice connection failed', e && e.message || 'Could not send connection data through Realtime.');
    });
  };
  function sameContext(presence) {
    const room = localVoice().room || null, remoteRoom = presence.vr || null;
    return room || remoteRoom ? !!room && room === remoteRoom : true;
  }
  function canShareVoice(presence) {
    const v = localVoice();
    return sameContext(presence) || v.mode === 'shout' || presence.vm === 'shout';
  }
  function distanceTo(presence) {
    const mine = typeof PX !== 'undefined' && PX.myPos();
    return mine && Number.isFinite(+presence.x) && Number.isFinite(+presence.y)
      ? Math.hypot(mine.x - presence.x, mine.y - presence.y) : Infinity;
  }
  function canHear(presence) {
    const v = localVoice();
    if (v.deafened) return false;
    if (v.room && v.room === presence.vr) return true;
    if (v.mode === 'shout' || presence.vm === 'shout') return true;
    return sameContext(presence) && distanceTo(presence) <= HEAR_DISTANCE;
  }
  function shouldConnect(presence) {
    const v = localVoice();
    if (v.room && v.room === presence.vr) return true;
    const localSending = !v.muted && !v.deafened, remoteSending = !presence.mu;
    if (remoteSending && canHear(presence)) return true;
    const remoteCanHearLocal = v.mode === 'shout' || (sameContext(presence) && (presence.vm === 'shout' || distanceTo(presence) <= HEAR_DISTANCE));
    return localSending && remoteCanHearLocal;
  }
  function setRemoteVolume(entry) {
    const audible = canHear(entry.presence);
    entry.audio.muted = !audible;
    entry.audio.volume = audible ? 1 : 0;
    if (audible && entry.audio.srcObject && entry.audio.paused) {
      entry.audio.play().catch(e => {
        entry.playBlocked = true;
        report(`play-${entry.id || 'remote'}`, 'Voice audio is blocked', e && e.message || 'Click the page once to allow audio playback.');
      });
    }
  }
  function removePeer(id) {
    const entry = peers.get(id); if (!entry) return;
    try { entry.pc.ontrack = null; entry.pc.close(); } catch (e) {}
    entry.audio.pause(); entry.audio.srcObject = null; entry.audio.remove(); peers.delete(id);
  }
  function attachMic(entry, track) {
    if (track) track.enabled = true;
    return entry.sender.replaceTrack(track).then(() => {
      if (track && entry.sender.track !== track) throw new Error('The browser did not attach the active microphone track.');
    }).catch(e => {
      if (peers.get(entry.id) === entry) report(`send-track-${entry.id}`, 'Could not send your microphone', e && e.message || String(e));
    });
  }
  function makePeer(id, presence) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    const transceiver = pc.addTransceiver('audio', { direction: 'sendrecv' });
    const audio = document.createElement('audio'); audio.autoplay = true; audio.playsInline = true; audio.hidden = true; document.body.appendChild(audio);
    const entry = { id, pc, sender: transceiver.sender, audio, presence, pendingIce: [], offerStarted: false, playBlocked: false, lastSeenAt: Date.now(), trackReady: Promise.resolve() };
    peers.set(id, entry);
    pc.onicecandidate = e => { if (e.candidate) sendSignal(id, { candidate: e.candidate.toJSON ? e.candidate.toJSON() : e.candidate }); };
    pc.ontrack = e => {
      audio.srcObject = e.streams && e.streams[0] ? e.streams[0] : new MediaStream([e.track]);
      setRemoteVolume(entry);
      audio.play().catch(e => {
        entry.playBlocked = true;
        report(`play-${id}`, 'Voice audio is blocked', e && e.message || 'Click the page once to allow audio playback.');
      });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed') report(`connection-${id}`, 'Voice connection failed', 'The browser could not establish a direct audio connection. Check both devices’ network/firewall settings.');
      if (pc.connectionState === 'failed' && peers.get(id) === entry) removePeer(id);
    };
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') report(`ice-${id}`, 'Voice network path failed', 'Realtime is connected, but audio could not cross the network.');
    };
    const track = liveTrack(); if (track) entry.trackReady = attachMic(entry, track);
    if (String(tabId) < String(id)) startOffer(id, entry);
    return entry;
  }
  async function startOffer(id, entry) {
    if (entry.offerStarted || !CAP.room || entry.pc.signalingState !== 'stable') return;
    entry.offerStarted = true;
    try {
      await entry.trackReady;
      await entry.pc.setLocalDescription(await entry.pc.createOffer());
      sendSignal(id, { description: entry.pc.localDescription.toJSON() });
    } catch (e) {
      entry.offerStarted = false;
      report(`offer-${id}`, 'Could not start voice connection', e && e.message || String(e));
    }
  }
  async function onSignal(from, data) {
    if (!data || !data.signal || data.to !== tabId || !from || from === tabId) return;
    const presence = Object.assign({}, (CAP.peers || []).find(p => p.peer === from)?.presence || {}, { vr: data.room || null });
    if (!canShareVoice(presence)) return;
    const entry = peers.get(from) || makePeer(from, presence), pc = entry.pc, signal = data.signal;
    try {
      if (signal.description) {
        await pc.setRemoteDescription(signal.description);
        for (const candidate of entry.pendingIce.splice(0)) await pc.addIceCandidate(candidate);
        if (signal.description.type === 'offer') {
          await pc.setLocalDescription(await pc.createAnswer());
          sendSignal(from, { description: pc.localDescription.toJSON() });
        }
      } else if (signal.candidate) {
        if (pc.remoteDescription) await pc.addIceCandidate(signal.candidate);
        else entry.pendingIce.push(signal.candidate);
      }
    } catch (e) {
      report(`signal-receive-${from}`, 'Could not connect voice', e && e.message || String(e));
    }
  }
  function reconcile() {
    if (!S || !user(ME) || !CAP.room || typeof RTCPeerConnection === 'undefined') return;
    const seen = new Set();
    (CAP.peers || []).forEach(peer => {
      const p = peer.presence;
      if (peer.isMe || !p || !p.uid || p.uid === ME || !canShareVoice(p)) return;
      seen.add(peer.peer);
      const entry = peers.get(peer.peer);
      if (entry) { entry.presence = p; entry.lastSeenAt = Date.now(); setRemoteVolume(entry); }
      else if (shouldConnect(p)) makePeer(peer.peer, p);
    });
    for (const id of [...peers.keys()]) if (!seen.has(id)) {
      if ((CAP.peers || []).some(p => p.peer === id) || Date.now() - peers.get(id).lastSeenAt > 10000) removePeer(id);
    }
  }
  function refresh() {
    if (typeof PX !== 'undefined') PX.netPush(true);
    reconcile();
  }
  async function acquireMic() {
    if (hasMic()) return true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast('Microphone unavailable', 'Open the office on HTTPS or localhost and allow microphone access.', 'bad');
      return false;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false });
      return hasMic();
    } catch (e) {
      const v = localVoice(); v.muted = true;
      toast('Could not access the microphone', e && e.name === 'NotAllowedError' ? 'Allow microphone access in your browser, then try again.' : (e.message || 'Check that a microphone is connected.'), 'bad');
      if (typeof persist === 'function') commit();
      return false;
    }
  }
  function applyMute() {
    if (micTesting) stopMicTest();
    const v = localVoice(), track = !micTesting && !v.muted && !v.deafened ? liveTrack() : null;
    if (stream && !track) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    peers.forEach(entry => attachMic(entry, track));
    peers.forEach(setRemoteVolume);
    if (typeof PX !== 'undefined') PX.netPush(true);
    reconcile();
  }
  async function enableMic() {
    const ok = await acquireMic();
    if (!ok) { localVoice().muted = true; commit(); return false; }
    applyMute(); commit(); return true;
  }
  async function toggleMic() {
    if (micTesting) stopMicTest();
    const v = localVoice();
    if (v.muted || !hasMic()) {
      const ok = await acquireMic(); if (!ok) { v.muted = true; commit(); return false; }
      v.muted = false; v.deafened = false;
      toast('Microphone on', 'People in range or in your voice room can hear you.', 'ok');
    } else {
      v.muted = true;
      toast('Microphone off', 'Others can no longer hear you.', 'warn');
    }
    applyMute(); commit(); return true;
  }
  async function testMic() {
    if (micTesting) { stopMicTest(); return; }
    if (!(await acquireMic())) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      if (localVoice().muted || localVoice().deafened) { stream.getTracks().forEach(t => t.stop()); stream = null; }
      toast('Microphone test unavailable', 'This browser does not support audio level monitoring.', 'warn'); return;
    }
    try {
      testContext = new AudioContextClass();
      await testContext.resume();
      const source = testContext.createMediaStreamSource(stream), analyser = testContext.createAnalyser();
      analyser.fftSize = 256;
      const silent = testContext.createGain(), samples = new Uint8Array(analyser.fftSize);
      silent.gain.value = 0;
      source.connect(analyser); analyser.connect(silent); silent.connect(testContext.destination);
      micTesting = true;
      peers.forEach(entry => attachMic(entry, null));
      if (typeof render === 'function') render();
      const measure = () => {
        if (!micTesting) return;
        analyser.getByteTimeDomainData(samples);
        const rms = Math.sqrt(samples.reduce((sum, sample) => sum + ((sample - 128) / 128) ** 2, 0) / samples.length);
        const level = Math.min(100, Math.round(rms * 240));
        const bar = document.getElementById('micTestMeter'), label = document.getElementById('micTestStatus');
        if (bar) bar.style.width = `${level}%`;
        if (label) label.textContent = level > 3 ? 'Microphone detected' : 'Speak to test';
        testFrame = requestAnimationFrame(measure);
      };
      measure(); testTimer = setTimeout(stopMicTest, 15000);
    } catch (e) {
      stopMicTest();
      toast('Microphone test failed', e && e.message || 'Check your browser audio permissions.', 'bad');
    }
  }
  function stopMicTest() {
    if (!micTesting && !testContext) return;
    micTesting = false; cancelAnimationFrame(testFrame); clearTimeout(testTimer);
    if (testContext) { testContext.close().catch(() => {}); testContext = null; }
    if (stream) {
      const v = localVoice(), track = !v.muted && !v.deafened ? liveTrack() : null;
      peers.forEach(entry => attachMic(entry, track));
      if (!track) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    }
    if (typeof render === 'function') render();
  }
  function resumeAudio() {
    peers.forEach(entry => {
      if (entry.audio.srcObject && entry.audio.paused) entry.audio.play().then(() => { entry.playBlocked = false; }).catch(e => {
        entry.playBlocked = true;
        report(`play-${entry.id}`, 'Voice audio is blocked', e && e.message || 'Check this site’s sound permissions.');
      });
    });
  }
  async function checkLink() {
    const v = localVoice(), track = liveTrack();
    if (!peers.size) {
      toast('No voice link yet', `Mic ${v.muted || v.deafened ? 'off' : track ? 'on' : 'not detected'} · no WebRTC peer connected.`, 'warn');
      return;
    }
    const details = await Promise.all([...peers.values()].map(async entry => {
      try {
        const stats = [...(await entry.pc.getStats()).values()];
        const out = stats.find(s => s.type === 'outbound-rtp' && (s.kind === 'audio' || s.mediaType === 'audio'));
        const incoming = stats.find(s => s.type === 'inbound-rtp' && (s.kind === 'audio' || s.mediaType === 'audio'));
        const sender = entry.sender.track;
        return `${entry.pc.connectionState}/${entry.pc.iceConnectionState} · mic ${sender && sender.readyState === 'live' && sender.enabled ? 'attached' : 'missing'} · sent ${out ? out.packetsSent || 0 : 0} · received ${incoming ? incoming.packetsReceived || 0 : 0} · player ${entry.audio.paused ? 'paused' : 'playing'}`;
      } catch (e) { return `${entry.pc.connectionState}/${entry.pc.iceConnectionState} · stats unavailable`; }
    }));
    toast('Voice link check', `Mic ${v.muted || v.deafened ? 'off' : track ? 'on' : 'not detected'} · ${details.join(' | ')}`, 'info');
  }

  addEventListener('pagehide', () => {
    stopMicTest();
    if (stream) stream.getTracks().forEach(track => track.stop());
    peers.forEach((entry, id) => removePeer(id));
  });
  ['pointerdown', 'keydown'].forEach(event => addEventListener(event, resumeAudio, { passive: true }));
  setInterval(reconcile, 700);
  setTimeout(() => { if (typeof render === 'function') render(); }, 0);
  return { hasMic, enableMic, toggleMic, testMic, checkLink, isTestingMic: () => micTesting, applyMute, refresh, onSignal };
})();
