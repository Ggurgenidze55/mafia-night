'use client';

import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { getSocket } from '@/lib/socket';

type PeerMap = Map<string, SimplePeer.Instance>;

export function useWebRTC(myPlayerId: string | null, enabled: boolean) {
  const peersRef = useRef<PeerMap>(new Map());
  const [streams, setStreams] = useState<Map<string, MediaStream>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled || !myPlayerId) return;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        setLocalStream(stream);
      })
      .catch(() => console.warn('[WebRTC] camera unavailable'));

    const socket = getSocket();

    socket.on('webrtc:offer', ({ fromId, offer }) => {
      const peer = createPeer(fromId, false, offer);
      peersRef.current.set(fromId, peer);
    });

    socket.on('webrtc:answer', ({ fromId, answer }) => {
      peersRef.current.get(fromId)?.signal(answer);
    });

    socket.on('webrtc:ice', ({ fromId, candidate }) => {
      peersRef.current.get(fromId)?.signal({ type: 'candidate', candidate } as SimplePeer.SignalData);
    });

    return () => {
      socket.off('webrtc:offer');
      socket.off('webrtc:answer');
      socket.off('webrtc:ice');
      peersRef.current.forEach(p => p.destroy());
      peersRef.current.clear();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [myPlayerId, enabled]);

  function createPeer(targetId: string, initiator: boolean, signal?: unknown): SimplePeer.Instance {
    const socket = getSocket();
    const peer = new SimplePeer({
      initiator,
      stream: localStreamRef.current ?? undefined,
      trickle: true
    });

    peer.on('signal', (data) => {
      if (data.type === 'offer') {
        socket.emit('webrtc:offer', { targetId, offer: data as RTCSessionDescriptionInit });
      } else if (data.type === 'answer') {
        socket.emit('webrtc:answer', { targetId, answer: data as RTCSessionDescriptionInit });
      } else {
        socket.emit('webrtc:ice', { targetId, candidate: data as unknown as RTCIceCandidateInit });
      }
    });

    peer.on('stream', (stream) => {
      setStreams(prev => new Map(prev).set(targetId, stream));
    });

    peer.on('close', () => {
      setStreams(prev => { const m = new Map(prev); m.delete(targetId); return m; });
    });

    if (signal) peer.signal(signal as SimplePeer.SignalData);

    return peer;
  }

  function callPeer(targetId: string) {
    if (peersRef.current.has(targetId)) return;
    const peer = createPeer(targetId, true);
    peersRef.current.set(targetId, peer);
  }

  return { localStream, streams, callPeer };
}
