import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  interfaceName: 'GalleryBlock',
  labels: {
    singular: 'Galeri',
    plural: 'Galeri',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'layout',
          type: 'select',
          defaultValue: 'grid',
          label: 'Tata Letak',
          options: [
            { label: 'Grid (kisi rapi)', value: 'grid' },
            { label: 'Masonry (tinggi bervariasi)', value: 'masonry' },
            { label: 'Carousel (slider)', value: 'carousel' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'columns',
          type: 'select',
          defaultValue: '3',
          label: 'Jumlah Kolom',
          options: [
            { label: '2 Kolom', value: '2' },
            { label: '3 Kolom', value: '3' },
            { label: '4 Kolom', value: '4' },
          ],
          admin: {
            width: '50%',
            description: 'Berlaku untuk tata letak Grid dan Masonry (di layar lebar).',
            condition: (_, siblingData) => siblingData?.layout !== 'carousel',
          },
        },
      ],
    },
    {
      name: 'enableLightbox',
      type: 'checkbox',
      label: 'Aktifkan Lightbox',
      defaultValue: true,
      admin: {
        description: 'Klik gambar untuk membukanya layar penuh dengan navigasi sebelumnya/berikutnya.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'autoplay',
          type: 'checkbox',
          label: 'Autoplay (Carousel)',
          defaultValue: true,
          admin: {
            width: '50%',
            condition: (_, siblingData) => siblingData?.layout === 'carousel',
          },
        },
        {
          name: 'autoplayInterval',
          type: 'number',
          label: 'Interval Autoplay (ms)',
          defaultValue: 5000,
          min: 1000,
          admin: {
            width: '50%',
            step: 500,
            condition: (_, siblingData) =>
              siblingData?.layout === 'carousel' && Boolean(siblingData?.autoplay),
          },
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Gambar',
      minRows: 1,
      labels: {
        singular: 'Gambar',
        plural: 'Gambar',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Keterangan (opsional)',
        },
      ],
    },
  ],
}
