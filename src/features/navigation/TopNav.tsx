"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const links = [
  { href: "/", label: "Home" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export const TopNav = () => {
  const pathname = usePathname();
  return (
    <nav className="w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-main)] md:gap-4 md:px-4 md:py-2 md:text-sm md:font-medium md:normal-case md:tracking-normal">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded px-2 py-1 transition-colors",
                active
                  ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                  : "hover:text-[var(--color-primary)]",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
