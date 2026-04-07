export default function sitemap() {
  const baseUrl = 'https://aigenlabs.vn';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
  ];
}
