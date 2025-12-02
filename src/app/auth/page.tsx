"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const redirect = searchParams.get("redirect") || "/";

  const submit = async () => {
    setError(null);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push(redirect);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data?.message ?? "Invalid password");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-4 py-10">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6">
        <Card>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-lg font-semibold text-[var(--color-text-main)]">Protected access</div>
              <div className="text-sm text-[var(--color-text-muted)]">Enter the password to continue.</div>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-[var(--color-border)] px-3 py-2 text-sm"
              placeholder="Password"
            />
            {error && <div className="text-sm text-[var(--color-error)]">{error}</div>}
            <Button className="w-full" onClick={submit}>
              Unlock
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
