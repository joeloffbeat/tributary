'use client'

import { useCallback, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { IP_TYPES } from '@/constants/protocols/story'
import type { UseRegisterIPAReturn } from '../hooks/use-register-ipa'

interface StepIPMetadataProps {
  form: UseRegisterIPAReturn
}

export function StepIPMetadata({ form }: StepIPMetadataProps) {
  const { metadata, setMetadata, error } = form
  const [tagInput, setTagInput] = useState('')

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !metadata.tags.includes(tag)) {
      setMetadata({ tags: [...metadata.tags, tag] })
      setTagInput('')
    }
  }, [tagInput, metadata.tags, setMetadata])

  const removeTag = useCallback(
    (tag: string) => {
      setMetadata({ tags: metadata.tags.filter((t) => t !== tag) })
    },
    [metadata.tags, setMetadata]
  )

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag()
      }
    },
    [addTag]
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">IP Asset Metadata</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Provide details about your intellectual property
        </p>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="Enter a title for your IP asset"
            value={metadata.title}
            onChange={(e) => setMetadata({ title: e.target.value })}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            {metadata.title.length}/100 characters
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe your IP asset..."
            value={metadata.description}
            onChange={(e) => setMetadata({ description: e.target.value })}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground">
            {metadata.description.length}/500 characters
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={metadata.category}
            onValueChange={(value) => setMetadata({ category: value as typeof metadata.category })}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {IP_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Creator Name */}
        <div className="space-y-2">
          <Label htmlFor="creatorName">
            Creator Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="creatorName"
            placeholder="Your name or pseudonym"
            value={metadata.creatorName}
            onChange={(e) => setMetadata({ creatorName: e.target.value })}
            maxLength={50}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              maxLength={30}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {metadata.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Add up to 10 tags to help others discover your IP
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
    </div>
  )
}
