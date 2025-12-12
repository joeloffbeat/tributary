'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, ArrowRight, Upload, X, ImageIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IP_CATEGORIES, MIN_PRICE_USDC, MAX_PRICE_USDC } from '../../constants'
import type { IPAsset } from '@/lib/types/story'
import type { CreateListingParams, IPCategory } from '../../types'

interface StepSetPricingProps {
  selectedIP: IPAsset
  initialParams: Partial<CreateListingParams>
  onSubmit: (params: Partial<CreateListingParams>) => void
  onBack: () => void
}

export function StepSetPricing({
  selectedIP,
  initialParams,
  onSubmit,
  onBack,
}: StepSetPricingProps) {
  const [title, setTitle] = useState(
    initialParams.title ||
      selectedIP.nftMetadata?.name ||
      selectedIP.metadata?.name ||
      selectedIP.name ||
      ''
  )
  const [description, setDescription] = useState(
    initialParams.description || selectedIP.metadata?.description || ''
  )
  const [category, setCategory] = useState<IPCategory>(initialParams.category || 'other')
  const [pricePerUse, setPricePerUse] = useState(initialParams.pricePerUse || '')
  const [assetFile, setAssetFile] = useState<File | null>(initialParams.assetFile || null)
  const [imageFile, setImageFile] = useState<File | null>(initialParams.imageFile || null)
  const [licenseType, setLicenseType] = useState<CreateListingParams['licenseType']>(
    initialParams.licenseType || 'commercial_use'
  )

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!pricePerUse) {
      newErrors.pricePerUse = 'Price is required'
    } else {
      const price = parseFloat(pricePerUse)
      if (isNaN(price) || price < parseFloat(MIN_PRICE_USDC)) {
        newErrors.pricePerUse = `Minimum price is ${MIN_PRICE_USDC} USDC`
      } else if (price > parseFloat(MAX_PRICE_USDC)) {
        newErrors.pricePerUse = `Maximum price is ${MAX_PRICE_USDC} USDC`
      }
    }
    if (!assetFile) {
      newErrors.assetFile = 'Asset file is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [title, description, pricePerUse, assetFile])

  const handleSubmit = () => {
    if (!validateForm()) return

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      pricePerUse,
      assetFile: assetFile!,
      imageFile: imageFile || undefined,
      licenseType,
    })
  }

  const handleAssetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAssetFile(file)
      setErrors((prev) => ({ ...prev, assetFile: '' }))
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImageFile(file)
  }

  return (
    <div className="space-y-6">
      {/* Selected IP Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Selected IP Asset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {selectedIP.nftMetadata?.image?.cachedUrl || selectedIP.metadata?.image ? (
                <img
                  src={selectedIP.nftMetadata?.image?.cachedUrl || selectedIP.metadata?.image}
                  alt="IP"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">
                {selectedIP.nftMetadata?.name || selectedIP.metadata?.name || 'Untitled IP'}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedIP.ipId.slice(0, 10)}...{selectedIP.ipId.slice(-8)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listing Details */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter listing title"
              className="mt-1.5"
            />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your IP asset..."
              rows={3}
              className="mt-1.5"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as IPCategory)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IP_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price per Use (USDC) *</Label>
              <Input
                id="price"
                type="number"
                value={pricePerUse}
                onChange={(e) => setPricePerUse(e.target.value)}
                placeholder="0.00"
                min={MIN_PRICE_USDC}
                max={MAX_PRICE_USDC}
                step="0.01"
                className="mt-1.5"
              />
              {errors.pricePerUse && (
                <p className="text-sm text-destructive mt-1">{errors.pricePerUse}</p>
              )}
            </div>
          </div>

          <div>
            <Label>License Type</Label>
            <Select
              value={licenseType}
              onValueChange={(v) => setLicenseType(v as CreateListingParams['licenseType'])}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commercial_use">Commercial Use</SelectItem>
                <SelectItem value="commercial_remix">Commercial Remix</SelectItem>
                <SelectItem value="non_commercial">Non-Commercial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            label="Asset File *"
            description="The actual IP asset users will receive"
            file={assetFile}
            onChange={handleAssetFileChange}
            onRemove={() => setAssetFile(null)}
            error={errors.assetFile}
          />
          <FileUpload
            label="Preview Image (Optional)"
            description="A preview image for the marketplace"
            file={imageFile}
            onChange={handleImageFileChange}
            onRemove={() => setImageFile(null)}
            accept="image/*"
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleSubmit}>
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

interface FileUploadProps {
  label: string
  description: string
  file: File | null
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
  error?: string
  accept?: string
}

function FileUpload({ label, description, file, onChange, onRemove, error, accept }: FileUploadProps) {
  return (
    <div>
      <Label>{label}</Label>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      {file ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 min-w-0">
            <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground">
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Click to upload</span>
          <input type="file" className="hidden" accept={accept} onChange={onChange} />
        </label>
      )}
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
    </div>
  )
}

export default StepSetPricing
