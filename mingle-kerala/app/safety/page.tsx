import {Legal} from "@/components/Legal";
export const metadata={title:"Safety center"};
export default function Page(){return <Legal eyebrow="YOUR BOUNDARIES / YOUR CHOICE" title="Safety center" intro="Privacy-first design is a product goal, but no online stranger is risk-free. Protect your boundaries." sections={[
  {title:"Anonymous, not invisible",paragraphs:["Other members see your alias, district, age and optional interests. Your town/village is only visible if you explicitly enable locality sharing. Your private account email is not shown publicly. The operator receives UPI transaction information for one-time activation, so payment is not anonymous to the receiver."]},
  {title:"Messaging consent",paragraphs:["All first conversations require an accepted chat request. You can set requests to everyone, your district, members with shared interests, or nobody."]},
  {title:"Block and report",paragraphs:["Use Block to prevent further interactions and remove that person from your discovery. Use Report when you encounter abuse, scams or underage suspicions; a moderator can review the report."]},
  {title:"Safe chatting",paragraphs:["Do not share addresses, banking credentials, OTPs, passwords or intimate images. Be cautious with external links. If you choose to meet someone offline, prioritize public locations and trusted friends. Messages are not end-to-end encrypted."]}
 ]}/>;}
