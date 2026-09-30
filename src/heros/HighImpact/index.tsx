'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

type HeroMedia = NonNullable<Page['hero']['media']>

export const HighImpactHero: React.FC<Page['hero']> = ({
  autoplay,
  autoplayInterval,
  highImpactVariant,
  links,
  media,
  richText,
  slides,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  // Carousel slide images configured in the admin.
  const slideImages: HeroMedia[] = (slides ?? [])
    .map((slide) => slide?.image)
    .filter((image): image is HeroMedia => Boolean(image) && typeof image === 'object')

  // The layout is chosen explicitly in the admin. Fall back to a carousel only
  // when the variant is unset (legacy data) but multiple slides exist.
  const isCarousel =
    highImpactVariant === 'carousel' || (highImpactVariant == null && slideImages.length > 1)

  // Single-image layout uses `media`, falling back to the first slide.
  const singleImage: HeroMedia | undefined =
    media && typeof media === 'object' ? media : slideImages[0]

  return (
    <div
      className="relative -mt-[10.4rem] flex items-center justify-center min-h-[80vh] text-white"
      data-theme="dark"
    >
      {/* Background media sits behind the content and fills the sized hero. */}
      {isCarousel && slideImages.length > 0 ? (
        <HeroCarousel
          autoplay={autoplay ?? true}
          autoplayInterval={autoplayInterval ?? 5000}
          slides={slideImages}
        />
      ) : (
        singleImage && (
          <div className="absolute inset-0 z-0 select-none">
            <Media fill imgClassName="object-cover" priority resource={singleImage} />
          </div>
        )
      )}

      {/* Foreground content overlays the media. `pointer-events-none` lets clicks
          over empty areas fall through to the carousel controls; interactive
          children re-enable pointer events.
          
          Alignment and text size are driven by the Lexical rich text editor —
          the `format` property on the root node determines text-align, and 
          heading tags (h1–h4) are styled by the prose typography plugin. */}
      <div className="container mb-8 z-10 relative flex items-end pointer-events-none">
        <div className="w-full">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex gap-4 pointer-events-auto">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

const HeroCarousel: React.FC<{
  autoplay: boolean
  autoplayInterval: number
  slides: HeroMedia[]
}> = ({ autoplay, autoplayInterval, slides }) => {
  const autoplayPlugin = useRef(
    Autoplay({ delay: autoplayInterval, stopOnInteraction: false, stopOnMouseEnter: true }),
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    autoplay ? [autoplayPlugin.current] : [],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi])

  // Honor users who prefer reduced motion by stopping autoplay.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      autoplayPlugin.current?.stop()
    }
  }, [])

  return (
    <>
      {/* Image track: back layer. */}
      <div
        className="absolute inset-0 z-0 select-none"
        role="region"
        aria-roledescription="carousel"
        aria-label="Hero images"
      >
        <div className="overflow-hidden h-full" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((image, i) => (
              <div
                className="relative flex-[0_0_100%] min-w-0 h-full"
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${slides.length}`}
              >
                <Media fill imgClassName="object-cover" priority={i === 0} resource={image} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls: top layer, above the foreground content so they are clickable. */}
      <button
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        onClick={scrollPrev}
        type="button"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        onClick={scrollNext}
        type="button"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            aria-current={i === selectedIndex}
            aria-label={`Go to slide ${i + 1}`}
            className={
              'h-2.5 w-2.5 rounded-full transition ' +
              (i === selectedIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70')
            }
            key={i}
            onClick={() => scrollTo(i)}
            type="button"
          />
        ))}
      </div>
    </>
  )
}
