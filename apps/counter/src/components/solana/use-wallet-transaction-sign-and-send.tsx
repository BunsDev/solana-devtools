import { useWalletUi } from '@wallet-ui/react'
import {
  type Instruction,
  type TransactionSendingSigner,
  createTransaction,
  getBase58Decoder,
  signAndSendTransactionMessageWithSigners,
} from 'gill'

export function useWalletTransactionSignAndSend() {
  const { client } = useWalletUi()

  return async (ix: Instruction, signer: TransactionSendingSigner) => {
    console.log('🔄 Starting transaction signing process...')
    console.log('📋 Instruction:', ix)
    console.log('✍️ Signer:', signer.address)
    
    try {
      // Fetch a fresh blockhash with confirmed commitment for better reliability
      console.log('🔍 Fetching latest blockhash...')
      const { value: latestBlockhash } = await client.rpc.getLatestBlockhash()
        // { commitment: 'confirmed' })
        .send()
      console.log('📦 Latest blockhash:', latestBlockhash)
      
      if (!latestBlockhash || !latestBlockhash.blockhash) {
        throw new Error('Failed to fetch valid blockhash from RPC')
      }

      console.log('🏗️ Creating transaction...')
      const transaction = createTransaction({
        feePayer: signer,
        version: 0,
        latestBlockhash,
        instructions: [ix],
      })
      console.log('📄 Transaction created:', transaction)
      
      console.log('📡 Sending transaction...')
      const signature = await signAndSendTransactionMessageWithSigners(transaction)

      console.log('✅ Transaction sent successfully! Signature:', signature)
      return getBase58Decoder().decode(signature)
    } catch (error) {
      console.error('❌ Transaction failed:', error)
      
      // Enhanced error handling for SendTransactionError
      if (error && typeof error === 'object' && 'getLogs' in error) {
        try {
          const logs = (error as any).getLogs()
          console.error('📋 Transaction logs:', logs)
        } catch (logError) {
          console.error('Failed to get transaction logs:', logError)
        }
      }
      
      // Log the full error object for debugging
      console.error('🔍 Full error details:', JSON.stringify(error, null, 2))
      
      // Provide more specific error messages
      const errorMessage = (error as Error).message
      if (errorMessage.includes('Blockhash not found')) {
        throw new Error('Transaction failed: Blockhash expired or invalid. This might be due to network latency or RPC issues. Please try again.')
      }
      
      if (errorMessage.includes('simulation failed')) {
        throw new Error('Transaction simulation failed. Check your cluster connection, account balances, and program deployment.')
      }
      
      if (errorMessage.includes('User rejected')) {
        throw new Error('Transaction was rejected by the user')
      }
      
      throw error
    }
  }
}
