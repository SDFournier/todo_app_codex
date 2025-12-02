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
    <nav className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 text-sm font-medium text-[var(--color-text-main)]">
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
