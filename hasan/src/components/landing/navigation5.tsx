import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/base-ui/navigation-menu';
import { Button } from '@/components/base-ui/button';
import { Badge } from '@/components/base-ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/base-ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/base-ui/accordion';
import {
  Cpu,
  Layers,
  GitBranch,
  Terminal,
  Command,
  User,
  Menu,
  ArrowUpRight,
} from 'lucide-react';

export function Navigation5() {
  return (
    <div className="relative w-full py-10 font-mono">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-6">
        <div className="flex h-16 w-4xl items-center justify-between gap-2 rounded-full border border-white/10 bg-[#101010]/90 backdrop-blur-md pr-3 shadow-lg md:w-5xl">
          <div className="flex items-center gap-2 pr-6 pl-4">
            <div className="text-primary flex h-8 w-8 items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6 fill-current"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Watermelon
            </span>
          </div>

          <div className="hidden lg:block">
            <NavigationMenu
              className={cn(
                'static',
                '[&>div:last-child]:inset-x-0 [&>div:last-child]:top-full [&>div:last-child]:w-full',
                '[&_[data-slot=navigation-menu-viewport]]:mx-auto [&_[data-slot=navigation-menu-viewport]]:-mt-6 [&_[data-slot=navigation-menu-viewport]]:max-w-7xl [&_[data-slot=navigation-menu-viewport]]:ring-0',
                '[&_[data-slot=navigation-menu-viewport]]:rounded-[2.5rem] [&_[data-slot=navigation-menu-viewport]]:border [&_[data-slot=navigation-menu-viewport]]:border-white/10',
                '[&_[data-slot=navigation-menu-viewport]]:bg-[#101010] [&_[data-slot=navigation-menu-viewport]]:shadow-2xl',
                '[&_[data-slot=navigation-menu-viewport]]:transition-all [&_[data-slot=navigation-menu-viewport]]:duration-300 [&_[data-slot=navigation-menu-viewport]]:ease-in-out',
                '[&_[data-slot=navigation-menu-viewport]]:data-open:fade-in-0 [&_[data-slot=navigation-menu-viewport]]:data-closed:fade-out-0',
                '[&_[data-slot=navigation-menu-viewport]]:data-open:zoom-in-100 [&_[data-slot=navigation-menu-viewport]]:data-closed:zoom-out-100',
              )}
            >
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
                    href="#"
                  >
                    Features
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="flex items-center gap-2 rounded-full bg-transparent px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
                    href="#"
                  >
                    Developers
                    <Badge
                      variant="secondary"
                      className="bg-primary text-primary-foreground hover:bg-primary h-4 rounded-full px-1.5 text-[10px]"
                    >
                      API
                    </Badge>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-auto rounded-full bg-transparent px-4 py-2 text-sm font-medium text-white/50 transition-all hover:bg-white/5 hover:text-white focus:bg-transparent data-[state=open]:bg-white/10">
                    Solutions
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-0 font-mono">
                    <div className="grid w-5xl grid-cols-4 gap-6 divide-x divide-white/10 px-10 py-10">
                      <div className="flex flex-col px-2">
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                          <Cpu className="h-5 w-5 text-white/70" />
                        </div>
                        <h4 className="mb-1 text-sm font-medium text-white">
                          Compute Engine
                        </h4>
                        <p className="mb-3 text-sm tracking-tight text-white/40">
                          Train and deploy models with infinite scale
                          infrastructure.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            className="h-7 gap-1.5 rounded-full px-3 text-xs text-white/70 border-white/10"
                          >
                            <Layers className="h-3.5 w-3.5" />
                            Pipelines
                          </Button>
                          <Button
                            variant="outline"
                            className="h-7 gap-1.5 rounded-full px-3 text-xs text-white/70 border-white/10"
                          >
                            <GitBranch className="h-3.5 w-3.5" />
                            Webhooks
                          </Button>
                          <Button
                            variant="outline"
                            className="h-7 gap-1.5 rounded-full px-3 text-xs text-white/70 border-white/10"
                          >
                            <Terminal className="h-3.5 w-3.5" />
                            CLI Tool
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 pl-6">
                        <h4 className="mb-1 text-xs text-white/40 uppercase">
                          Use Cases
                        </h4>
                        <a href="#" className="text-sm font-medium tracking-tight text-white/50 transition-colors hover:text-white">
                          Fraud Detection
                        </a>
                        <a href="#" className="text-sm font-medium tracking-tight text-white/50 transition-colors hover:text-white">
                          Personalized Search
                        </a>
                        <a href="#" className="text-sm font-medium tracking-tight text-white/50 transition-colors hover:text-white">
                          Predictive Analytics
                        </a>
                        <a href="#" className="text-sm font-medium tracking-tight text-white/50 transition-colors hover:text-white">
                          LLM Gateways
                        </a>
                      </div>

                      <div className="flex flex-col gap-3 pl-6">
                        <h4 className="mb-1 text-xs text-white/40 uppercase">
                          Resources
                        </h4>
                        <a href="#" className="text-sm font-medium tracking-tight text-white/50 transition-colors hover:text-white">
                          Documentation
                        </a>
                        <a href="#" className="text-sm font-medium tracking-tight text-white/50 transition-colors hover:text-white">
                          API Reference
                        </a>
                        <a href="#" className="text-sm font-medium tracking-tight text-white/50 transition-colors hover:text-white">
                          System Status
                        </a>
                      </div>

                      <div className="flex flex-col pl-6">
                        <h4 className="mb-4 text-xs text-white/40 uppercase">
                          Featured
                        </h4>
                        <a
                          href="#"
                          className="group ring-primary/50 relative flex h-full flex-col justify-between overflow-hidden rounded-2xl p-6 ring transition-all"
                        >
                          <div className="from-primary/10 absolute inset-0 bg-gradient-to-br via-transparent to-transparent group-hover:opacity-100" />
                          <div className="absolute inset-0 -z-10 bg-white/5" />

                          <div>
                            <Badge
                              variant="outline"
                              className="border-primary text-primary mb-3 bg-[#101010]"
                            >
                              Upcoming Webinar
                            </Badge>
                            <h4 className="mb-2 text-sm font-semibold text-white">
                              Building scalable AI pipelines
                            </h4>
                            <p className="text-sm tracking-tight text-white/50">
                              Join our engineers for a live teardown of the new
                              Compute Engine architecture.
                            </p>
                          </div>

                          <div className="text-primary mt-4 flex items-center text-sm font-medium">
                            Register now{' '}
                            <ArrowUpRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </a>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
                    href="#"
                  >
                    Customers
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="rounded-full bg-transparent px-4 py-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
                    href="#"
                  >
                    Enterprise
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex hidden items-center gap-1 md:flex">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white/50 hover:bg-white/10"
              >
                <Command className="size-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white/50 hover:bg-white/10"
              >
                <User className="size-4.5" />
              </Button>
            </div>
            <Button className="bg-primary hover:bg-primary/90 hidden rounded-full px-6 font-semibold text-black md:block">
              Get started
            </Button>

            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    className="rounded-full text-white/70 hover:bg-white/10"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="flex w-[300px] flex-col gap-6 border-white/10 bg-[#101010] p-6 font-mono"
                >
                  <div className="flex items-center gap-2">
                    <div className="text-primary dark:text-primary flex h-8 w-8 items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-6 fill-current"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <span className="text-lg font-bold text-white">
                      Watermelon
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <a href="#" className="text-base font-medium text-white">
                      Features
                    </a>
                    <div className="flex items-center justify-between">
                      <a href="#" className="text-base font-medium text-white">
                        Developers
                      </a>
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 text-primary"
                      >
                        API
                      </Badge>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="solutions" className="border-none">
                        <AccordionTrigger className="justify-between py-0 text-base font-medium text-white hover:no-underline">
                          Solutions
                        </AccordionTrigger>
                        <AccordionContent className="mt-1 ml-2 flex !h-auto flex-col gap-3 border-l border-white/10 pb-0 pl-4 text-base font-medium [&_a]:no-underline">
                          <div className="flex flex-col gap-2 pt-4">
                            <span className="text-xs text-white/40 uppercase">
                              Infrastructure
                            </span>
                            <a href="#" className="hover:text-primary text-sm font-medium tracking-tight text-white/60">
                              Compute Engine
                            </a>
                            <a href="#" className="hover:text-primary text-sm font-medium tracking-tight text-white/60">
                              System Status
                            </a>
                          </div>
                          <div className="mt-2 flex flex-col gap-2">
                            <span className="text-xs text-white/40 uppercase">
                              Use Cases
                            </span>
                            <a href="#" className="hover:text-primary text-sm font-medium tracking-tight text-white/60">
                              Fraud Detection
                            </a>
                            <a href="#" className="hover:text-primary text-sm font-medium tracking-tight text-white/60">
                              Predictive Analytics
                            </a>
                            <a href="#" className="hover:text-primary text-sm font-medium tracking-tight text-white/60">
                              LLM Gateways
                            </a>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <a href="#" className="text-base font-medium text-white">
                      Customers
                    </a>
                    <a href="#" className="text-base font-medium text-white">
                      Enterprise
                    </a>
                  </div>

                  <div className="mt-auto flex flex-col gap-3">
                    <Button className="bg-primary hover:bg-primary/90 w-full rounded-full text-black">
                      Get started
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
