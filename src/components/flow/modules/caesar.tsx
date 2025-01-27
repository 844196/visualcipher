import React, { useMemo, useState } from 'react'
import { NodeProps } from 'reactflow'
import { Label } from '@/components/ui/label'
import {
  getOutput,
  ModuleProps,
  NodeProcess,
} from '@/components/flow/node-types'
import { ModuleNode } from '@/components/flow/components/module-node'
import { Button } from '@/components/ui/button'
import { useNodeDataState } from '@/components/flow/hooks/use-node-data-state'
import { StringShift } from '@/components/flow/utils/string-shift'
import { getIncomersWithHandle } from '@/components/flow/utils/get-incomers-with-handle'
import { ALPHABETS, UNKNOWN_CHARACTER } from '@/components/flow/utils/const'
import { Highlight } from '@/components/flow/components/highlight'
import { getInputs } from '@/components/flow/utils/get-inputs'

export type CaesarData = {
  shift?: number
}

const CaesarProcess: NodeProcess<CaesarData> = (node, params, inputs) => {
  return inputs.input ? CaesarEncrypt(inputs.input, node.data.shift ?? 0).encrypted : ''
}

export const CaesarModule: ModuleProps<CaesarData> = {
  type: 'caesar',
  node: Caesar,
  process: CaesarProcess,
  defaultData: {
    shift: 3,
  },
  name: 'Caesar Cipher',
  description: `[ABC] → [BCD]
Provides the ability to encrypt input text with the Caesar cipher.
The Caesar cipher is a classic cryptographic technique that encrypts a string of text by shifting a certain number of letters of the alphabet.
The user can enter any text and specify the number of letters to be shifted to encrypt that text. For example, if the number of shifts is 3, "ABC" is converted to "DEG" and "HELLO" is converted to "KHOOR".
`,
  ports: {
    in: {
      input: {}
    },
    out: {
      output: {}
    },
  },
}

function CaesarEncrypt(
  text: string,
  shift: number
): {
  encrypted: string
  highlightIndex: number
  shiftedAlphabetsText: string
} {
  const shifted = StringShift(ALPHABETS, shift)
  const encrypted = text.replace(/[a-z]/gi, (letter) => {
    const index = ALPHABETS.indexOf(letter)
    if (index == -1) {
      return UNKNOWN_CHARACTER
    }
    return shifted[index] ?? UNKNOWN_CHARACTER
  })

  return {
    encrypted: encrypted,
    highlightIndex: ALPHABETS.indexOf(text.slice(-1)),
    shiftedAlphabetsText: shifted,
  }
}

function Caesar({ id, data: initialData }: NodeProps<CaesarData>) {
  const [data, setData] = useNodeDataState<CaesarData>(id, initialData)
  const shiftedAlphabetsText = useMemo(() => {
    return StringShift(ALPHABETS, data.shift ?? 0)
  }, [data.shift])
  const highlightIndex = useMemo(() => {
    if (data.inputs?.input) {
      const encrypted = CaesarEncrypt(data.inputs.input, data.shift ?? 0)
      return encrypted.highlightIndex
    } else {
      return undefined
    }
  }, [data.inputs, data.shift])

  const shiftLeft = () => {
    setData({
      shift: (data.shift ?? 0) - 1,
    })
  }
  const shiftRight = () => {
    setData({
      shift: (data.shift ?? 0) + 1,
    })
  }

  return (
    <ModuleNode label="Caesar cipher">
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
            ROTATE: {data.shift}
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
        <Label className={'my-auto font-mono'}>
          <Highlight
            index={highlightIndex}
            className={'text-module-input'}
            text={ALPHABETS}
          />
        </Label>
        <Label className={'my-auto font-mono'}>
          <Highlight
            index={highlightIndex}
            className={'text-module-output'}
            text={shiftedAlphabetsText}
          />
        </Label>
      </div>
    </ModuleNode>
  )
}
