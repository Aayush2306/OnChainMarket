import { Link } from "wouter";
import { SiTelegram, SiGitbook } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import logoUrl from "../../../assets/main-logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="footer-logo">
              <img src={logoUrl} alt="On-Chain Market" className="h-8 w-8 rounded-lg object-contain" />
              <span className="font-display text-lg font-bold">On-Chain Market</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <a
              href="https://onchainmarketsol.gitbook.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted hover-elevate transition-all"
              data-testid="link-gitbook"
              aria-label="GitBook Documentation"
            >
              <SiGitbook className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/onchainmarketsol"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted hover-elevate transition-all"
              data-testid="link-twitter"
              aria-label="X (Twitter)"
            >
              <FaXTwitter className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/onchainmarketsol"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted hover-elevate transition-all"
              data-testid="link-telegram"
              aria-label="Telegram"
            >
              <SiTelegram className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} On-Chain Market. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
