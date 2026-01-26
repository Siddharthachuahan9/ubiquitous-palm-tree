'use client';

import { Tool } from './TopBar';
import { IPInspector } from '@/components/tools/IPInspector';

interface ToolRouterProps {
  currentTool: Tool;
}

export function ToolRouter({ currentTool }: ToolRouterProps) {
  const renderTool = () => {
    switch (currentTool) {
      case 'diff':
        return (
          <div style={{ padding: '24px' }}>
            <h2>JSON Diff Tool</h2>
            <p>Compare two JSON documents side-by-side</p>
          </div>
        );

      case 'jsonpath':
        return (
          <div style={{ padding: '24px' }}>
            <h2>JSONPath Query Tool</h2>
            <p>Query JSON data using JSONPath expressions</p>
          </div>
        );

      case 'validate':
        return (
          <div style={{ padding: '24px' }}>
            <h2>JSON Validation Tool</h2>
            <p>Validate JSON syntax and structure</p>
          </div>
        );

      case 'ip':
        return <IPInspector />;

      case 'ping':
        return (
          <div style={{ padding: '24px' }}>
            <h2>Ping Tool</h2>
            <p>Test network reachability via HTTPS</p>
          </div>
        );

      case 'base64':
        return (
          <div style={{ padding: '24px' }}>
            <h2>Base64 Encoder/Decoder</h2>
            <p>Encode and decode Base64 strings with UTF-8 support</p>
          </div>
        );

      case 'jwt':
        return (
          <div style={{ padding: '24px' }}>
            <h2>JWT Decoder</h2>
            <p>Decode and inspect JWT tokens locally</p>
          </div>
        );

      default:
        return (
          <div style={{ padding: '24px' }}>
            <h2>Tool not found</h2>
            <p>The requested tool is not available</p>
          </div>
        );
    }
  };

  return <div style={{ flex: 1, overflow: 'auto' }}>{renderTool()}</div>;
}
