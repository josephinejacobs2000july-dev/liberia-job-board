"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const path = usePathname();
  const employer = path.startsWith("/employer");
  return (
    <nav className="nav" aria-label="Main">
      <Link href="/" aria-current={!employer ? "page" : undefined}>
        Find a job
      </Link>
      <Link href="/employer" aria-current={employer ? "page" : undefined}>
        For employers
      </Link>
    </nav>
  );
}
