/** @type {import('next-sitemap').IConfig} */
const NextSitemapConfig = {
  siteUrl: process.env.SITE_DOMAIN,
  generateRobotsTxt: true,
};

module.exports = NextSitemapConfig;
