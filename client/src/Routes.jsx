import { Login } from "./Pages/Login";
import { Home } from "./Pages/Home";
import { Layout } from "./Pages/Layout";
import { ProtectedRoute } from "./lib/ProtectedRoute";
import { AddAppointment } from "./Components/AddAppointment";
import { PendingAppointments } from "./Components/PendingAppointments";
import { HistoryAppointments } from "./Components/HistoryAppointments";
import { Appointment } from "./Components/Appointment";
import { Settings } from "./Components/Settings";
import { ShowLab } from "./Components/ShowLab";

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
            path: "/show-lab/:id",
            element: <ShowLab />,
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
