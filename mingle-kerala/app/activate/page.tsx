"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { ArrowUpRight, BadgeCheck, Copy, RotateCw, Wallet, ShieldCheck } from "lucide-react";
import {useLocale} from "@/components/LocaleProvider";
import { AuthFrame } from "@/components/AuthFrame";
import { api } from "@/lib/client";
const UPI = "arshaksfi1-1@okicici";
type Receipt = { paymentId: string; proofSecret: string; email: string };
export default function ActivatePage() {
  const router = useRouter(); const {t} = useLocale();
  const [email,setEmail] = useState(""); const [utr,setUtr] = useState("");
  const [isAdult,setAdult] = useState(false); const [terms,setTerms] = useState(false);
  const [privacy,setPrivacy] = useState(false); const [guidelines,setGuidelines] = useState(false);
  const [receipt,setReceipt] = useState<Receipt|null>(null);
  const [status,setStatus] = useState("PENDING_VERIFICATION"); const [claimCode,setClaimCode] = useState("");
  const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  useEffect(() => { try { const saved = localStorage.getItem("kc_activation_receipt"); if(saved){const r = JSON.parse(saved) as Receipt; if(r.paymentId && r.proofSecret){setReceipt(r);setEmail(r.email || "");}} } catch {} },[]);
  const payUri = `upi://pay?pa=${encodeURIComponent(UPI)}&pn=${encodeURIComponent("Mingle Kerala")}&am=25.00&cu=INR&tn=${encodeURIComponent("Mingle Kerala one-time ID activation")}`;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try { const data = await api<{ paymentId:string; proofSecret:string }>("/api/activation/submit", {method:"POST",body:{email,utr,isAdult,acceptTerms:terms,acceptPrivacy:privacy,acceptGuidelines:guidelines}});
      const r = {...data,email}; setReceipt(r); localStorage.setItem("kc_activation_receipt",JSON.stringify(r)); setStatus("PENDING_VERIFICATION");
    } catch(e){setError((e as Error).message);} finally{setBusy(false);}
  }
  async function check() {
    if(!receipt) return;setBusy(true);setError("");
    try { const data = await api<{status:string;claimCode?:string|null;activated:boolean}>("/api/activation/status",{method:"POST",body:receipt});setStatus(data.status);setClaimCode(data.claimCode||"");
    }catch(e){setError((e as Error).message);}finally{setBusy(false);}
  }
  useEffect(()=>{ if(receipt) void check(); /* only when receipt changes */ // eslint-disable-next-line react-hooks/exhaustive-deps
  },[receipt?.paymentId]);
  return <AuthFrame><div className="eyebrow"><span className="tiny-pulse"/> {t("STEP 01 / COMMUNITY ACTIVATION","ഘട്ടം 01 / ഐഡി ആക്ടിവേഷൻ")}</div><h2>{t("Begin with intention.","മിംഗിൾ കേരളയിൽ ചേരൂ.")}</h2><p className="subtle">{t("A one-time ₹25 activation fee supports hosting, security and Mingle Kerala. Existing members can ","ഒറ്റത്തവണ ₹25 ആക്ടിവേഷൻ ഫീസ് സെർവർ, സുരക്ഷ എന്നിവയ്ക്ക് സഹായിക്കുന്നു. നിലവിലെ അംഗങ്ങൾക്ക് ")}<Link className="inline-link" href="/login">{t("sign in free","സൗജന്യമായി ലോഗിൻ ചെയ്യാം")}</Link>.</p>
    {!receipt ? <><div className="panel" style={{marginTop:23}}><div className="payment-number"><small>₹</small>25<span style={{fontSize:14,color:"#84aaa8"}}>.00</span></div><div className="payment-upi">{t("One-time activation · Paid directly to","ഒറ്റത്തവണ ആക്ടിവേഷൻ · നേരിട്ട് അടയ്ക്കേണ്ട UPI:")} {UPI}</div><div className="qr-frame"><QRCodeSVG value={payUri} size={155} level="M" bgColor="#fff" fgColor="#081a25"/></div><div style={{display:"flex",justifyContent:"center",gap:9,flexWrap:"wrap"}}><a href={payUri} className="btn btn-primary mini-btn">{t("Open UPI app","UPI ആപ്പ് തുറക്കൂ")} <ArrowUpRight size={14}/></a><button className="btn btn-ghost mini-btn" onClick={()=>navigator.clipboard.writeText(UPI)}><Copy size={13}/> {t("Copy UPI ID","UPI ഐഡി കോപ്പി ചെയ്യൂ")}</button></div></div>
    <div className="form-message form-warn" style={{marginTop:15}}>{t("Payment verification is manual. Submit the UPI reference after paying. Your account unlocks only after the actual bank credit is checked.","പേയ്‌മെന്റ് പരിശോധന ഡെവലപ്പർ നേരിട്ടാണ് നടത്തുന്നത്. പണമടച്ച ശേഷം UPI റഫറൻസ് നമ്പർ നൽകൂ. ബാങ്കിൽ പണം ലഭിച്ചതായി സ്ഥിരീകരിച്ചാൽ മാത്രമേ ഐഡി ലഭിക്കൂ.")}</div>
    <form className="form" onSubmit={submit}><div className="field"><label htmlFor="activation-email">{t("Email for activation (never public)","ആക്ടിവേഷനുള്ള ഇമെയിൽ (മറ്റുള്ളവർ കാണില്ല)")}</label><input id="activation-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div><div className="field"><label htmlFor="utr">{t("UPI transaction reference / UTR","UPI ഇടപാട് നമ്പർ / UTR")}</label><input id="utr" value={utr} onChange={e=>setUtr(e.target.value)} placeholder={t("UPI reference from payment receipt","പണമടച്ചതിന്റെ UPI റഫറൻസ് നമ്പർ")} minLength={8} maxLength={35} required/><span className="field-help">{t("Pay first, then copy the reference from your UPI app.","ആദ്യം പണമടയ്ക്കൂ. ശേഷം UPI ആപ്പിൽ നിന്ന് റഫറൻസ് നമ്പർ പകർത്തൂ.")}</span></div>
    <label className="checkbox-row"><input type="checkbox" checked={isAdult} onChange={e=>setAdult(e.target.checked)} required/> {t("I confirm I am at least 18 years old.","എനിക്ക് 18 വയസ്സോ അതിലധികമോ പ്രായമുണ്ട്.")}</label>
    <label className="checkbox-row"><input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} required/> {t("I accept the","ഞാൻ അംഗീകരിക്കുന്നു:")} <Link className="inline-link" href="/terms" target="_blank">{t("Terms of Service","സേവന നിബന്ധനകൾ")}</Link>.</label>
    <label className="checkbox-row"><input type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)} required/> {t("I accept the","ഞാൻ അംഗീകരിക്കുന്നു:")} <Link className="inline-link" href="/privacy" target="_blank">{t("Privacy Policy","സ്വകാര്യതാ നയം")}</Link>.</label>
    <label className="checkbox-row"><input type="checkbox" checked={guidelines} onChange={e=>setGuidelines(e.target.checked)} required/> {t("I accept the","ഞാൻ അംഗീകരിക്കുന്നു:")} <Link className="inline-link" href="/community" target="_blank">{t("Community Guidelines","കമ്മ്യൂണിറ്റി നിയമങ്ങൾ")}</Link>.</label>
    {error&&<div role="alert" className="form-message form-error">{error}</div>}
    <button className="btn btn-primary" disabled={busy||!isAdult||!terms||!privacy||!guidelines}>{busy?t("Submitting…","സമർപ്പിക്കുന്നു…"):t("Submit payment for verification","പേയ്‌മെന്റ് പരിശോധിക്കാൻ സമർപ്പിക്കൂ")} <ArrowUpRight size={16}/></button></form>
    </> : <div className="panel" style={{marginTop:28}}><div className="status-pill pending"><ShieldCheck size={14}/> {t("ACTIVATION STATUS","ആക്ടിവേഷൻ നില")}</div><h3 style={{fontSize:23,margin:"16px 0 10px"}}>{status==="VERIFIED"?t("Payment verified!","പേയ്‌മെന്റ് സ്ഥിരീകരിച്ചു!"):status==="REJECTED"?t("Payment not approved","പേയ്‌മെന്റ് അംഗീകരിച്ചില്ല"):t("We are checking your payment","പേയ്‌മെന്റ് പരിശോധിക്കുന്നു")}</h3><p>{status==="VERIFIED"?t("Activation approved. You can create your anonymous profile.","ആക്ടിവേഷൻ അംഗീകരിച്ചു. ഇനി പ്രൊഫൈൽ സൃഷ്ടിക്കാം."):status==="REJECTED"?t("Payment not approved. Contact support.","പേയ്‌മെന്റ് അംഗീകരിച്ചില്ല. സഹായത്തിനായി ബന്ധപ്പെടൂ."):t("The developer will check the actual ₹25 credit. Keep this browser receipt safe.","ഡെവലപ്പർ ₹25 ക്രെഡിറ്റ് പരിശോധിക്കും. ഈ ബ്രൗസറിലെ രസീത് സൂക്ഷിക്കുക.")}</p><div className="field" style={{margin:"18px 0"}}><label>{t("Payment request ID","പേയ്‌മെന്റ് ഐഡി")}</label><div className="code-text">{receipt.paymentId}</div></div>
    {claimCode&&<><div className="field"><label>{t("Verified activation code","സ്ഥിരീകരിച്ച ആക്ടിവേഷൻ കോഡ്")}</label><div className="code-text">{claimCode}</div></div><button className="btn btn-primary" style={{width:"100%",marginTop:20}} onClick={()=>router.push("/register")}>{t("Create my anonymous ID","എന്റെ അജ്ഞാത ഐഡി സൃഷ്ടിക്കൂ")} <BadgeCheck size={17}/></button></>}
    {!claimCode&&<button className="btn btn-ghost" disabled={busy} style={{width:"100%"}} onClick={check}><RotateCw size={15}/>{busy?t("Checking…","പരിശോധിക്കുന്നു…"):t("Check verification status","സ്ഥിതി പരിശോധിക്കൂ")}</button>}
    <button className="btn btn-ghost" style={{width:"100%",marginTop:10}} onClick={()=>{if(window.confirm("Replace your saved receipt? Keep your payment ID and proof first.")){localStorage.removeItem("kc_activation_receipt");setReceipt(null);setClaimCode("");}}}>{t("Submit a different payment","മറ്റൊരു പേയ്‌മെന്റ് സമർപ്പിക്കൂ")}</button>
    {error&&<div role="alert" className="form-message form-error" style={{marginTop:12}}>{error}</div>}</div>}
    <div className="auth-footnote"><Wallet size={15} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>{t("This is a mandatory activation fee, not a voluntary donation. Your UPI payment may reveal your payment details to the recipient. Read ","ഇത് നിർബന്ധിത ആക്ടിവേഷൻ ഫീസാണ്, സ്വമേധയാ സംഭാവനയല്ല. UPI പേയ്‌മെന്റിലെ വിവരങ്ങൾ സ്വീകർത്താവിന് കാണാം. വായിക്കൂ: ")}<Link href="/refund" className="inline-link">{t("activation and refund policy","ആക്ടിവേഷൻ / റീഫണ്ട് നയം")}</Link>.</div>
  </AuthFrame>;
}
