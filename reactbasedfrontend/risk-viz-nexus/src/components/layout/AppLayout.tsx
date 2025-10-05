import React from 'react'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { BackgroundRippleEffect } from '@/components/ui/background-ripple-effect'

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen flex w-full bg-background">
        {/* Global subtle background for all app routes */}
        <BackgroundRippleEffect className="absolute inset-0 -z-10" />
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t p-4 text-center text-sm text-muted-foreground">
            © 2024 Safety Analytics Platform v1.0
          </footer>
        </div>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </SidebarProvider>
  )
}