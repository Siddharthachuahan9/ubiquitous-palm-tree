'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

interface NavTool {
  id: string;
  name: string;
  path: string;
  icon: React.ReactNode;
}

const TOOLS: NavTool[] = [
  {
    id: 'diff',
    name: 'Diff',
    path: '/json-diff',
    icon: (
      <svg {...iconProps}>
        <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
        <path d="M15 3h4a2 2 0 0 0 2 2v14a2 2 0 0 0-2 2h-4" />
        <line x1="12" y1="3" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'jsonpath',
    name: 'Query',
    path: '/jsonpath',
    icon: (
      <svg {...iconProps}>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    id: 'validate',
    name: 'Validate',
    path: '/json-validate',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'base64',
    name: 'Base64',
    path: '/base64',
    icon: (
      <svg {...iconProps}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: 'jwt',
    name: 'JWT',
    path: '/jwt',
    icon: (
      <svg {...iconProps}>
        <circle cx="7.5" cy="15.5" r="5.5" />
        <path d="m21 2-9.6 9.6" />
        <path d="m15.5 7.5 3 3L22 7l-3-3" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      <div className={styles.container}>
        {TOOLS.map((tool) => {
          const isActive = pathname === tool.path;

          return (
            <button
              key={tool.id}
              className={`${styles.button} ${isActive ? styles.active : ''}`}
              onClick={() => router.push(tool.path)}
              aria-label={tool.name}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={styles.icon}>{tool.icon}</span>
              <span className={styles.label}>{tool.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
