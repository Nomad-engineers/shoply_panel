import * as React from "react";

import { cn } from "@/lib/theme";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, subtitle, actions, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mb-8",
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }
);
PageHeader.displayName = "PageHeader";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ items, className }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn(
          "flex items-center gap-2 text-sm text-text-secondary mb-4",
          className
        )}
      >
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-text-primary transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-text-primary">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span className="text-text-secondary">/</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

export { PageHeader, Breadcrumb };