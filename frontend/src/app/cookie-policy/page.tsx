import type { Metadata } from "next";
import { LegalLayout } from "@/components/layout/legal-layout";

export const metadata: Metadata = {
  title: "Cookie Policy — Erduio",
};

export default function CookiePolicyPage() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="June 27, 2026">
      <p>
        {`This Cookie Policy explains how Safique Samuel, operating the Erduio school management platform ("Erduio", "we", "us", or "our"), uses cookies and similar technologies on the Service, and forms part of our `}
        <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h2>1. What Are Cookies and Similar Technologies</h2>
      <p>
        {`Cookies are small text files placed on your device by a website. "Similar technologies" include browser storage mechanisms such as local storage and session storage, which websites and applications use to store information on your device in a similar way to cookies. For simplicity, we refer to all of these as "cookies" in this Policy.`}
      </p>

      <h2>2. How We Use Cookies</h2>
      <p>
        We use cookies only to operate and secure the Service. We do not use cookies for third-party advertising,
        and we do not permit third parties to use cookies on the Service to track you for advertising purposes.
        Specifically, we use cookies to:
      </p>
      <ul>
        <li>
          Keep you signed in during a browsing session and authenticate your access to the Service (strictly
          necessary).
        </li>
        <li>Remember your display preferences, such as light or dark theme (functional).</li>
        <li>
          Remember which announcements, grades, report cards, and similar items you have already viewed, so we can
          show you what is new (functional).
        </li>
      </ul>

      <h2>3. Categories of Cookies We Use</h2>
      <ul>
        <li>
          <strong>Strictly Necessary:</strong> Required for the Service to function, such as maintaining your
          authenticated session. The Service cannot operate without these, and they cannot be switched off through
          our systems (you may clear them via your browser settings, but doing so will sign you out).
        </li>
        <li>
          <strong>Functional:</strong> Remember choices you make, such as theme preference and previously viewed
          content, to improve your experience. Disabling these through your browser may cause certain preferences to
          reset.
        </li>
      </ul>
      <p>We do not use analytics, advertising, or third-party tracking cookies.</p>

      <h2>4. How Long Cookies Last</h2>
      <p>
        Our authentication cookies/session storage last for the duration of your browser session and are cleared
        when you close your browser or sign out. Functional preferences stored in local storage persist on your
        device until you clear your browser data or until they are overwritten.
      </p>

      <h2>5. Managing Cookies</h2>
      <p>
        Most browsers allow you to control cookies and similar technologies through their settings, including
        blocking or deleting them. Because we rely on strictly necessary cookies to keep you signed in, blocking or
        deleting them will prevent you from using the Service. Instructions for managing cookies are typically
        available in your {"browser's"} help documentation.
      </p>

      <h2>6. Changes to this Policy</h2>
      <p>
        {`We may update this Cookie Policy from time to time to reflect changes in the technologies we use. We will post the updated Policy on the Service and update the "Last updated" date above.`}
      </p>

      <h2>7. Contact Us</h2>
      <p>If you have questions about this Cookie Policy, please contact:</p>
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
