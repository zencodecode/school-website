import React from 'react'

import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'

import type { MediaWithTextBlock as MediaWithTextBlockProps } from '@/payload-types'

type Props = MediaWithTextBlockProps & {
  className?: string
  disableInnerContainer?: boolean
}

const mediaWidthClasses: Record<string, string> = {
  oneThird: 'md:w-1/3',
  half: 'md:w-1/2',
  twoThirds: 'md:w-2/3',
}

export const MediaWithTextBlock: React.FC<Props> = (props) => {
  const {
    media,
    richText,
    mediaPosition = 'left',
    mediaWidth = 'half',
    verticalAlignment = 'center',
    className,
  } = props

  const mediaCol = mediaWidthClasses[mediaWidth || 'half'] ?? 'md:w-1/2'

  return (
    <div className={cn('my-8', className)}>
      <div
        className={cn('flex flex-col gap-6 md:flex-row', {
          'md:flex-row-reverse': mediaPosition === 'right',
          'md:items-center': verticalAlignment === 'center',
          'md:items-start': verticalAlignment === 'start',
        })}
      >
        <div className={cn('w-full', mediaCol)}>
          {media && typeof media === 'object' && (
            <Media
              resource={media}
              imgClassName="w-full h-auto rounded-[0.8rem] border border-border"
            />
          )}
        </div>
        <div className="w-full md:flex-1">
          {richText && <RichText data={richText} enableGutter={false} />}
        </div>
      </div>
    </div>
  )
}
