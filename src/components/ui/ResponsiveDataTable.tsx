import { Table, THead, TH, TR, TD, TEmpty } from "@/components/ui/Table";

export interface DataColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  /** Shown as the mobile card's heading instead of a label/value row. Exactly one column should set this. */
  primary?: boolean;
}

/**
 * Renders as a normal table at md+ and as stacked label/value cards below
 * md. Column definitions are shared between both layouts so pages don't
 * duplicate row markup — this is what keeps Projects, Deadlines,
 * Documents, and the Dashboard's project list consistent instead of each
 * page inventing its own mobile treatment (or, as before, none at all).
 *
 * `dense`: use when nesting inside an already-padded container (e.g. a
 * PanelBody) — drops the table's own horizontal cell padding and mobile
 * card padding so it doesn't double up with the parent's.
 */
export function ResponsiveDataTable<T>({
  columns,
  rows,
  rowKey,
  rowClassName,
  emptyMessage,
  dense = false,
}: {
  columns: DataColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowClassName?: (row: T) => string;
  emptyMessage: string;
  dense?: boolean;
}) {
  const primaryCol = columns.find((c) => c.primary) ?? columns[0];
  const secondaryCols = columns.filter((c) => c !== primaryCol);
  const cellPad = dense ? "px-0" : undefined;
  const cardPad = dense ? "py-3" : "px-4 py-4";

  return (
    <>
      {/* Desktop / tablet: normal table */}
      <div className="hidden md:block">
        <Table>
          <THead>
            {columns.map((c) => (
              <TH key={c.key} className={cellPad}>{c.header}</TH>
            ))}
          </THead>
          <tbody>
            {rows.length === 0 && <TEmpty colSpan={columns.length}>{emptyMessage}</TEmpty>}
            {rows.map((row) => (
              <TR key={rowKey(row)} className={rowClassName?.(row)}>
                {columns.map((c) => (
                  <TD key={c.key} className={`${cellPad ?? ""} ${c.className ?? ""}`}>
                    {c.render(row)}
                  </TD>
                ))}
              </TR>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Mobile: one stacked card per row */}
      <div className="md:hidden divide-y divide-hairline">
        {rows.length === 0 && (
          <div className="px-4 py-10 text-center text-ink-muted text-sm">{emptyMessage}</div>
        )}
        {rows.map((row) => (
          <div key={rowKey(row)} className={`${cardPad} ${rowClassName?.(row) ?? ""}`}>
            <div className="font-medium text-sm mb-2">{primaryCol.render(row)}</div>
            <dl className="flex flex-col gap-1.5">
              {secondaryCols.map((c) => (
                <div key={c.key} className="flex items-baseline justify-between gap-3 text-sm">
                  <dt className="text-ink-muted text-xs shrink-0">{c.header}</dt>
                  <dd className="text-right">{c.render(row)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}
