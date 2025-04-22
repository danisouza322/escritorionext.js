"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Logo from "@/components/logo"
import { Session } from "@/types"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Calendar,
  FileText,
  FolderKanban,
  Home,
  Users,
  Users2,
} from "lucide-react"

interface MobileNavProps {
  user?: Session["user"]
}

export default function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b p-6">
          <SheetTitle className="flex items-center justify-start">
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 p-4">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              pathname === "/dashboard"
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/clientes"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              pathname.startsWith("/dashboard/clientes")
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <Users className="h-5 w-5" />
            <span>Clientes</span>
          </Link>
          <Link
            href="/dashboard/documentos"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              pathname.startsWith("/dashboard/documentos")
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <FileText className="h-5 w-5" />
            <span>Documentos</span>
          </Link>
          <Link
            href="/dashboard/tarefas"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              pathname.startsWith("/dashboard/tarefas")
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <FolderKanban className="h-5 w-5" />
            <span>Tarefas</span>
          </Link>
          <Link
            href="/dashboard/calendario"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              pathname.startsWith("/dashboard/calendario")
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <Calendar className="h-5 w-5" />
            <span>Calendário</span>
          </Link>
          {user?.tipo === "admin" && (
            <Link
              href="/dashboard/colaboradores"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                pathname.startsWith("/dashboard/colaboradores")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              <Users2 className="h-5 w-5" />
              <span>Colaboradores</span>
            </Link>
          )}
          {user?.tipo === "admin" && (
            <Link
              href="/dashboard/relatorios"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                pathname.startsWith("/dashboard/relatorios")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground"
              )}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Relatórios</span>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
