/**
 * JSON-LD Structured Data Generation
 * Provides rich search results for Google and other search engines
 */

import { Tool } from '@/components/shell/ToolNavigation';

/**
 * Generate WebApplication JSON-LD structured data
 */
export function generateWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'json0',
    alternateName: 'json0.dev',
    url: 'https://json0.dev',
    description:
      'Fast, friendly JSON tools. Compare, query, and validate JSON - all in your browser. Privacy-first, no data leaves your device.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Person',
      name: 'Siddharthachuahan9',
    },
    featureList: [
      'JSON Diff',
      'JSON Validation',
      'JSONPath Query',
      'JWT Decoder',
      'Base64 Encoder/Decoder',
      'Hash Generator (SHA)',
      'UUID Generator',
      'IP Inspector',
      'Ping Tool',
      'XML to JSON Converter',
    ],
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0',
  };
}

/**
 * Generate SoftwareApplication JSON-LD for specific tool
 */
export function generateToolSchema(tool: Tool, title: string, description: string) {
  const toolNames: Record<Tool, string> = {
    diff: 'JSON Diff',
    validate: 'JSON Validator',
    jsonpath: 'JSONPath Query',
    jwt: 'JWT Decoder',
    base64: 'Base64 Encoder/Decoder',
    ping: 'Ping Tool',
    ip: 'IP Inspector',
    hash: 'Hash Generator',
    uuid: 'UUID Generator',
    'xml-to-json': 'XML to JSON Converter',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: toolNames[tool],
    applicationCategory: 'DeveloperTool',
    operatingSystem: 'Any',
    url: `https://json0.dev/${tool}`,
    description: description,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    creator: {
      '@type': 'Person',
      name: 'Siddharthachuahan9',
    },
    inLanguage: 'en-US',
    featureList: getToolFeatures(tool),
  };
}

/**
 * Get feature list for specific tool
 */
function getToolFeatures(tool: Tool): string[] {
  const features: Record<Tool, string[]> = {
    diff: [
      'Compare two JSON documents',
      'Visual diff highlighting',
      'Syntax highlighting',
      'Privacy-first local processing',
    ],
    validate: [
      'JSON syntax validation',
      'Error detection',
      'Line number references',
      'Privacy-first local processing',
    ],
    jsonpath: [
      'JSONPath expression query',
      'Extract data from JSON',
      'Syntax highlighting',
      'Privacy-first local processing',
    ],
    jwt: [
      'Decode JWT tokens',
      'View header and payload',
      'Signature verification',
      'Privacy-first local processing',
    ],
    base64: [
      'Encode to Base64',
      'Decode from Base64',
      'Text and file support',
      'Privacy-first local processing',
    ],
    ping: ['Ping any URL', 'Check network connectivity', 'Response time measurement'],
    ip: ['IP address lookup', 'Geolocation info', 'ISP details'],
    hash: [
      'SHA-1, SHA-256, SHA-384, SHA-512',
      'Cryptographic hash generation',
      'Privacy-first local processing',
    ],
    uuid: [
      'UUID v4 generation',
      'Bulk generation support',
      'Multiple formats',
      'Privacy-first local processing',
    ],
    'xml-to-json': [
      'Convert XML to JSON',
      'DOMParser-based conversion',
      'File upload support',
      'Privacy-first local processing',
    ],
  };

  return features[tool] || [];
}

/**
 * Generate BreadcrumbList JSON-LD
 */
export function generateBreadcrumbSchema(tool: Tool, toolName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://json0.dev',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: toolName,
        item: `https://json0.dev/${tool}`,
      },
    ],
  };
}
