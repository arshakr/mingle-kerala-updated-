"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Dices } from "lucide-react";
import { AuthFrame } from "@/components/AuthFrame";
import { LocalityField } from "@/components/LocalityField";
import { useLocale } from "@/components/LocaleProvider";
import { api } from "@/lib/client";
import { DISTRICTS, INTERESTS } from "@/lib/constants";
import { placeLabel } from "@/lib/kerala-locations";
const generated = () => {
  const left=["Monsoon","Velvet","Coastal","Quiet","Neon","Lagoon","Echo","Mango","Cosmic","Silver"];
  const right=["Nova","Orbit","Wave","Otter","Bloom","Drift","Comet","Muse","Ripple","Atlas"];
  const n=crypto.getRandomValues(new Uint32Array(3));return `${left[n[0]%left.length]}${right[n[1]%right.length]}${n[2]%9000+1000}`;
};
type Receipt = { paymentId:string;proofSecret:string;email:string };
export default function RegisterPage(){const router=useRouter();const {t,locale}=useLocale();const [receipt,setReceipt]=useState<Receipt|null>(null);const [claimCode,setClaimCode]=useState("");
  const [username,setUsername]=useState("");const [password,setPassword]=useState("");const [age,setAge]=useState(18);
  const [gender,setGender]=useState("PREFER_NOT_TO_SAY");const [district,setDistrict]=useState("Alappuzha");const [locality,setLocality]=useState("");const [language,setLanguage]=useState("BOTH");const [bio,setBio]=useState("");const [interests,setInterests]=useState<string[]>(["Technology"]);
  const [adult,setAdult]=useState(false);const [terms,setTerms]=useState(false);const [privacy,setPrivacy]=useState(false);const [guidelines,setGuidelines]=useState(false);const [error,setError]=useState("");const [busy,setBusy]=useState(false);const [verified,setVerified]=useState(false);
  useEffect(()=>{setUsername(generated());try{const str=localStorage.getItem("kc_activation_receipt");if(!str)return;const r=JSON.parse(str) as Receipt;setReceipt(r);api<{status:string;claimCode:string|null}>("/api/activation/status",{method:"POST",body:r}).then(d=>{if(d.status==="VERIFIED"&&d.claimCode){setClaimCode(d.claimCode);setVerified(true);}}).catch(()=>{});}catch{}},[]);
  function toggleInterest(i:string){setInterests(v=>v.includes(i)?v.filter(x=>x!==i):v.length<8?[...v,i]:v);}
  async function submit(e:React.FormEvent){e.preventDefault();if(!receipt||!verified)return;setBusy(true);setError("");try{await api("/api/auth/register",{method:"POST",body:{...receipt,claimCode,username,password,age,gender,district,locality,language,bio,interests,isAdult:adult,acceptTerms:terms,acceptPrivacy:privacy,acceptGuidelines:guidelines}});localStorage.removeItem("kc_activation_receipt");router.replace("/dashboard");}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <AuthFrame><div className="eyebrow"><span className="tiny-pulse"/> {t("STEP 02 / ANONYMOUS IDENTITY","ഘട്ടം 02 / അജ്ഞാത ഐഡന്റിറ്റി")}</div><h2>{t("Make an entrance. Stay anonymous.","പേരില്ലാതെ പരിചയപ്പെടൂ.")}</h2><p className="subtle">{t("No real names, public phone numbers, or profile photos needed.","യഥാർത്ഥ പേരോ ഫോൺ നമ്പറോ ഫോട്ടോയോ പരസ്യമാക്കേണ്ട.")}</p>
    {!verified?<div className="panel" style={{marginTop:25}}><h3>{t("Verified activation required","പേയ്‌മെന്റ് സ്ഥിരീകരണം ആവശ്യമാണ്")}</h3><p>{t("To create your ID, pay ₹25 and wait for the developer to verify the UPI credit. You can check your payment status.","ഐഡി സൃഷ്ടിക്കാൻ ₹25 അടച്ച് ഡെവലപ്പറുടെ UPI പരിശോധന പൂർത്തിയാകണം. പേയ്‌മെന്റ് നില പരിശോധിക്കാം.")}</p><Link href="/activate" className="btn btn-primary">{t("Go to activation","ആക്ടിവേഷനിലേക്ക്")} <ArrowRight size={16}/></Link></div>:
    <form className="form" onSubmit={submit}>
      <div className="form-message form-success">✓ {t("Your ₹25 payment is verified. You may create one account.","₹25 പേയ്‌മെന്റ് സ്ഥിരീകരിച്ചു. ഒരു അക്കൗണ്ട് സൃഷ്ടിക്കാം.")}</div>
      <div className="field"><label>{t("Anonymous username","അജ്ഞാത ഉപയോക്തൃനാമം")}</label><div className="payment-inline"><input value={username} onChange={e=>setUsername(e.target.value)} required minLength={5} maxLength={24}/><button type="button" onClick={()=>setUsername(generated())} className="icon-btn" title={t("Generate new name","പുതിയ പേര് കണ്ടെത്തൂ")}><Dices size={18}/></button></div></div>
      <div className="field"><label>{t("Password (at least 10 characters)","പാസ്‌വേഡ് (കുറഞ്ഞത് 10 അക്ഷരങ്ങൾ)")}</label><input type="password" value={password} autoComplete="new-password" onChange={e=>setPassword(e.target.value)} minLength={10} maxLength={128} required/></div>
      <div className="form-grid"><div className="field"><label>{t("Age (18+)","പ്രായം (18+)")}</label><input type="number" min={18} max={115} value={age} onChange={e=>setAge(Number(e.target.value))} required/></div><div className="field"><label>{t("Gender","ലിംഗം")}</label><select value={gender} onChange={e=>setGender(e.target.value)}><option value="MALE">{t("Male","പുരുഷൻ")}</option><option value="FEMALE">{t("Female","സ്ത്രീ")}</option><option value="PREFER_NOT_TO_SAY">{t("Prefer not to say","പറയാൻ താൽപര്യമില്ല")}</option></select></div></div>
      <div className="form-grid"><div className="field"><label>{t("District","ജില്ല")}</label><select value={district} onChange={e=>{setDistrict(e.target.value);setLocality("");}}>{DISTRICTS.map(d=><option key={d} value={d}>{placeLabel(d,locale)}</option>)}</select></div><div className="field"><label>{t("Chat language","സംഭാഷണ ഭാഷ")}</label><select value={language} onChange={e=>setLanguage(e.target.value)}><option value="BOTH">മലയാളം + English</option><option value="MALAYALAM">മലയാളം</option><option value="ENGLISH">English</option></select></div></div>
      <LocalityField district={district} value={locality} onChange={setLocality}/>
      <div className="field"><label>{t("Short anonymous bio (optional)","ചെറിയ പരിചയക്കുറിപ്പ് (ഐച്ഛികം)")}</label><textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} placeholder={t("What do you enjoy?","നിങ്ങൾക്ക് ഇഷ്ടമുള്ളത് എന്താണ്?")} maxLength={280}/></div>
      <div className="field"><label>{t("Your interests (select 1–8)","നിങ്ങളുടെ താൽപര്യങ്ങൾ (1–8)")}</label><div className="interest-picker">{INTERESTS.map(i=><button type="button" key={i} aria-pressed={interests.includes(i)} className={`interest-option ${interests.includes(i)?"active":""}`} onClick={()=>toggleInterest(i)}>{i}</button>)}</div></div>
      <label className="checkbox-row"><input required type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)}/> {t("I am at least 18 years old.","എനിക്ക് 18 വയസ്സോ അതിലധികമോ പ്രായമുണ്ട്.")}</label>
      <label className="checkbox-row"><input required type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)}/> {t("I accept the","ഞാൻ അംഗീകരിക്കുന്നു:")} <Link target="_blank" className="inline-link" href="/terms">{t("Terms of Service","സേവന നിബന്ധനകൾ")}</Link>.</label>
      <label className="checkbox-row"><input required type="checkbox" checked={privacy} onChange={e=>setPrivacy(e.target.checked)}/> {t("I accept the","ഞാൻ അംഗീകരിക്കുന്നു:")} <Link target="_blank" className="inline-link" href="/privacy">{t("Privacy Policy","സ്വകാര്യതാ നയം")}</Link>.</label>
      <label className="checkbox-row"><input required type="checkbox" checked={guidelines} onChange={e=>setGuidelines(e.target.checked)}/> {t("I accept the","ഞാൻ അംഗീകരിക്കുന്നു:")} <Link target="_blank" className="inline-link" href="/community">{t("Community Guidelines","കമ്മ്യൂണിറ്റി മാർഗ്ഗനിർദ്ദേശങ്ങൾ")}</Link>.</label>
      {error&&<div role="alert" className="form-message form-error">{error}</div>}
      <button className="btn btn-primary" disabled={busy||!adult||!terms||!privacy||!guidelines||interests.length===0}>{busy?t("Creating your space…","അക്കൗണ്ട് സൃഷ്ടിക്കുന്നു…"):t("Create anonymous account","അജ്ഞാത അക്കൗണ്ട് സൃഷ്ടിക്കൂ")}<ArrowRight size={17}/></button>
    </form>}
    <div className="auth-footnote">{t("Already have an account?","അക്കൗണ്ട് ഉണ്ടോ?")} <Link className="inline-link" href="/login">{t("Sign in","ലോഗിൻ")}</Link>.</div>
  </AuthFrame>;
}
