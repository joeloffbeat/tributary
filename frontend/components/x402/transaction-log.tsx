'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, X, Loader2 } from 'lucide-react'

export interface LogEntry {
  message: string
  type: 'info' | 'success' | 'error'
  timestamp: Date
}

interface TransactionLogProps {
  logs: LogEntry[]
}

export function TransactionLog({ logs }: TransactionLogProps) {
  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />
      case 'error':
        return <X className="w-4 h-4 text-red-500" />
      default:
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Transaction Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="mt-0.5">{getIcon(log.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm">{log.message}</p>
                    <p className="text-xs text-muted-foreground">{log.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
