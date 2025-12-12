'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Trash2 } from 'lucide-react'
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

async function updateRowAPI(tableName: string, id: string | number, data: Record<string, any>, idColumn: string = 'id'): Promise<boolean> {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update', tableName, id, data, idColumn })
  })
  const json = await res.json()
  return json.success
}

async function deleteRowAPI(tableName: string, id: string | number, idColumn: string = 'id'): Promise<boolean> {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', tableName, id, idColumn })
  })
  const json = await res.json()
  return json.success
}

interface EditRowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string | null
  tableInfo: TableInfo | undefined
  row: TableRow | null
  onSuccess: () => void
}

export function EditRowDialog({ open, onOpenChange, tableName, tableInfo, row, onSuccess }: EditRowDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (row && tableInfo) {
      // Initialize form with row data
      const initialData: Record<string, any> = {}
      tableInfo.columns.forEach(column => {
        initialData[column.name] = row[column.name]
      })
      setFormData(initialData)
    }
  }, [row, tableInfo])

  if (!tableName || !tableInfo || !row) {
    return null
  }

  // Get the primary key column
  const primaryKeyColumn = tableInfo.columns.find(col => col.primaryKey)
  if (!primaryKeyColumn) {
    return null
  }

  // Get columns that can be edited (exclude auto-generated timestamps)
  const editableColumns = tableInfo.columns.filter(col => {
    const isAutoTimestamp = (col.name.includes('created_at') || col.name.includes('updated_at')) &&
                           col.type.toLowerCase().includes('datetime')
    return !isAutoTimestamp
  })

  const handleInputChange = (columnName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [columnName]: value
    }))

    // Clear error for this field
    if (errors[columnName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[columnName]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    editableColumns.forEach(column => {
      const value = formData[column.name]

      // Check required fields
      if (!column.nullable && (value === null || value === undefined || value === '')) {
        newErrors[column.name] = 'This field is required'
        return
      }

      // Type validation
      if (value !== null && value !== undefined && value !== '') {
        const lowerType = column.type.toLowerCase()

        if (lowerType.includes('int') && isNaN(Number(value))) {
          newErrors[column.name] = 'Must be a number'
        } else if (lowerType.includes('real') && isNaN(Number(value))) {
          newErrors[column.name] = 'Must be a decimal number'
        } else if (lowerType.includes('bool') && typeof value !== 'boolean') {
          newErrors[column.name] = 'Must be true or false'
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // Prepare data for update (exclude primary key)
      const updateData: Record<string, any> = {}

      editableColumns.forEach(column => {
        if (column.primaryKey) {
          return // Skip primary key
        }

        const value = formData[column.name]

        if (value === null || value === undefined || value === '') {
          if (column.nullable) {
            updateData[column.name] = null
          }
        } else {
          const lowerType = column.type.toLowerCase()

          if (lowerType.includes('int')) {
            updateData[column.name] = parseInt(value, 10)
          } else if (lowerType.includes('real')) {
            updateData[column.name] = parseFloat(value)
          } else if (lowerType.includes('bool')) {
            updateData[column.name] = value
          } else {
            updateData[column.name] = value
          }
        }
      })

      const success = await updateRowAPI(tableName, row[primaryKeyColumn.name], updateData, primaryKeyColumn.name)

      if (success) {
        onSuccess()
        onOpenChange(false)
      } else {
        setErrors({ _general: 'Failed to update row. Please check your data and try again.' })
      }
    } catch (error) {
      setErrors({ _general: error instanceof Error ? error.message : 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this row? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const success = await deleteRowAPI(tableName, row[primaryKeyColumn.name], primaryKeyColumn.name)

      if (success) {
        onSuccess()
        onOpenChange(false)
      } else {
        setErrors({ _general: 'Failed to delete row. Please try again.' })
      }
    } catch (error) {
      setErrors({ _general: error instanceof Error ? error.message : 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({})
    setErrors({})
  }

  const renderInput = (column: any) => {
    const value = formData[column.name] || ''
    const lowerType = column.type.toLowerCase()

    // Make primary key readonly
    if (column.primaryKey) {
      return (
        <Input
          id={column.name}
          value={value}
          disabled
          className="bg-muted"
        />
      )
    }

    if (lowerType.includes('bool')) {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={column.name}
            checked={formData[column.name] || false}
            onCheckedChange={(checked) => handleInputChange(column.name, checked)}
          />
          <Label htmlFor={column.name}>
            {formData[column.name] ? 'True' : 'False'}
          </Label>
        </div>
      )
    }

    if (lowerType.includes('text') && column.name.includes('metadata')) {
      return (
        <Textarea
          id={column.name}
          value={value}
          onChange={(e) => handleInputChange(column.name, e.target.value)}
          placeholder={`Enter ${column.name}...`}
          className={`min-h-[100px] ${errors[column.name] ? 'border-red-500' : ''}`}
        />
      )
    }

    return (
      <Input
        id={column.name}
        type={lowerType.includes('int') || lowerType.includes('real') ? 'number' : 'text'}
        step={lowerType.includes('real') ? 'any' : undefined}
        value={value}
        onChange={(e) => handleInputChange(column.name, e.target.value)}
        placeholder={`Enter ${column.name}...`}
        className={errors[column.name] ? 'border-red-500' : ''}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm()
      onOpenChange(open)
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Row in {tableName}</DialogTitle>
          <DialogDescription>
            Modify the values for this row. Primary key fields are read-only.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors._general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors._general}</AlertDescription>
            </Alert>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {editableColumns.map((column) => (
              <div key={column.name} className="space-y-2">
                <Label htmlFor={column.name}>
                  {column.name}
                  {!column.nullable && !column.primaryKey && <span className="text-red-500 ml-1">*</span>}
                  <span className="text-xs text-muted-foreground ml-2">
                    ({column.type})
                    {column.primaryKey && ' - Primary Key'}
                  </span>
                </Label>

                {renderInput(column)}

                {errors[column.name] && (
                  <p className="text-sm text-red-500">{errors[column.name]}</p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Row
            </Button>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}