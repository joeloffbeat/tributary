'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Check } from 'lucide-react'

interface PaymentCardProps {
  tier: string
  price: string
  description: string
  features?: string[]
  onPayClick: () => void
  isPaying: boolean
}

export function PaymentCard({
  tier,
  price,
  description,
  features,
  onPayClick,
  isPaying,
}: PaymentCardProps) {
  return (
    <Card className="w-full max-w-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{tier}</CardTitle>
          <Badge variant={tier === 'Premium' ? 'default' : 'secondary'}>
            {tier === 'Premium' ? 'Hot' : 'Popular'}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-4">
          {price} <span className="text-sm text-muted-foreground">USDC</span>
        </div>
        {features && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm">
                <Check className="w-4 h-4 mr-2 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onPayClick} disabled={isPaying}>
          {isPaying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Pay Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
