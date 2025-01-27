import React, { useMemo, useState } from 'react'
import { NodeProps } from 'reactflow'
import {
  getOutput,
  ModuleProps,
  NodeProcess,
} from '@/components/flow/node-types'
import { ModuleNode } from '@/components/flow/components/module-node'
import { useNodeDataState } from '@/components/flow/hooks/use-node-data-state'
import { getIncomersWithHandle } from '@/components/flow/utils/get-incomers-with-handle'

type WordCounterData = {
}

const WordCounterProcess: NodeProcess<WordCounterData> = (node, params) => {
  return ''
}

export const WordCounterModule: ModuleProps<WordCounterData> = {
  type: 'word_counter',
  node: WordCounter,
  process: WordCounterProcess,
  defaultData: {},
  name: 'Word Counter',
  description:
    'Count the number of space-separated strings and display them in order of frequency',
  ports: {
    in: {
      input: {}
    },
    out: {},
  },
}

type Counts = {
  word: string
  count: number
  percentage: string
}[]

function WordCounter({ id, data: initialData }: NodeProps<WordCounterData>) {
  const [data, setData] = useNodeDataState<WordCounterData>(id, initialData)
  const counts = useMemo(() => {
    if (!data.inputs?.input) {
      return []
    }
    const allCharCount = data.inputs.input.length
    const counts: Counts = []
    for (let char of data.inputs.input.split(' ')) {
      const index = counts.findIndex((c) => c.word === char)
      if (index == -1) {
        counts.push({
          word: char,
          count: 1,
          percentage: '0',
        })
      } else {
        counts[index] = {
          word: char,
          count: counts[index].count + 1,
          percentage: '0',
        }
      }
    }
    for (let count of counts) {
      count.percentage = `${((count.count / allCharCount) * 100).toFixed(2)}%`
    }

    counts.sort((a, b) => {
      return a.count > b.count ? -1 : 1
    })
    return counts
  }, [data])

  return (
    <ModuleNode label={'Word counter (Top 10)'}>
      <div
        className={
          'flex flex-col justify-center m-auto gap-2 font-mono whitespace-pre'
        }
      >
        {counts.map((c, k) => {
          if (k > 10) {
            return
          }
          return (
            <div key={c.word}>
              {c.word}: {c.count} ({c.percentage}%) <br />
            </div>
          )
        })}
      </div>
    </ModuleNode>
  )
}
