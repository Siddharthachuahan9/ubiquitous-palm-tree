'use client';

import { useState, useEffect } from 'react';
import { TopBar, Tool } from './TopBar';
import { RightSidebar } from './RightSidebar';
import { ToolRouter } from './ToolRouter';
import { CommandPalette } from './CommandPalette';
import { PrivacyModal } from './PrivacyModal';
import { CreditLine } from './CreditLine';
import styles from './AppShell.module.css';

export function AppShell() {
  const [currentTool, setCurrentTool] = useState<Tool>('diff');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);

  const handleToolChange = (tool: Tool) => {
    setCurrentTool(tool);
  };

  const handleCommandPaletteOpen = () => {
    setCommandPaletteOpen(true);
  };

  const handleCommandPaletteClose = () => {
    setCommandPaletteOpen(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K - Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // Cmd+/ / Ctrl+/ - Toggle Sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.shell}>
      <TopBar
        currentTool={currentTool}
        onToolChange={handleToolChange}
        onCommandPaletteOpen={handleCommandPaletteOpen}
        onPrivacyModalOpen={() => setPrivacyModalOpen(true)}
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

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={handleCommandPaletteClose}
        onSelectTool={handleToolChange}
        currentTool={currentTool}
      />

      {/* Privacy Modal */}
      <PrivacyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />

      {/* Credit Line */}
      <div className={styles.footer}>
        <CreditLine onOpenPrivacyModal={() => setPrivacyModalOpen(true)} />
      </div>
    </div>
  );
}
