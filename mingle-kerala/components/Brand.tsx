import Link from "next/link";
export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="brand" aria-label="Mingle Kerala home / മിംഗിൾ കേരള"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M5 12c7 0 8-7 15-7s9 7 15 7M5 20c7 0 8-7 15-7s9 7 15 7M5 28c7 0 8-7 15-7s9 7 15 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span>{!compact && <span>mingle<span className="brand-light">kerala</span><span className="brand-dot">.</span></span>}</Link>;
}
