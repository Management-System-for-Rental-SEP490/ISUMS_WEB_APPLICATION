import { useTranslation } from "react-i18next";
import { LoadingSpinner } from "../../../components/shared/Loading";

function Avatar({ name }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #3bb582 0%, #2096d8 100%)" }}
    >
      {initials || "?"}
    </div>
  );
}

function EmptyState({ hasSearch }) {
  const { t } = useTranslation("common");
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "#EAF4F0", border: "1px solid #C4DED5" }}
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "#3bb582" }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <p className="font-semibold" style={{ color: "#1E2D28" }}>
        {hasSearch ? t("users.emptySearch") : t("users.emptyAll")}
      </p>
      <p className="text-sm" style={{ color: "#5A7A6E" }}>
        {hasSearch ? t("users.emptySearchHint") : t("users.emptyAllHint")}
      </p>
    </div>
  );
}

export default function UsersTable({ users, loading, searchTerm }) {
  const { t } = useTranslation("common");

  if (loading) {
    return (
      <div
        className="rounded-2xl px-8 py-16 flex flex-col items-center gap-4"
        style={{ background: "#FFFFFF", border: "1px solid #C4DED5" }}
      >
        <LoadingSpinner size="lg" showLabel label={t("users.loading")} />
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid #C4DED5", boxShadow: "0 4px 20px -2px rgba(59,181,130,0.08)" }}
    >
      {users.length === 0 ? (
        <EmptyState hasSearch={!!searchTerm} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #C4DED5", background: "#EAF4F0" }}>
                <th className="text-center px-4 py-3.5 text-xs font-semibold uppercase tracking-wide w-12" style={{ color: "#5A7A6E" }}>{t("users.colIndex")}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>{t("users.colUser")}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>{t("users.colEmail")}</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wide" style={{ color: "#5A7A6E" }}>{t("users.colPhone")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr
                  key={user.id}
                  className="transition"
                  style={{ borderBottom: "1px solid rgba(196,222,213,0.4)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F0FAF6"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td className="px-4 py-3.5 text-center text-xs font-medium" style={{ color: "#5A7A6E" }}>{idx + 1}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.displayName} />
                      <div>
                        <p className="font-semibold leading-tight" style={{ color: "#1E2D28" }}>{user.displayName}</p>
                        <p className="text-[11px] font-mono mt-0.5" style={{ color: "#5A7A6E" }}>{user.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <a
                      href={`mailto:${user.email}`}
                      className="transition"
                      style={{ color: "#2096d8" }}
                      onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                      onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}
                    >
                      {user.email}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    {!user.phone || user.phone === "Chưa có" ? (
                      <span className="text-xs italic" style={{ color: "#5A7A6E" }}>{t("users.noPhone")}</span>
                    ) : (
                      <span className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "#EAF4F0", color: "#1E4A38" }}>
                        {user.phone}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
