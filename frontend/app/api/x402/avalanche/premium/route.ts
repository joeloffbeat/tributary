import { settlePayment, facilitator } from 'thirdweb/x402'
import { createThirdwebClient } from 'thirdweb'
import { avalancheFuji } from 'thirdweb/chains'
import { USDC_FUJI_ADDRESS, PAYMENT_AMOUNTS, X402_API_ENDPOINTS } from '@/constants/protocols/x402'

const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
})

const thirdwebFacilitator = facilitator({
  client,
  serverWalletAddress: process.env.THIRDWEB_SERVER_WALLET_ADDRESS!,
})

export async function GET(request: Request) {
  const paymentData = request.headers.get('x-payment')

  const result = await settlePayment({
    resourceUrl: X402_API_ENDPOINTS.AVALANCHE.PREMIUM,
    method: 'GET',
    paymentData,
    payTo: process.env.MERCHANT_WALLET_ADDRESS!,
    network: avalancheFuji,
    price: {
      amount: PAYMENT_AMOUNTS.PREMIUM.amount,
      asset: {
        address: USDC_FUJI_ADDRESS,
      },
    },
    facilitator: thirdwebFacilitator,
  })

  if (result.status === 200) {
    return Response.json({
      tier: 'premium',
      data: 'Welcome to Premium tier! You have unlocked all advanced features.',
      features: ['Access to all content', 'Priority support', 'Advanced analytics', 'Custom integrations'],
      timestamp: new Date().toISOString(),
    })
  } else {
    return Response.json(result.responseBody, {
      status: result.status,
      headers: result.responseHeaders,
    })
  }
}
