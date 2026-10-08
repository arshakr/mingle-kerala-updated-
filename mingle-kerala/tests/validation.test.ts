import { describe,it,expect } from "vitest";
import { paymentSchema,registerSchema,profileSchema } from "../lib/validation";
const base = { email:"a@example.com",utr:"123456789012",isAdult:true,acceptTerms:true,acceptPrivacy:true,acceptGuidelines:true };
describe("Activation validation",()=>{
 it("requires adult affirmation and all policy acknowledgements",()=>{
  expect(paymentSchema.safeParse(base).success).toBe(true);
  expect(paymentSchema.safeParse({...base,isAdult:false}).success).toBe(false);
  expect(paymentSchema.safeParse({...base,acceptTerms:false}).success).toBe(false);
  expect(paymentSchema.safeParse({...base,acceptPrivacy:false}).success).toBe(false);
  expect(paymentSchema.safeParse({...base,acceptGuidelines:false}).success).toBe(false);
 });
 it("rejects invalid UPI reference",()=>expect(paymentSchema.safeParse({...base,utr:"123"}).success).toBe(false));
 it("rejects underage registration",()=>{
  const payload={...base,paymentId:"payment123",proofSecret:"x".repeat(40),claimCode:"KC-EXAMPLE",password:"StrongPassword123",username:"MonsoonNova4433",age:17,gender:"MALE",district:"Alappuzha",language:"BOTH",interests:["Books"]};
  expect(registerSchema.safeParse(payload).success).toBe(false);
  expect(registerSchema.safeParse({...payload,age:18}).success).toBe(true);
 });
 it("restricts profile discovery request policy",()=>{
  expect(profileSchema.safeParse({allowRequests:"EVERYONE"}).success).toBe(true);
  expect(profileSchema.safeParse({allowRequests:"BYPASS"}).success).toBe(false);
 });
});
