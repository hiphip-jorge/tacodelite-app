import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Taco Delite | 15th Street';
const DEFAULT_DESCRIPTION =
    'The best Tex-Mex food in Plano. Fresh ingredients, bold flavors, and friendly service since 1989.';
const DEFAULT_IMAGE = '/assets/td-logo_2021.webp';

/**
 * Updates document head with SEO meta tags for each page.
 * Supports title, description, keywords, Open Graph, and Twitter Cards.
 */
function Seo({
    title,
    description = DEFAULT_DESCRIPTION,
    keywords,
    image = DEFAULT_IMAGE,
    noIndex = false,
}) {
    const location = useLocation();
    const baseUrl =
        typeof window !== 'undefined'
            ? window.location.origin
            : 'https://tacodelitewestplano.com';
    const canonicalUrl = `${baseUrl}${location.pathname}`;
    const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

    useEffect(() => {
        // Update title
        document.title = fullTitle;

        // Helper to set or update meta tag
        const setMeta = (attrs, content) => {
            const selector = Object.entries(attrs)
                .map(([k, v]) => `meta[${k}="${v}"]`)
                .join('');
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('meta');
                Object.entries(attrs).forEach(([k, v]) =>
                    el.setAttribute(k, v)
                );
                document.head.appendChild(el);
            }
            if (content !== undefined) el.setAttribute('content', content);
        };

        const setMetaByName = (name, content) => setMeta({ name }, content);
        const setMetaByProperty = (property, content) =>
            setMeta({ property }, content);

        // Standard meta tags
        setMetaByName('description', description);
        if (keywords) setMetaByName('keywords', keywords);

        // Open Graph
        setMetaByProperty('og:title', fullTitle);
        setMetaByProperty('og:description', description);
        setMetaByProperty('og:image', imageUrl);
        setMetaByProperty('og:url', canonicalUrl);
        setMetaByProperty('og:type', 'website');
        setMetaByProperty('og:site_name', SITE_NAME);
        setMetaByProperty('og:locale', 'en_US');

        // Twitter Card
        setMetaByName('twitter:card', 'summary_large_image');
        setMetaByName('twitter:title', fullTitle);
        setMetaByName('twitter:description', description);
        setMetaByName('twitter:image', imageUrl);

        // Canonical URL
        let linkCanonical = document.querySelector('link[rel="canonical"]');
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        linkCanonical.setAttribute('href', canonicalUrl);

        // Robots
        setMetaByName(
            'robots',
            noIndex ? 'noindex, nofollow' : 'index, follow'
        );

        // Cleanup on unmount - restore defaults
        return () => {
            document.title = SITE_NAME;
        };
    }, [fullTitle, description, keywords, imageUrl, canonicalUrl, noIndex]);

    return null;
}

export default Seo;
