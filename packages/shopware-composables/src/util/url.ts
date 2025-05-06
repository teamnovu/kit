export const cleanSeoUrl = (seoUrl: string) => {
  const url = seoUrl.replace(/\/?$/, '')
  return url.startsWith('/') ? url.slice(1) : url
}
