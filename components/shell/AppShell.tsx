'use client';

import { useState } from 'react';
import { TopBar, Tool } from './TopBar';
import { RightSidebar } from './RightSidebar';
import { ToolRouter } from './ToolRouter';
import styles from './AppShell.module.css';

export function AppShell() {
  const [currentTool, setCurrentTool] = useState<Tool>('diff');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleToolChange = (tool: Tool) => {
    setCurrentTool(tool);
  };

  const handleCommandPaletteOpen = () => {
    setCommandPaletteOpen(true);
  };

  const handleCommandPaletteClose = () => {
    setCommandPaletteOpen(false);
  };

  return (
    <div className={styles.shell}>
      <TopBar
        currentTool={currentTool}
        onToolChange={handleToolChange}
        onCommandPaletteOpen={handleCommandPaletteOpen}
      />

      <div className={styles.main}>
        <ToolRouter currentTool={currentTool} />

        {sidebarOpen && (
          <RightSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Command Palette - Placeholder */}
      {commandPaletteOpen && (
        <div className={styles.commandPaletteOverlay} onClick={handleCommandPaletteClose}>
          <div className={styles.commandPalette} onClick={(e) => e.stopPropagation()}>
            <div className={styles.commandPaletteHeader}>
              <input
                type="text"
                placeholder="Type a command..."
                className={styles.commandPaletteInput}
                autoFocus
              />
            </div>
            <div className={styles.commandPaletteContent}>
              <p style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                Command palette coming soon...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
