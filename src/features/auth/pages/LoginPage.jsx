import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bolt, Flame, ShieldCheck, Activity } from "lucide-react";
import bg from "../../../assets/background_login.avif";
import { useAuthStore, authActions } from "../store/auth.store";
import { LoadingSpinner } from "../../../components/shared/Loading";

export default function Login() {
  const navigate = useNavigate();
  const { isReady, isAuthenticated } = useAuthStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Quan trọng: luôn init ở trang login để:
  // - nếu vừa callback về /login?code=... -> keycloak-js consume code -> authenticate
  // - nếu không có session -> chỉ set isReady=true và đứng tại trang login
  useEffect(() => {
    authActions.init();
  }, []);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      // vào dashboard và thay URL (không giữ history của /login)
      navigate("/dashboard", { replace: true });
    }
  }, [isReady, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <section className="relative overflow-hidden bg-slate-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-900/75 to-teal-900/70" />
          <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] [background-size:32px_32px]" />

          <div className="absolute left-8 top-8 lg:left-12 lg:top-12">
            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/10 shadow-xl">
              <Bolt className="h-6 w-6 text-teal-300" strokeWidth={2} />
            </div>
          </div>

          <div className="absolute right-12 top-20 lg:right-16 lg:top-24">
            <div className="grid place-items-center h-12 w-12 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/10 shadow-xl">
              <Flame className="h-5 w-5 text-amber-300" strokeWidth={2} />
            </div>
          </div>

          <div className="relative z-10 flex min-h-[45vh] lg:min-h-screen items-end lg:items-center">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-20 pb-12 lg:pb-0">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-xl bg-teal-500/20 border border-teal-400/30 backdrop-blur-sm grid place-items-center shadow-lg">
                  <span className="text-teal-100 font-bold text-base">SR</span>
                </div>
                <div className="text-white font-semibold text-lg tracking-tight"></div>
              </div>

              <h1 className="text-white text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] font-bold leading-[1.15] tracking-tight max-w-xl">
                Quản lý tiện ích thông minh IoT
              </h1>

              <p className="mt-5 max-w-lg text-base lg:text-lg text-slate-200/90 leading-relaxed">
                Theo dõi và quản lý tiện ích thông minh cho nhà cho thuê và nhà nguyên căn
                tại TP. Hồ Chí Minh cùng hệ thống phân tích IoT theo thời gian thực.
              </p>

              <div className="mt-10 flex flex-wrap gap-6 lg:gap-8">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-[18px] w-[18px] text-teal-300" strokeWidth={2} />
                  <span className="text-sm lg:text-base text-slate-200/90 font-medium">
                    Bảo mật doanh nghiệp
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Activity className="h-[18px] w-[18px] text-teal-300" strokeWidth={2} />
                  <span className="text-sm lg:text-base text-slate-200/90 font-medium">
                    Giám sát thời gian thực
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 via-slate-50/70 to-transparent lg:hidden" />
        </section>

        <section className="flex items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-20 py-12 lg:py-16 bg-white">
          <div className="w-full max-w-[440px]">
            {!isReady ? (
              <div className="flex flex-col items-center justify-center py-16">
                <LoadingSpinner size="lg" showLabel label="Đang xác thực..." />
              </div>
            ) : (
              <>
                <div className="mb-10">
                  <h2 className="text-3xl lg:text-[2rem] font-bold text-slate-900 tracking-tight">
                    Chào mừng quay lại
                  </h2>
                  <p className="mt-2.5 text-base text-slate-600">
                    Đăng nhập để vào bảng điều khiển quản trị
                  </p>
                </div>

                <form className="space-y-5">
                  <button
                    type="button"
                    disabled={isLoggingIn}
                    onClick={async () => {
                      setIsLoggingIn(true);
                      await authActions.login();
                    }}
                    className="w-full rounded-xl bg-teal-600 px-4 py-3.5 font-semibold text-white text-[15px] shadow-lg shadow-teal-600/25 transition-all hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/30 focus:outline-none focus:ring-4 focus:ring-teal-200 active:scale-[0.98] mt-7 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Đang chuyển đến trang đăng nhập...
                      </>
                    ) : (
                      <>
                        Đăng nhập
                        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </button>

              <div className="pt-6 border-t border-slate-200 text-center">
                <p className="text-sm text-slate-600">
                  Cần hỗ trợ? Liên hệ{" "}
                  <a
                    className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                    href="mailto:support@smartrent.vn"
                  >
                    support@smartrent.vn
                  </a>
                </p>

                  {/* Debug nhỏ nếu bạn muốn nhìn trạng thái */}
                  {/* <pre className="mt-4 text-left text-xs text-slate-500">
                    {JSON.stringify({ isReady, isAuthenticated }, null, 2)}
                  </pre> */}
                </div>
              </form>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
