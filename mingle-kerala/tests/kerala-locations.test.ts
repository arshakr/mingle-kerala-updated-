import {describe,it,expect} from "vitest";
import {DISTRICTS} from "../lib/constants";
import {DISTRICT_MALAYALAM,KERALA_PLACES,placeLabel} from "../lib/kerala-locations";
import {localitySchema,registerSchema,profileSchema} from "../lib/validation";

describe("Mingle Kerala coverage and privacy",()=>{
  it("has all 14 districts and Malayalam names",()=>{
    expect(DISTRICTS).toHaveLength(14);
    expect(new Set(DISTRICTS).size).toBe(14);
    for (const district of DISTRICTS) {
      expect(DISTRICT_MALAYALAM[district]).toBeTruthy();
      expect(KERALA_PLACES[district]?.length).toBeGreaterThan(0);
      expect(placeLabel(district,"ml")).toBe(DISTRICT_MALAYALAM[district]);
      expect(placeLabel(district,"en")).toBe(district);
    }
  });
  it("accepts arbitrary Malayalam and English locality names, not just dropdown suggestions",()=>{
    expect(localitySchema.safeParse("മണ്ണഞ്ചേരി").success).toBe(true);
    expect(localitySchema.safeParse("My Village - Ward 2").success).toBe(true);
    expect(localitySchema.safeParse("A".repeat(81)).success).toBe(false);
    expect(localitySchema.safeParse("<script>alert(1)</script>").success).toBe(false);
  });
  it("accepts privacy opt-in but rejects nonboolean visibility",()=>{
    expect(profileSchema.safeParse({locality:"ഒരു ചെറിയ ഗ്രാമം",showLocality:false}).success).toBe(true);
    expect(profileSchema.safeParse({locality:"Kochi",showLocality:true}).success).toBe(true);
    expect(profileSchema.safeParse({showLocality:"true"}).success).toBe(false);
  });
  it("defaults missing locality to private empty place at registration",()=>{
    const registration = {paymentId:"payment123",proofSecret:"x".repeat(40),claimCode:"KC-EXAMPLE",email:"user@example.com",password:"StrongPassword123",username:"MonsoonNova4433",age:21,gender:"MALE",district:"Kannur",language:"BOTH",interests:["Books"],isAdult:true,acceptTerms:true,acceptPrivacy:true,acceptGuidelines:true};
    const parsed=registerSchema.parse(registration);
    expect(parsed.locality).toBe("");
  });
});
