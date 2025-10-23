import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoleProvider } from "./Context/RoleProvider.jsx";
import { AllRoutes } from "./Routes.jsx";
import Toaster from './Components/ui/toaster.jsx';
import './index.css'

createRoot(document.getElementById("root")).render(<Main />);

function Main() {
  const router = createBrowserRouter(AllRoutes);

  return (
  <StrictMode>
    <RoleProvider>
      <Toaster>
      <RouterProvider router={router} />
      </Toaster>
    </RoleProvider>
  </StrictMode>
)}

export default Main;
