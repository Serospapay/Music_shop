import { ReactNode } from "react";

type CardProps = {
  className?: string;
  children: ReactNode;
};

export function Card({ className = "", children }: CardProps) {
  return <div className={`ui-surface ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }: CardProps) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardTitle({ className = "", children }: CardProps) {
  return <h3 className={`text-lg font-semibold text-white ${className}`}>{children}</h3>;
}

export function CardDescription({ className = "", children }: CardProps) {
  return <p className={`text-sm text-zinc-400 ${className}`}>{children}</p>;
}

export function CardContent({ className = "", children }: CardProps) {
  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;
}
