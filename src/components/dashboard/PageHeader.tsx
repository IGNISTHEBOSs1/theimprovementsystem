import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
      <div className="max-w-2xl min-w-0 flex-1">
        {eyebrow && (
          <p className="text-xs font-semibold text-primary mb-1 tracking-normal">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </header>
  );
}
