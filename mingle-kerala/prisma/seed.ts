import "dotenv/config";
import argon2 from "argon2";
import { db } from "../lib/db";
import { INTERESTS, DISTRICTS, TERMS_VERSION } from "../lib/constants";
async function seed(){
  for(const name of INTERESTS) await db.interest.upsert({where:{name},update:{},create:{name}});
  console.log("Seeded interest catalog:",INTERESTS.length);
  if(process.env.SEED_DEMO_USERS!=="true") return;
  if(process.env.NODE_ENV==="production") throw new Error("Never seed demo users in production");
  const pass=await argon2.hash("OnlyForLocalDemo123!",{type:argon2.argon2id});
  const users=[
    {username:"MonsoonNova2841",gender:"PREFER_NOT_TO_SAY" as const, district:"Alappuzha",locality:"Mannancherry",language:"BOTH" as const,age:24,bio:"Evening rains, good books, curious minds.",interests:["Books","Movies","Travel"]},
    {username:"NeonWave5028",gender:"MALE" as const,district:"Ernakulam",locality:"Kochi",language:"ENGLISH" as const,age:26,bio:"Building things, breaking them, learning more.",interests:["Technology","Startups","Cars"]},
    {username:"LagoonMuse6134",gender:"FEMALE" as const,district:"Kozhikode",locality:"Vadakara",language:"MALAYALAM" as const,age:23,bio:"Finding music in quiet corners.",interests:["Music","Photography","Art"]},
    {username:"CoastalOrbit1827",gender:"PREFER_NOT_TO_SAY" as const,district:"Thrissur",locality:"Guruvayur",language:"BOTH" as const,age:29,bio:"Films, football, and late-night conversations.",interests:["Movies","Sports","Food"]},
    {username:"SilverMango3120",gender:"MALE" as const,district:"Kannur",locality:"Thalassery",language:"BOTH" as const,age:27,bio:"Coffee and the open road.",interests:["Cars","Travel","Nature"]}
  ];
  for(const [i,u] of users.entries()){
    const email=`demo${i+1}@example.invalid`;
    await db.user.upsert({
      where: { email }, update: {},
      create: {
        email, passwordHash: pass, username: u.username, avatarSeed: u.username,
        age: u.age, gender: u.gender, district: u.district, locality: u.locality, showLocality: true, language: u.language,
        bio: u.bio, termsVersion: TERMS_VERSION, termsAcceptedAt: new Date(),
        interests: { create: u.interests.map(name => ({ interest: { connect: { name } } })) }
      }
    });
  }
  console.log("Created local-only fictional demo accounts. Password: OnlyForLocalDemo123! (never production)");
}
seed().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.$disconnect());
