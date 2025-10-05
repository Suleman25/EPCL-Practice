import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
} from '@/components/ui/sidebar'
import {
  BarChart3,
  Database,
  AlertTriangle,
  Map,
  MessageSquare,
  Brain,
  FileText,
  Settings,
  TrendingUp
} from 'lucide-react'

const mainNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: TrendingUp,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Workbook',
    url: '/workbook',
    icon: Database,
  },
  {
    title: 'Hazards & Incidents',
    url: '/hazards',
    icon: AlertTriangle,
  },
  {
    title: 'Maps',
    url: '/maps',
    icon: Map,
  },
  {
    title: 'Wordclouds',
    url: '/wordclouds',
    icon: MessageSquare,
  },
  {
    title: 'AI Agent',
    url: '/agent',
    icon: Brain,
  },
]

const settingsItems = [
  {
    title: 'Reports',
    url: '/reports',
    icon: FileText,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return currentPath === '/dashboard'
    }
    return currentPath.startsWith(path)
  }

  const getNavClasses = (path: string) => {
    const active = isActive(path)
    return active 
      ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
      : 'hover:bg-accent hover:text-accent-foreground'
  }

  return (
    <Sidebar className="border-r font-jura">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-jura font-semibold">Analytics Platform</SidebarGroupLabel>
          <SidebarGroupContent className="font-jura">
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="font-jura">
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== 'collapsed' && <span className="font-jura">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-jura font-semibold">Tools</SidebarGroupLabel>
          <SidebarGroupContent className="font-jura">
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="font-jura">
                    <NavLink
                      to={item.url}
                      className={getNavClasses(item.url)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== 'collapsed' && <span className="font-jura">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}