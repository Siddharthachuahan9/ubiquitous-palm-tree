'use client';

import { Tool } from './ToolNavigation';
import { JSONTools } from '@/components/tools/JSONTools';
import { JSONPathTool } from '@/components/tools/JSONPathTool';
import { IPInspector } from '@/components/tools/IPInspector';
import { Base64Tool } from '@/components/tools/Base64Tool';
import { JWTDecoder } from '@/components/tools/JWTDecoder';
import { PingTool } from '@/components/tools/PingTool';
import { HashGenerator } from '@/components/tools/HashGenerator';
import { UUIDGenerator } from '@/components/tools/UUIDGenerator';
import { XMLToJSONTool } from '@/components/tools/XMLToJSONTool';

interface ToolRouterProps {
  currentTool: Tool;
}

export function ToolRouter({ currentTool }: ToolRouterProps) {
  const renderTool = () => {
    switch (currentTool) {
      case 'diff':
        return <JSONTools initialMode="diff" />;

      case 'jsonpath':
        return <JSONPathTool />;

      case 'validate':
        return <JSONTools initialMode="validate" />;

      case 'ip':
        return <IPInspector />;

      case 'ping':
        return <PingTool />;

      case 'base64':
        return <Base64Tool />;

      case 'jwt':
        return <JWTDecoder />;

      case 'hash':
        return <HashGenerator />;

      case 'uuid':
        return <UUIDGenerator />;

      case 'xml-to-json':
        return <XMLToJSONTool />;

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
