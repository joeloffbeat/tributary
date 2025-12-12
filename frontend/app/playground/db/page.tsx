'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import {
  Database,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Download,
  Play,
  BarChart3,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react'
// API client functions
async function fetchTables() {
  const res = await fetch('/api/db?action=tables')
  const json = await res.json()
  return json.data
}

async function fetchTableData(tableName: string, page: number, limit: number, search?: string) {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : ''
  const res = await fetch(`/api/db?action=table-data&tableName=${tableName}&page=${page}&limit=${limit}${searchParam}`)
  const json = await res.json()
  return json.data
}

async function fetchStats() {
  const res = await fetch('/api/db?action=stats')
  const json = await res.json()
  return json.data
}

async function initSeed() {
  const res = await fetch('/api/db?action=init-seed')
  const json = await res.json()
  return json.seeded
}

export interface TableInfo {
  name: string
  count: number
  columns: ColumnInfo[]
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
}

export interface TableRow {
  [key: string]: any
}
import { AddRowDialog } from './components/add-row-dialog'
import { EditRowDialog } from './components/edit-row-dialog'
import { QueryDialog } from './components/query-dialog'

export default function DatabasePage() {
  const [tables, setTables] = useState<TableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tableData, setTableData] = useState<TableRow[]>([])
  const [totalRows, setTotalRows] = useState(0)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [rowsPerPage] = useState(20)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showQueryDialog, setShowQueryDialog] = useState(false)
  const [editingRow, setEditingRow] = useState<TableRow | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadTables()
    loadStats()

    // Initialize database with seed data if empty
    initSeed().then((seeded) => {
      if (seeded) {
        // Reload data after seeding
        setTimeout(() => {
          loadTables()
          loadStats()
        }, 1000)
      }
    })
  }, [])

  useEffect(() => {
    if (selectedTable) {
      loadTableData()
    }
  }, [selectedTable, currentPage, searchTerm])

  const loadTables = async () => {
    try {
      const tablesData = await fetchTables()
      setTables(tablesData)

      // Select first table if none selected
      if (!selectedTable && tablesData.length > 0) {
        setSelectedTable(tablesData[0].name)
      }
    } catch (error) {
      console.error('Error loading tables:', error)
    }
  }

  const loadTableData = async () => {
    if (!selectedTable) return

    setLoading(true)
    try {
      const result = await fetchTableData(selectedTable, currentPage, rowsPerPage, searchTerm)

      setTableData(result.data)
      setTotalRows(result.totalCount)
    } catch (error) {
      console.error('Error loading table data:', error)
      setTableData([])
      setTotalRows(0)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const dbStats = await fetchStats()
      setStats(dbStats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleRefresh = () => {
    loadTables()
    loadTableData()
    loadStats()
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(0)
  }

  const handleEditRow = (row: TableRow) => {
    setEditingRow(row)
    setShowEditDialog(true)
  }

  const handleRowAction = () => {
    loadTableData()
    loadTables()
    loadStats()
  }

  const exportTableToCSV = () => {
    if (!selectedTable || tableData.length === 0) return

    const currentTable = tables.find(t => t.name === selectedTable)
    if (!currentTable) return

    const headers = currentTable.columns.map(col => col.name).join(',')
    const rows = tableData.map(row =>
      currentTable.columns.map(col => {
        const value = row[col.name]
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
    link.download = `${selectedTable}_export.csv`
    link.click()
  }

  const totalPages = Math.ceil(totalRows / rowsPerPage)

  const selectedTableInfo = tables.find(t => t.name === selectedTable)

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Database Explorer</h1>
          <p className="text-muted-foreground">Explore and manage your local SQLite database</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowQueryDialog(true)}>
            <Play className="h-4 w-4 mr-2" />
            Run Query
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Database Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalTables}</div>
                  <p className="text-xs text-muted-foreground">Tables</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{stats.totalRows.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Rows</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{stats.databaseSize}</div>
                  <p className="text-xs text-muted-foreground">Database Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{selectedTable ? tableData.length : 0}</div>
                  <p className="text-xs text-muted-foreground">Current View</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tables Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Tables</CardTitle>
            <CardDescription>
              {tables.length} tables in database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {tables.map((table) => (
                  <div
                    key={table.name}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTable === table.name
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedTable(table.name)
                      setCurrentPage(0)
                      setSearchTerm('')
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{table.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {table.count} rows, {table.columns.length} columns
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedTable && selectedTableInfo ? (
            <Tabs defaultValue="data" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                </TabsList>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Row
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportTableToCSV}
                    disabled={tableData.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <TabsContent value="data" className="space-y-4">
                {/* Search and Filters */}
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={`Search in ${selectedTable}...`}
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Badge variant="outline">
                    {totalRows} rows
                  </Badge>
                </div>

                {/* Data Table */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5" />
                      <span>{selectedTable}</span>
                      {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tableData.length > 0 ? (
                      <div className="space-y-4">
                        <ScrollArea className="w-full rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {selectedTableInfo.columns.map((column) => (
                                  <TableHead key={column.name} className="min-w-[120px]">
                                    <div className="flex items-center space-x-1">
                                      <span>{column.name}</span>
                                      {column.primaryKey && (
                                        <Badge variant="outline" className="text-xs">PK</Badge>
                                      )}
                                    </div>
                                  </TableHead>
                                ))}
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tableData.map((row, index) => (
                                <TableRow key={index}>
                                  {selectedTableInfo.columns.map((column) => {
                                    const value = row[column.name]
                                    let displayValue = value

                                    if (value === null || value === undefined) {
                                      displayValue = <span className="text-muted-foreground italic">null</span>
                                    } else if (typeof value === 'string' && value.length > 50) {
                                      displayValue = value.substring(0, 50) + '...'
                                    } else if (typeof value === 'object') {
                                      displayValue = JSON.stringify(value)
                                    }

                                    return (
                                      <TableCell key={column.name} className="font-mono text-sm">
                                        <span title={String(value || '')}>
                                          {displayValue}
                                        </span>
                                      </TableCell>
                                    )
                                  })}
                                  <TableCell>
                                    <div className="flex space-x-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditRow(row)}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Showing {currentPage * rowsPerPage + 1} to{' '}
                              {Math.min((currentPage + 1) * rowsPerPage, totalRows)} of {totalRows} entries
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>

                              <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={currentPage === pageNum ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => setCurrentPage(pageNum)}
                                      className="w-8 h-8 p-0"
                                    >
                                      {pageNum + 1}
                                    </Button>
                                  )
                                })}
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage === totalPages - 1}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="h-8 w-8 mx-auto mb-2" />
                        <p>No data found</p>
                        {searchTerm && (
                          <p className="text-sm">Try adjusting your search terms</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schema">
                <Card>
                  <CardHeader>
                    <CardTitle>Schema: {selectedTable}</CardTitle>
                    <CardDescription>
                      Table structure and column definitions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Column Name</TableHead>
                          <TableHead>Data Type</TableHead>
                          <TableHead>Nullable</TableHead>
                          <TableHead>Primary Key</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTableInfo.columns.map((column) => (
                          <TableRow key={column.name}>
                            <TableCell className="font-mono">{column.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{column.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={column.nullable ? "secondary" : "destructive"}>
                                {column.nullable ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={column.primaryKey ? "default" : "secondary"}>
                                {column.primaryKey ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-lg">Select a table to view data</p>
                  <p>Choose from the list on the left to explore table contents</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddRowDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        tableName={selectedTable}
        tableInfo={selectedTableInfo}
        onSuccess={handleRowAction}
      />

      <EditRowDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        tableName={selectedTable}
        tableInfo={selectedTableInfo}
        row={editingRow}
        onSuccess={handleRowAction}
      />

      <QueryDialog
        open={showQueryDialog}
        onOpenChange={setShowQueryDialog}
      />
    </div>
  )
}