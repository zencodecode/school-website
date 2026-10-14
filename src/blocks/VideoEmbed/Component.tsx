import React from 'react'

import { cn } from '@/utilities/ui'
import { getVideoEmbed } from '@/utilities/getVideoEmbed'

export type VideoEmbedBlockProps = {
  url?: string | null
  caption?: string | null
  blockType?: 'videoEmbed'
}

type Props = VideoEmbedBlockProps & {
  className?: string
  disableInnerContainer?: boolean
}

export const VideoEmbedBlock: React.FC<Props> = ({ url, caption, className }) => {
  const video = getVideoEmbed(url)

  if (!video) {
    return null
  }

  const title = caption || (video.provider === 'youtube' ? 'YouTube video player' : 'Vimeo video player')

  return (
    <figure className={cn('mx-auto my-8 w-full', className)}>
      <div className="relative w-full overflow-hidden rounded-[0.8rem] border border-border aspect-video">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={video.embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
