'use client'

import { useState } from 'react'
import { Button }        from '@/components/ui/button'
import { Textarea }      from '@/components/ui/textarea'
import ScopeBoundaryNote from '@/components/primitives/ScopeBoundaryNote'
import type { DraftModel, SynthesisResponse } from '@/lib/types'

type Props = {
  onComplete: (assessmentId: string, model: DraftModel) => void
}

export default function SeedScreen({ onComplete }: Props) {
  const [description, setDescription] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const canSubmit = description.trim().length > 30 && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error ?? 'Failed to analyse product description')
      }

      const { assessment_id, model } = data as SynthesisResponse
      onComplete(assessment_id, model)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Describe your product
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Tell me what your fintech product does. I&apos;ll identify which RBI regulations
          apply and which parts of your product they affect.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={
            'e.g. We offer instant personal loans up to ₹2L via a mobile app. ' +
            'Customers complete video KYC, receive a loan offer, and repay in EMIs. ' +
            'We also offer a BNPL option at merchant checkout.'
          }
          rows={6}
          className="resize-none"
          disabled={loading}
        />
        <p className="text-xs text-slate-400">
          {description.trim().length < 30
            ? `${30 - description.trim().length} more characters to continue`
            : 'Ready to analyse'}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <ScopeBoundaryNote />
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? 'Analysing…' : 'Analyse product →'}
        </Button>
      </div>
    </div>
  )
}
