import React, { useMemo, useState } from 'react'
import { NodeProps } from 'reactflow'
import {
  getOutput,
  ModuleProps,
  NodeProcess,
} from '@/components/flow/node-types'
import { ModuleNode } from '@/components/flow/components/module-node'
import { Button } from '@/components/ui/button'
import { useNodeDataState } from '@/components/flow/hooks/use-node-data-state'
import { getIncomersWithHandle } from '@/components/flow/utils/get-incomers-with-handle'

type Data = {
  rails?: number
  input?: string
}

const Process: NodeProcess<Data> = (node, params) => {
  const incomers = getIncomersWithHandle(
    node,
    params.nodes,
    params.edges,
    'input'
  )
  if (incomers[0]) {
    const text = getOutput(incomers[0], params)
    params.updateNodeData(node, {
      input: text,
    })
    return RailFenceCipherEncrypt(text, node.data.rails ?? 3).encrypted
  }
  params.updateNodeData(node, {
    input: '',
  })
  return ''
}

export const RailFenceCipherModule: ModuleProps<Data> = {
  type: 'rail_fence_cipher',
  node: Node,
  process: Process,
  defaultData: {
    rails: 3,
  },
  name: 'Rail Fence Cipher',
  description: ``,
  ports: {
    in: {
      input: {}
    },
    out: {
      output: {}
    },
  },
}

export function RailFenceCipherEncrypt(
  text: string,
  rails: number
): {
  encrypted: string
} {

  return {
    encrypted: '',
  }
}

function Node({ id, data: initialData }: NodeProps<Data>) {
  const [data, setData] = useNodeDataState<Data>(id, initialData)

  const shiftLeft = () => {
    setData({
      rails: (data.rails ?? 0) - 1,
    })
  }
  const shiftRight = () => {
    setData({
      rails: (data.rails ?? 0) + 1,
    })
  }

  return (
    <ModuleNode label="Rail Fence cipher">
      <div className={'flex flex-col m-auto gap-2'}>
        <div className={'flex flex-row gap-2'}>
          <Button
            size={'xs'}
            onClick={shiftLeft}
            className={'flex-0 w-12'}
            variant="outline"
          >
            ←
          </Button>
          <div
            className={
              'flex-1 text-center text-muted-foreground text-xs m-auto'
            }
          >
            RAILS: {data.rails}
          </div>
          <Button
            size={'xs'}
            onClick={shiftRight}
            className={'flex-0 w-12'}
            variant="outline"
          >
            →
          </Button>
        </div>
      </div>
    </ModuleNode>
  )
}
