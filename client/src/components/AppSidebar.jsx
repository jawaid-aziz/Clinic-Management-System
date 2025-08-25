import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Home,
  LogOut,
  ChevronDown,
  ChevronUp,
  CalendarCheck, // Appointments
  FileText, // Templates
  Settings, // Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";

export function AppSidebar({ role }) {
  const navigate = useNavigate();

  const [openMenus, setOpenMenus] = useState({});

  const menuItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Appointments",
      icon: CalendarCheck,
      children: [
        { title: "Add", url: `/add-appointment` },
        { title: "Pending", url: `/pending-appointments` },
        { title: "History", url: `/history-appointments` },
      ],
    },
    ...(role === "paeds" || role === "gynae"
      ? [
          {
            title: "Templates",
            icon: FileText,
            children: [{ title: "View Templates", url: "/templates" }],
          },
        ]
      : []),
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("role");
    console.log("Role removed from localStorage.");
    window.location.reload();
    navigate("/login");
  };

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-cornflower-blue-300">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm text-l">
            Family Care Hospital
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, idx) => (
                <SidebarMenuItem key={`${item.title}-${idx}`}>
                  <div
                    className={`flex items-center justify-between p-1 gap-2 rounded-md ${
                      item.children ? "" : "hover:bg-gray-100"
                    }`}
                  >
                    {item.url && !item.children ? (
                      <Link
                        to={item.url}
                        className="flex items-center gap-2 w-full py-1"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-left">{item.title}</span>{" "}
                      </Link>
                    ) : (
                      <div
                        onClick={() =>
                          item.children ? toggleMenu(item.title) : null
                        }
                        className="flex items-center justify-between gap-2 w-full cursor-pointer py-1"
                      >
                        <div className="flex items-center gap-1">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </div>
                        {item.children && (
                          <span>
                            {openMenus[item.title] ? (
                              <ChevronUp />
                            ) : (
                              <ChevronDown />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {item.children && openMenus[item.title] && (
                    <SidebarMenu className="ml-1">
                      {item.children.map((child) => (
                        <SidebarMenuItem key={child.title}>
                          <SidebarMenuButton asChild>
                            <Link to={child.url}>
                              <span className="pl-4">{child.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="text-red-500 hover:text-red-600 cursor-pointer"
                >
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full"
                  >
                    <LogOut />
                    <span>Log Out</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
