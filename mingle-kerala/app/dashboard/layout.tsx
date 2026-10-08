"use client";
import {useEffect,useState} from "react";
import {usePathname,useRouter} from "next/navigation";
import Link from "next/link";
import {Compass,MessagesSquare,UserRoundPlus,Bell,SlidersHorizontal,LogOut,ShieldCheck,Sparkles} from "lucide-react";
import {Brand} from "@/components/Brand";
import {Avatar} from "@/components/Avatar";
import {Backdrop} from "@/components/Backdrop";
import {LanguageToggle,useLocale} from "@/components/LocaleProvider";
import {placeLabel} from "@/lib/kerala-locations";
import {api,PublicUser} from "@/lib/client";
const links=[{href:"/dashboard",en:"Discover",ml:"കണ്ടെത്തൂ",icon:Compass},{href:"/dashboard/messages",en:"Conversations",ml:"ചാറ്റുകൾ",icon:MessagesSquare},{href:"/dashboard/requests",en:"Requests",ml:"അഭ്യർത്ഥനകൾ",icon:UserRoundPlus},{href:"/dashboard/notifications",en:"Notifications",ml:"അറിയിപ്പുകൾ",icon:Bell},{href:"/dashboard/settings",en:"My privacy",ml:"സ്വകാര്യത",icon:SlidersHorizontal}];
export default function DashboardLayout({children}:{children:React.ReactNode}){const path=usePathname();const router=useRouter();const {t,locale}=useLocale();const [me,setMe]=useState<PublicUser|null>(null);const [loading,setLoading]=useState(true);
  useEffect(()=>{let active=true;api<{user:PublicUser}>("/api/auth/me").then(d=>{if(active)setMe(d.user);}).catch(()=>{if(active)router.replace("/login");}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[router]);
  async function logout(){await api("/api/auth/logout",{method:"POST"}).catch(()=>{});router.replace("/login");}
  return <div className="app-shell"><Backdrop/><aside className="side-rail"><Brand/><div className="rail-label">{t("YOUR SPACE","നിങ്ങളുടെ ഇടം")}</div><div className="rail-links">{links.map(l=><Link key={l.href} href={l.href} className={`rail-link ${path===l.href?"active":""}`}><l.icon/>{t(l.en,l.ml)}</Link>)}</div><div className="rail-bottom"><LanguageToggle/><div className="rail-label" style={{marginTop:20}}>{t("CONTROL CENTER","നിയന്ത്രണങ്ങൾ")}</div><div className="rail-links"><Link className="rail-link" href="/safety"><ShieldCheck/>{t("Safety center","സുരക്ഷ")}</Link>{me&&me.role!=="USER"&&<Link className="rail-link" href="/admin"><Sparkles/>{t("Admin","അഡ്മിൻ")}</Link>}<button className="rail-link" onClick={logout}><LogOut/>{t("Sign out","ലോഗൗട്ട്")}</button></div>{me&&<div className="rail-user"><Avatar seed={me.avatarSeed} size={38}/><div><strong>{me.username}</strong><span>{placeLabel(me.district,locale)}</span></div></div>}</div></aside>
  <main className="main-view"><div className="mobile-top"><Brand/><LanguageToggle/>{me&&<Avatar seed={me.avatarSeed} size={34}/>}</div>{loading?<div className="empty-state">{t("Loading your private space…","നിങ്ങളുടെ ഇടം തുറക്കുന്നു…")}</div>:me?children:null}</main><nav className="mobile-nav" aria-label="Primary navigation">{links.map(l=><Link key={l.href} href={l.href} className={path===l.href?"active":""}><l.icon/>{t(l.en,l.ml)}</Link>)}</nav></div>;
}
