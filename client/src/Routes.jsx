import { Login } from "./Pages/Login";
import { Home } from "./Pages/Home";
import { Layout } from "./Pages/Layout";
import { ProtectedRoute } from "./lib/ProtectedRoute";
import { AddPatient } from "./components/AddPatient";
import path from "path";

export const AllRoutes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,  // auth check
    children: [
      {
        path: "/",
        element: <Layout />,       // only renders if role exists
        children: [
          {
            path: "/",
            element: <Home />,
          },
          {
            path: "/add-patient",
            element: <AddPatient />,
          }
        ],
      },
    ],
  },
];
