import { cn } from "@/lib/utils";

export default function SubHeading({
  className,
  children,
  variant = "medium",
}: {
  className?: string;
  children: React.ReactNode;
  variant?: "big" | "medium" | "small";
}) {
  const variants = {
    big: "text-base md:text-lg",
    medium: "text-sm md:text-base",
    small: "text-xs md:text-sm",
  };
  return (
    <p className={cn("text-white/50 leading-relaxed", variants[variant], className)}>
      {children}
    </p>
  );
}
