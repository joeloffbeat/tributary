'use client'

import { useMediaQuery } from '@/hooks/use-media-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MobileDrawer } from './mobile-drawer'

interface ResponsiveDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function ResponsiveDialog({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ResponsiveDialogProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile) {
    return (
      <MobileDrawer isOpen={isOpen} onClose={onClose} title={title}>
        {children}
      </MobileDrawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={className}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
