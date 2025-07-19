import { useWalletAccountTransactionSendingSigner, useWalletUi } from '@wallet-ui/react'
import type { UiWalletAccount } from '@wallet-ui/react'
import { useMemo } from 'react'

// Custom hook that safely handles wallet signing operations
export function useWalletUiSigner() {
  const { account, cluster } = useWalletUi()
  
  // Always call the hook with valid parameters or null values
  // This ensures we follow React's rules of hooks by always calling hooks in the same order
  const accountToUse = account ? (account as UiWalletAccount) : null
  const clusterId = cluster?.id || ''
  
  const signer = useWalletAccountTransactionSendingSigner(accountToUse, clusterId)
  
  // Return the signer or undefined if wallet is not properly connected
  return useMemo(() => {
    if (!account || !cluster) return undefined
    return signer
  }, [account, cluster, signer])
}
