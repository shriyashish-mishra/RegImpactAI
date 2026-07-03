'use client'

import { useState, useEffect } from 'react'
import { Button }   from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import QuotaExceededScreen from '@/components/primitives/QuotaExceededScreen'
import type { ConfirmedModel, Question, QuestionsResponse, QuotaExceededResponse } from '@/lib/types'

type Props = {
  confirmedModel: ConfirmedModel
  onComplete:     (answeredQuestions: Question[]) => void
}

export default function DiscoveryScreen({ confirmedModel, onComplete }: Props) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [fetching, setFetching]   = useState(true)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededResponse | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchQuestions() {
      setFetching(true)
      setError(null)
      try {
        const res = await fetch('/api/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirmedModel }),
        })
        const data = await res.json()

        if (res.status === 429 && data?.error === 'quota_exceeded') {
          if (!cancelled) setQuotaExceeded(data as QuotaExceededResponse)
          return
        }

        if (!res.ok) throw new Error(data?.error ?? 'Failed to generate questions')
        if (!cancelled) setQuestions((data as QuestionsResponse).questions)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        }
      } finally {
        if (!cancelled) setFetching(false)
      }
    }

    fetchQuestions()
    return () => { cancelled = true }
  }, [confirmedModel])

  if (quotaExceeded) {
    return <QuotaExceededScreen resetAt={quotaExceeded.resetAt} />
  }

  const activeIndex = questions.findIndex(q => q.answer === null)
  const allAnswered = questions.length > 0 && activeIndex === -1
  const remaining   = questions.filter(q => q.answer === null).length

  function handleAnswer(id: string, answer: string) {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, answer } : q))
    // Best-effort persistence — the wizard already has the answer in local
    // state and doesn't wait on this to proceed.
    fetch(`/api/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    }).catch(() => {})
  }

  async function handleComplete() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    onComplete(questions)
  }

  if (fetching) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            A few questions about {confirmedModel.product_name}
          </h1>
          <p className="text-slate-500 text-sm">Preparing targeted questions…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          A few questions about {confirmedModel.product_name}
        </h1>
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {error}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          A few questions about {confirmedModel.product_name}
        </h1>
        <p className="text-slate-500 text-sm">
          {allAnswered
            ? 'All questions answered. Ready to assess.'
            : `${remaining} question${remaining === 1 ? '' : 's'} remaining.`}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, i) => {
          const isActive   = i === activeIndex
          const isAnswered = q.answer !== null
          const isUpcoming = !isActive && !isAnswered

          return (
            <div key={q.id} className={[
              'flex flex-col gap-4 border rounded-xl px-5 py-5 transition-all',
              isActive   ? 'border-indigo-300 bg-white shadow-sm'       : '',
              isAnswered ? 'border-slate-200 bg-slate-50 opacity-80'    : '',
              isUpcoming ? 'border-slate-100 bg-slate-50/50 opacity-50' : '',
            ].join(' ')}>

              <div className="flex items-start gap-3">
                <span className={[
                  'text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  isActive   ? 'bg-indigo-600 text-white'   : '',
                  isAnswered ? 'bg-slate-800 text-white'     : '',
                  isUpcoming ? 'bg-slate-200 text-slate-500' : '',
                ].join(' ')}>
                  {isAnswered ? '✓' : q.seq}
                </span>
                <p className="text-sm font-medium text-slate-800 leading-snug">{q.prompt}</p>
              </div>

              <div className="ml-9 px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-600">Why I&apos;m asking: </span>
                  {q.rationale}
                </p>
              </div>

              {isActive && (
                <div className="ml-9">
                  <AnswerInput question={q} onAnswer={answer => handleAnswer(q.id, answer)} />
                </div>
              )}

              {isAnswered && (
                <div className="ml-9 text-sm text-slate-600 italic">
                  &ldquo;{q.answer}&rdquo;
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allAnswered && (
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button onClick={handleComplete} disabled={loading}>
            {loading ? 'Preparing assessment…' : 'Generate assessment →'}
          </Button>
        </div>
      )}
    </div>
  )
}

function AnswerInput({ question, onAnswer }: { question: Question; onAnswer: (a: string) => void }) {
  const [value, setValue] = useState('')

  function submit() {
    const t = value.trim()
    if (t) onAnswer(t)
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Type your answer…"
        rows={2}
        className="resize-none"
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
        autoFocus
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Enter to confirm</span>
        <Button size="sm" onClick={submit} disabled={value.trim().length === 0}>
          Confirm →
        </Button>
      </div>
    </div>
  )
}
