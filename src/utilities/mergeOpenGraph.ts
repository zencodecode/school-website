import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

import { DEFAULT_SITE_NAME } from '@/utilities/getSiteName'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Website resmi Pondok Pesantren Abu Bakar Shiddiq.',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: DEFAULT_SITE_NAME,
  title: DEFAULT_SITE_NAME,
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
