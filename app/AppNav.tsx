"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppNav() {
  const pathname = usePathname();

  if (pathname === "/multi-turn") {
    return null;
  }

  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/chat">Chat</Link>
      <Link href="/multi-turn">Multi-Turn</Link>
      <Link href="/image-analysis">Image Analysis</Link>
    </nav>
  );
}
