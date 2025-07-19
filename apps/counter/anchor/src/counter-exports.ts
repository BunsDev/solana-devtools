// Here we export some useful types and functions for interacting with the Anchor program.
import { type Account, address, getBase58Decoder } from 'gill'
import type { SolanaClusterId } from '@wallet-ui/react'

// Define a type for the RPC client to avoid dependency on SolanaClient
type RpcClient = { 
  getProgramAccounts: (address: string | object, config: object) => { 
    send: () => Promise<any> 
  } 
}
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import { type Counter, COUNTER_DISCRIMINATOR, COUNTER_PROGRAM_ADDRESS, getCounterDecoder } from './client/js'
import CounterIDL from '../target/idl/counter.json'

export type CounterAccount = Account<Counter, string>

// Re-export the generated IDL and type
export { CounterIDL }

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getCounterProgramId(cluster: SolanaClusterId) {
  switch (cluster) {
    case 'solana:devnet':
      return address('BbDVPD53NemX9wCk4Xie8A2jv8NrjNcUre9ruX9BW7TQ')
    case 'solana:testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return address('6z68wfurCMYkZG51s1Et9BJEd9nJGUusjHXNt4dGbNNF')
      // return address('4bUAtU9pycsoXB8SfRyAUKScHDGXukgbphJbUHeeR4oL') // Deployed program ID
    case 'solana:mainnet':
    default:
      return COUNTER_PROGRAM_ADDRESS
  }
}

export * from './client/js'

export function getCounterProgramAccounts(rpc: RpcClient) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getCounterDecoder(),
    filter: getBase58Decoder().decode(COUNTER_DISCRIMINATOR),
    programAddress: COUNTER_PROGRAM_ADDRESS,
  })
}
