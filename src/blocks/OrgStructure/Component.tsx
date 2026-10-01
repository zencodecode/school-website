import { Media } from '@/components/Media'
import type { OrgStructureBlock as OrgStructureBlockProps } from '@/payload-types'

export const OrgStructureBlock: React.FC<OrgStructureBlockProps> = ({ title, members }) => {
  const sorted = [...(members ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div className="container my-16">
      {title && <h2 className="mb-8 text-center">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {sorted.map((member, i) => (
          <div key={i} className="text-center">
            {member.photo && typeof member.photo === 'object' && (
              <Media resource={member.photo} className="rounded-full mx-auto mb-3 w-32 h-32" />
            )}
            <p className="font-semibold">{member.name}</p>
            <p className="text-sm text-muted-foreground">{member.position}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
