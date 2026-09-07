import { HTMLAttributes } from "react";

export function Panel({
  className = "",
  raised = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { raised?: boolean }) {
  return (
    <div
      className={`border border-hairline ${
        raised ? "bg-paper-raised" : "bg-paper"
      } rounded-[var(--radius-md)] ${className}`}
      {...props}
    />
  );
}

export function PanelHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`px-5 py-4 border-b border-hairline ${className}`}
      {...props}
    />
  );
}

export function PanelBody({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 py-4 ${className}`} {...props} />;
}
