import Link from "next/link";
import Image from "next/image";
import { Footer } from "./footer";

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/login">
          <Image src="/erduio-wordmark.png" alt="Erduio" width={299} height={137} className="h-7 w-auto" />
        </Link>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
          Back to sign in
        </Link>
      </header>
      <main className="flex-1 px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto legal-content">
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
