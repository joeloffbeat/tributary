// ============================================================================
// TEMPLATE: Goldsky Webhook Handler
// Replace: EntityName, processing logic
// ============================================================================

import { NextResponse } from 'next/server'

// Goldsky webhook payload type
interface GoldskyWebhookPayload {
  entity: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  data: Record<string, unknown>
  block: {
    number: number
    hash: string
    timestamp: number
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as GoldskyWebhookPayload

    // Validate entity type
    if (payload.entity !== 'ENTITY_NAME') {
      return NextResponse.json(
        { error: 'Unexpected entity type' },
        { status: 400 }
      )
    }

    // Handle different operations
    switch (payload.operation) {
      case 'INSERT':
        await handleInsert(payload.data, payload.block)
        break
      case 'UPDATE':
        await handleUpdate(payload.data, payload.block)
        break
      case 'DELETE':
        await handleDelete(payload.data, payload.block)
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleInsert(
  data: Record<string, unknown>,
  block: { number: number; hash: string; timestamp: number }
) {
  // TODO: Process new entity
  console.log('New entity:', data)
  console.log('Block:', block.number)

  // Example: Sync to database
  // await supabase.from('entities').insert({
  //   id: data.id,
  //   ...data,
  //   indexed_at_block: block.number,
  // })

  // Example: Send notification
  // if (meetsCondition(data)) {
  //   await sendNotification(data)
  // }
}

async function handleUpdate(
  data: Record<string, unknown>,
  block: { number: number; hash: string; timestamp: number }
) {
  // TODO: Process updated entity
  console.log('Updated entity:', data)

  // Example: Update database
  // await supabase.from('entities').update({
  //   ...data,
  //   indexed_at_block: block.number,
  // }).eq('id', data.id)
}

async function handleDelete(
  data: Record<string, unknown>,
  block: { number: number; hash: string; timestamp: number }
) {
  // TODO: Process deleted entity
  console.log('Deleted entity:', data)

  // Example: Remove from database
  // await supabase.from('entities').delete().eq('id', data.id)
}
