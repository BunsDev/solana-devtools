'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

export function AddDevnetButton() {
  const [isAdding, setIsAdding] = useState(false)

  const addDevnetToWallet = async () => {
    setIsAdding(true)
    
    try {
      // Check if wallet supports network switching
      // @ts-ignore
      if (!window.solana || !window.solana.request) {
        toast.error('Wallet does not support network switching')
        return
      }

      // Add Solana Devnet network to wallet
      // @ts-ignore
      await window.solana.request({
        method: 'wallet_addEthereumChain', // Note: Some wallets use Ethereum-style methods
        params: [{
          chainId: '0x65', // Devnet chain ID (101 in hex)
          chainName: 'Solana Devnet',
          nativeCurrency: {
            name: 'SOL',
            symbol: 'SOL',
            decimals: 9,
          },
          rpcUrls: [
            'https://api.devnet.solana.com',
            'https://devnet.helius-rpc.com/?api-key=demo',
          ],
          blockExplorerUrls: [
            'https://explorer.solana.com/?cluster=devnet',
          ],
        }],
      })

      toast.success('Solana Devnet added to wallet successfully!')
    } catch (error) {
      console.error('Failed to add Devnet to wallet:', error)
      
      // Fallback: Provide manual instructions
      const errorMessage = (error as Error).message
      if (errorMessage.includes('User rejected') || errorMessage.includes('rejected')) {
        toast.error('User rejected adding Devnet to wallet')
      } else {
        toast.error('Failed to add Devnet automatically. Please add manually in your wallet settings.')
        
        // Show manual instructions
        toast.info(
          'Manual setup: Add RPC URL "https://api.devnet.solana.com" to your wallet\'s Devnet settings',
          { duration: 10000 }
        )
      }
    } finally {
      setIsAdding(false)
    }
  }

  const copyDevnetRPC = async () => {
    const devnetRPC = 'https://api.devnet.solana.com'
    try {
      await navigator.clipboard.writeText(devnetRPC)
      toast.success('Devnet RPC URL copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy RPC URL')
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 border rounded-lg bg-card">
      <h3 className="text-sm font-semibold text-card-foreground">Network Configuration</h3>
      <p className="text-xs text-muted-foreground">
        Add Solana Devnet to your wallet for testing and development
      </p>
      
      <div className="flex gap-2">
        <Button
          onClick={addDevnetToWallet}
          disabled={isAdding}
          size="sm"
          className="flex-1"
        >
          {isAdding ? 'Adding...' : 'Add Solana Devnet'}
        </Button>
        
        <Button
          onClick={copyDevnetRPC}
          variant="outline"
          size="sm"
        >
          Copy RPC URL
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>RPC URL:</strong> https://api.devnet.solana.com</p>
        <p><strong>Chain ID:</strong> 101 (Devnet)</p>
        <p><strong>Explorer:</strong> https://explorer.solana.com/?cluster=devnet</p>
      </div>
    </div>
  )
}

// Alternative Solana-specific approach for wallets that support it
export function AddDevnetButtonSolana() {
  const [isAdding, setIsAdding] = useState(false)

  const addSolanaDevnet = async () => {
    setIsAdding(true)
    
    try {
      // For Solana wallets that support network configuration
      // @ts-ignore
      if (window.solana && window.solana.isPhantom) {
        // Phantom wallet specific approach
        // @ts-ignore
        await window.solana.connect()
        
        // Request to switch to devnet
        // @ts-ignore
        await window.solana.request({
          method: 'wallet_switchSolanaChain',
          params: {
            chainId: 'devnet',
          },
        })
        
        toast.success('Switched to Solana Devnet!')
      } else {
        // Generic approach - just show instructions
        toast.info('Please manually switch to Devnet in your wallet settings')
      }
    } catch (error) {
      console.error('Failed to switch to Devnet:', error)
      toast.error('Please manually switch to Devnet in your wallet settings')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      onClick={addSolanaDevnet}
      disabled={isAdding}
      variant="outline"
      size="sm"
    >
      {isAdding ? 'Switching...' : 'Switch to Devnet'}
    </Button>
  )
}
