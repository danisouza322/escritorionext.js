"use client"

import { cn } from "@/lib/utils"
import {
  BarChart3,
  Calendar,
  FileText,
  FolderKanban,
  Home,
  LucideIcon,
  Users,
  Users2,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import Logo from "@/components/logo"
import { Session } from "@/types"

interface SidebarItemProps {
  icon: LucideIcon
  title: string
  href: string
  isActive?: boolean
}

function SidebarItem({ icon: Icon, title, href, isActive }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
        isActive
          ? "bg-primary/10 text-primary font-medium"
          : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
    </Link>
  )
}

interface SidebarProps {
  className?: string
  user?: Session["user"]
}

export default function Sidebar({ className, user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r bg-background lg:flex",
        className
      )}
    >
      <div className="p-6">
        <Logo />
      </div>
      <div className="flex-1 overflow-auto py-2 px-4">
        <nav className="flex flex-col gap-1">
          <SidebarItem
            href="/dashboard"
            icon={Home}
            title="Dashboard"
            isActive={pathname === "/dashboard"}
          />
          <SidebarItem
            href="/dashboard/clientes"
            icon={Users}
            title="Clientes"
            isActive={pathname.startsWith("/dashboard/clientes")}
          />
          <SidebarItem
            href="/dashboard/documentos"
            icon={FileText}
            title="Documentos"
            isActive={pathname.startsWith("/dashboard/documentos")}
          />
          <SidebarItem
            href="/dashboard/tarefas"
            icon={FolderKanban}
            title="Tarefas"
            isActive={pathname.startsWith("/dashboard/tarefas")}
          />
          <SidebarItem
            href="/dashboard/calendario"
            icon={Calendar}
            title="Calendário"
            isActive={pathname.startsWith("/dashboard/calendario")}
          />
          {user?.tipo === "admin" && (
            <SidebarItem
              href="/dashboard/colaboradores"
              icon={Users2}
              title="Colaboradores"
              isActive={pathname.startsWith("/dashboard/colaboradores")}
            />
          )}
          {user?.tipo === "admin" && (
            <SidebarItem
              href="/dashboard/relatorios"
              icon={BarChart3}
              title="Relatórios"
              isActive={pathname.startsWith("/dashboard/relatorios")}
            />
          )}
        </nav>
      </div>
      <div className="p-4 mt-auto border-t">
        <p className="text-xs text-muted-foreground mb-2">
          {user?.contabilidade?.nome}
        </p>
        <p className="text-xs text-muted-foreground">
          © 2023 ContabiPRO
        </p>
      </div>
    </aside>
  )
}
