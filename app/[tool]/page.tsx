import type { Metadata } from 'next';
import Script from 'next/script';
import { AppShell } from '@/components/shell/AppShell';
import { getToolFromSlug, getRouteMetadata, getAllRouteSlugs } from '@/lib/routing';
import { generateToolSchema, generateBreadcrumbSchema } from '@/lib/seo/jsonld';
import { notFound } from 'next/navigation';

interface ToolPageProps {
  params: {
    tool: string;
  };
}

/**
 * Generate metadata for each tool route
 */
export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const toolId = getToolFromSlug(params.tool);

  if (!toolId) {
    return {
      title: 'Tool Not Found | json0',
      description: 'The requested tool was not found.',
    };
  }

  const route = getRouteMetadata(toolId);

  if (!route) {
    return {
      title: 'json0 - JSON Tools Online',
      description: 'Fast, friendly JSON tools.',
    };
  }

  return {
    title: route.title,
    description: route.description,
    viewport: 'width=device-width, initial-scale=1',
    openGraph: {
      title: route.title,
      description: route.description,
      type: 'website',
      url: `https://json0.dev/${route.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: route.title,
      description: route.description,
    },
  };
}

/**
 * Generate static params for all tool routes
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  return getAllRouteSlugs().map((slug) => ({
    tool: slug,
  }));
}

/**
 * Tool route page component
 */
export default function ToolPage({ params }: ToolPageProps) {
  const toolId = getToolFromSlug(params.tool);

  // Show 404 if tool slug is invalid
  if (!toolId) {
    notFound();
  }

  const route = getRouteMetadata(toolId);

  if (!route) {
    return <AppShell initialTool={toolId} />;
  }

  // Generate JSON-LD structured data
  const toolSchema = generateToolSchema(toolId, route.title, route.description);
  const breadcrumbSchema = generateBreadcrumbSchema(toolId, route.title);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="tool-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <AppShell initialTool={toolId} />
    </>
  );
}
