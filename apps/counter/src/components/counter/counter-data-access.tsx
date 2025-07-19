import {
  CounterAccount,
  getCloseInstruction,
  getCounterProgramAccounts,
  getCounterProgramId,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '@project/anchor'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { generateKeyPairSigner } from 'gill'
import { useWalletUi } from '@wallet-ui/react'
import { useWalletTransactionSignAndSend } from '../solana/use-wallet-transaction-sign-and-send'
import { useClusterVersion } from '@/components/cluster/use-cluster-version'
import { toastTx } from '@/components/toast-tx'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import { install as installEd25519 } from '@solana/webcrypto-ed25519-polyfill'

// polyfill ed25519 for browsers (to allow `generateKeyPairSigner` to work)
installEd25519()

export function useCounterProgramId() {
  const { cluster } = useWalletUi()
  return useMemo(() => getCounterProgramId(cluster.id), [cluster])
}

export function useCounterProgram() {
  const { client, cluster } = useWalletUi()
  const programId = useCounterProgramId()
  const query = useClusterVersion()

  return useQuery({
    retry: false,
    queryKey: ['get-program-account', { cluster, clusterVersion: query.data }],
    queryFn: () => client.rpc.getAccountInfo(programId).send(),
  })
}


// export function useCounterInitializeMutation() {
//   const { cluster } = useWalletUi()
//   const queryClient = useQueryClient()
//   const signer = useWalletUiSigner()
//   const signAndSend = useWalletTransactionSignAndSend()

//   return useMutation({
//     mutationFn: async () => {
//       const counter = await generateKeyPairSigner()
//       return await signAndSend(getInitializeInstruction({ payer: signer, counter }), signer)
//     },
//     onSuccess: async (tx) => {
//       toastTx(tx)
//       await queryClient.invalidateQueries({ queryKey: ['counter', 'accounts', { cluster }] })
//     },
//     onError: () => toast.error('Failed to run program'),
//   })
// }

// Simplified version for debugging
export function useCounterInitializeMutationSimple() {
  const { cluster } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => {
      console.log('🚀 Starting counter initialization...')
      console.log('Signer address:', signer.address)
      
      const counter = await generateKeyPairSigner()
      console.log('Generated counter:', counter.address)
      
      const instruction = getInitializeInstruction({ payer: signer, counter })
      console.log('Instruction:', instruction)
      
      return await signAndSend(instruction, signer)
    },
    onSuccess: (tx) => {
      console.log('✅ Success! Transaction:', tx)
      toast.success('Counter initialized successfully!')
      queryClient.invalidateQueries({ queryKey: ['counter', 'accounts', { cluster }] })
    },
    onError: (error) => {
      console.error('❌ Error:', error)
      toast.error(`Error: ${(error as Error).message}`)
    },
  })
}

export function useCounterInitializeMutation() {
  const { cluster, client } = useWalletUi()
  const queryClient = useQueryClient()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => {
      try {
        console.log('🔍 Checking wallet balance...')
        const balance = await client.rpc.getBalance(signer.address).send()
        const balanceNumber = Number(balance.value) // Convert BigInt to number
        console.log('Wallet balance:', balance.value, 'lamports', `(${balanceNumber / 1000000000} SOL)`)
        
        // Minimum required for account creation (rough estimate: ~0.002 SOL)
        const minimumRequired = 2000000 // 0.002 SOL in lamports
        if (balanceNumber < minimumRequired) {
          throw new Error(`Insufficient SOL balance. Need at least 0.002 SOL for account creation. Current balance: ${balanceNumber / 1000000000} SOL`)
        }

        console.log('💰 Balance check passed!')
        const counter = await generateKeyPairSigner()
        console.log('🔑 Generated counter address:', counter.address)
        
        const instruction = getInitializeInstruction({ 
          payer: signer, 
          counter
        })
        
        console.log('📝 Instruction created:', instruction)
        console.log('🚀 Sending transaction...')
        
        const result = await signAndSend(instruction, signer)
        console.log('✅ Transaction sent successfully:', result)
        return result
      } catch (error) {
        console.error('❌ Counter initialization error:', error)
        // Log the full error object for debugging
        console.error('Full error object:', JSON.stringify(error, null, 2))
        throw error
      }
    },
    onSuccess: async (tx) => {
      console.log('🎉 Transaction successful:', tx)
      toastTx(tx)
      await queryClient.invalidateQueries({ queryKey: ['counter', 'accounts', { cluster }] })
    },
    onError: (error) => {
      console.error('🚨 Mutation error:', error)
      const errorMessage = (error as Error).message
      
      if (errorMessage.includes('Insufficient SOL')) {
        toast.error(errorMessage)
      } else if (errorMessage.includes('Error processing the transaction')) {
        toast.error('Transaction failed. Check console for details and ensure you have sufficient SOL balance.')
      } else if (errorMessage.includes('User rejected')) {
        toast.error('Transaction was rejected by user')
      } else {
        toast.error('Failed to initialize counter: ' + errorMessage)
      }
    },
  })
}

export function useCounterDecrementMutation({ counter }: { counter: CounterAccount }) {
  const invalidateAccounts = useCounterAccountsInvalidate()
  const signer = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()

  return useMutation({
    mutationFn: async () => await signAndSend(getDecrementInstruction({ counter: counter.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useCounterIncrementMutation({ counter }: { counter: CounterAccount }) {
  const invalidateAccounts = useCounterAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () => await signAndSend(getIncrementInstruction({ counter: counter.address }), signer),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useCounterSetMutation({ counter }: { counter: CounterAccount }) {
  const invalidateAccounts = useCounterAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async (value: number) =>
      await signAndSend(
        getSetInstruction({
          counter: counter.address,
          value,
        }),
        signer,
      ),
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useCounterCloseMutation({ counter }: { counter: CounterAccount }) {
  const invalidateAccounts = useCounterAccountsInvalidate()
  const signAndSend = useWalletTransactionSignAndSend()
  const signer = useWalletUiSigner()

  return useMutation({
    mutationFn: async () => {
      return await signAndSend(getCloseInstruction({ payer: signer, counter: counter.address }), signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}

export function useCounterAccountsQuery() {
  const { client } = useWalletUi()

  return useQuery({
    queryKey: useCounterAccountsQueryKey(),
    queryFn: async () => await getCounterProgramAccounts(client.rpc),
  })
}

function useCounterAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useCounterAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}

function useCounterAccountsQueryKey() {
  const { cluster } = useWalletUi()

  return ['counter', 'accounts', { cluster }]
}
