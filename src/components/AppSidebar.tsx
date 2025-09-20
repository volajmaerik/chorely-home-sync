import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  List, 
  CheckSquare, 
  Star, 
  Trophy, 
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useHousehold } from "@/hooks/useHousehold";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "All Chores", url: "/chores", icon: List },
  { title: "My Chores", url: "/my-chores", icon: CheckSquare },
  { title: "Evaluations", url: "/evaluations", icon: Star },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
];

const settingsItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { household, isAdmin } = useHousehold();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center w-full transition-all duration-200 ${
      isActive 
        ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground font-medium shadow-lg" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }`;

  // Don't show sidebar if no household (during setup)
  if (!household) {
    return null;
  }

  return (
    <Sidebar className={`${isCollapsed ? "w-14" : "w-60"} sidebar-transition`}>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className={getNavCls}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                          {!isCollapsed && <span>{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/admin"
                      className={getNavCls}
                    >
                      {({ isActive }) => (
                        <>
                          <Settings className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                          {!isCollapsed && <span>Admin Panel</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={`h-4 w-4 ${isCollapsed ? "" : "mr-3"}`} />
                          {!isCollapsed && <span>{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Household Info */}
        {!isCollapsed && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Household</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2 text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium truncate">{household.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.email}
                  {isAdmin && (
                    <span className="ml-1 text-primary font-medium">(Admin)</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Invite Code: {household.invite_code}
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}