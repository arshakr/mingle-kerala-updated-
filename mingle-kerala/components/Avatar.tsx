export function Avatar({ seed, size = 52, className = "" }: { seed: string; size?: number; className?: string }) {
  let n = 0; for (const c of seed || "K") n = Math.imul(31, n) + c.charCodeAt(0) | 0;
  const hue = 165 + ((n >>> 0) % 85);
  return <span className={`avatar ${className}`} style={{ width: size, height: size, background: `radial-gradient(circle at 28% 23%, hsla(${hue-25},95%,80%,.95), transparent 38%),radial-gradient(circle at 78% 76%, hsla(${hue+35},96%,60%,.85), transparent 48%),linear-gradient(135deg,hsl(${hue},75%,23%),#061626)` }} aria-hidden="true"><span className="avatar-sigil">✧</span></span>;
}
