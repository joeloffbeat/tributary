'use client'

import { Tag, GitBranch, AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StoryIPAsset } from '@/lib/services/story-api-service'
import { STORY_EXPLORER } from '@/constants/protocols/story'

interface IPAssetActionsTabProps {
  asset: StoryIPAsset
  onListForSale?: (asset: StoryIPAsset) => void
  onCreateDerivative?: (asset: StoryIPAsset) => void
  onRaiseDispute?: (asset: StoryIPAsset) => void
}

export function IPAssetActionsTab({
  asset,
  onListForSale,
  onCreateDerivative,
  onRaiseDispute,
}: IPAssetActionsTabProps) {
  // Check if derivatives are allowed based on license terms
  const canCreateDerivative = asset.licenses?.some(
    (license) => license.terms.derivativesAllowed
  ) ?? false

  const hasLicenseTerms = (asset.licenses?.length ?? 0) > 0

  return (
    <div className="space-y-4">
      {/* List for Sale */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Tag className="h-4 w-4" />
            List for Sale
          </CardTitle>
          <CardDescription>
            List your IP asset license on the marketplace for others to purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasLicenseTerms ? (
            <Button
              className="w-full"
              onClick={() => onListForSale?.(asset)}
              disabled={!onListForSale}
            >
              <Tag className="h-4 w-4 mr-2" />
              List License for Sale
            </Button>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                You need to attach license terms before listing
              </p>
              <Button variant="outline" asChild>
                <a
                  href={`${STORY_EXPLORER}/ipa/${asset.ipId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Attach License on Explorer
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Derivative */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Create Derivative
          </CardTitle>
          <CardDescription>
            Create a new IP asset that derives from this one
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canCreateDerivative ? (
            <Button
              className="w-full"
              variant="secondary"
              onClick={() => onCreateDerivative?.(asset)}
              disabled={!onCreateDerivative}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Create Derivative Work
            </Button>
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {hasLicenseTerms ? (
                <p>Derivatives are not allowed under the current license terms</p>
              ) : (
                <p>No license terms attached to determine derivative permissions</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raise Dispute */}
      <Card className="border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Raise Dispute
          </CardTitle>
          <CardDescription>
            Report infringement or raise a dispute against this IP asset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            variant="destructive"
            onClick={() => onRaiseDispute?.(asset)}
            disabled={!onRaiseDispute}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Raise Dispute
          </Button>
        </CardContent>
      </Card>

      {/* Info note */}
      <p className="text-xs text-muted-foreground text-center pt-2">
        Some actions may require additional transactions and gas fees
      </p>
    </div>
  )
}
