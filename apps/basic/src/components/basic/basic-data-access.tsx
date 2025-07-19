import { getBasicProgramId, getGreetInstruction } from '@project/anchor'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useWalletUi } from '@wallet-ui/react'
import { toastTx } from '@/components/toast-tx'
import { useWalletTransactionSignAndSend } from '@/components/solana/use-wallet-transaction-sign-and-send'
import { useWalletUiSigner } from '@/components/solana/use-wallet-ui-signer'
import type { Signature } from 'gill'

export function useBasicProgramId() {
  const { cluster } = useWalletUi()

  return useMemo(() => getBasicProgramId(cluster.id), [cluster])
}

export function useGetProgramAccountQuery() {
  const { client, cluster } = useWalletUi()

  return useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => client.rpc.getAccountInfo(getBasicProgramId(cluster.id)).send(),
  })
}

export function useLatestGreeting() {
  const { client } = useWalletUi()
  const [greeting, setGreeting] = useState<string>('')
  const [lastSignature, setLastSignature] = useState<string | null>(null)
  
  async function fetchGreeting(signature: Signature) {
    try {
      // Wait a bit for the transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Fetch transaction with logs
      const txResponse = await client.rpc.getTransaction(signature, { maxSupportedTransactionVersion: 0, encoding: 'jsonParsed' }).send()
      if (!txResponse) return null
      console.log('Transaction response:', txResponse)
      // Extract logs from transaction
      const logs = txResponse.meta?.logMessages || []
      console.log('Transaction logs:', logs)
      // Look for the greeting in the logs ("Program log: GM")
      const greetingLog = logs.find((log: string) => log.includes('Program log: GM'))
      console.log('Greeting log:', greetingLog)
      if (greetingLog) {
        const extractedGreeting = greetingLog.replace('Program log: ', '')
        setGreeting(extractedGreeting)
        return extractedGreeting
      }
      return null
    } catch (error) {
      console.error('Failed to fetch greeting:', error)
      return null
    }
  }
  console.log({ greeting })

  return {
    greeting,
    fetchGreeting,
    lastSignature,
    setLastSignature,
  }
}

export function useGreetMutation() {
  const programAddress = useBasicProgramId()
  const txSigner = useWalletUiSigner()
  const signAndSend = useWalletTransactionSignAndSend()
  const { fetchGreeting, setLastSignature } = useLatestGreeting()

  return useMutation({
    mutationFn: async () => {
      const signature = await signAndSend(getGreetInstruction({ programAddress }), txSigner)
      setLastSignature(signature)
      return signature
    },
    onSuccess: async (signature) => {
      toastTx(signature)
      // Fetch the greeting from transaction logs
      await fetchGreeting(signature as Signature)
    },
    onError: () => toast.error('Failed to run program'),
  })
}
