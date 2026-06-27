import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata: Metadata = {
  title: "Terms & Conditions — Erduio",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms and Conditions" lastUpdated="June 27, 2026">
      <p>
        {`These Terms and Conditions ("Terms") constitute a legally binding agreement between you and Safique Samuel, an individual operating the Erduio school management platform ("Erduio", "the Platform", "we", "us", or "our"), governing your access to and use of the Platform, including any associated websites, applications, and services (collectively, the "Service").`}
      </p>
      <p>
        <strong>
          {`PLEASE READ THESE TERMS CAREFULLY. BY ACCESSING OR USING THE SERVICE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT ACCESS OR USE THE SERVICE.`}
        </strong>
      </p>

      <h2>1. Nature of the Service and Institutional Access</h2>
      <p>
        {`The Service is provided exclusively on a business-to-business, subscription basis to educational institutions, school groups, and other organizations ("Schools", "Institutions", or "you" where the context requires) that have entered into a separate, signed services or subscription agreement with us (each, a "Subscription Agreement").`}
      </p>
      <p>
        {`Erduio is not a self-service consumer product. Individuals — including administrators, teachers, students, and parents or guardians ("End Users") — may only access the Service through an account provisioned by a School that has an active Subscription Agreement with us. We do not create accounts directly for individuals who approach us outside of an institutional relationship.`}
      </p>
      <p>
        Any school, district, organization, or individual wishing to use the Service must first contact our
        management team to discuss eligibility, pricing, onboarding, and the terms of a Subscription Agreement,
        before any account will be created or access granted. Contact details are provided in Section 21 (Contact
        Us).
      </p>
      <p>
        {`These Terms apply to every person who accesses the Service, including End Users provisioned by a School. Where these Terms conflict with a signed Subscription Agreement between us and a School, the Subscription Agreement controls solely with respect to the Institution that signed it, and these Terms apply to all other matters and to all End Users.`}
      </p>
      <p>
        Schools are responsible for ensuring that their administrators, teachers, students, and parents are made
        aware of, and agree to comply with, these Terms as a condition of being provisioned an account.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        {`You must be at least the age of majority in your jurisdiction to enter into a Subscription Agreement on behalf of a School. Where End Users are minors (e.g., students), their account is provisioned and controlled by the School, and the School is solely responsible for obtaining any consents required from parents or legal guardians under applicable law prior to provisioning such accounts.`}
      </p>
      <p>
        Schools represent and warrant that they have all necessary rights, consents, and authority to submit End
        User data (including personal data of minors) to the Service.
      </p>

      <h2>3. Accounts and Security</h2>
      <p>
        {`Accounts are created and managed by a School's designated administrators. End Users are responsible for maintaining the confidentiality of their login credentials and for all activity occurring under their account.`}
      </p>
      <p>
        You must notify us promptly at the contact details in Section 21 if you become aware of any unauthorized
        access to or use of an account.
      </p>
      <p>
        We reserve the right to suspend or disable any account that we reasonably believe has been compromised, is
        being used in violation of these Terms, or poses a security risk to the Service or other users.
      </p>

      <h2>4. Subscriptions, Fees, and Payment</h2>
      <p>
        Access to the Service is provided on a subscription basis. Subscription terms, including pricing, billing
        cycle, payment method, and the number of permitted users, are set out in the applicable Subscription
        Agreement or order form agreed between us and the School.
      </p>
      <p>
        Unless otherwise agreed in writing, subscription fees are billed in advance on a recurring basis and
        automatically renew for successive periods equal to the initial subscription term, unless either party
        provides written notice of non-renewal at least thirty (30) days before the end of the then-current term.
      </p>
      <p>
        All fees are exclusive of applicable taxes, levies, or duties, which the School is responsible for paying in
        addition to the subscription fees, except for taxes on our net income.
      </p>
      <p>
        Except as expressly set out in a Subscription Agreement or required by applicable law, fees are
        non-refundable, including in the event of partial use, suspension, or termination of the Service.
      </p>
      <p>
        We may change our subscription fees from time to time. Any fee changes will take effect at the start of the
        next renewal term following notice to the School, and will not apply retroactively to a then-current paid
        term.
      </p>
      <p>
        {`If any amount owed is not paid when due, we may, after providing reasonable notice, suspend access to the Service for the relevant School and all of its End Users until outstanding amounts are paid in full. We may also charge interest on overdue amounts at the lesser of 1.5% per month or the maximum rate permitted by applicable law.`}
      </p>

      <h2>5. School and End User Responsibilities</h2>
      <p>Schools are solely responsible for:</p>
      <ul>
        <li>
          the accuracy, quality, and legality of all data entered into the Service, including academic records,
          attendance, discipline records, and personal information of students, parents, and staff;
        </li>
        <li>
          {`creating, managing, and deactivating End User accounts in a timely manner, including upon a student's withdrawal or a staff member's departure;`}
        </li>
        <li>
          ensuring that its use of the Service, and the use by its End Users, complies with all applicable laws,
          including data protection and education laws in the jurisdictions in which the School operates; and
        </li>
        <li>
          obtaining any consents from parents, guardians, students, or staff necessary to lawfully provide their
          personal data to the Service.
        </li>
      </ul>
      <p>End Users must use the Service only for its intended educational administration purposes and must not:</p>
      <ul>
        <li>attempt to gain unauthorized access to any part of the Service or to data of other Schools or End Users;</li>
        <li>interfere with or disrupt the integrity or performance of the Service;</li>
        <li>
          upload or transmit any material that is unlawful, defamatory, harassing, or that infringes the rights of
          any third party;
        </li>
        <li>
          reverse engineer, decompile, or attempt to derive the source code of the Service, except to the extent
          such restriction is prohibited by applicable law;
        </li>
        <li>use any automated means (bots, scrapers, etc.) to access the Service without our prior written consent; or</li>
        <li>resell, sublicense, or make the Service available to any third party other than as contemplated by these Terms.</li>
      </ul>

      <h2>6. Intellectual Property</h2>
      <p>
        {`The Service, including its software, design, the "Erduio" name and logo, and all related intellectual property, is owned by, or licensed to, us and is protected by copyright, trademark, and other intellectual property laws. Except for the limited right to access and use the Service granted under these Terms and the applicable Subscription Agreement, no rights are granted to you in the Service.`}
      </p>
      <p>
        {`Subject to your School's compliance with these Terms and payment of applicable fees, we grant the School and its End Users a limited, non-exclusive, non-transferable, revocable right to access and use the Service during the subscription term, solely for the School's internal educational administration purposes.`}
      </p>

      <h2>7. School Data and Content</h2>
      <p>
        {`As between us and a School, the School (and, where applicable, its End Users) retains all right, title, and interest in and to the data it submits to the Service, including student records, grades, attendance, communications, and files ("School Data").`}
      </p>
      <p>
        {`The School grants us a limited, non-exclusive, worldwide license to host, store, process, transmit, and display School Data solely as necessary to provide, maintain, support, and improve the Service, and as otherwise permitted under our Privacy Policy.`}
      </p>
      <p>
        We do not claim ownership of School Data and will not use School Data for any purpose other than providing
        the Service, except as required by law or as otherwise agreed in writing.
      </p>
      <p>
        We are not responsible for verifying the accuracy or completeness of any School Data entered by a School or
        its End Users, and we disclaim all liability arising from inaccurate, incomplete, or unlawfully obtained
        School Data.
      </p>

      <h2>8. Confidentiality</h2>
      <p>
        {`Each party may have access to confidential or proprietary information of the other party. Each party agrees to use the other's confidential information solely to perform its obligations under these Terms and the applicable Subscription Agreement, and not to disclose it to any third party except as required to provide the Service (including to subprocessors bound by confidentiality obligations) or as required by law.`}
      </p>

      <h2>9. Data Protection</h2>
      <p>
        Our collection, use, and processing of personal data in connection with the Service is described in our{" "}
        <a href="/privacy-policy">Privacy Policy</a>, which is incorporated into these Terms by reference.
      </p>
      <p>
        {`As between us and a School, the School is generally the data controller (or equivalent) with respect to personal data of its End Users, and we act as a data processor (or equivalent service provider) acting on the School's instructions, except where we process data for our own administrative or legal purposes as described in the Privacy Policy.`}
      </p>
      <p>
        Where required by applicable data protection law, the parties will enter into a data processing agreement
        governing the processing of personal data under these Terms.
      </p>

      <h2>10. Service Availability and Support</h2>
      <p>
        We will use commercially reasonable efforts to make the Service available, but we do not guarantee
        uninterrupted or error-free operation. The Service may be temporarily unavailable for scheduled maintenance,
        emergency maintenance, or due to causes beyond our reasonable control.
      </p>
      <p>
        We may modify, update, or discontinue features of the Service from time to time. We will use reasonable
        efforts to notify Schools in advance of material changes that adversely affect core functionality.
      </p>

      <h2>11. Term, Suspension, and Termination</h2>
      <p>These Terms remain in effect for as long as you access or use the Service.</p>
      <p>{`We may suspend or terminate a School's (and its End Users') access to the Service:`}</p>
      <ul>
        <li>for non-payment, in accordance with Section 4;</li>
        <li>
          immediately, if the School or any End User materially breaches these Terms, including the Acceptable Use
          provisions in Section 5;
        </li>
        <li>if required to comply with applicable law or a competent {"authority's"} order; or</li>
        <li>upon expiration or termination of the applicable Subscription Agreement.</li>
      </ul>
      <p>
        A School may terminate its Subscription Agreement in accordance with the termination provisions set out in
        that agreement.
      </p>
      <p>
        {`Upon termination, the School's right to access the Service ends. We will make School Data available for export for a period of thirty (30) days following termination, after which we may delete such data in accordance with our data retention practices described in the Privacy Policy, unless a longer retention period is required by law.`}
      </p>
      <p>
        Sections 6 (Intellectual Property), 7 (School Data and Content), 8 (Confidentiality), 12 (Disclaimers), 13
        (Limitation of Liability), 14 (Indemnification), and 17–20 (Governing Law through Entire Agreement) survive
        termination of these Terms.
      </p>

      <h2>12. Disclaimers</h2>
      <p>
        {`THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW.`}
      </p>
      <p>
        We do not warrant that the Service will meet your specific requirements, that it will be uninterrupted,
        timely, secure, or error-free, or that any academic records, grades, or other outputs generated through the
        Service will be accurate, as these depend on data entered by Schools and End Users.
      </p>

      <h2>13. Limitation of Liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL WE BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE,
        DATA, OR GOODWILL, ARISING OUT OF OR RELATED TO YOUR USE OF, OR INABILITY TO USE, THE SERVICE, REGARDLESS OF
        THE THEORY OF LIABILITY AND EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, OUR TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATED
        TO THESE TERMS OR THE SERVICE, WHETHER IN CONTRACT, TORT, OR OTHERWISE, WILL NOT EXCEED THE TOTAL
        SUBSCRIPTION FEES PAID BY THE RELEVANT SCHOOL TO US IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE
        EVENT GIVING RISE TO THE CLAIM.
      </p>
      <p>
        Nothing in these Terms limits or excludes liability that cannot be limited or excluded under applicable law,
        including liability for death or personal injury caused by negligence, or for fraud or fraudulent
        misrepresentation.
      </p>

      <h2>14. Indemnification</h2>
      <p>
        {`The School agrees to indemnify, defend, and hold harmless Safique Samuel and Erduio, and our respective successors and assigns, from and against any third-party claims, damages, liabilities, costs, and expenses (including reasonable legal fees) arising out of or related to:`}
      </p>
      <ul>
        <li>
          the School Data, including any claim that it infringes the rights of, or was unlawfully obtained from, a
          third party;
        </li>
        <li>
          {`the School's or its End Users' breach of these Terms or applicable law; or`}
        </li>
        <li>{`the School's failure to obtain any consents required to provide End User data to the Service.`}</li>
      </ul>

      <h2>15. Force Majeure</h2>
      <p>
        Neither party will be liable for any failure or delay in performance under these Terms resulting from causes
        beyond its reasonable control, including acts of God, natural disasters, pandemics, war, terrorism, civil
        unrest, governmental action, internet or telecommunications failures, or failures of third-party hosting or
        infrastructure providers.
      </p>

      <h2>16. Modifications to the Service and These Terms</h2>
      <p>
        {`We may update these Terms from time to time to reflect changes in the Service, legal or regulatory requirements, or our business practices. We will post the updated Terms on the Service and update the "Last updated" date above. Material changes will, where practicable, be communicated to Schools in advance.`}
      </p>
      <p>
        Continued use of the Service after the effective date of any updated Terms constitutes acceptance of those
        Terms. If a School does not agree to updated Terms, it should contact us to discuss termination of its
        Subscription Agreement.
      </p>

      <h2>17. Governing Law</h2>
      <p>
        These Terms, and any dispute arising out of or in connection with them or the Service, are governed by the
        laws of Barbados, without regard to its conflict of laws principles.
      </p>

      <h2>18. Dispute Resolution</h2>
      <p>
        The parties will first attempt in good faith to resolve any dispute arising out of or relating to these
        Terms through informal negotiation between authorized representatives within thirty (30) days of written
        notice of the dispute.
      </p>
      <p>
        If the dispute is not resolved through negotiation, it will be submitted to the exclusive jurisdiction of
        the courts of Barbados, and each party irrevocably submits to the jurisdiction of those courts.
      </p>

      <h2>19. Severability</h2>
      <p>
        If any provision of these Terms is held to be invalid or unenforceable, that provision will be limited or
        eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and
        effect.
      </p>

      <h2>20. Entire Agreement; Order of Precedence</h2>
      <p>
        {`These Terms, together with our `}<a href="/privacy-policy">Privacy Policy</a>{`, our `}
        <a href="/cookie-policy">Cookie Policy</a>
        {`, and any applicable Subscription Agreement, constitute the entire agreement between the parties regarding the Service and supersede all prior or contemporaneous agreements, understandings, or communications, whether written or oral.`}
      </p>
      <p>
        In the event of a conflict between a signed Subscription Agreement and these Terms, the Subscription
        Agreement will govern with respect to the School that signed it; these Terms govern in all other respects.
      </p>
      <p>
        {`Our failure to enforce any provision of these Terms is not a waiver of our right to do so later. We may assign these Terms in connection with a merger, acquisition, or sale of all or substantially all of our assets; you may not assign these Terms without our prior written consent.`}
      </p>

      <h2>21. Contact Us</h2>
      <p>
        For questions about these Terms, to discuss a Subscription Agreement, or for any legal inquiries, please
        contact:
      </p>
      <p>
        <strong>Safique Samuel</strong>
        <br />
        Email: <a href="mailto:contact@safiquesamuel.com">contact@safiquesamuel.com</a>
        <br />
        Website: <a href="https://safiquesamuel.com" target="_blank" rel="noopener noreferrer">safiquesamuel.com</a>
      </p>
    </LegalLayout>
  );
}
