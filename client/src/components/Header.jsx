import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, UserCircle } from "lucide-react";

export const Header = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    console.log("Role removed from localStorage.");
    window.location.reload();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between px-4 py-2 ">
      {/* Left Side: Sidebar Trigger */}
      <div>
        <SidebarTrigger>
          <Button variant="ghost" size="icon" className="sm:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SidebarTrigger>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-gray-800 tracking-wide">
          {role === "reception" && "Reception"}
          {role === "paeds" && "Paediatrics"}
          {role === "gynae" && "Gynaecology"}
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <UserCircle className="h-8 w-8 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
