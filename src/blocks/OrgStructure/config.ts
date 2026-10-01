import type { Block } from 'payload'

export const OrgStructureBlock: Block = {
  slug: 'orgStructure',
  interfaceName: 'OrgStructureBlock',
  labels: { singular: 'Organization Structure', plural: 'Organization Structures' },
  fields: [
    {
      name: 'title',
      type: 'text',
      defaultValue: 'Organization Structure',
    },
    {
      name: 'members',
      type: 'array',
      labels: { singular: 'Member', plural: 'Members' },
      fields: [
        { name: 'name', type: 'text', required: true, label: 'Name' },
        { name: 'position', type: 'text', required: true, label: 'Position' },
        { name: 'photo', type: 'upload', relationTo: 'media', label: 'Photo' },
        { name: 'order', type: 'number', label: 'Display Order' },
      ],
    },
  ],
}
