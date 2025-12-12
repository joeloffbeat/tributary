'use client'

import { useState } from 'react'
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
import { AlertCircle } from 'lucide-react'
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

async function insertRowAPI(tableName: string, data: Record<string, any>): Promise<boolean> {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'insert', tableName, data })
  })
  const json = await res.json()
  return json.success
}

interface AddRowDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tableName: string | null
  tableInfo: TableInfo | undefined
  onSuccess: () => void
}

export function AddRowDialog({ open, onOpenChange, tableName, tableInfo, onSuccess }: AddRowDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  if (!tableName || !tableInfo) {
    return null
  }

  // Get columns that can be inserted (exclude auto-generated ones)
  const insertableColumns = tableInfo.columns.filter(col => {
    // Skip auto-generated ID columns and timestamp columns with defaults
    const isAutoId = col.name === 'id' && col.primaryKey
    const isAutoTimestamp = (col.name.includes('created_at') || col.name.includes('updated_at')) &&
                           col.type.toLowerCase().includes('datetime')
    return !isAutoId && !isAutoTimestamp
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

    insertableColumns.forEach(column => {
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
      // Prepare data for insertion
      const insertData: Record<string, any> = {}

      insertableColumns.forEach(column => {
        const value = formData[column.name]

        if (value === null || value === undefined || value === '') {
          if (column.nullable) {
            insertData[column.name] = null
          }
          // Skip non-nullable fields that are empty (they should have been caught by validation)
        } else {
          const lowerType = column.type.toLowerCase()

          if (lowerType.includes('int')) {
            insertData[column.name] = parseInt(value, 10)
          } else if (lowerType.includes('real')) {
            insertData[column.name] = parseFloat(value)
          } else if (lowerType.includes('bool')) {
            insertData[column.name] = value
          } else {
            insertData[column.name] = value
          }
        }
      })

      const success = await insertRowAPI(tableName, insertData)

      if (success) {
        // Reset form
        setFormData({})
        setErrors({})
        onSuccess()
        onOpenChange(false)
      } else {
        setErrors({ _general: 'Failed to insert row. Please check your data and try again.' })
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
          <DialogTitle>Add New Row to {tableName}</DialogTitle>
          <DialogDescription>
            Fill in the values for the new row. Required fields are marked with *.
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
            {insertableColumns.map((column) => (
              <div key={column.name} className="space-y-2">
                <Label htmlFor={column.name}>
                  {column.name}
                  {!column.nullable && <span className="text-red-500 ml-1">*</span>}
                  <span className="text-xs text-muted-foreground ml-2">({column.type})</span>
                </Label>

                {renderInput(column)}

                {errors[column.name] && (
                  <p className="text-sm text-red-500">{errors[column.name]}</p>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Row'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}