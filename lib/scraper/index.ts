export async function scrapeAmazonProduct(url: string) {
  if (!url) {
    return;
  }

  //BrighData proxy configuration
  const username = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 22225;
  const proxyUrl = String(process.env.BRIGHT_DATA_PROXY);
}
