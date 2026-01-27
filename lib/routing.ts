import { Tool } from '@/components/shell/TopBar';

/**
 * Route Configuration
 * Maps URL slugs to tool IDs for client-side routing
 */

export interface ToolRoute {
  slug: string;
  toolId: Tool;
  title: string;
  description: string;
}

export const TOOL_ROUTES: ToolRoute[] = [
  {
    slug: 'json-diff',
    toolId: 'diff',
    title: 'JSON Diff - Compare JSON Online | json0',
    description: 'Compare and diff two JSON documents instantly. Visualize differences between JSON files with syntax highlighting. Privacy-first, runs locally in your browser.',
  },
  {
    slug: 'json-validate',
    toolId: 'validate',
    title: 'JSON Validator - Validate JSON Online | json0',
    description: 'Validate JSON syntax instantly. Check JSON formatting and find errors with clear error messages. Privacy-first, runs locally in your browser.',
  },
  {
    slug: 'jsonpath',
    toolId: 'jsonpath',
    title: 'JSONPath Query Tool - Query JSON Online | json0',
    description: 'Query JSON documents with JSONPath expressions. Extract data from complex JSON structures easily. Privacy-first, runs locally in your browser.',
  },
  {
    slug: 'jwt',
    toolId: 'jwt',
    title: 'JWT Decoder - Decode JWT Tokens Online | json0',
    description: 'Decode and inspect JWT tokens instantly. View header, payload, and signature with syntax highlighting. Privacy-first, runs locally in your browser.',
  },
  {
    slug: 'base64',
    toolId: 'base64',
    title: 'Base64 Encoder & Decoder Online | json0',
    description: 'Encode and decode Base64 strings instantly. Convert text to Base64 and back with ease. Privacy-first, runs locally in your browser.',
  },
  {
    slug: 'ping',
    toolId: 'ping',
    title: 'Ping Tool - Network Ping Test Online | json0',
    description: 'Ping any URL to check network connectivity and response time. Test website availability instantly. Privacy-first tool.',
  },
  {
    slug: 'ip',
    toolId: 'ip',
    title: 'IP Inspector - Check IP Address Info | json0',
    description: 'Inspect IP addresses and get detailed information. Check geolocation, ISP, and more. Privacy-first tool.',
  },
  {
    slug: 'hash',
    toolId: 'hash',
    title: 'Hash Generator - Generate SHA Hashes Online | json0',
    description: 'Generate cryptographic hashes (SHA-1, SHA-256, SHA-384, SHA-512) instantly. Privacy-first, runs locally in your browser.',
  },
  {
    slug: 'uuid',
    toolId: 'uuid',
    title: 'UUID Generator - Generate UUIDs Online | json0',
    description: 'Generate UUIDs (v4, v1-like, nil) instantly. Bulk generation supported. Privacy-first, runs locally in your browser.',
  },
];

/**
 * Get tool ID from URL slug
 */
export function getToolFromSlug(slug: string): Tool | null {
  const route = TOOL_ROUTES.find((r) => r.slug === slug);
  return route?.toolId || null;
}

/**
 * Get URL slug from tool ID
 */
export function getSlugFromTool(tool: Tool): string {
  const route = TOOL_ROUTES.find((r) => r.toolId === tool);
  return route?.slug || 'json-diff';
}

/**
 * Get route metadata from tool ID
 */
export function getRouteMetadata(tool: Tool): ToolRoute | null {
  return TOOL_ROUTES.find((r) => r.toolId === tool) || null;
}

/**
 * Get all valid route slugs for static generation
 */
export function getAllRouteSlugs(): string[] {
  return TOOL_ROUTES.map((r) => r.slug);
}
