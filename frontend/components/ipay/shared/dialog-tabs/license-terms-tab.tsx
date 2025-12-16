'use client'

import {
  Shield,
  DollarSign,
  GitBranch,
  Clock,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  EnrichedIPAsset,
  StoryLicenseTerms,
} from '@/lib/services/story-api-service'
import {
  getLicenseTypeFromTerms,
  formatMintingFeeFromTerms,
} from '@/lib/services/story-api-service'

interface LicenseTermsTabProps {
  enrichedData: EnrichedIPAsset | null
}

export function LicenseTermsTab({ enrichedData }: LicenseTermsTabProps) {
  const licenseTerms = enrichedData?.licenseTerms || []

  if (licenseTerms.length === 0) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h4 className="text-lg font-medium mb-2">No License Terms</h4>
        <p className="text-sm text-muted-foreground">
          This IP asset has no attached license terms
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {licenseTerms.length} license term{licenseTerms.length > 1 ? 's' : ''} attached
      </p>

      {licenseTerms.map((terms, index) => (
        <LicenseTermsCard key={terms.id || index} terms={terms} index={index} />
      ))}
    </div>
  )
}

function LicenseTermsCard({
  terms,
  index,
}: {
  terms: StoryLicenseTerms
  index: number
}) {
  const licenseType = getLicenseTypeFromTerms(terms)
  const mintingFee = formatMintingFeeFromTerms(terms)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            License #{terms.licenseTermsId || index + 1}
          </CardTitle>
          <Badge variant="outline">{licenseType}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key terms grid */}
        <div className="grid grid-cols-2 gap-3">
          <TermBadge
            label="Commercial Use"
            allowed={terms.commercialUse}
          />
          <TermBadge
            label="Derivatives"
            allowed={terms.derivativesAllowed}
          />
          <TermBadge
            label="Transferable"
            allowed={terms.transferable}
          />
          <TermBadge
            label="Attribution Required"
            allowed={terms.commercialAttribution || terms.derivativesAttribution}
          />
        </div>

        {/* Fees and details */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Minting Fee
            </span>
            <span className="font-medium">{mintingFee}</span>
          </div>

          {terms.commercialRevShare > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Revenue Share
              </span>
              <span className="font-medium">
                {(terms.commercialRevShare / 1_000_000).toFixed(1)}%
              </span>
            </div>
          )}

          {terms.expiration && terms.expiration !== '0' && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Expires
              </span>
              <span className="font-medium">
                {formatExpiration(terms.expiration)}
              </span>
            </div>
          )}
        </div>

        {/* Derivative conditions */}
        {terms.derivativesAllowed && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Derivative Conditions</p>
            <div className="flex flex-wrap gap-2">
              {terms.derivativesApproval && (
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Approval Required
                </Badge>
              )}
              {terms.derivativesReciprocal && (
                <Badge variant="secondary" className="text-xs">
                  <GitBranch className="h-3 w-3 mr-1" />
                  Reciprocal
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TermBadge({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
        allowed
          ? 'bg-green-500/10 text-green-500'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {allowed ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span>{label}</span>
    </div>
  )
}

function formatExpiration(expiration: string): string {
  if (expiration === '0') return 'Never'
  try {
    const date = new Date(parseInt(expiration) * 1000)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return expiration
  }
}
