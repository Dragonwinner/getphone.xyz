import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  structuredData?: object;
}

export default function SEO({
  title,
  description,
  keywords,
  ogImage = 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg',
  ogType = 'website',
  canonical,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    document.title = `${title} | GetPhone.xyz`;

    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords || 'mobile phones, smartphones, buy phones online, phone deals' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'og:type', content: ogType },
      { property: 'og:site_name', content: 'GetPhone.xyz' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: ogImage },
    ];

    metaTags.forEach(({ name, property, content }) => {
      const key = name || property;
      const attr = name ? 'name' : 'property';
      let element = document.querySelector(`meta[${attr}="${key}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key!);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    });

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, keywords, ogImage, ogType, canonical, structuredData]);

  return null;
}
