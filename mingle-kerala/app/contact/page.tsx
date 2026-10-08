import {Legal} from "@/components/Legal";
export const metadata={title:"Contact and support"};
export default function Page(){return <Legal eyebrow="SUPPORT / GET IN TOUCH" title="We are listening." intro="For account recovery, UPI payment checks, refunds, privacy concerns, underage reports or safety issues, contact the operator using the verified support details below." sections={[
  {title:"Support contact",paragraphs:[`Configured support address: ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "NOT CONFIGURED — operator must set NEXT_PUBLIC_SUPPORT_EMAIL before launch"}. Do not publicly launch until this inbox is monitored and a business/operator contact is published.`]},
  {title:"Payment support",paragraphs:["For payment verification problems include your activation request ID, transaction UTR, amount and date. Never share UPI PIN, OTP, online banking passwords or account passwords."]}
 ]}/>;}
