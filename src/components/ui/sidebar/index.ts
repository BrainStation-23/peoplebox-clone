import { SidebarProvider, useSidebar } from "./SidebarProvider"
import { SidebarBase } from "./SidebarBase"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "./SidebarMenu"
import { SidebarTrigger } from "./SidebarTrigger"

// Re-export components
export {
  SidebarProvider,
  useSidebar,
  SidebarBase as Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
}

// Re-export types
export type { SidebarProviderProps } from "./SidebarProvider"