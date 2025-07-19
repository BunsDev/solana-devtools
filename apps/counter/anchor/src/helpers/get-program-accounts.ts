import { type Address, Base58EncodedBytes } from 'gill'

// Define RPC client interface to avoid dependency on SolanaClient
interface RpcClient {
  getProgramAccounts: (address: string | object, config: object) => { 
    send: () => Promise<any> 
  }
}

export interface GetProgramAccountsConfig {
  filter: string
  programAddress: Address
}

export async function getProgramAccounts(rpc: RpcClient, config: GetProgramAccountsConfig) {
  return await rpc
    .getProgramAccounts(config.programAddress, {
      encoding: 'jsonParsed',
      filters: [
        {
          memcmp: { offset: 0n, bytes: config.filter as Base58EncodedBytes, encoding: 'base58' },
        },
      ],
    })
    .send()
}
