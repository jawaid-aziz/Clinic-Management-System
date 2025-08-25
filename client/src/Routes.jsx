import { Login } from "./Pages/Login";
import { Home } from "./Pages/Home";
import { Layout } from "./Pages/Layout";
import { ProtectedRoute } from "./lib/ProtectedRoute";
import { AddAppointment } from "./components/AddAppointment";
import { PendingAppointments } from "./components/PendingAppointments";
import { HistoryAppointments } from "./components/HistoryAppointments";
import { Appointment } from "./components/Appointment";
import { Settings } from "./components/Settings";

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
            path: "/add-appointment",
            element: <AddAppointment />,
          },
          {
            path: "/pending-appointments",
            element: <PendingAppointments />,
          },
          {
            path: "/history-appointments",
            element: <HistoryAppointments />,
          },
          {
            path: "/appointment/:id",
            element: <Appointment />,
          },
          {
            path: "/settings",
            element: <Settings />,
          },
        ],
      },
    ],
  },
];
