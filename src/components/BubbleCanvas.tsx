import { useEffect, useRef, useCallback, useState } from "react";
import { RadixToken, getChange, getVolume, TimeFilter, PriceUnit, BubbleMode, VolumeFilter } from "@/hooks/useRadixPrices";
interface Bubble {
  token: RadixToken;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  targetRadius: number;
  change: number;
  volumeRank: number; // 0..1, 1 = highest volume
}
interface BubbleCanvasProps {
  tokens: RadixToken[];
  filter: TimeFilter;
  priceUnit: PriceUnit;
  bubbleMode: BubbleMode;
  volumeFilter: VolumeFilter;
  onTokenClick: (token: RadixToken) => void;
}
const MIN_RADIUS = 22;
const MAX_RADIUS = 80;
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
function hslToRgba(h: number, s: number, l: number, a: number): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}
export default function BubbleCanvas({ tokens, filter, priceUnit, bubbleMode, volumeFilter, onTokenClick }: BubbleCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const hoveredRef = useRef<Bubble | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanvasSize({ w: el.clientWidth, h: el.clientHeight });
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setCanvasSize({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const existing = new Map(bubblesRef.current.map((b) => [b.token.address, b]));

    if (bubbleMode === "volume") {
      // Size bubbles by volume rank
      const volumes = tokens.map((t) => getVolume(t, volumeFilter));
      const maxVol = Math.max(...volumes, 1);
      bubblesRef.current = tokens.map((token) => {
        const vol = getVolume(token, volumeFilter);
        const normalizedSize = Math.sqrt(vol / maxVol);
        const targetRadius = MIN_RADIUS + normalizedSize * (MAX_RADIUS - MIN_RADIUS);
        const volumeRank = vol / maxVol;
        const change = getChange(token, filter, priceUnit);
        const prev = existing.get(token.address);
        if (prev) {
          prev.token = token;
          prev.change = change;
          prev.targetRadius = targetRadius;
          prev.volumeRank = volumeRank;
          return prev;
        }
        if (token.iconUrl) loadImage(token.iconUrl);
        return {
          token,
          x: Math.random() * canvasSize.w,
          y: Math.random() * canvasSize.h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: targetRadius * 0.5,
          targetRadius,
          change,
          volumeRank,
        };
      });
    } else {
      // Original price-change mode
      const changes = tokens.map((t) => Math.abs(getChange(t, filter, priceUnit)));
      const maxChange = Math.max(...changes, 1);
      bubblesRef.current = tokens.map((token) => {
        const change = getChange(token, filter, priceUnit);
        const absChange = Math.abs(change);
        const normalizedSize = Math.sqrt(absChange / maxChange);
        const targetRadius = MIN_RADIUS + normalizedSize * (MAX_RADIUS - MIN_RADIUS);
        const prev = existing.get(token.address);
        if (prev) {
          prev.token = token;
          prev.change = change;
          prev.targetRadius = targetRadius;
          prev.volumeRank = 0;
          return prev;
        }
        if (token.iconUrl) loadImage(token.iconUrl);
        return {
          token,
          x: Math.random() * canvasSize.w,
          y: Math.random() * canvasSize.h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: targetRadius * 0.5,
          targetRadius,
          change,
          volumeRank: 0,
        };
      });
    }
  }, [tokens, filter, priceUnit, bubbleMode, volumeFilter, canvasSize]);
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { w, h } = canvasSize;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const bubbles = bubblesRef.current;
    const mouse = mouseRef.current;
    let hovered: Bubble | null = null;
    for (const b of bubbles) {
      b.radius += (b.targetRadius - b.radius) * 0.05;
      if (mouse) {
        const dx = b.x - mouse.x;
        const dy = b.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < b.radius + 5) {
          hovered = b;
        }
        if (dist < 150 && dist > 0) {
          const force = 0.3 / dist;
          b.vx += dx * force;
          b.vy += dy * force;
        }
      }
      const cx = w / 2, cy = h / 2;
      b.vx += (cx - b.x) * 0.00008;
      b.vy += (cy - b.y) * 0.00008;
      b.vx *= 0.985;
      b.vy *= 0.985;
      b.x += b.vx;
      b.y += b.vy;
      if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -0.5; }
      if (b.x + b.radius > w) { b.x = w - b.radius; b.vx *= -0.5; }
      if (b.y - b.radius < 0) { b.y = b.radius; b.vy *= -0.5; }
      if (b.y + b.radius > h) { b.y = h - b.radius; b.vy *= -0.5; }
    }
    for (let i = 0; i < bubbles.length; i++) {
      for (let j = i + 1; j < bubbles.length; j++) {
        const a = bubbles[i], b = bubbles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.radius + b.radius;
        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2;
          const nx = dx / dist, ny = dy / dist;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          const dvx = b.vx - a.vx;
          const dvy = b.vy - a.vy;
          const dvn = dvx * nx + dvy * ny;
          if (dvn < 0) {
            a.vx += dvn * nx * 0.3;
            a.vy += dvn * ny * 0.3;
            b.vx -= dvn * nx * 0.3;
            b.vy -= dvn * ny * 0.3;
          }
        }
      }
    }
    hoveredRef.current = hovered;
    // Read current bubbleMode from DOM attribute to avoid stale closure
    const currentBubbleMode = canvas.dataset.bubbleMode as BubbleMode;
    for (const b of bubbles) {
      const isHovered = b === hovered;
      let baseH: number, baseS: number, baseL: number;
      if (currentBubbleMode === "volume") {
        // Amber/orange gradient for volume mode: high vol = bright amber, low vol = muted orange
        const rank = b.volumeRank;
        baseH = 35 + rank * 10; // 35 (amber) to 45 (golden)
        baseS = 60 + rank * 30; // 60..90%
        baseL = 20 + rank * 15; // 20..35%
      } else {
        const change = b.change;
        const isPositive = change > 0;
        const isNeutral = Math.abs(change) < 0.01;
        baseH = isNeutral ? 220 : isPositive ? 145 : 0;
        baseS = isNeutral ? 15 : isPositive ? 65 : 72;
        baseL = isNeutral ? 20 : isPositive ? 25 : 25;
      }
      const alpha = isHovered ? 0.7 : 0.45;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = hslToRgba(baseH, baseS, baseL, alpha);
      ctx.fill();
      ctx.strokeStyle = hslToRgba(baseH, baseS, isHovered ? 55 : 40, isHovered ? 0.9 : 0.5);
      ctx.lineWidth = isHovered ? 2.5 : 1.5;
      ctx.stroke();
      const iconSize = Math.min(b.radius * 0.6, 28);
      const img = b.token.iconUrl ? IMAGES_CACHE.get(b.token.iconUrl) : null;
      const hasIcon = img && img.complete && img.naturalWidth > 0;
      if (hasIcon) {
        try {
          ctx.save();
          ctx.beginPath();
          ctx.arc(b.x, b.y - b.radius * 0.22, iconSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, b.x - iconSize / 2, b.y - b.radius * 0.22 - iconSize / 2, iconSize, iconSize);
          ctx.restore();
        } catch {
          ctx.restore();
        }
      } else {
        ctx.beginPath();
        ctx.arc(b.x, b.y - b.radius * 0.22, iconSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = hslToRgba(baseH, baseS, 35, 0.8);
        ctx.fill();
        ctx.fillStyle = "hsl(210, 20%, 92%)";
        ctx.font = `700 ${Math.max(8, iconSize * 0.45)}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.token.symbol?.slice(0, 2) || "?", b.x, b.y - b.radius * 0.22);
      }
      ctx.fillStyle = "hsl(210, 20%, 92%)";
      ctx.font = `600 ${Math.max(8, b.radius * 0.26)}px 'Space Grotesk', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const nameY = b.y + b.radius * 0.15;
      ctx.fillText(b.token.symbol, b.x, nameY);
      if (b.radius > 20) {
        if (currentBubbleMode === "volume") {
  const vol = getVolume(b.token, volumeFilter);  // ← corrigido: usa 24H ou 7D
  const volStr = vol >= 1_000_000
    ? `${(vol / 1_000_000).toFixed(1)}M`
    : vol >= 1_000
    ? `${(vol / 1_000).toFixed(0)}K`
    : `${vol.toFixed(0)}`;
          ctx.font = `500 ${Math.max(7, b.radius * 0.2)}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = hslToRgba(40, 90, 70, 1);
          ctx.fillText(volStr, b.x, nameY + b.radius * 0.28);
        } else {
          const change = b.change;
          const isPositive = change > 0;
          const isNeutral = Math.abs(change) < 0.01;
          const rounded = Math.round(change);
          const changeStr = `${rounded > 0 ? "+" : ""}${rounded}%`;
          ctx.font = `500 ${Math.max(7, b.radius * 0.2)}px 'JetBrains Mono', monospace`;
          ctx.fillStyle = isNeutral
            ? hslToRgba(220, 15, 55, 1)
            : isPositive
            ? hslToRgba(145, 65, 55, 1)
            : hslToRgba(0, 72, 60, 1);
          ctx.fillText(changeStr, b.x, nameY + b.radius * 0.28);
        }
      }
    }
    if (canvas) {
      canvas.style.cursor = hovered ? "pointer" : "default";
    }
    animRef.current = requestAnimationFrame(animate);
  }, [canvasSize]);
  // Keep bubbleMode accessible to animate loop via data attribute (avoids stale closure)
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.dataset.bubbleMode = bubbleMode;
    }
  }, [bubbleMode]);
  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }, []);
  const handleMouseLeave = useCallback(() => {
    mouseRef.current = null;
  }, []);
  const handleClick = useCallback(() => {
    if (hoveredRef.current) {
      onTokenClick(hoveredRef.current.token);
    }
  }, [onTokenClick]);
  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        data-bubble-mode={bubbleMode}
        style={{ width: canvasSize.w, height: canvasSize.h }}
        className="block"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
    </div>
  );
}
