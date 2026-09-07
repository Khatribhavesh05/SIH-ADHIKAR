import { ButtonHTMLAttributes } from "react";
import Link from "next/link";

const VARIANTS = {
  primary: "bg-brand text-white border-brand hover:bg-brand-dark",
  secondary: "bg-paper-raised text-ink border-hairline-strong hover:border-ink",
  ghost: "bg-transparent text-ink border-transparent hover:border-hairline-strong",
  danger: "bg-[var(--color-danger)] text-white border-[var(--color-danger)] hover:opacity-90",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-[var(--radius-sm)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  href,
  children,
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border rounded-[var(--radius-sm)] transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}
