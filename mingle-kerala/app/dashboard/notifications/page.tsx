"use client";
import {useLocale} from "@/components/LocaleProvider";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Bell,CheckCheck} from "lucide-react";
import {PageIntro} from "@/components/PageIntro";
import {api,when} from "@/lib/client";
type Note={id:string;title:string;body:string;href:string|null;readAt:string|null;createdAt:string};
export default function Notifications(){const {t}=useLocale();const [items,setItems]=useState<Note[]>([]);const [error,setError]=useState("");async function load(){try{setItems((await api<{notifications:Note[]}>("/api/notifications")).notifications);}catch(e){setError((e as Error).message);}}useEffect(()=>{void load();},[]);
  async function read(id?:string){try{await api("/api/notifications",{method:"PATCH",body:{id}});await load();}catch(e){setError((e as Error).message);}}
  return <><PageIntro eyebrow={t("UPDATES / NOTIFICATIONS","അറിയിപ്പുകൾ")} title={t("What's new in your orbit.","പുതിയ വാർത്തകൾ ഇവിടെ.")} desc={t("Chat requests and important account updates appear here.","ചാറ്റ് അഭ്യർത്ഥനകളും അക്കൗണ്ട് അറിയിപ്പുകളും ഇവിടെ ലഭിക്കും.")}/><div style={{display:"flex",justifyContent:"flex-end",marginBottom:13}}><button className="btn btn-ghost mini-btn" onClick={()=>read()}><CheckCheck size={14}/> {t("Mark all read","എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തൂ")}</button></div>{error&&<div className="form-message form-error">{error}</div>}<div className="list-panel">{items.length?items.map(n=><div className="notification-item" key={n.id} style={!n.readAt?{background:"#b7ffe70d"}:{}}><span style={{color:"#a9ffe0"}}><Bell size={20}/></span><div style={{flex:1}}><h3>{n.title} {!n.readAt&&<span style={{color:"#a9ffe0"}}>●</span>}</h3><p>{n.body}</p><p style={{marginTop:6,fontSize:9}}>{when(n.createdAt)}</p>{n.href&&<Link href={n.href} className="text-link" style={{marginTop:7}}>{t("Open","തുറക്കൂ")} →</Link>}</div>{!n.readAt&&<button className="icon-btn" title={t("Mark read","വായിച്ചതായി അടയാളപ്പെടുത്തൂ")} onClick={()=>read(n.id)}><CheckCheck size={14}/></button>}</div>):<div className="empty-state"><Bell size={24} style={{margin:"0 auto 12px"}}/><h3>{t("All quiet here.","പുതിയ അറിയിപ്പുകളില്ല.")}</h3><p>{t("Notifications will appear here.","പുതിയ അറിയിപ്പുകൾ ഇവിടെ കാണാം.")}</p></div>}</div></>;
}
