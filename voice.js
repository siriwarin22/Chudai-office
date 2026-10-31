'use strict';
const VOICE = (() => {
  const peers = new Map();
  const HEAR_DISTANCE = 4.5 * 16;
  let stream = null;

  const localVoice = () => S && S.voice ? S.voice : { room: null, muted: true, deafened: false, mode: 'near' };
  const liveTrack = () => stream && stream.getAudioTracks().find(track => track.readyState === 'live') || null;
  const hasMic = () => !!liveTrack();
  const sendSignal = (peer, signal) => {
    if (CAP.room) CAP.room.emit('voiceSignal', { to: peer, room: localVoice().room || null, signal }).catch(() => {});
  };
  function sameContext(presence) {
    const room = localVoice().room || null, remoteRoom = presence.vr || null;
    return room || remoteRoom ? !!room && room === remoteRoom : true;
  }
  function distanceTo(presence) {
    const mine = typeof PX !== 'undefined' && PX.myPos();
    return mine && Number.isFinite(+presence.x) && Number.isFinite(+presence.y)
      ? Math.hypot(mine.x - presence.x, mine.y - presence.y) : Infinity;
  }
  function canHear(presence) {
    const v = localVoice();
    if (!sameContext(presence) || v.deafened) return false;
    if (v.room && v.room === presence.vr) return true;
    return presence.vm === 'shout' || distanceTo(presence) <= HEAR_DISTANCE;
  }
  function shouldConnect(presence) {
    const v = localVoice();
    if (!sameContext(presence)) return false;
    if (v.room && v.room === presence.vr) return true;
    const localSending = !v.muted && !v.deafened, remoteSending = !presence.mu;
    if (!localSending && !remoteSending) return false;
    return (localSending && v.mode === 'shout') || (remoteSending && presence.vm === 'shout') || distanceTo(presence) <= HEAR_DISTANCE;
  }
  function setRemoteVolume(entry) {
    const audible = canHear(entry.presence);
    entry.audio.muted = !audible;
    entry.audio.volume = audible ? 1 : 0;
    if (audible && entry.audio.srcObject && entry.audio.paused) {
      entry.audio.play().catch(() => { entry.playBlocked = true; });
    }
  }
  function removePeer(id) {
    const entry = peers.get(id); if (!entry) return;
    try { entry.pc.ontrack = null; entry.pc.close(); } catch (e) {}
    entry.audio.pause(); entry.audio.srcObject = null; entry.audio.remove(); peers.delete(id);
  }
  function makePeer(id, presence) {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    const transceiver = pc.addTransceiver('audio', { direction: 'sendrecv' });
    const audio = document.createElement('audio'); audio.autoplay = true; audio.playsInline = true; audio.hidden = true; document.body.appendChild(audio);
    const entry = { pc, sender: transceiver.sender, audio, presence, pendingIce: [], offerStarted: false, playBlocked: false, lastSeenAt: Date.now() };
    peers.set(id, entry);
    pc.onicecandidate = e => { if (e.candidate) sendSignal(id, { candidate: e.candidate.toJSON ? e.candidate.toJSON() : e.candidate }); };
    pc.ontrack = e => {
      audio.srcObject = e.streams && e.streams[0] ? e.streams[0] : new MediaStream([e.track]);
      setRemoteVolume(entry);
      audio.play().catch(() => { entry.playBlocked = true; });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' && peers.get(id) === entry) removePeer(id);
    };
    const track = liveTrack(); if (track) entry.sender.replaceTrack(track).catch(() => {});
    if (String(tabId) < String(id)) startOffer(id, entry);
    return entry;
  }
  async function startOffer(id, entry) {
    if (entry.offerStarted || !CAP.room || entry.pc.signalingState !== 'stable') return;
    entry.offerStarted = true;
    try {
      await entry.pc.setLocalDescription(await entry.pc.createOffer());
      sendSignal(id, { description: entry.pc.localDescription.toJSON() });
    } catch (e) { entry.offerStarted = false; }
  }
  async function onSignal(from, data) {
    if (!data || !data.signal || data.to !== tabId || !from || from === tabId) return;
    const presence = Object.assign({}, (CAP.peers || []).find(p => p.peer === from)?.presence || {}, { vr: data.room || null });
    if (!sameContext(presence)) return;
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
    } catch (e) {}
  }
  function reconcile() {
    if (!S || !user(ME) || !CAP.room || typeof RTCPeerConnection === 'undefined') return;
    const seen = new Set();
    (CAP.peers || []).forEach(peer => {
      const p = peer.presence;
      if (peer.isMe || !p || !p.uid || p.uid === ME || !sameContext(p)) return;
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
    const v = localVoice(), track = !v.muted && !v.deafened ? liveTrack() : null;
    if (stream && !track) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    peers.forEach(entry => entry.sender.replaceTrack(track).catch(() => {}));
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
  function resumeAudio() {
    peers.forEach(entry => { if (entry.audio.srcObject && entry.audio.paused) entry.audio.play().catch(() => {}); });
  }

  addEventListener('pagehide', () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    peers.forEach((entry, id) => removePeer(id));
  });
  ['pointerdown', 'keydown'].forEach(event => addEventListener(event, resumeAudio, { passive: true }));
  setInterval(reconcile, 700);
  setTimeout(() => { if (typeof render === 'function') render(); }, 0);
  return { hasMic, enableMic, toggleMic, applyMute, refresh, onSignal };
})();
