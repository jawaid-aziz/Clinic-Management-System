import { Login } from "./Pages/Login"
import { Home } from "./Pages/Home"
import { Layout } from "./Pages/Layout"

export const AllRoutes =
[
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <Home />
            }
        ]
    }
]