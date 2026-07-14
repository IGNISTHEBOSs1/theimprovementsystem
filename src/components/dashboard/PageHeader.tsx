import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-label text-primary mb-2">{eyebrow}</p>}
        <h1 className="text-display-lg text-foreground">{title}</h1>
        <p className="mt-2 text-body-md text-muted-foreground">{description}</p>
      </div>
      {children}
    </header>
  );
}
