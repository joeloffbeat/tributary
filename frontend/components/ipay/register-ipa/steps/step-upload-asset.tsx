'use client'

import { useCallback, useRef } from 'react'
import { Upload, X, Image as ImageIcon, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UseRegisterIPAReturn } from '../hooks/use-register-ipa'

interface StepUploadAssetProps {
  form: UseRegisterIPAReturn
}

const ACCEPTED_TYPES = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
  'audio/*': ['.mp3', '.wav', '.ogg', '.flac'],
  'video/*': ['.mp4', '.webm', '.mov'],
  'application/pdf': ['.pdf'],
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function StepUploadAsset({ form }: StepUploadAssetProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { assetFile, assetPreviewUrl, assetIpfsHash, isUploading, error } = form

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > MAX_FILE_SIZE) {
        form.setError('File size must be less than 50MB')
        return
      }

      form.setAssetFile(file)
    },
    [form]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files?.[0]
      if (!file) return

      if (file.size > MAX_FILE_SIZE) {
        form.setError('File size must be less than 50MB')
        return
      }

      form.setAssetFile(file)
    },
    [form]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const handleUpload = useCallback(async () => {
    await form.uploadAsset()
  }, [form])

  const removeFile = useCallback(() => {
    form.setAssetFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [form])

  const isImage = assetFile?.type.startsWith('image/')

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Upload Your IP Asset</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload the file you want to register as intellectual property
        </p>
      </div>

      {!assetFile ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
            'transition-colors duration-200',
            'hover:border-primary hover:bg-primary/5',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm font-medium mb-1">
            Drop your file here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Images, audio, video, or documents up to 50MB
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 space-y-4">
          {/* Preview */}
          <div className="relative">
            {isImage && assetPreviewUrl ? (
              <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                <img
                  src={assetPreviewUrl}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
                <FileText className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={removeFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* File info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              {isImage ? (
                <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span className="truncate">{assetFile.name}</span>
            </div>
            <span className="text-muted-foreground shrink-0">
              {(assetFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          {/* Upload status */}
          {assetIpfsHash ? (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-600" />
              Uploaded to IPFS
            </div>
          ) : (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading to IPFS...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload to IPFS
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={Object.entries(ACCEPTED_TYPES)
          .flatMap(([type, exts]) => [type, ...exts])
          .join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
