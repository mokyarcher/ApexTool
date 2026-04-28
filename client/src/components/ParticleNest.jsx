import { useEffect, useRef } from 'react';

export default function ParticleNest({
  count = 90,
  color = '200,30,30',
  lineWidth = 0.5,
  maxDist = 85,
  mouseDist = 260,
  orbitRadius = 120,
  speed = 0.35,
  opacity = 0.5,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let mouse = { x: null, y: null };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function onMouseMove(e) { mouse.x = e.clientX; mouse.y = e.clientY; }
    function onMouseOut() { mouse.x = null; mouse.y = null; }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseout', onMouseOut);

    const particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        r: Math.random() * 1.5 + 0.5,
        attracted: false,
        wasAttracted: false,
      });
    }

    const DAMPING = 0.92;
    const ATTRACT_FORCE = 0.004;
    const REPEL_DIST = 50;
    const REPEL_FORCE = 0.6;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = performance.now() * 0.0012;

      for (const p of particles) {
        const prevAttracted = p.attracted;
        p.attracted = false;

        if (mouse.x !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseDist) {
            p.attracted = true;
            p.wasAttracted = true;
            const diff = dist - orbitRadius;
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            p.vx += nx * diff * ATTRACT_FORCE;
            p.vy += ny * diff * ATTRACT_FORCE;

            // Gentle tangential drift
            p.vx += -ny * 0.012;
            p.vy += nx * 0.012;

            p.vx *= DAMPING;
            p.vy *= DAMPING;
          }
        }

        // Scatter: was attracted but now free → random outward push
        if (!p.attracted && prevAttracted && p.wasAttracted) {
          p.wasAttracted = false;
          const angle = Math.random() * Math.PI * 2;
          const push = 1.2 + Math.random() * 1.5;
          p.vx = Math.cos(angle) * push;
          p.vy = Math.sin(angle) * push;
        }

        // Inter-particle repulsion (prevents clustering)
        for (const q of particles) {
          if (p === q) continue;
          const dx2 = p.x - q.x;
          const dy2 = p.y - q.y;
          const d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d2 < REPEL_DIST && d2 > 0.1) {
            const push = (REPEL_DIST - d2) / REPEL_DIST * REPEL_FORCE;
            p.vx += (dx2 / d2) * push;
            p.vy += (dy2 / d2) * push;
          }
        }

        // Free-floating damping
        if (!p.attracted) {
          p.vx *= 0.985;
          p.vy *= 0.985;
        }

        // Speed limit
        const spd = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSpd = p.attracted ? speed * 2 : speed * 2.5;
        if (spd > maxSpd) {
          p.vx = (p.vx / spd) * maxSpd;
          p.vy = (p.vy / spd) * maxSpd;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        if (p.x > canvas.width) { p.x = canvas.width; p.vx = -Math.abs(p.vx); }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
        if (p.y > canvas.height) { p.y = canvas.height; p.vy = -Math.abs(p.vy); }
      }

      // === Render ===
      const all = [...particles];
      if (mouse.x !== null) {
        all.push({ x: mouse.x, y: mouse.y, r: 0, isMouse: true, attracted: false });
      }

      // Lines
      for (let i = 0; i < all.length; i++) {
        const a = all[i];
        for (let j = i + 1; j < all.length; j++) {
          const b = all[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          const isMouse = a.isMouse || b.isMouse;
          const limit = isMouse ? mouseDist * mouseDist : maxDist * maxDist;

          if (distSq < limit) {
            const ratio = distSq / limit;
            const alpha = (1 - ratio) * opacity;
            const lw = isMouse ? lineWidth * (1.5 - ratio) : lineWidth;
            const hueSeed = time * 0.8 + (a.x + b.x) * 0.004 + (a.y + b.y) * 0.003;
            const r = Math.round(128 + 127 * Math.sin(hueSeed));
            const g = Math.round(128 + 127 * Math.sin(hueSeed + (Math.PI * 2) / 3));
            const bl = Math.round(128 + 127 * Math.sin(hueSeed + (Math.PI * 4) / 3));
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${r},${g},${bl},${alpha})`;
            ctx.lineWidth = lw;
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const p of particles) {
        const dotR = p.attracted ? p.r * 1.6 : p.r;
        const dotAlpha = p.attracted ? opacity * 1.4 : opacity * 0.7;
        ctx.beginPath();
        ctx.arc(p.x, p.y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${dotAlpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, [count, color, lineWidth, maxDist, mouseDist, orbitRadius, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}
