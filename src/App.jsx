import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { authActions } from "./features/auth/store/auth.store";

export default function App() {
  useEffect(() => {
    authActions.init();
  }, []);
  return <RouterProvider router={router} />;
}
