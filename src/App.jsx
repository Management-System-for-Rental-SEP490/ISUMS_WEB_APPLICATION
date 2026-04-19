import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { authActions } from "./features/auth/store/auth.store";
import { ToastContainer } from "react-toastify";
import { ConfigProvider } from "antd";
import viVN from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

export default function App() {
  useEffect(() => {
    authActions.init();
  }, []);

  return (
    <ConfigProvider
      locale={viVN}
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
