'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFaceTracking } from '@/hooks/useFaceTracking';
import type { Player } from '@mafia-night/shared';

interface Props {
  player: Player;
  stream?: MediaStream;
  isMe?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  faceTrackingEnabled?: boolean;
}

export function PlayerCard({ player, stream, isMe, isSelected, onClick, faceTrackingEnabled }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const emotion = useFaceTracking(videoRef, !!(faceTrackingEnabled && stream));

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const isDead = !player.isAlive;

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick && !isDead ? { scale: 1.05 } : {}}
      whileTap={onClick && !isDead ? { scale: 0.98 } : {}}
      className="relative flex flex-col items-center gap-1 cursor-pointer"
    >
      {/* Avatar ring */}
      <div
        className="relative rounded-full overflow-hidden"
        style={{
          width: 80,
          height: 80,
          border: isSelected
            ? '3px solid #E63946'
            : isMe
            ? '3px solid #C8A96E'
            : '2px solid rgba(200,169,110,0.3)',
          opacity: isDead ? 0.4 : 1,
          filter: isDead ? 'grayscale(100%)' : 'none',
        }}
      >
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted={isMe}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl font-bold"
            style={{ background: 'rgba(200,169,110,0.1)', color: '#C8A96E' }}
          >
            {player.avatar || player.name[0].toUpperCase()}
          </div>
        )}

        {/* Dead overlay */}
        {isDead && (
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            💀
          </div>
        )}
      </div>

      {/* Emotion badge */}
      {!isDead && (faceTrackingEnabled || stream) && (
        <div className="absolute -top-1 -right-1 text-lg leading-none">{emotion}</div>
      )}

      {/* Name */}
      <span
        className="text-xs font-medium truncate max-w-[80px] text-center"
        style={{ color: isDead ? '#666' : isMe ? '#C8A96E' : '#e5e7eb' }}
      >
        {player.name} {isMe && '(შენ)'}
      </span>

      {/* Host crown */}
      {player.isHost && (
        <span className="absolute -top-3 text-xs">👑</span>
      )}
    </motion.div>
  );
}
