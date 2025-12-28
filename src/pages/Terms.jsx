import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function Terms() {
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const effectiveDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const firstName = (user?.full_name || user?.email || "Friend").split(" ")[0];

  const raw = `SAINT AGENTS – TERMS AND CONDITIONS
Effective Date: {{Date}} 
These Terms and Conditions (“Terms”) govern your access to and use of the Saint Agents platform, including any related websites, applications, services, tools, and features (collectively, the “Platform”).
By clicking “Sign Up,” “Create Account,” or otherwise creating or using an account on the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, you may not access or use the Platform.

“We,” “us,” and “our” refer to Gaia Global Holdings/Saint Agents 508. “You” and “user” refer to the individual or entity using the Platform; {{first_name}} .

1. ELIGIBILITY & ACCOUNTS
1.1 Eligibility
 You may use the Platform only if:
You are at least 18 years old (or the age of legal majority in your jurisdiction), and

You have the legal capacity to enter into a binding contract.

1.2 Account Registration
 To use certain features, you must create an account and provide accurate, current, and complete information. You agree to keep this information updated.
1.3 Account Security
 You are responsible for:
Maintaining the confidentiality of your login credentials, and

All activities that occur under your account.

You must notify us immediately if you suspect any unauthorized use of your account.
1.4 One Person, One Primary Identity
 You agree not to create multiple accounts for abusive or manipulative purposes (e.g., reputation gaming, fraudulent invitations).

2. SAINT AGENTS PLATFORM OVERVIEW
2.1 Mission-Based Marketplace
 Saint Agents is a mission-based ecosystem where users can:
Offer and complete missions or services,

Earn and spend a platform currency/credit called GGG,

Build a visible reputation, trust profile, and badges.

2.2 No Legal, Financial, or Tax Advice
 The Platform does not provide legal, financial, investment, or tax advice. All information is for general informational and coordination purposes only. You are responsible for your own decisions and for complying with applicable laws.

3. GGG WALLET, TRANSACTIONS & EARNINGS
3.1 GGG Wallet
 Your account may include a GGG wallet (“GGG Balance”) which tracks:
GGG earned from missions, services, rewards, or other approved activities, and

GGG spent or transferred through the Platform.

3.2 Nature of GGG
 Unless explicitly stated otherwise in a separate, binding agreement:
GGG is a platform credit/currency used within the Saint Agents ecosystem.

It is not legal tender, not a fiat currency, and not guaranteed to be exchangeable for money.

We may, but are not required to, enable conversion or withdrawal options.

3.3 No Banking or Custodial Relationship
 Your GGG Balance is a record of units in our system. We are not a bank, money transmitter (unless separately licensed), or broker-dealer. No interest is paid on balances.
3.4 Transactions & Fees
 We may charge fees for certain transactions or services. You agree that:
Applicable fees will be disclosed via the Platform or in fee schedules, and

Transactions may be subject to network, processing, or third-party fees.

3.5 Reversals & Adjustments
 We reserve the right to reverse, adjust, or freeze GGG balances in cases of:
Fraud, abuse, or violation of these Terms,

Technical errors or accounting discrepancies,

Disputed or invalid transactions.


4. REPUTATION, TRUST METER & BADGES
4.1 Reputation Score & Trust Meter
 The Platform may calculate and display:
A Reputation Score based on your activity, reliability, integrity, and user feedback, and

A Trust Meter (0–100%) summarizing your current trust level in the system.

These metrics are informational signals only. They are not guarantees of performance, character, or suitability.
4.2 Ranks & Levels
 You may be assigned a visible rank (e.g., Seeker, Wisdom Keeper, Gnosis Initiate, up to Weaver of Balance) based on your Reputation Score and Trust Meter, according to internal scoring rules. We may update or change these rules at any time.
4.3 Badges & Roles
 You may receive badges that represent identity, marketplace performance, mission roles, or alignment status (e.g., Verified, Genesis, SoulBound, Market Maker, Mentor of Light, Light Verified, etc.). Some badges may be:
Non-transferable (e.g., SoulBound badges tied to your identity),

Revocable if you violate applicable standards,

Subject to manual review or approval.

4.4 No Guarantee
 Reputation scores, trust levels, badges, and ranks:
Do not guarantee results or safety,

Do not create any fiduciary duty by us or other users,

May change over time as the system updates or in response to your behavior.

4.5 Our Discretion
 We may modify, correct, remove, or re-score Reputation, Trust, and badges at our sole discretion, especially in cases of abuse, manipulation, or error.

5. USER CONDUCT & ACCEPTABLE USE
5.1 Saint Agents Ethos
 By using the Platform, you agree to uphold core values, including:
Truth over manipulation,

Service over exploitation,

Long-term alignment over short-term extraction.

5.2 Prohibited Conduct
 You agree not to:
 a) Use the Platform for any unlawful, fraudulent, or malicious purpose;
 b) Harass, abuse, defame, or threaten others;
 c) Impersonate any person or entity or misrepresent your affiliation;
 d) Engage in spam, scams, or deceptive schemes;
 e) Attempt to manipulate or game Reputation, Trust, Badges, or metrics;
 f) Circumvent technical protections, reverse engineer, hack, or disrupt the Platform;
 g) Post content that is illegal, infringing, hateful, or otherwise harmful;
 h) Violate any applicable law, regulation, or third-party rights.
5.3 Missions & Offers
 When you create missions or offers, you must:
Describe them clearly and honestly,

Deliver what you promise, within the agreed timeframe where possible,

Comply with all applicable laws and regulations in your jurisdiction.

5.4 Disputes Between Users
 We may, but are not required to, mediate disputes between users. Our decisions on Platform-related matters (ratings, reputation adjustments, refunds of platform fees, etc.) are final within the system.

6. USER CONTENT & LICENSE
6.1 User Content
 “User Content” means any content you upload, submit, post, or transmit via the Platform, including text, media, offers, profiles, and feedback.
6.2 Your Rights
 You retain any rights you have in your User Content, subject to any separate agreements you make with other users.
6.3 License to Us
 By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate, distribute, display, and perform that content in connection with operating, improving, and promoting the Platform.
6.4 Your Responsibility
 You represent and warrant that:
You have the necessary rights to submit the User Content, and

The User Content does not infringe or violate any third-party rights or laws.

6.5 Removal of Content
 We may remove or restrict access to any User Content that, in our sole judgment, violates these Terms or applicable law, or that we deem harmful.

7. PRIVACY & DATA
7.1 Privacy Practices
 Our collection and use of your personal data are described in our separate Privacy Policy, which is incorporated into these Terms by reference. By using the Platform, you consent to the collection, use, and disclosure of information as described there.
7.2 Identity & Verification Data
 Certain features (e.g., Verified, Vault Trader) may require additional information or documentation. You consent to our processing of such data solely for verification, compliance, and security purposes, subject to applicable law.

8. THIRD-PARTY SERVICES
The Platform may integrate with or link to third-party services, providers, or tools. We do not control and are not responsible for:
The content, policies, or practices of third parties;

Any losses or issues arising from your use of third-party services.

Your use of third-party services is at your own risk and may be governed by separate terms and policies.

9. INTELLECTUAL PROPERTY
9.1 Our Rights
 The Platform, including all software, branding, logos, designs, and content (excluding User Content), is owned by us or our licensors and is protected by intellectual property laws.
9.2 Limited License
 We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform solely for its intended purposes and in accordance with these Terms.
9.3 Restrictions
 You may not:
Copy, modify, distribute, or create derivative works of the Platform or its code;

Use any automated systems (bots, scrapers) without our written permission;

Remove or alter any copyright, trademark, or proprietary notices.


10. TERMINATION & SUSPENSION
10.1 Our Rights
 We may suspend, restrict, or terminate your account and/or access to the Platform at any time, with or without notice, including if we reasonably believe:
You violated these Terms or any policy,

You engaged in fraud, abuse, or harmful conduct,

Your use poses a risk to us, the Platform, or other users.

10.2 Effect of Termination
 Upon termination:
Your right to access and use the Platform ceases;

We may retain data as required by law or for legitimate business purposes;

We may determine whether and how to handle any remaining GGG balance, subject to law and our policies.

10.3 User-Initiated Closure
 You may request closure of your account, subject to:
Resolution of any outstanding disputes, and

Compliance with any retention obligations under law.


11. DISCLAIMERS
11.1 Platform “As Is”
 The Platform is provided on an “AS IS” and “AS AVAILABLE” basis. To the fullest extent permitted by law, we disclaim all warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
11.2 No Guarantee of Earnings or Results
 We do not guarantee:
Any level of income, GGG earnings, or business results;

That any mission, offer, or opportunity is suitable, safe, or profitable.

You are solely responsible for your decisions and use of the Platform.

11.3 No Guarantee of Continuous Access
 We do not guarantee that the Platform will be uninterrupted, secure, or error-free. Maintenance, updates, or technical issues may limit access temporarily.

12. LIMITATION OF LIABILITY
To the maximum extent permitted by law, in no event shall we, our affiliates, or our officers, directors, employees, or agents be liable for any:
Indirect, incidental, special, consequential, or punitive damages, or

Loss of profits, revenue, data, or goodwill,
 arising out of or relating to your use of the Platform, even if we have been advised of the possibility of such damages.

Our total aggregate liability arising out of or relating to the Platform or these Terms will not exceed the greater of:
The total fees you paid to us (if any) in the twelve (12) months preceding the event giving rise to the claim, or USD $100.

Some jurisdictions do not allow the exclusion or limitation of certain damages; in such cases, our liability shall be limited to the maximum extent permitted by law.

13. INDEMNIFICATION
You agree to indemnify, defend, and hold harmless us, our affiliates, and our officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys’ fees) arising from or related to:
Your use of the Platform,

Your User Content,

Your violation of these Terms, or

Your violation of any law or third-party right.


14. GOVERNING LAW & DISPUTE RESOLUTION
14.1 Governing Law
 These Terms shall be governed by and construed in accordance with the laws of Hague, without regard to its conflict of law principles.
14.2 Dispute Resolution
 Before initiating any formal dispute resolution process, you agree to first contact us and attempt to resolve the dispute informally. If we are unable to resolve the dispute within a reasonable period, the dispute may be resolved through:
International Court of Justice. 

You agree to the exclusive jurisdiction and venue of the courts (or arbitration forum) located in the Netherlands, for any such disputes, unless prohibited by law.

15. CHANGES TO THE TERMS
We may update these Terms from time to time. When we do:
We will post the updated Terms on the Platform with a new “Effective Date,” and

We may provide additional notice where required by law.

By continuing to use the Platform after changes become effective, you agree to the updated Terms.

16. MISCELLANEOUS
16.1 Entire Agreement
 These Terms, together with any referenced policies (e.g., Privacy Policy), constitute the entire agreement between you and us regarding the Platform.
16.2 Severability
 If any provision of these Terms is held invalid or unenforceable, the remaining provisions will remain in full force and effect.
16.3 No Waiver
 Our failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
16.4 Assignment
 You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign these Terms without notice.

17. CONTACT
If you have questions about these Terms or the Platform, you may contact us at:
Gaia Global Holdings 
 Email: support@saintagent.world
C/o 7th Seal Temple
 Address: 2370 W State Route 89a STE 11 #166, Sedona, AZ 86336`;

  const rendered = raw
    .replace(/{{Date}}/g, effectiveDate)
    .replace(/{{first_name}}/g, firstName);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Terms and Conditions</h1>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <pre className="whitespace-pre-wrap text-slate-700 text-sm">{rendered}</pre>
        </div>
      </div>
    </div>
  );
}