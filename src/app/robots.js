export default function robots() {
  const baseUrl = 'https://aigenlabs.vn';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/student/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
