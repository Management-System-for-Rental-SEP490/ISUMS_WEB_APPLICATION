import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { authActions } from "./features/auth/store/auth.store";
import { ToastContainer } from "react-toastify";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import enUS from "antd/locale/en_US";
import jaJP from "antd/locale/ja_JP";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import "dayjs/locale/en";
import "dayjs/locale/ja";
import { useLanguageStore } from "./store/languageStore";

const ANTD_LOCALES = { vi: viVN, en: enUS, ja: jaJP };

export default function App() {
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    authActions.init();
  }, []);

  useEffect(() => {
    dayjs.locale(language);
  }, [language]);

  return (
    <ConfigProvider
      locale={ANTD_LOCALES[language] ?? viVN}
      theme={{
        token: {
          fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif",
        },
      }}
    >
      <>
        <RouterProvider router={router} />
        <ToastContainer position="top-right" autoClose={3000} />
      </>
    </ConfigProvider>
  );
}
