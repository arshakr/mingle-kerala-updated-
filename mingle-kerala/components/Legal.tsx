"use client";
import {LanguageToggle,useLocale} from "@/components/LocaleProvider";
import { Brand } from "@/components/Brand";
import { Backdrop } from "@/components/Backdrop";
import Link from "next/link";
export type Section = { title: string; paragraphs: string[]; bullets?: string[] };
export function Legal({eyebrow,title,intro,sections}:{eyebrow:string;title:string;intro:string;sections:Section[]}){
 const {t,locale}=useLocale(); return <div className="legal-wrap"><Backdrop/><div className="container"><div className="legal-header"><Brand/><LanguageToggle/></div><article className="legal-content"><div className="eyebrow"><span className="tiny-pulse"/>{eyebrow}</div><h1 style={{marginTop:17}}>{title}</h1>{locale==="ml"&&<p lang="ml" className="legal-lang-note">നിയമ / സ്വകാര്യതാ രേഖയുടെ ഔദ്യോഗിക രൂപം ഇപ്പോൾ ഇംഗ്ലീഷിലാണ്. താഴെ നൽകിയിരിക്കുന്ന ഇംഗ്ലീഷ് രേഖ ശ്രദ്ധാപൂർവ്വം വായിക്കുക. കൂടുതൽ സഹായത്തിന് ബന്ധപ്പെടാം.</p>}<p>{intro}</p>{sections.map(s=><section key={s.title}><h2>{s.title}</h2>{s.paragraphs.map(p=><p key={p}>{p}</p>)}{s.bullets&&<ul>{s.bullets.map(b=><li key={b}>{b}</li>)}</ul>}</section>)}<p style={{marginTop:45,paddingTop:20,borderTop:"1px solid #aaffdb30"}}>{t("Questions?","ചോദ്യങ്ങളുണ്ടോ?")} <Link href="/contact">{t("Contact us","ബന്ധപ്പെടൂ")}</Link> · <Link href="/">{t("Return home","ഹോമിലേക്ക്")}</Link></p></article></div></div>;
}
