import * as React from "react"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useSidebar } from "./SidebarProvider"
import { cn } from "@/lib/utils"

export interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  SidebarTriggerProps
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn("hover:bg-transparent", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <Menu className="h-6 w-6" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"