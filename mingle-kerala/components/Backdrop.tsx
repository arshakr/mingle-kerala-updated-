"use client";
import { motion } from "framer-motion";
export function Backdrop({ hero = false }: { hero?: boolean }) {
  return <div className={`ambient ${hero ? "ambient-hero" : ""}`} aria-hidden="true">
    <div className="aurora aurora-a"/><div className="aurora aurora-b"/><div className="aurora aurora-c"/>
    <div className="grain"/><div className="grid-horizon"/>
    {hero && <><motion.div className="hero-wave wave-a" animate={{ rotate: [0,7,-4,0], scale:[1,1.05,1] }} transition={{ duration:18, repeat:Infinity, ease:"easeInOut" }}/>
      <motion.div className="hero-wave wave-b" animate={{ rotate: [0,-6,4,0], scale:[1,1.1,1] }} transition={{ duration:21, repeat:Infinity, ease:"easeInOut" }}/>
      <div className="rain-lines"/></>}
  </div>;
}
