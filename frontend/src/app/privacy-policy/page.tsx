import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — Erduio",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="June 27, 2026">
      <p>
        {`This Privacy Policy explains how Safique Samuel, operating the Erduio school management platform ("Erduio", "we", "us", or "our"), collects, uses, discloses, and protects personal information in connection with the Erduio service (the "Service"). This Policy should be read together with our `}
        <a href="/terms">Terms and Conditions</a>
        {` and our `}
        <a href="/cookie-policy">Cookie Policy</a>.
      </p>
      <p>
        {`Erduio is provided exclusively to educational institutions ("Schools") under a signed subscription agreement. In most cases, the School determines what personal information is submitted to the Service and for what purpose, and the School acts as the data controller (or equivalent) of that information, while we act as a data processor (or equivalent service provider) acting on the School's instructions. Where we determine the purpose and means of processing — for example, account or billing information for the School itself, or technical and usage data necessary to operate and secure the Service — we act as a data controller for that limited purpose.`}
      </p>

      <h2>1. Information We Collect</h2>
      <p>We may collect the following categories of information:</p>
      <ul>
        <li>
          <strong>Account and Profile Information:</strong> name, email address, role (administrator, teacher,
          student, parent/guardian), phone number, and password (stored in hashed form), as provisioned by a School.
        </li>
        <li>
          <strong>Academic and Administrative Records:</strong> information that Schools and their staff enter into
          the Service to administer their institution, including class and subject enrollment, attendance records,
          assignments and grades, exam results, report cards, discipline records, and file attachments uploaded to
          the Service.
        </li>
        <li>
          <strong>Communications:</strong> announcements, messages, and notifications sent or received through the
          Service.
        </li>
        <li>
          <strong>Technical and Usage Data:</strong> IP address, browser and device type, log files, timestamps, and
          information about how the Service is accessed and used, collected automatically as you interact with the
          Service.
        </li>
        <li>
          <strong>Cookies and Similar Technologies:</strong> as described in our <a href="/cookie-policy">Cookie Policy</a>.
        </li>
      </ul>

      <h2>2. Sources of Information</h2>
      <p>We collect information:</p>
      <ul>
        <li>
          directly from Schools and their authorized administrators, who provision End User accounts and enter
          academic and administrative records;
        </li>
        <li>from End Users themselves (for example, when logging in or updating their profile); and</li>
        <li>automatically through the operation of the Service (for example, technical and usage data).</li>
      </ul>

      <h2>3. How We Use Information</h2>
      <p>We use personal information to:</p>
      <ul>
        <li>
          provide, operate, and maintain the Service, including authenticating users and displaying the appropriate
          portal and data for each role;
        </li>
        <li>process subscription billing and manage our relationship with Schools;</li>
        <li>
          communicate with Schools and End Users about the Service, including service announcements, security
          notices, and support;
        </li>
        <li>
          maintain the security and integrity of the Service, including detecting and preventing fraud, abuse, and
          unauthorized access;
        </li>
        <li>analyze and improve the performance, usability, and reliability of the Service; and</li>
        <li>comply with applicable legal obligations and enforce our Terms and Conditions.</li>
      </ul>
      <p>We do not use personal information for third-party advertising, and we do not sell personal information.</p>

      <h2>4. Legal Basis for Processing</h2>
      <p>
        Where applicable data protection law (including the Barbados Data Protection Act, 2019, and comparable laws
        in other jurisdictions where Schools operate) requires a legal basis for processing, we (or the School, as
        the controller) rely on one or more of the following: performance of the Subscription Agreement or these
        Terms; the {"School's"} legitimate interests in administering its educational operations; compliance with a
        legal obligation; and, where required (for example, for certain processing relating to minors), consent
        obtained by the School from a parent or legal guardian.
      </p>

      <h2>5. {"Children's"} Information</h2>
      <p>
        Because End Users may include students who are minors, we collect personal information about students
        solely at the direction of, and under the authority of, the School that provisions the relevant account.
        Schools are responsible for ensuring that they have a lawful basis, and have obtained any consents required
        from parents or legal guardians, before submitting a {"minor's"} personal information to the Service.
        Parents and guardians who have questions about their {"child's"} information should contact their School in
        the first instance, as the School controls the data; we will assist the School in responding to such
        requests as described in Section 8.
      </p>

      <h2>6. How We Share Information</h2>
      <p>We do not sell personal information. We may share personal information:</p>
      <ul>
        <li>
          with the School to which an End User belongs, and with that {"School's"} authorized administrators, as
          necessary for the School to administer its use of the Service;
        </li>
        <li>
          with service providers and subprocessors who perform services on our behalf (such as cloud hosting and
          email delivery providers), under contractual obligations of confidentiality and security;
        </li>
        <li>
          where required to comply with applicable law, regulation, legal process, or governmental request;
        </li>
        <li>
          to protect the rights, property, or safety of Erduio, our Schools, End Users, or the public; and
        </li>
        <li>
          in connection with a merger, acquisition, financing, or sale of assets, subject to confidentiality
          obligations and consistent with this Policy.
        </li>
      </ul>

      <h2>7. Data Retention</h2>
      <p>
        {`We retain personal information for as long as a School's Subscription Agreement remains active, and for a reasonable period thereafter (ordinarily up to thirty (30) days following termination, as described in our `}
        <a href="/terms">Terms and Conditions</a>
        {`) to allow for data export, after which we will delete or anonymize the information unless a longer retention period is required by applicable law, necessary to resolve disputes, or required to enforce our agreements.`}
      </p>

      <h2>8. Your Rights</h2>
      <p>
        Subject to applicable data protection law, you may have rights to access, correct, update, restrict, object
        to, or request deletion of your personal information, or to receive a copy of it in a portable format.
        Because Schools generally control End User data, End Users (or their parents/guardians, where applicable)
        should direct such requests to their School in the first instance. Where we are not able to action a request
        directly because the School is the controller, we will refer the request to the relevant School and provide
        reasonable assistance to the School in responding. Where we act as a controller (for example, regarding a
        {" School's"} own account or billing information), you may contact us directly using the details in Section 14.
      </p>

      <h2>9. Data Security</h2>
      <p>
        We implement administrative, technical, and physical safeguards designed to protect personal information
        against unauthorized access, alteration, disclosure, or destruction, including encrypted transmission,
        access controls, and password hashing. No method of transmission or storage is completely secure, and we
        cannot guarantee absolute security.
      </p>

      <h2>10. International Data Transfers</h2>
      <p>
        Personal information may be processed and stored in countries other than the country in which a School or
        End User is located, including by our hosting and infrastructure providers. Where required by applicable
        law, we will take appropriate measures to ensure that such transfers provide an adequate level of protection
        for personal information.
      </p>

      <h2>11. Cookies and Similar Technologies</h2>
      <p>
        We use cookies and similar technologies (such as browser local storage and session storage) to operate the
        Service, including to keep you signed in, remember your display preferences, and track which content you
        have already viewed. Further detail is provided in our <a href="/cookie-policy">Cookie Policy</a>.
      </p>

      <h2>12. Third-Party Links</h2>
      <p>
        The Service may contain links to third-party websites. We are not responsible for the privacy practices or
        content of any third-party websites, and we encourage you to review the privacy policy of any third-party
        site you visit.
      </p>

      <h2>13. Changes to this Policy</h2>
      <p>
        {`We may update this Privacy Policy from time to time to reflect changes in our practices or for legal or regulatory reasons. We will post the updated Policy on the Service and update the "Last updated" date above. Material changes will, where practicable, be communicated to Schools in advance.`}
      </p>

      <h2>14. Contact Us</h2>
      <p>If you have questions about this Privacy Policy or our data practices, please contact:</p>
      <p>
        <strong>Safique Samuel</strong>
        <br />
        Email: <a href="mailto:contact@safiquesamuel.com">contact@safiquesamuel.com</a>
        <br />
        Website: <a href="https://safiquesamuel.com" target="_blank" rel="noopener noreferrer">safiquesamuel.com</a>
      </p>
      <p>
        {`If you are an End User with a question about your personal information, please contact your School's administrator in the first instance, as your School controls your account and data.`}
      </p>
    </LegalLayout>
  );
}
