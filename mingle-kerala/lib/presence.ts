import { Redis } from "@upstash/redis";
let redis: Redis | null = null;
function client(){
 if(redis) return redis;
 const url=process.env.UPSTASH_REDIS_REST_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if(!url||!token) return null;
 redis = new Redis({url,token});
 return redis;
}
export async function presenceOnline(userId:string){await client()?.set(`kc:presence:${userId}`,"1",{ex:100});}
export async function presenceOffline(userId:string){await client()?.del(`kc:presence:${userId}`);}
export async function onlineIds(ids:string[]):Promise<Set<string>>{
 if(!ids.length||!client()) return new Set();
 const keys=ids.map(id=>`kc:presence:${id}`);
 const vals=await client()!.mget<(string|null)[]>(...keys);
 return new Set(ids.filter((_,i)=>vals[i]!=null));
}
