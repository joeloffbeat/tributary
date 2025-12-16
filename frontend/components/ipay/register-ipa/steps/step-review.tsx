'use client'

import { useMemo } from 'react'
import { Check, X, ExternalLink, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getIPayChainConfig, isChainSupported } from '@/constants/ipay'
import { SELF_HOSTED_DEPLOYMENTS } from '@/constants/hyperlane/self-hosted'
import type { UseRegisterIPAReturn } from '../hooks/use-register-ipa'

interface StepReviewProps {
  form: UseRegisterIPAReturn
}

function BooleanBadge({ value, trueLabel, falseLabel }: {
  value: boolean
  trueLabel?: string
  falseLabel?: string
}) {
  return value ? (
    <Badge variant="default" className="gap-1">
      <Check className="h-3 w-3" />
      {trueLabel ?? 'Yes'}
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <X className="h-3 w-3" />
      {falseLabel ?? 'No'}
    </Badge>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function ReviewItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function StepReview({ form }: StepReviewProps) {
  const {
    assetFile,
    assetPreviewUrl,
    assetIpfsHash,
    metadata,
    licenseConfig,
    connectedChainId,
    error,
  } = form

  // Use default chain ID 43113 (Fuji) if undefined
  const chainId = connectedChainId ?? 43113

  const selectedChain = useMemo(
    () => getIPayChainConfig(chainId),
    [chainId]
  )

  const deployment = useMemo(
    () => SELF_HOSTED_DEPLOYMENTS[chainId],
    [chainId]
  )

  const isConnectedChainSupported = useMemo(
    () => isChainSupported(chainId) && !!deployment,
    [chainId, deployment]
  )

  const isImage = assetFile?.type.startsWith('image/')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Review & Submit</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review your IP registration details before submitting
        </p>
      </div>

      {/* Connected Chain Info */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Source Chain</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedChain?.displayName || `Chain ${chainId}`}</span>
            {selectedChain?.isTestnet && (
              <Badge variant="outline" className="text-xs">
                Testnet
              </Badge>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Cross-chain registration will be initiated from your connected chain via Hyperlane
        </p>
      </div>

      {!isConnectedChainSupported && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your connected chain ({chainId}) is not supported for iPay. Please switch to Avalanche Fuji, Sepolia, or Polygon Amoy.
          </AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Asset Preview */}
      <ReviewSection title="Asset">
        <div className="flex items-start gap-4">
          {isImage && assetPreviewUrl ? (
            <div className="w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
              <img
                src={assetPreviewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center shrink-0">
              {assetFile?.type.startsWith('image/') ? (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              ) : (
                <FileText className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          )}
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium truncate">{assetFile?.name}</p>
            <p className="text-xs text-muted-foreground">
              {assetFile && `${(assetFile.size / 1024 / 1024).toFixed(2)} MB`}
            </p>
            {assetIpfsHash && (
              <a
                href={`https://ipfs.io/ipfs/${assetIpfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View on IPFS
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </ReviewSection>

      <Separator />

      {/* Metadata */}
      <ReviewSection title="Metadata">
        <ReviewItem label="Title" value={metadata.title} />
        <ReviewItem label="Category" value={metadata.category} />
        <ReviewItem label="Creator" value={metadata.creatorName} />
        {metadata.tags.length > 0 && (
          <div className="flex items-start justify-between text-sm">
            <span className="text-muted-foreground">Tags</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
              {metadata.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </ReviewSection>

      <Separator />

      {/* License Terms */}
      <ReviewSection title="License Terms">
        <ReviewItem
          label="Commercial Use"
          value={<BooleanBadge value={licenseConfig.commercialUse} trueLabel="Allowed" falseLabel="Not Allowed" />}
        />
        {licenseConfig.commercialUse && (
          <>
            <ReviewItem
              label="Commercial Attribution"
              value={<BooleanBadge value={licenseConfig.commercialAttribution} trueLabel="Required" falseLabel="Optional" />}
            />
            <ReviewItem
              label="Revenue Share"
              value={`${licenseConfig.commercialRevShare}%`}
            />
          </>
        )}
        <ReviewItem
          label="Derivatives"
          value={<BooleanBadge value={licenseConfig.derivativesAllowed} trueLabel="Allowed" falseLabel="Not Allowed" />}
        />
        {licenseConfig.derivativesAllowed && (
          <>
            <ReviewItem
              label="Derivative Attribution"
              value={<BooleanBadge value={licenseConfig.derivativesAttribution} trueLabel="Required" falseLabel="Optional" />}
            />
            <ReviewItem
              label="Approval Required"
              value={<BooleanBadge value={licenseConfig.derivativesApproval} />}
            />
            <ReviewItem
              label="Reciprocal License"
              value={<BooleanBadge value={licenseConfig.derivativesReciprocal} />}
            />
          </>
        )}
        <ReviewItem
          label="Minting Fee"
          value={`${licenseConfig.mintingFee || '0'} WIP`}
        />
      </ReviewSection>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  )
}
