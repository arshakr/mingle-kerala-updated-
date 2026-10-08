export function PageIntro({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return <header className="page-intro"><div className="eyebrow"><span className="tiny-pulse"/>{eyebrow}</div><h1>{title}</h1>{desc && <p>{desc}</p>}</header>;
}
