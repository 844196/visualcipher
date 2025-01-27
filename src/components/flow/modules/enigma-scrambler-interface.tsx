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
import { Checkbox } from '@/components/ui/checkbox'
import { StringConnector } from '@/components/flow/components/string-connector'
import { StringShift } from '@/components/flow/utils/string-shift'
import { getIncomersWithHandle } from '@/components/flow/utils/get-incomers-with-handle'
import { ALPHABETS } from '@/components/flow/utils/const'
import { Highlight } from '@/components/flow/components/highlight'

type EnigmaScramblerInterfaceData = {
  reverse?: boolean
}

const EnigmaScramblerInterfaceProcess: NodeProcess<
  EnigmaScramblerInterfaceData
> = (node, params, inputs) => {
  if (!inputs.scrambler) {
    return ''
  }
  const { top, bottom, rotate } = JSON.parse(inputs.scrambler)

  if (inputs.input) {
    const result = EnigmaScramblerInterfaceEncrypt(
      inputs.input ?? '',
      top ?? '',
      bottom ?? '',
      rotate ?? '',
      !!node.data.reverse
    )
    if (result.error) {
      throw new Error(result.error)
    }

    return result.encrypted
  }
  return ''
}

export const EnigmaScramblerInterfaceModule: ModuleProps<EnigmaScramblerInterfaceData> =
  {
    type: 'enigma_scrambler_interface',
    node: EnigmaScramblerInterface,
    process: EnigmaScramblerInterfaceProcess,
    defaultData: {
      reverse: false,
    },
    name: 'Enigma Scrambler Interface',
    description: `Interface that connects from Scrambler and emulates the actual Scrambler signal
Enigma cipher uses the same Scrambler twice in a single conversion process, once in forward and once in reverse
Set reverse to true if you want to perform the process in reverse order.`,
    ports: {
      in: {
        scrambler: {
          className: '-ml-28',
          description: 'from Scrambler Port',
        },
        input: {}
      },
      out: {
        output: {}
      },
    },
  }

function EnigmaScramblerInterfaceEncrypt(
  text: string,
  top: string,
  bottom: string,
  rotate: string,
  reverse: boolean
): {
  encrypted: string
  currentTopHighlightIndex?: number
  currentTop: string
  currentBottomHighlightIndex?: number
  currentBottom: string
  turn: string
  error?: string
} {
  if (!top || !bottom) {
    return {
      encrypted: '',
      currentTopHighlightIndex: undefined,
      currentTop: '',
      currentBottomHighlightIndex: undefined,
      currentBottom: '',
      turn: '',
      error: '',
    }
  }
  let encrypted = ''
  let currentTopIndex = undefined
  let currentBottomIndex = undefined
  let [currentTop, currentBottom] = [top, bottom]
  if (reverse) {
    [currentTop, currentBottom] = [currentBottom, currentTop]
  }
  if (!text.match(/^[A-Z]*$/)) {
    return {
      encrypted: encrypted,
      currentTopHighlightIndex: currentTopIndex,
      currentTop: currentTop,
      currentBottomHighlightIndex: currentBottomIndex,
      currentBottom: currentBottom,
      turn: '',
      error: 'The ENIGMA cipher machine can only use uppercase letters.',
    }
  }
  let currentLength = 1
  let turned = ''
  for (let sourceCharacter of text.split('')) {
    // ENIGMA ROTAR ROTATE BEFORE PROCESSING
    if (rotate.slice(currentLength - 1, currentLength) === '1') {
      currentTop = StringShift(currentTop, -1)
      currentBottom = StringShift(currentBottom, -1)
    }
    currentTopIndex = ALPHABETS.indexOf(sourceCharacter)
    const shiftedAlphabet = currentTop.slice(
      currentTopIndex,
      currentTopIndex + 1
    )
    currentBottomIndex = currentBottom.indexOf(shiftedAlphabet)
    encrypted += ALPHABETS.slice(currentBottomIndex, currentBottomIndex + 1)
    currentLength++
  }

  return {
    encrypted: encrypted,
    currentTopHighlightIndex: currentTopIndex,
    currentTop: currentTop,
    currentBottomHighlightIndex: currentBottomIndex,
    currentBottom: currentBottom,
    turn: turned,
  }
}

function EnigmaScramblerInterface({
  id,
  data: initialData,
}: NodeProps<EnigmaScramblerInterfaceData>) {
  const [data, setData] = useNodeDataState<EnigmaScramblerInterfaceData>(
    id,
    initialData
  )
  const result = useMemo(() => {
    const { top, bottom, rotate } = JSON.parse(data.inputs?.scrambler ?? '{}')
    return EnigmaScramblerInterfaceEncrypt(
      data.inputs?.input ?? '',
      top ?? '',
      bottom ?? '',
      rotate ?? '',
      !!data.reverse
    )
  }, [data])

  return (
    <ModuleNode label="Enigma Scrambler Interface">
      <div className={'flex flex-col m-auto gap-2 pt-2 w-[340px]'}>
        <div className={'flex flex-row gap-2'}>
          <div className="flex items-center mx-auto space-x-2">
            <Checkbox
              checked={data.reverse}
              id="reverse"
              onCheckedChange={(e) => setData({ ...data, reverse: !!e })}
            />
            <label
              htmlFor="reverse"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Reverse
            </label>
          </div>
        </div>
        <div className={'flex flex-col m-auto gap-1 font-mono whitespace-pre'}>
          <Label className={' text-muted-foreground'}>
            <Highlight
              index={result.currentTopHighlightIndex}
              className={'text-module-input'}
              text={ALPHABETS}
            />
          </Label>
          <Label>
            <StringConnector
              top={result.currentTopHighlightIndex}
              bottom={result.currentTopHighlightIndex}
            />
          </Label>
          <Label>
            <Highlight
              index={result.currentTopHighlightIndex}
              className={'text-module-hint'}
              text={result.currentTop}
            />
          </Label>
          <Label>
            <StringConnector
              top={result.currentTopHighlightIndex}
              bottom={result.currentBottomHighlightIndex}
            />
          </Label>
          <Label>
            <Highlight
              index={result.currentBottomHighlightIndex}
              className={'text-module-hint'}
              text={result.currentBottom}
            />
          </Label>
          <Label>
            <StringConnector
              top={result.currentBottomHighlightIndex}
              bottom={result.currentBottomHighlightIndex}
            />
          </Label>
          <Label className={' text-muted-foreground'}>
            <Highlight
              index={result.currentBottomHighlightIndex}
              className={'text-module-output'}
              text={ALPHABETS}
            />
          </Label>
        </div>
      </div>
    </ModuleNode>
  )
}
