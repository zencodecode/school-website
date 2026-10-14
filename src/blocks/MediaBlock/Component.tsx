import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
    alignment,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  // "Float" so surrounding paragraphs wrap beside the media.
  const isFloat = alignment === 'left' || alignment === 'right'

  return (
    <div
      className={cn(
        {
          container: enableGutter && !isFloat,
          // Width capped at ~45% on wide screens; full-width on mobile so it stacks naturally.
          'float-left clear-left mr-6 mb-4 w-full sm:max-w-[45%]': alignment === 'left',
          'float-right clear-right ml-6 mb-4 w-full sm:max-w-[45%]': alignment === 'right',
        },
        className,
      )}
    >
      {(media || staticImage) && (
        <Media
          imgClassName={cn(
            'border border-border rounded-[0.8rem]',
            { 'w-full h-auto': isFloat },
            imgClassName,
          )}
          resource={media}
          src={staticImage}
        />
      )}
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              container: !disableInnerContainer && !isFloat,
            },
            captionClassName,
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </div>
  )
}
