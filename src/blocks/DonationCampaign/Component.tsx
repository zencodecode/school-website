import React from 'react'
import type { DonationCampaignBlock as DonationCampaignProps } from '@/payload-types'
import Link from 'next/link'

const formatCurrency = (amount: number) => `Rp ${amount.toLocaleString('id-ID')}`

export const DonationCampaignBlock: React.FC<DonationCampaignProps & { id?: string }> = (props) => {
  const {
    id,
    badge,
    heading,
    description,
    targetAmount,
    collectedAmount,
    donorCount,
    auditInfo,
    donationOptions,
    bankInfo,
    ctaLabel,
    ctaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
  } = props

  const percentage =
    targetAmount > 0 ? Math.min(Math.round((collectedAmount / targetAmount) * 100), 100) : 0

  return (
    <section className="w-full py-20" id={id ?? undefined}>
      <div className="container">
        <div className="bg-background border border-border rounded-xl p-8 lg:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left column — Campaign info */}
            <div className="lg:col-span-7">
              {badge && (
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-accent/20 text-accent-foreground font-semibold inline-block">
                  {badge}
                </span>
              )}
              {heading && (
                <h2 className="font-headline text-headline-lg font-bold mt-4">{heading}</h2>
              )}
              {description && (
                <p className="text-body-md text-muted-foreground leading-relaxed mt-3">
                  {description}
                </p>
              )}

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between font-mono text-xs mb-2">
                  <span className="font-semibold">
                    Terkumpul: {formatCurrency(collectedAmount)}
                  </span>
                  <span className="text-accent-foreground font-bold">
                    Target: {formatCurrency(targetAmount)} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {(donorCount !== undefined || auditInfo) && (
                  <div className="flex justify-between text-[11px] font-mono mt-2 text-muted-foreground">
                    {donorCount !== undefined && donorCount !== null && (
                      <span>{donorCount.toLocaleString('id-ID')} Donatur Terverifikasi</span>
                    )}
                    {auditInfo && <span>{auditInfo}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Right column — Quick donation */}
            <div className="lg:col-span-5">
              <div className="bg-card border border-border rounded-lg p-6 flex flex-col gap-4 shadow-sm">
                <h3 className="font-mono text-xs uppercase font-semibold tracking-wider">
                  Salurkan Wakaf Tunai Cepat
                </h3>

                {donationOptions && donationOptions.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {donationOptions.map((opt, i) => (
                      <div
                        key={i}
                        className={`py-2 px-3 border rounded text-center font-mono text-xs font-semibold cursor-pointer transition-colors ${
                          opt.isHighlighted
                            ? 'border-accent bg-muted text-accent-foreground'
                            : 'border-border hover:border-accent hover:bg-muted'
                        }`}
                      >
                        {formatCurrency(opt.amount)}
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={ctaUrl || '#'}
                  className="w-full py-3 bg-accent hover:bg-accent/80 text-accent-foreground rounded text-center font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                  {ctaLabel || 'Wakaf Sekarang'}
                </Link>

                {secondaryCtaLabel && secondaryCtaUrl && (
                  <Link
                    href={secondaryCtaUrl}
                    className="w-full py-2.5 bg-background border border-border hover:bg-muted rounded text-center text-xs font-medium transition-colors"
                  >
                    {secondaryCtaLabel}
                  </Link>
                )}

                {bankInfo && (
                  <p className="text-[11px] font-mono text-muted-foreground text-center mt-2">
                    {bankInfo}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
