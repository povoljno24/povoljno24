export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://povoljno24.rs';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/profil', '/postoglas', '/oglas/edit/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
