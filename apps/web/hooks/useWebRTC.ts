'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import { getSocket } from '@/lib/socket';

export function useWebRTC(myPlayerId: string | null, enabled: boolean) {
  const peersRef = useRef<Map<string, SimplePeer.Instance>>(new Map());
  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const readyRef = useRef(false);

  // Step 1: get camera/mic
  useEffect(() => {
    if (!enabled) return;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        setLocalStream(stream);
        readyRef.current = true;
      })
      .catch(() => {
        console.warn('[WebRTC] camera/mic unavailable');
        readyRef.current = true; // still allow signalling without stream
      });

    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      readyRef.current = false;
    };
  }, [enabled]);

  // Step 2: listen for incoming signals
  useEffect(() => {
    if (!enabled || !myPlayerId) return;
    const socket = getSocket();

    function onOffer({ fromId, offer }: { fromId: string; offer: RTCSessionDescriptionInit }) {
      // Answer — we are NOT initiator
      if (peersRef.current.has(fromId)) return; // already connected
      const peer = buildPeer(fromId, false);
      peersRef.current.set(fromId, peer);
      peer.signal(offer);
    }

    function onAnswer({ fromId, answer }: { fromId: string; answer: RTCSessionDescriptionInit }) {
      peersRef.current.get(fromId)?.signal(answer);
    }

    function onIce({ fromId, candidate }: { fromId: string; candidate: RTCIceCandidateInit }) {
      peersRef.current.get(fromId)?.signal({ type: 'candidate', candidate } as SimplePeer.SignalData);
    }

    socket.on('webrtc:offer', onOffer);
    socket.on('webrtc:answer', onAnswer);
    socket.on('webrtc:ice', onIce);

    return () => {
      socket.off('webrtc:offer', onOffer);
      socket.off('webrtc:answer', onAnswer);
      socket.off('webrtc:ice', onIce);
    };
  }, [enabled, myPlayerId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      peersRef.current.forEach(p => p.destroy());
      peersRef.current.clear();
    };
  }, []);

  function buildPeer(targetId: string, initiator: boolean): SimplePeer.Instance {
    const socket = getSocket();

    const peer = new SimplePeer({
      initiator,
      stream: localStreamRef.current ?? undefined,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    });

    peer.on('signal', data => {
      if ((data as RTCSessionDescriptionInit).type === 'offer') {
        socket.emit('webrtc:offer', { targetId, offer: data as RTCSessionDescriptionInit });
      } else if ((data as RTCSessionDescriptionInit).type === 'answer') {
        socket.emit('webrtc:answer', { targetId, answer: data as RTCSessionDescriptionInit });
      } else {
        socket.emit('webrtc:ice', { targetId, candidate: data as unknown as RTCIceCandidateInit });
      }
    });

    peer.on('stream', stream => {
      setStreams(prev => new Map(prev).set(targetId, stream));
    });

    peer.on('close', () => {
      peersRef.current.delete(targetId);
      setStreams(prev => { const m = new Map(prev); m.delete(targetId); return m; });
    });

    peer.on('error', err => {
      console.warn('[WebRTC] peer error:', err.message);
      peersRef.current.delete(targetId);
      peer.destroy();
    });

    return peer;
  }

  // Called by game page when we know the other players.
  // Only the player whose ID is lexicographically smaller initiates —
  // this prevents both sides from creating offers simultaneously.
  const callPeer = useCallback((targetId: string) => {
    if (!myPlayerId || !enabled) return;
    if (peersRef.current.has(targetId)) return; // already connected

    const iInitiate = myPlayerId < targetId;
    if (!iInitiate) return; // the other side will initiate toward me

    // Wait until getUserMedia resolves (max 3s)
    const attempt = () => {
      if (!readyRef.current) { setTimeout(attempt, 200); return; }
      if (peersRef.current.has(targetId)) return;
      const peer = buildPeer(targetId, true);
      peersRef.current.set(targetId, peer);
    };
    attempt();
  }, [myPlayerId, enabled]);

  const hangUp = useCallback((targetId: string) => {
    peersRef.current.get(targetId)?.destroy();
    peersRef.current.delete(targetId);
    setStreams(prev => { const m = new Map(prev); m.delete(targetId); return m; });
  }, []);

  return { localStream, streams, callPeer, hangUp };
}
