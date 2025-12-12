import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    serverWallet: process.env.THIRDWEB_SERVER_WALLET_ADDRESS || null,
    merchantWallet: process.env.MERCHANT_WALLET_ADDRESS || null,
  })
}
