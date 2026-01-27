'use client';

import { useRouter, usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

interface Tool {
  id: string;
  name: string;
  icon: string;
  path: string;
}

const TOOLS: Tool[] = [
  { id: 'diff', name: 'Diff', icon: '🔍', path: '/json-diff' },
  { id: 'jsonpath', name: 'Path', icon: '🗺️', path: '/jsonpath' },
  { id: 'validate', name: 'Validate', icon: '✓', path: '/json-validate' },
  { id: 'base64', name: 'Base64', icon: '📦', path: '/base64' },
  { id: 'jwt', name: 'JWT', icon: '🔐', path: '/jwt' },
];

/**
 * BottomNav - Mobile navigation bar
 *
 * Features:
 * - Shows icons and labels for primary tools
 * - Active tool highlighted
 * - Only visible on mobile (<768px)
 * - Fixed to bottom of viewport
 * - Touch-friendly 44px minimum targets
 *
 * Usage:
 * ```tsx
 * <BottomNav />
 * ```
 */
export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleToolClick = (path: string) => {
    router.push(path);
  };

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      <div className={styles.container}>
        {TOOLS.map((tool) => {
          const isActive = pathname === tool.path;

          return (
            <button
              key={tool.id}
              className={`${styles.button} ${isActive ? styles.active : ''}`}
              onClick={() => handleToolClick(tool.path)}
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
