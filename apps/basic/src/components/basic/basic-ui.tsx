import { ellipsify } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
import { useBasicProgramId, useGetProgramAccountQuery, useGreetMutation, useLatestGreeting } from './basic-data-access'

export function BasicProgramExplorerLink() {
  const programId = useBasicProgramId()

  return <ExplorerLink address={programId.toString()} label={ellipsify(programId.toString())} />
}

export function BasicCreate() {
  const greetMutation = useGreetMutation()

  return (
    <Button onClick={() => greetMutation.mutateAsync()} disabled={greetMutation.isPending}>
      Run program{greetMutation.isPending && '...'}
    </Button>
  )
}

export function BasicProgram() {
  const query = useGetProgramAccountQuery()
  const { greeting } = useLatestGreeting()

  console.log({ greeting })

  if (query.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!query.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {/* {greeting && ( */}
        <div className="p-4 bg-black text-white border rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Latest Greeting</h3>
          <div className="text-2xl font-bold">{greeting}</div>
          <p className="text-sm mt-2">This greeting was sent from the Solana program</p>
        </div>
      {/* )} */}
      <div className="p-4 bg-black text-white border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Program Data</h3>
        <pre className="p-4 bg-black text-white border rounded-lg overflow-auto">
          {JSON.stringify(query.data.value.data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
