import { type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from "react";

type TableProps = {
  className?: string;
  children: ReactNode;
};

export function Table({ className = "", children }: TableProps) {
  return (
    <div className={`ui-table-shell ${className}`}>
      <table className="w-full border-collapse md:min-w-[640px]">{children}</table>
    </div>
  );
}

export function TableHeader({ className = "", children }: TableProps) {
  return <thead className={`ui-table-head ${className}`}>{children}</thead>;
}

export function TableBody({ className = "", children }: TableProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ className = "", children }: TableProps) {
  return <tr className={`ui-table-row ${className}`}>{children}</tr>;
}

type TableHeadProps = ThHTMLAttributes<HTMLTableCellElement> & {
  className?: string;
  children?: ReactNode;
};

export function TableHead({ className = "", children, ...rest }: TableHeadProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-zinc-400 ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
  className?: string;
  children?: ReactNode;
};

export function TableCell({ className = "", children, ...rest }: TableCellProps) {
  return (
    <td className={`px-4 py-3 text-sm text-zinc-200 ${className}`} {...rest}>
      {children}
    </td>
  );
}
