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
        {/* Founder Decision (Mobile hierarchy chunk): eyebrow ("Your
            system," "Your commitments," "Goal: X," etc.) removed from
            mobile only — desktop keeps it unchanged. On a phone screen
            this label was competing with the title for the very first
            thing a person reads; the title alone already carries that
            meaning. Pure visibility toggle (hidden md:block), not a
            content/data change — eyebrow is still passed and still
            rendered on desktop exactly as before. */}
        {eyebrow && <p className="hidden md:block text-label text-primary mb-2">{eyebrow}</p>}
        <h1 className="text-display-lg text-foreground">{title}</h1>
        <p className="mt-2 text-body-md text-muted-foreground">{description}</p>
      </div>
      {children}
    </header>
  );
}
