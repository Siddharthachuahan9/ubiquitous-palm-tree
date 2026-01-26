'use client';

import { Tool } from './TopBar';
import { IPInspector } from '@/components/tools/IPInspector';
import { Base64Tool } from '@/components/tools/Base64Tool';
import { JWTDecoder } from '@/components/tools/JWTDecoder';
import { PingTool } from '@/components/tools/PingTool';

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
        return <PingTool />;

      case 'base64':
        return <Base64Tool />;

      case 'jwt':
        return <JWTDecoder />;

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
