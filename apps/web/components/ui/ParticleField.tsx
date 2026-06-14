'use client';
import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; alpha: number;
  alphaDir: number;
  color: string;
  type: 'star' | 'suit';
  suit?: string;
  rotation: number; rotSpeed: number;
}

const SUITS = ['♠', '♥', '♣', '♦'];
const COLORS = ['rgba(200,169,110,', 'rgba(230,57,70,', 'rgba(255,255,255,'];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles: Particle[] = [];
    const COUNT = Math.min(80, Math.floor(W * H / 14000));

    function spawn(i: number): Particle {
      const isSuit = Math.random() < 0.15;
      const colorBase = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: isSuit ? 10 + Math.random() * 8 : 1 + Math.random() * 2,
        alpha: Math.random() * 0.5,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
        color: colorBase,
        type: isSuit ? 'suit' : 'star',
        suit: SUITS[Math.floor(Math.random() * 4)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
      };
    }

    for (let i = 0; i < COUNT; i++) particles.push(spawn(i));

    // Shooting stars
    const shootingStars: { x: number; y: number; vx: number; vy: number; len: number; alpha: number }[] = [];
    function spawnShootingStar() {
      if (Math.random() < 0.003 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * W * 0.8,
          y: Math.random() * H * 0.3,
          vx: 4 + Math.random() * 3,
          vy: 1.5 + Math.random() * 2,
          len: 80 + Math.random() * 60,
          alpha: 1,
        });
      }
    }

    let raf: number;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Shooting stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx; s.y += s.vy; s.alpha -= 0.015;
        if (s.alpha <= 0) { shootingStars.splice(i, 1); continue; }
        const grad = ctx.createLinearGradient(s.x - s.vx * s.len / s.vx, s.y - s.vy * s.len / s.vx, s.x, s.y);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(1, `rgba(255,255,255,${s.alpha * 0.6})`);
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.moveTo(s.x - s.vx * 10, s.y - s.vy * 10);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.alpha += 0.004 * p.alphaDir;
        if (p.alpha > 0.6) { p.alpha = 0.6; p.alphaDir = -1; }
        if (p.alpha < 0.02) { p.alpha = 0.02; p.alphaDir = 1; }
        if (p.y < -20) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -20) p.x = W + 10;
        if (p.x > W + 20) p.x = -10;

        if (p.type === 'suit') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.font = `${p.size}px serif`;
          ctx.fillStyle = `${p.color}${p.alpha})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.suit!, 0, 0);
          ctx.restore();
        } else {
          // Glow star
          ctx.beginPath();
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grd.addColorStop(0, `${p.color}${p.alpha})`);
          grd.addColorStop(1, `${p.color}0)`);
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.min(1, p.alpha * 2)})`;
          ctx.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />
  );
}
