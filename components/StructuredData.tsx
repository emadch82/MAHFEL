'use client';

export default function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'سرای هنر و اندیشه',
    alternateName: 'Soha Art & Thought',
    url: 'https://soha-sima.ir',
    description: 'پلتفرم پادکست، کتاب و ویدیو - سرای هنر و اندیشه',
    inLanguage: 'fa',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://soha-sima.ir/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'سرای هنر و اندیشه',
    url: 'https://soha-sima.ir',
    logo: 'https://soha-sima.ir/logo.png',
    sameAs: [],
  };

  const podcastJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'پادکست‌های سرای هنر و اندیشه',
    description: 'مجموعه درسگفتارها و گفتگوهای سرای هنر و اندیشه',
    url: 'https://soha-sima.ir',
    isPartOf: {
      '@type': 'WebSite',
      name: 'سرای هنر و اندیشه',
      url: 'https://soha-sima.ir',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(podcastJsonLd) }}
      />
    </>
  );
}
