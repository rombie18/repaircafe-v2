/** @type {import('next-sitemap').IConfig} */
const NextSitemapConfig = {
  siteUrl: process.env.SITE_DOMAIN,
  generateIndexSitemap: false,
  generateRobotsTxt: true,
};

module.exports = NextSitemapConfig;
