import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginAdminAction } from "@/actions/adminAuth";
import { ADMIN_COOKIE_NAME, verifyAdminSessionJwt } from "@/lib/admin-session";

type AdminLoginPageProps = {
  searchParams?: {
    error?: string;
    next?: string;
  };
};

function getErrorMessage(error?: string) {
  if (error === "invalid") {
    return "Невірний пароль адміністратора.";
  }
  if (error === "config") {
    return "ADMIN_PASSWORD не налаштовано у змінних середовища.";
  }
  return null;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const envPassword = process.env.ADMIN_PASSWORD;
  if (envPassword) {
    const cookieStore = await cookies();
    const currentToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (currentToken && (await verifyAdminSessionJwt(currentToken))) {
      redirect("/admin");
    }
  }

  const nextPath = searchParams?.next?.startsWith("/admin") ? searchParams.next : "/admin";
  const errorMessage = getErrorMessage(searchParams?.error);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="ui-surface w-full p-6 sm:p-8">
        <p className="ui-page-eyebrow">Адмін</p>
        <h1 className="mt-2 font-display text-3xl font-normal text-white">Вхід у панель</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Для доступу до панелі керування введіть пароль адміністратора.
        </p>

        <form action={loginAdminAction} className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block space-y-1.5">
            <span className="ui-label">Пароль</span>
            <input
              type="password"
              name="password"
              required
              className="ui-input"
            />
          </label>

          {errorMessage ? <p className="text-sm font-medium text-rose-400">{errorMessage}</p> : null}

          <button
            type="submit"
            className="ui-btn-primary-block hover:scale-[1.01]"
          >
            Увійти
          </button>
        </form>
      </section>
    </div>
  );
}
