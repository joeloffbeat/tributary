'use client'

import { useAccount } from '@/lib/web3'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="font-title text-5xl text-primary mb-4">Profile</h1>
      {isConnected ? (
        <p className="font-body text-muted-foreground">
          CONNECTED: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      ) : (
        <p className="font-body text-muted-foreground">
          CONNECT YOUR WALLET TO VIEW YOUR PROFILE
        </p>
      )}
      {/* Profile content will be implemented in prompt 13 */}
    </div>
  )
}
