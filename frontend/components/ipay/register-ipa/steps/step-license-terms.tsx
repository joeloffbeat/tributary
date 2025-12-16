'use client'

import { Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { UseRegisterIPAReturn } from '../hooks/use-register-ipa'

interface StepLicenseTermsProps {
  form: UseRegisterIPAReturn
}

interface LicenseToggleProps {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
}

function LicenseToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: LicenseToggleProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 p-4 rounded-lg border',
        'transition-colors',
        checked ? 'border-primary bg-primary/5' : 'border-border',
        disabled && 'opacity-50'
      )}
    >
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}

export function StepLicenseTerms({ form }: StepLicenseTermsProps) {
  const { licenseConfig, setLicenseConfig, error } = form

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">License Terms</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure PIL (Programmable IP License) terms for your asset
        </p>
      </div>

      <div className="space-y-4">
        {/* Commercial Use */}
        <LicenseToggle
          id="commercialUse"
          label="Commercial Use"
          description="Allow others to use your IP for commercial purposes"
          checked={licenseConfig.commercialUse}
          onCheckedChange={(checked) =>
            setLicenseConfig({
              commercialUse: checked,
              // Reset commercial settings if disabled
              ...(checked ? {} : { commercialRevShare: 0 }),
            })
          }
        />

        {/* Commercial Attribution */}
        {licenseConfig.commercialUse && (
          <LicenseToggle
            id="commercialAttribution"
            label="Require Attribution (Commercial)"
            description="Require attribution when used commercially"
            checked={licenseConfig.commercialAttribution}
            onCheckedChange={(checked) =>
              setLicenseConfig({ commercialAttribution: checked })
            }
          />
        )}

        {/* Commercial Revenue Share */}
        {licenseConfig.commercialUse && (
          <div className="p-4 rounded-lg border space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Revenue Share</Label>
                <p className="text-xs text-muted-foreground">
                  Percentage of revenue you receive from commercial use
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Revenue share is automatically collected through Story
                      Protocol's royalty system when derivatives earn revenue.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-4">
              <Slider
                value={[licenseConfig.commercialRevShare]}
                onValueChange={([value]) =>
                  setLicenseConfig({ commercialRevShare: value })
                }
                max={50}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-right font-mono text-sm">
                {licenseConfig.commercialRevShare}%
              </span>
            </div>
          </div>
        )}

        {/* Derivatives Allowed */}
        <LicenseToggle
          id="derivativesAllowed"
          label="Allow Derivatives"
          description="Allow others to create derivative works from your IP"
          checked={licenseConfig.derivativesAllowed}
          onCheckedChange={(checked) =>
            setLicenseConfig({
              derivativesAllowed: checked,
              // Reset derivative settings if disabled
              ...(checked
                ? {}
                : {
                    derivativesAttribution: true,
                    derivativesApproval: false,
                    derivativesReciprocal: false,
                  }),
            })
          }
        />

        {/* Derivatives Attribution */}
        {licenseConfig.derivativesAllowed && (
          <LicenseToggle
            id="derivativesAttribution"
            label="Require Attribution (Derivatives)"
            description="Require attribution in derivative works"
            checked={licenseConfig.derivativesAttribution}
            onCheckedChange={(checked) =>
              setLicenseConfig({ derivativesAttribution: checked })
            }
          />
        )}

        {/* Derivatives Approval */}
        {licenseConfig.derivativesAllowed && (
          <LicenseToggle
            id="derivativesApproval"
            label="Require Approval"
            description="Require your approval before derivatives can be created"
            checked={licenseConfig.derivativesApproval}
            onCheckedChange={(checked) =>
              setLicenseConfig({ derivativesApproval: checked })
            }
          />
        )}

        {/* Derivatives Reciprocal */}
        {licenseConfig.derivativesAllowed && (
          <LicenseToggle
            id="derivativesReciprocal"
            label="Reciprocal License"
            description="Derivatives must use the same license terms"
            checked={licenseConfig.derivativesReciprocal}
            onCheckedChange={(checked) =>
              setLicenseConfig({ derivativesReciprocal: checked })
            }
          />
        )}

        {/* Minting Fee */}
        <div className="p-4 rounded-lg border space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="mintingFee" className="text-sm font-medium">
                Minting Fee (WIP)
              </Label>
              <p className="text-xs text-muted-foreground">
                Fee charged when someone mints a license token
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>
                    WIP is Story Protocol's native token. Users pay this fee to
                    obtain a license to use your IP.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="relative">
            <Input
              id="mintingFee"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={licenseConfig.mintingFee}
              onChange={(e) => setLicenseConfig({ mintingFee: e.target.value })}
              className="pr-14"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              WIP
            </span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  )
}
