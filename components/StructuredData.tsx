import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'Organization' | 'SoftwareApplication' | 'Article' | 'VideoObject' | 'FAQPage' | 'BreadcrumbList' | 'Blog' | 'BlogPosting' | 'CollectionPage';
  data: Record<string, any>;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export const OrganizationSchema = () => (
  <StructuredData
    type="Organization"
    data={{
      name: 'AgentWrite',
      url: 'https://agentwoodai.com',
      logo: 'https://agentwoodai.com/logo.png',
      description: 'AI-powered video marketing tools and content creation software for brands and content creators',
      sameAs: [
        'https://x.com/agentwoodstudio',
        'https://discord.com/invite/agentwood',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@agentwood.xyz',
        contactType: 'Customer Support',
      },
    }}
  />
);

export const SoftwareApplicationSchema = () => (
  <StructuredData
    type="SoftwareApplication"
    data={{
      name: 'AgentWrite',
      applicationCategory: 'ContentCreationApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '7',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '127',
      },
      description: 'AI-powered video marketing tools, video idea generator, and content creation software for brands',
    }}
  />
);

