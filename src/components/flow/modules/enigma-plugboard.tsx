import React, { useMemo } from 'react'
import { NodeProps } from 'reactflow'
import { Label } from '@/components/ui/label'
import {
  getOutput,
  ModuleProps,
  NodeProcess,
} from '@/components/flow/node-types'
import { ModuleNode } from '@/components/flow/components/module-node'
import { useNodeDataState } from '@/components/flow/hooks/use-node-data-state'
import { StringConnector } from '@/components/flow/components/string-connector'
import { getIncomersWithHandle } from '@/components/flow/utils/get-incomers-with-handle'
import { Highlight } from '@/components/flow/components/highlight'

type EnigmaPlugBoardData = {
  plugs?: string
  input?: string
}

const EnigmaPlugBoardProcess: NodeProcess<EnigmaPlugBoardData> = (
  node,
  params,
  inputs
) => {
  return EnigmaPlugBoardEncrypt(inputs.input ?? '', inputs.plugs ?? '').encrypted
}

export const EnigmaPlugBoardModule: ModuleProps<EnigmaPlugBoardData> = {
  type: 'enigma_plug_board',
  node: EnigmaPlugBoard,
  process: EnigmaPlugBoardProcess,
  defaultData: {},
  name: 'Enigma Plug Board (Steckerbrett)',
  description: `plugs[AB CD] input[ABCX] → output[BADX]
Plugboard Emulator for Enigma Crypto Machines
Passing a space-separated set of two characters to {plugs} replaces the corresponding part of the string entered with {input}.`,
  ports: {
    in: {
      input: {},
      plugs: {
        className: '-ml-24',
        description: (
          <>
            eg: [AB CD]
            <br />
            Set of space-separated replacement strings
          </>
        ),
      },
    },
    out: {
      output: {}
    },
  },
}

export function EnigmaPlugBoardEncrypt(
  text: string,
  plugs: string
): {
  encrypted: string
} {
  const source = plugs
    .split(' ')
    .map((s) => s.charAt(0) + s.charAt(1))
    .join('')
    .toUpperCase()
  const target = plugs
    .split(' ')
    .map((s) => s.charAt(1) + s.charAt(0))
    .join('')
    .toUpperCase()
  const encrypted = text.replace(
    /[a-z]/gi,
    (letter) => target?.[source.indexOf(letter)] ?? letter
  )
  return {
    encrypted: encrypted,
  }
}

function EnigmaPlugBoard({
  id,
  data: initialData,
}: NodeProps<EnigmaPlugBoardData>) {
  const [data, setData] = useNodeDataState<EnigmaPlugBoardData>(id, initialData)
  const source = useMemo(() => {
    return (
      data.inputs?.plugs
        ?.split(' ')
        .map((s) => s.charAt(0) + s.charAt(1))
        .join(' ')
        .toUpperCase() ?? ''
    )
  }, [data.inputs])
  const target = useMemo(() => {
    return (
      data.inputs?.plugs
        ?.split(' ')
        .map((s) => s.charAt(1) + s.charAt(0))
        .join(' ')
        .toUpperCase() ?? ''
    )
  }, [data.inputs])
  const currentIndex = useMemo(() => {
    if (!source || !data.inputs) {
      return undefined
    }
    if (!data.inputs.input || data.inputs.input?.charAt(-1)) {
      return undefined
    }
    const index = source.indexOf(data.inputs.input.charAt(data.inputs.input.length - 1))
    if (index == -1) {
      return undefined
    }
    return index
  }, [data.inputs])

  return (
    <ModuleNode label="Enigma PlugBoard">
      <div className={'flex flex-col gap-1 m-auto w-60'}>
        <Label className={'my-auto'}>
          <Highlight
            index={currentIndex}
            className={'text-module-input'}
            text={source}
            notch={''}
          />
        </Label>
        <Label className={'my-auto'}>
          <StringConnector top={currentIndex} bottom={currentIndex} />
        </Label>
        <Label className={'my-auto'}>
          <Highlight
            index={currentIndex}
            className={'text-module-output'}
            text={target}
            notch={''}
          />
        </Label>
      </div>
    </ModuleNode>
  )
}
