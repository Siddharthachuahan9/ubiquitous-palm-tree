'use client';

import Script from 'next/script';
import { AppShell } from '@/components/shell/AppShell';
import { generateWebApplicationSchema } from '@/lib/seo/jsonld';

export default function Home() {
  const webAppSchema = generateWebApplicationSchema();

  return (
    <>
      {/* JSON-LD Structured Data for Homepage */}
      <Script
        id="webapp-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <AppShell initialTool="diff" />
    </>
  );
}
