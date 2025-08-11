import { Header } from "../Components/Header";
import { SidebarProvider } from "@/Components/ui/sidebar";
import { AppSidebar } from "@/Components/AppSidebar";
import { Outlet } from "react-router-dom";
import { useRole } from "@/context/RoleProvider";

export const Layout = () => {
  const { role } = useRole();

  return (
    <SidebarProvider>
      <div className="flex">
        {/* Sidebar */}
        <AppSidebar role={role} />
      </div>

      <div className="flex flex-col w-full">
        {/* Header */}
        <div>
          <Header role={role} />
        </div>

        {/* Page Content */}
        <div className="">
          <Outlet /> {/* Nested routes */}
        </div>
      </div>
    </SidebarProvider>
  );
};
