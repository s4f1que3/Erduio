import Link from "next/link";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

export function Footer() {
  return (
    <footer className="px-4 sm:px-6 py-4 text-center text-xs text-muted-foreground space-y-1.5">
      <nav className="flex items-center justify-center gap-x-4 gap-y-1 flex-wrap">
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-foreground hover:underline">
            {link.label}
          </Link>
        ))}
      </nav>
      <p>
        Created by{" "}
        <Link
          href="https://safiquesamuel.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Safique Samuel
        </Link>
      </p>
    </footer>
  );
}
