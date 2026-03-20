import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { logoutUserAction } from "@/actions/userAuth";
import type { SessionUser } from "@/lib/user-auth";

type UserNavProps = {
  user: SessionUser | null;
};

export function UserNav({ user }: UserNavProps) {
  if (!user) {
    return (
      <div className="hidden items-center gap-1 sm:flex sm:gap-2">
        <Link
          href="/login"
          className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-white"
        >
          Увійти
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-medium text-white transition-colors hover:border-brand-400/40 hover:bg-white/10"
        >
          Реєстрація
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex sm:gap-3">
      <Link
        href="/account"
        className="inline-flex max-w-[10rem] items-center gap-2 truncate rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-white"
        title={user.email}
      >
        <UserRound className="h-4 w-4 shrink-0 text-brand-400" strokeWidth={1.75} aria-hidden />
        <span className="truncate">{user.name}</span>
      </Link>
      <form action={logoutUserAction}>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-rose-300"
          aria-label="Вийти з акаунту"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          <span className="hidden lg:inline">Вийти</span>
        </button>
      </form>
    </div>
  );
}
