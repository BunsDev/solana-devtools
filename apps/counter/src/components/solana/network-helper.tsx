'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useState } from 'react'
import { Copy, ExternalLink, Wifi } from 'lucide-react'

export function NetworkHelper() {
  const [isConnecting, setIsConnecting] = useState(false)

  const devnetConfig = {
    name: 'Solana Devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    chainId: 'devnet',
    explorer: 'https://explorer.solana.com/?cluster=devnet',
    faucet: 'https://faucet.solana.com',
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard!`)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error(`Failed to copy ${label}`)
    }
  }

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const requestAirdrop = async () => {
    setIsConnecting(true)
    try {
      // Open Solana faucet in new tab
      openInNewTab(devnetConfig.faucet)
      toast.info('Solana faucet opened in new tab. Request 1-2 SOL for testing.')
    } catch (error) {
      toast.error('Failed to open faucet')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          Network Configuration
        </CardTitle>
        <CardDescription>
          Configure your wallet for Solana Devnet development
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network:</span>
            <span className="text-sm text-muted-foreground">{devnetConfig.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">RPC URL:</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground font-mono">
                {devnetConfig.rpcUrl.replace('https://', '').substring(0, 20)}...
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(devnetConfig.rpcUrl, 'RPC URL')}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => copyToClipboard(devnetConfig.rpcUrl, 'Devnet RPC URL')}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy RPC URL
          </Button>
          
          <Button
            onClick={() => openInNewTab(devnetConfig.explorer)}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Explorer
          </Button>
          
          <Button
            onClick={requestAirdrop}
            disabled={isConnecting}
            className="w-full"
            size="sm"
          >
            <Wifi className="h-4 w-4 mr-2" />
            {isConnecting ? 'Opening...' : 'Get Devnet SOL'}
          </Button>
        </div>

        {/* Manual Instructions */}
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium mb-2">Manual Setup Instructions:</h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Open your Solana wallet (Phantom, Solflare, etc.)</li>
            <li>Go to Settings → Network</li>
            <li>Switch to "Devnet" or add custom RPC</li>
            <li>Use RPC URL: {devnetConfig.rpcUrl}</li>
            <li>Get test SOL from the faucet</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for inline use
export function DevnetQuickActions() {
  const copyDevnetRPC = () => {
    navigator.clipboard.writeText('https://api.devnet.solana.com')
    toast.success('Devnet RPC copied!')
  }

  const openFaucet = () => {
    window.open('https://faucet.solana.com', '_blank')
    toast.info('Faucet opened - request 1-2 SOL for testing')
  }

  return (
    <div className="flex gap-2">
      <Button onClick={copyDevnetRPC} variant="outline" size="sm">
        Copy Devnet RPC
      </Button>
      <Button onClick={openFaucet} variant="outline" size="sm">
        Get Test SOL
      </Button>
    </div>
  )
}
