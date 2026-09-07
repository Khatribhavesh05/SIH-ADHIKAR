const TONES = {
  neutral: "bg-paper text-ink-muted border-hairline-strong",
  success: "bg-[var(--color-success-tint)] text-[var(--color-success)] border-[var(--color-success)]/30",
  warning: "bg-[var(--color-warning-tint)] text-[var(--color-warning)] border-[var(--color-warning)]/30",
  danger: "bg-[var(--color-danger-tint)] text-[var(--color-danger)] border-[var(--color-danger)]/30",
  info: "bg-[var(--color-info-tint)] text-[var(--color-info)] border-[var(--color-info)]/30",
  brand: "bg-brand-tint text-brand-dark border-brand/30",
} as const;

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof TONES;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border rounded-[var(--radius-sm)] ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
