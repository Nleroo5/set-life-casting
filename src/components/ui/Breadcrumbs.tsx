"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface BreadcrumbItem {
  name: string;
  href: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on homepage
  if (pathname === "/") return null;

  // Generate breadcrumb items from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split("/").filter((path) => path);
    const breadcrumbs: BreadcrumbItem[] = [{ name: "Home", href: "/" }];

    let currentPath = "";
    paths.forEach((path) => {
      currentPath += `/${path}`;
      // Convert path to readable name (e.g., "talent-resources" -> "Talent Resources")
      const name = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      breadcrumbs.push({ name, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Generate JSON-LD structured data
  const generateStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `https://www.setlifecasting.com${item.href}`,
      })),
    };
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData()),
        }}
      />

      {/* Breadcrumb UI */}
      <nav aria-label="Breadcrumb" className="bg-primary-light py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm" style={{ fontFamily: 'var(--font-outfit)' }}>
            {breadcrumbs.map((breadcrumb, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <li key={breadcrumb.href} className="flex items-center">
                  {index > 0 && (
                    <svg
                      className="w-4 h-4 text-secondary-light mx-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {isLast ? (
                    <span
                      className="text-secondary font-medium"
                      aria-current="page"
                    >
                      {breadcrumb.name}
                    </span>
                  ) : (
                    <Link
                      href={breadcrumb.href}
                      className="text-secondary-light hover:text-accent transition-colors duration-200"
                    >
                      {breadcrumb.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
