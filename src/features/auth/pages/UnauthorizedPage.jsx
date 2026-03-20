import { useNavigate } from "react-router-dom";
import { authActions, useAuthStore } from "../store/auth.store";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const profile = useAuthStore((s) => s.profile);

  const handleLogout = async () => {
    await authActions.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
        </div>

        {/* Code */}
        <p className="text-7xl font-bold text-slate-200 mb-2 select-none">
          403
        </p>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Không có quyền truy cập
        </h1>

        {/* Message */}
        <p className="text-slate-500 text-sm leading-relaxed mb-2">
          Tài khoản{" "}
          {profile?.name ? (
            <span className="font-medium text-slate-700">{profile.name}</span>
          ) : (
            "của bạn"
          )}{" "}
          không có quyền truy cập vào hệ thống này.
        </p>
        <p className="text-slate-400 text-xs mb-8">
          Chỉ tài khoản có vai trò{" "}
          <span className="font-semibold text-slate-500">Chủ nhà</span>,{" "}
          <span className="font-semibold text-slate-500">Quản lý</span> hoặc{" "}
          <span className="font-semibold text-slate-500">Quản trị viên</span>{" "}
          mới được phép đăng nhập.
        </p>

        {/* Divider */}
        <div className="h-px bg-slate-200 mb-8" />

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Đăng xuất và dùng tài khoản khác
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg border border-slate-200 transition-colors"
          >
            Quay lại
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-slate-400">
          Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ quản trị viên hệ
          thống.
        </p>
      </div>
    </div>
  );
}
