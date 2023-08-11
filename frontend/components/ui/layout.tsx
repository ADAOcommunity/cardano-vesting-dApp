import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./sidebar-nav";
import { MainNav } from "../main-nav";
import WalletConnect from "../wallet-connect";

interface SettingsLayoutProps {
  children: React.ReactNode
}

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/examples/forms",
  },
  {
    title: "Account",
    href: "/examples/forms/account",
  },
  {
    title: "Appearance",
    href: "/examples/forms/appearance",
  },
  {
    title: "Notifications",
    href: "/examples/forms/notifications",
  },
  {
    title: "Display",
    href: "/examples/forms/display",
  },
]
interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function Layout({ children, title, description }: SettingsLayoutProps) {

  return (
    <>
      <div className="border-b border-muted-foreground">
        <div className="flex h-16 items-center px-4">
          {/* <TeamSwitcher /> */}
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            {/* <Search /> */}
            <WalletConnect />
            {/* <UserNav /> */}
          </div>
        </div>
      </div>
      <div className="hidden space-y-6 p-10 pb-16 md:block">

        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground">
            {description}
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 justify-center">
          {/* <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside> */}
          <div className="flex-1 justify-center items-center">{children}</div>
        </div>
      </div>
    </>
  )
}