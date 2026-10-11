import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

/** Navy banner used at the top of every page, matching the navbar gradient. */
const PageHeader = ({ title, subtitle, icon: Icon, actions, onBack, className }: PageHeaderProps) => (
  <div
    className={cn(
      "no-print relative overflow-hidden rounded-2xl px-5 py-5 sm:px-7 sm:py-6 mb-6 text-white shadow-lg shadow-blue-950/20",
      className
    )}
    style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)" }}
  >
    {/* Decorative watch-dial rings */}
    <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border border-white/10" />
    <div className="pointer-events-none absolute -right-2 -top-8 h-32 w-32 rounded-full border border-white/10" />

    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 transition-colors hover:bg-white/20"
            title="Back"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        {Icon && !onBack && (
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-wide sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-sm text-blue-200">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="flex flex-wrap gap-2 md:flex-nowrap">{actions}</div>}
    </div>
  </div>
);

type HeaderButtonVariant = "solid" | "ghost" | "danger";

const headerButtonVariants: Record<HeaderButtonVariant, string> = {
  solid: "bg-white text-[#1e3a5f] hover:bg-blue-50 shadow-sm",
  ghost: "border border-white/25 bg-white/10 text-white hover:bg-white/20",
  danger: "border border-red-300/30 bg-red-500/15 text-red-100 hover:bg-red-500/30",
};

/** Button styled for use inside PageHeader's `actions`. */
export const HeaderButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: HeaderButtonVariant }
>(({ variant = "ghost", className, ...props }, ref) => (
  <button
    ref={ref}
    {...props}
    className={cn(
      "inline-flex flex-1 md:flex-none items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-60",
      headerButtonVariants[variant],
      className
    )}
  />
));
HeaderButton.displayName = "HeaderButton";

export default PageHeader;
