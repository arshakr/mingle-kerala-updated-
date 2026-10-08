"use client";
import {useId} from "react";
import { KERALA_PLACES } from "@/lib/kerala-locations";
import {useLocale} from "@/components/LocaleProvider";
export function LocalityField({district,value,onChange,required=false}:{district:string;value:string;onChange:(v:string)=>void;required?:boolean}) {
  const id = useId(); const {t} = useLocale();
  return <div className="field">
    <label htmlFor={id}>{t("Your place / town / village", "നിങ്ങളുടെ സ്ഥലം / പട്ടണം / ഗ്രാമം")}{!required && <span className="field-optional"> {t("(optional)","(ഐച്ഛികം)")}</span>}</label>
    <input id={id} list={`${id}-places`} value={value} onChange={e=>onChange(e.target.value)} maxLength={80} required={required} autoComplete="off" placeholder={t("Search suggestions or type ANY Kerala locality…","കേരളത്തിലെ ഏത് സ്ഥലവും ടൈപ്പ് ചെയ്യാം…")}/>
    <datalist id={`${id}-places`}>{(KERALA_PLACES[district]||[]).map(p=><option value={p} key={p}/>)}</datalist>
    <span className="field-help">{t("All villages, panchayats and neighbourhoods are supported by free entry. Private unless you choose to show it.","കേരളത്തിലെ ഏത് ഗ്രാമവും പഞ്ചായത്തും പ്രദേശവും നൽകാം. നിങ്ങൾ അനുവദിച്ചാൽ മാത്രമേ മറ്റുള്ളവർക്ക് കാണൂ.")}</span>
  </div>;
}
