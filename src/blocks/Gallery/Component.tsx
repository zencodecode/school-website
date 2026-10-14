'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import { cn } from '@/utilities/ui'
import { Media } from '@/components/Media'

import type { GalleryBlock as GalleryBlockProps, Media as MediaType } from '@/payload-types'

type Props = GalleryBlockProps & {
  className?: string
  disableInnerContainer?: boolean
}

type GalleryItem = {
  media: MediaType
  caption?: string | null
}

const gridColsClass: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-2 md:grid-cols-3',
  '4': 'grid-cols-2 md:grid-cols-4',
}

const masonryColsClass: Record<string, string> = {
  '2': 'columns-1 sm:columns-2',
  '3': 'columns-2 md:columns-3',
  '4': 'columns-2 md:columns-4',
}

export const GalleryBlock: React.FC<Props> = (props) => {
  const {
    images,
    layout = 'grid',
    columns = '3',
    enableLightbox = true,
    autoplay = true,
    autoplayInterval = 5000,
    className,
  } = props

  // Hanya ambil gambar yang sudah ter-populate sebagai objek Media.
  const items: GalleryItem[] = (images ?? []).flatMap((item) => {
    const media = item?.image
    if (!media || typeof media !== 'object') return []
    return [{ media, caption: item?.caption }]
  })

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback(
    (index: number) => {
      if (enableLightbox) setLightboxIndex(index)
    },
    [enableLightbox],
  )
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  if (items.length === 0) return null

  const cols = columns || '3'
  const clickableProps = (index: number) =>
    enableLightbox
      ? {
          onClick: () => openLightbox(index),
          role: 'button' as const,
          tabIndex: 0,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openLightbox(index)
            }
          },
          'aria-label': `Perbesar gambar ${index + 1}`,
        }
      : {}

  return (
    <div className={cn('my-8', className)}>
      {/* ---------- GRID ---------- */}
      {layout === 'grid' && (
        <div className={cn('grid gap-3', gridColsClass[cols] ?? gridColsClass['3'])}>
          {items.map((item, i) => (
            <figure
              key={i}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border border-border',
                enableLightbox &&
                  'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              )}
              {...clickableProps(i)}
            >
              <Media
                fill
                imgClassName="object-cover transition-transform duration-500 group-hover:scale-110"
                resource={item.media}
              />
              {item.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-black/60 p-2 text-sm text-white transition-transform duration-300 group-hover:translate-y-0">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* ---------- MASONRY ---------- */}
      {layout === 'masonry' && (
        <div
          className={cn(
            'gap-3 [column-fill:_balance]',
            masonryColsClass[cols] ?? masonryColsClass['3'],
          )}
        >
          {items.map((item, i) => (
            <figure
              key={i}
              className={cn(
                'group relative mb-3 break-inside-avoid overflow-hidden rounded-lg border border-border',
                enableLightbox &&
                  'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              )}
              {...clickableProps(i)}
            >
              <Media
                imgClassName="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                resource={item.media}
              />
              {item.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-black/60 p-2 text-sm text-white transition-transform duration-300 group-hover:translate-y-0">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* ---------- CAROUSEL ---------- */}
      {layout === 'carousel' && (
        <GalleryCarousel
          items={items}
          autoplay={Boolean(autoplay)}
          autoplayInterval={autoplayInterval ?? 5000}
          onImageClick={openLightbox}
          enableLightbox={Boolean(enableLightbox)}
        />
      )}

      {/* ---------- LIGHTBOX ---------- */}
      {enableLightbox && lightboxIndex !== null && (
        <Lightbox items={items} startIndex={lightboxIndex} onClose={closeLightbox} />
      )}
    </div>
  )
}

/* ============================================================
 * Carousel (reuse pola embla seperti di hero)
 * ============================================================ */
const GalleryCarousel: React.FC<{
  items: GalleryItem[]
  autoplay: boolean
  autoplayInterval: number
  enableLightbox: boolean
  onImageClick: (index: number) => void
}> = ({ items, autoplay, autoplayInterval, enableLightbox, onImageClick }) => {
  const autoplayPlugin = useRef(
    Autoplay({ delay: autoplayInterval, stopOnInteraction: false, stopOnMouseEnter: true }),
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    autoplay ? [autoplayPlugin.current] : [],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) autoplayPlugin.current?.stop()
  }, [])

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Galeri gambar"
    >
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex gap-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="relative flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${items.length}`}
            >
              <figure
                className={cn(
                  'group relative aspect-[4/3] overflow-hidden rounded-lg border border-border',
                  enableLightbox && 'cursor-pointer',
                )}
                {...(enableLightbox
                  ? {
                      onClick: () => onImageClick(i),
                      role: 'button',
                      tabIndex: 0,
                      onKeyDown: (e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          onImageClick(i)
                        }
                      },
                      'aria-label': `Perbesar gambar ${i + 1}`,
                    }
                  : {})}
              >
                <Media
                  fill
                  imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                  resource={item.media}
                />
                {item.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-sm text-white">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            </div>
          ))}
        </div>
      </div>

      <button
        aria-label="Sebelumnya"
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/70 hover:scale-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        onClick={scrollPrev}
        type="button"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        aria-label="Berikutnya"
        className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/70 hover:scale-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        onClick={scrollNext}
        type="button"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="mt-4 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            aria-current={i === selectedIndex}
            aria-label={`Ke slide ${i + 1}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i === selectedIndex
                ? 'w-6 bg-primary'
                : 'w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70',
            )}
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}

/* ============================================================
 * Lightbox fullscreen (embla untuk navigasi)
 * ============================================================ */
const Lightbox: React.FC<{
  items: GalleryItem[]
  startIndex: number
  onClose: () => void
}> = ({ items, startIndex, onClose }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex })
  const [selectedIndex, setSelectedIndex] = useState(startIndex)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  // Kunci scroll body & dengarkan keyboard selama lightbox terbuka.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') scrollPrev()
      else if (e.key === 'ArrowRight') scrollNext()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, scrollPrev, scrollNext])

  const current = items[selectedIndex]

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau galeri"
    >
      {/* Header: counter + tombol tutup */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm tabular-nums">
          {selectedIndex + 1} / {items.length}
        </span>
        <button
          aria-label="Tutup"
          className="rounded-full bg-white/10 p-2 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          onClick={onClose}
          type="button"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Area gambar */}
      <div className="relative flex-1 overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {items.map((item, i) => (
            <div className="relative flex-[0_0_100%] min-w-0 h-full" key={i}>
              <div className="relative mx-auto flex h-full w-full items-center justify-center p-4">
                <div className="relative h-full w-full">
                  <Media
                    fill
                    imgClassName="object-contain"
                    resource={item.media}
                    priority={i === startIndex}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Caption */}
      {current?.caption && (
        <div className="px-4 pb-2 text-center text-sm text-white/80">{current.caption}</div>
      )}

      {/* Navigasi */}
      {items.length > 1 && (
        <>
          <button
            aria-label="Sebelumnya"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 hover:scale-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            onClick={scrollPrev}
            type="button"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="Berikutnya"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 hover:scale-110 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            onClick={scrollNext}
            type="button"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  )
}
