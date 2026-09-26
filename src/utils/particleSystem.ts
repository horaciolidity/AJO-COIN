// High-performance Canvas Particle System (Zero React DOM Mutations)

export interface CanvasParticle {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  scale: number;
  speedY: number;
  speedX: number;
}

const particles: CanvasParticle[] = [];
let animFrameId: number | null = null;
let canvasCtx: CanvasRenderingContext2D | null = null;

export const registerParticleCanvas = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    canvasCtx = null;
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  canvasCtx = ctx;

  const render = () => {
    if (!canvasCtx || !canvas) return;

    // Resize canvas to match display size if needed
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    // Clear canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    // Render & update particles in memory
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.y -= p.speedY;
      p.x += p.speedX;
      p.opacity -= 0.025;

      if (p.opacity <= 0) {
        particles.splice(i, 1);
        continue;
      }

      canvasCtx.save();
      canvasCtx.globalAlpha = Math.max(0, p.opacity);
      canvasCtx.font = `900 ${Math.floor(20 * p.scale)}px sans-serif`;
      canvasCtx.fillStyle = p.color;
      canvasCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      canvasCtx.shadowBlur = 8;
      canvasCtx.fillText(p.text, p.x, p.y);
      canvasCtx.restore();
    }

    animFrameId = requestAnimationFrame(render);
  };

  if (animFrameId) cancelAnimationFrame(animFrameId);
  animFrameId = requestAnimationFrame(render);
};

export const spawnCanvasParticle = (
  x: number,
  y: number,
  text: string,
  color = '#34D399'
) => {
  particles.push({
    id: Date.now() + Math.random(),
    x: x + (Math.random() - 0.5) * 30,
    y: y - 10,
    text,
    color,
    opacity: 1,
    scale: 1 + Math.random() * 0.3,
    speedY: 1.8 + Math.random() * 1.2,
    speedX: (Math.random() - 0.5) * 1.5,
  });

  // Keep max 30 particles active to prevent memory bloat
  if (particles.length > 30) {
    particles.shift();
  }
};
