export const relativizeSeoUrl = (seoUrl: string) => {
  const url = seoUrl.replace(/\/?$/, '')
  return url.startsWith('/') ? url.slice(1) : url
}

export const absolutizeSeoUrl = (seoUrl: string) => {
  return `/${relativizeSeoUrl(seoUrl)}`
}
