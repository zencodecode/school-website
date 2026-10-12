import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

type Column = NonNullable<NonNullable<ContentBlockProps['columns']>[number]>

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const getColumnClasses = (
    size: Column['size'] = 'full',
    alignment: Column['alignment'] = 'left',
  ) => {
    const spanMap: Record<NonNullable<Column['size']>, string> = {
      full: 'col-span-4 lg:col-span-12',
      half: 'col-span-4 md:col-span-2 lg:col-span-6',
      oneThird: 'col-span-4 lg:col-span-4',
      twoThirds: 'col-span-4 lg:col-span-8',
    }

    const startMap: Record<
      'center' | 'right',
      Partial<Record<NonNullable<Column['size']>, string>>
    > = {
      center: {
        half: 'md:col-start-2 lg:col-start-4',
        oneThird: 'lg:col-start-5',
        twoThirds: 'lg:col-start-3',
      },
      right: {
        half: 'md:col-start-3 lg:col-start-7',
        oneThird: 'lg:col-start-9',
        twoThirds: 'lg:col-start-5',
      },
    }

    const currentSize = size || 'full'
    const spanClass = spanMap[currentSize] || spanMap.full
    const startClass =
      alignment && alignment !== 'left' ? startMap[alignment]?.[currentSize] || '' : ''

    return cn(spanClass, startClass)
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size, alignment } = col

            return (
              <div className={getColumnClasses(size, alignment)} key={index}>
                {richText && <RichText data={richText} enableGutter={false} />}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
