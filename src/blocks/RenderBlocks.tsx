import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { DonationCampaignBlock } from '@/blocks/DonationCampaign/Component'
import { FeatureGridBlock } from '@/blocks/FeatureGrid/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { OrgStructureBlock } from '@/blocks/OrgStructure/Component'
import { ProgramGridBlock } from '@/blocks/ProgramGrid/Component'
import { StatsGridBlock } from '@/blocks/StatsGrid/Component'
import { TestimonialBlock } from '@/blocks/Testimonial/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  donationCampaign: DonationCampaignBlock,
  featureGrid: FeatureGridBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  orgStructure: OrgStructureBlock,
  programGrid: ProgramGridBlock,
  statsGrid: StatsGridBlock,
  testimonial: TestimonialBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className="my-16" key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
