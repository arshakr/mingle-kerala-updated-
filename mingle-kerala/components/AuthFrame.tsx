"use client";
import { Brand } from "@/components/Brand";
import { Backdrop } from "@/components/Backdrop";
import { LanguageToggle,useLocale } from "@/components/LocaleProvider";
import Link from "next/link";
export function AuthFrame({children}: {children: React.ReactNode}) {
  const {t} = useLocale();
  return <div className="auth-outer"><Backdrop/><div className="auth-brand-side"><Brand/><div style={{position:"relative",zIndex:2}}><div className="eyebrow"><span className="tiny-pulse"/>{t("THE CURRENT IS CALLING","പുതിയ സൗഹൃദങ്ങളുടെ ലോകം")}</div><h1>{t("A place to be seen without being identified.","സ്വന്തം ഐഡന്റിറ്റി വെളിപ്പെടുത്താതെ സംസാരിക്കാം.")}</h1><p>{t("Across Kerala, conversations flow better when curiosity comes first. Find yours in a community built around consent and privacy.","കേരളത്തിലെ എല്ലാ ജില്ലകളിലും പുതിയ ആളുകളുമായി സുരക്ഷിതമായി സംസാരിക്കൂ. സ്വകാര്യതയും പരസ്പര സമ്മതവുമാണ് ഞങ്ങളുടെ അടിസ്ഥാനം.")}</p></div><div className="auth-note">MINGLE KERALA / MINGLEKERALA.IN · 18+ ONLY</div></div><main className="auth-form-side"><div><div className="auth-top-actions"><Link href="/" style={{fontSize:12,color:"#b3d0cf"}}>← {t("Back to home","ഹോമിലേക്ക് മടങ്ങുക")}</Link><LanguageToggle/><span className="age-pill">18+ ONLY</span></div>{children}</div></main></div>;
}
