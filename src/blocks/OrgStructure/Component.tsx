import { Media } from '@/components/Media'
import type { OrgStructureBlock as OrgStructureBlockProps } from '@/payload-types'

export const OrgStructureBlock: React.FC<OrgStructureBlockProps> = ({ title, members }) => {
  const sorted = [...(members ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div className="container my-16">
      {title && <h2 className="mb-8 text-center">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {sorted.map((member, i) => (
          <div
            key={i}
            className="bg-card border border-border/80 rounded-2xl p-6 text-center hover:border-primary/60 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 group shadow-xs relative overflow-hidden"
          >
            {/* Top accent shine on hover */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {member.photo && typeof member.photo === 'object' && (
              <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-primary/15 group-hover:ring-8 group-hover:ring-primary/30 transition-all duration-500 shadow-sm relative">
                <Media
                  resource={member.photo}
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            )}
            <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
              {member.name}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{member.position}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
