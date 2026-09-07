import { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

/**
 * Shared table primitives so every data table in the app (Projects,
 * Deadlines & Risk, Documents, Dashboard, Disbursement) shares one
 * consistent look: hairline row dividers, a tinted header row, and the
 * same row-hover — instead of each page reinventing its own table markup.
 */
export function Table({ className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm border-collapse ${className}`} {...props} />
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-paper">
      <tr className="border-b border-hairline-strong text-left">{children}</tr>
    </thead>
  );
}

export function TH({ className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`px-5 py-2.5 text-xs font-medium text-ink-muted uppercase tracking-wide ${className}`}
      {...props}
    />
  );
}

export function TR({ className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`border-b border-hairline last:border-0 hover:bg-paper transition-colors ${className}`}
      {...props}
    />
  );
}

export function TD({ className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-5 py-3 ${className}`} {...props} />;
}

export function TEmpty({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center text-ink-muted text-sm">
        {children}
      </td>
    </tr>
  );
}
