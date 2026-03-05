import { useEffect, useRef, useState } from "react";
import { RadixToken, getChange, TimeFilter } from "@/hooks/useRadixPrices";

interface Bubble {
  token: RadixToken;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  change: number;
}

interface BubbleCanvasProps {
  tokens: RadixToken[];
  filter: TimeFilter;
  onSelectToken: (token: RadixToken) => void;
}

const MIN_RADIUS = 20;
const MAX_RADIUS = 75;
const IMAGES_CACHE = new Map<string, HTMLImageElement>();
const FAILED_IMAGES = new Set<string>();

function loadImage(url: string): HTMLImageElement | null {
  if (!url || FAILED_IMAGES.has(url)) return null;
  if (IMAGES_CACHE.has(url)) return IMAGES_CACHE.get(url)!;
  const img = new Image();
  img.src = url;
  img.onload = () => IMAGES_CACHE.set(url, img);
  img.onerror = () => FAILED_IMAGES.add(url);
  return null;
}

export default function BubbleCanvas({
  tokens,
  filter,
  onSelectToken,
}: BubbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const changes = tokens.map((t) => Math.abs(getChange(t, filter)));
    const maxChange = Math.max(...changes, 1);

    bubblesRef.current = tokens.map((token) => {
      const change = getChange(token, filter);
      const targetRadius =
        MIN_RADIUS + (Math.abs(change) / maxChange) * (MAX_RADIUS - MIN_RADIUS);
      
      const existing = bubblesRef.current.find(b => b.token.address === token.address);
      
      return {
        token,
        x: existing?.x ?? Math.random() * canvas.width,
        y: existing?.y ?? Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: existing?.radius ?? 0,
        targetRadius,
        change,
      };
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Deep Space Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, "#020617");
      bgGrad.addColorStop(0.5, "#0f172a");
      bgGrad.addColorStop(1, "#020617");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Distant Stars
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      for (let i = 0; i < 60; i++) {
        const x = (Math.sin(i * 4321.12) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(i * 1234.56) * 0.5 + 0.5) * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      const bubbles = bubblesRef.current;

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.radius += (b.targetRadius - b.radius) * 0.05;
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < b.radius) { b.x = b.radius; b.vx *= -1; }
        if (b.x > canvas.width - b.radius) { b.x = canvas.width - b.radius; b.vx *= -1; }
        if (b.y < b.radius) { b.y = b.radius; b.vy *= -1; }
        if (b.y > canvas.height - b.radius) { b.y = canvas.height - b.radius; b.vy *= -1; }

        for (let j = i + 1; j < bubbles.length; j++) {
          const b2 = bubbles[j];
          const dx = b2.x - b.x;
          const dy = b2.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = b.radius + b2.radius + 2;
          
          if (dist < minDist) {
            const angle = Math.atan2(dy, dx);
            const force = (minDist - dist) * 0.015;
            b.vx -= Math.cos(angle) * force;
            b.vy -= Math.sin(angle) * force;
            b2.vx += Math.cos(angle) * force;
            b2.vy += Math.sin(angle) * force;
          }
        }

        ctx.save();
        
        // Glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = b.change >= 0 ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)";
        
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        
        const colorBase = b.change >= 0 ? "34, 197, 94" : "239, 68, 68";
        
        // Realistic 3D Bubble Radial Gradient
        const bubbleGrad = ctx.createRadialGradient(
          b.x - b.radius * 0.35, 
          b.y - b.radius * 0.35, 
          b.radius * 0.05, 
          b.x, b.y, b.radius
        );
        bubbleGrad.addColorStop(0, "rgba(255, 255, 255, 0.6)"); // Reflection
        bubbleGrad.addColorStop(0.2, `rgba(${colorBase}, 0.4)`);
        bubbleGrad.addColorStop(0.8, `rgba(${colorBase}, 0.15)`);
        bubbleGrad.addColorStop(1, `rgba(${colorBase}, 0.3)`); // Edge
        
        ctx.fillStyle = bubbleGrad;
        ctx.fill();
        
        // Bubble Rim
        ctx.strokeStyle = `rgba(${colorBase}, 0.6)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.clip();
        const img = loadImage(b.token.iconUrl || "");
        if (img) {
          const imgSize = b.radius * 1.4;
          ctx.globalAlpha = 0.9;
          ctx.drawImage(img, b.x - imgSize/2, b.y - imgSize/2, imgSize, imgSize);
          ctx.globalAlpha = 1;
        }
        
        ctx.restore();

        // Labels
        if (b.radius > 22) {
          ctx.fillStyle = "white";
          ctx.font = `bold ${Math.max(10, b.radius / 2.8)}px Inter, sans-serif`;
          ctx.textAlign = "center";
          ctx.shadowBlur = 6;
          ctx.shadowColor = "rgba(0,0,0,0.8)";
          ctx.fillText(b.token.symbol, b.x, b.y + b.radius * 0.1);
          
          ctx.font = `600 ${Math.max(8, b.radius / 4.2)}px Inter, sans-serif`;
          ctx.fillStyle = b.change >= 0 ? "#4ade80" : "#f87171";
          ctx.fillText(`${b.change >= 0 ? '+' : ''}${b.change.toFixed(1)}%`, b.x, b.y + b.radius * 0.45);
          ctx.shadowBlur = 0;
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      for (const b of bubblesRef.current) {
        const dx = mouseX - b.x;
        const dy = mouseY - b.y;
        if (Math.sqrt(dx * dx + dy * dy) < b.radius) {
          onSelectToken(b.token);
          break;
        }
      }
    };

    canvas.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", handleClick);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [tokens, filter, onSelectToken]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full cursor-pointer bg-[#020617]"
    />
  );
}
