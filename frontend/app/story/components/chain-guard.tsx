'use client'

import { AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useStoryChain } from '../hooks'

interface ChainGuardProps {
  children: React.ReactNode
}

export function ChainGuard({ children }: ChainGuardProps) {
  const { isOnStoryChain, needsSwitch, switchToStory, storyChainName } = useStoryChain()

  if (needsSwitch) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">Wrong Network</CardTitle>
          </div>
          <CardDescription>
            Story Protocol operations require you to be on {storyChainName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={switchToStory} className="w-full">
            Switch to {storyChainName}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
