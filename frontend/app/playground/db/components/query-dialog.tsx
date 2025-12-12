'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Play, Download, Copy, Clock, Database } from 'lucide-react'
export interface TableRow {
  [key: string]: any
}

async function executeQueryAPI(query: string): Promise<TableRow[]> {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'query', query })
  })
  const json = await res.json()
  if (!json.success) {
    throw new Error(json.error || 'Failed to execute query')
  }
  return json.data
}

interface QueryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const exampleQueries = [
  {
    title: 'All Users with ENS Names',
    query: 'SELECT wallet_address, ens_name FROM users WHERE ens_name IS NOT NULL;'
  },
  {
    title: 'Transaction Summary by Status',
    query: 'SELECT status, COUNT(*) as count, SUM(CAST(value AS REAL)) as total_value FROM transactions GROUP BY status;'
  },
  {
    title: 'Top Token Holders',
    query: 'SELECT u.ens_name, t.symbol, t.balance FROM tokens t JOIN users u ON t.user_id = u.id ORDER BY CAST(t.balance AS REAL) DESC LIMIT 10;'
  },
  {
    title: 'DeFi Positions by Protocol',
    query: 'SELECT protocol, COUNT(*) as positions, AVG(apy) as avg_apy, SUM(value_usd) as total_value FROM defi_positions WHERE is_active = 1 GROUP BY protocol;'
  },
  {
    title: 'Recent User Activities',
    query: 'SELECT u.ens_name, ua.activity_type, ua.description, ua.timestamp FROM user_activities ua JOIN users u ON ua.user_id = u.id ORDER BY ua.timestamp DESC LIMIT 20;'
  },
  {
    title: 'NFT Collection Summary',
    query: 'SELECT contract_address, COUNT(*) as nft_count FROM nfts GROUP BY contract_address ORDER BY nft_count DESC;'
  }
]

export function QueryDialog({ open, onOpenChange }: QueryDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<TableRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])
    setExecutionTime(null)

    const startTime = performance.now()

    try {
      const result = await executeQueryAPI(query.trim())
      const endTime = performance.now()

      setResults(result)
      setExecutionTime(endTime - startTime)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while executing the query')
    } finally {
      setLoading(false)
    }
  }

  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery)
    setResults([])
    setError(null)
    setExecutionTime(null)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportResultsToCSV = () => {
    if (results.length === 0) return

    const headers = Object.keys(results[0]).join(',')
    const rows = results.map(row =>
      Object.values(row).map(value => {
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value || ''
      }).join(',')
    )

    const csvContent = [headers, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'query_results.csv'
    link.click()
  }

  const getColumnNames = () => {
    if (results.length === 0) return []
    return Object.keys(results[0])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>SQL Query Runner</DialogTitle>
          <DialogDescription>
            Execute read-only SQL queries against your local database. Write operations are not allowed for safety.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Query Input and Examples */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">SQL Query</Label>
              <Textarea
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SQL query here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleExecuteQuery}
                disabled={loading || !query.trim()}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {loading ? 'Executing...' : 'Execute Query'}
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(query)}
                disabled={!query.trim()}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Example Queries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Example Queries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {exampleQueries.map((example, index) => (
                  <div key={index} className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-auto p-2"
                      onClick={() => handleExampleQuery(example.query)}
                    >
                      <div className="text-left">
                        <div className="font-medium text-xs">{example.title}</div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {example.query.substring(0, 40)}...
                        </div>
                      </div>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Results Header */}
            {(results.length > 0 || error || executionTime !== null) && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {error ? 'Query Error' : `${results.length} rows returned`}
                    </span>
                  </div>
                  {executionTime !== null && (
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{executionTime.toFixed(2)}ms</span>
                    </div>
                  )}
                </div>

                {results.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportResultsToCSV}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Results Table */}
            {results.length > 0 && (
              <Card className="flex-1 overflow-hidden">
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {getColumnNames().map((column) => (
                            <TableHead key={column} className="min-w-[120px]">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results.map((row, index) => (
                          <TableRow key={index}>
                            {getColumnNames().map((column) => {
                              const value = row[column]
                              let displayValue = value

                              if (value === null || value === undefined) {
                                displayValue = <span className="text-muted-foreground italic">null</span>
                              } else if (typeof value === 'string' && value.length > 50) {
                                displayValue = value.substring(0, 50) + '...'
                              } else if (typeof value === 'object') {
                                displayValue = JSON.stringify(value)
                              }

                              return (
                                <TableCell key={column} className="font-mono text-sm">
                                  <span title={String(value || '')}>
                                    {displayValue}
                                  </span>
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!error && results.length === 0 && !loading && query.trim() && (
              <Card className="flex-1">
                <CardContent className="pt-8">
                  <div className="text-center text-muted-foreground">
                    <Database className="h-8 w-8 mx-auto mb-2" />
                    <p>No results returned</p>
                    <p className="text-sm">Your query executed successfully but returned no rows</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Initial State */}
            {!query.trim() && results.length === 0 && !error && (
              <Card className="flex-1">
                <CardContent className="pt-8">
                  <div className="text-center text-muted-foreground">
                    <Play className="h-8 w-8 mx-auto mb-2" />
                    <p>Ready to execute queries</p>
                    <p className="text-sm">Enter a SQL query or try one of the examples</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}