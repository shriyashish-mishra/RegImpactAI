'use client'

import { useState } from 'react'
import { Button }        from '@/components/ui/button'
import { Textarea }      from '@/components/ui/textarea'
import ScopeBoundaryNote from '@/components/primitives/ScopeBoundaryNote'
import QuotaExceededScreen from '@/components/primitives/QuotaExceededScreen'
import type { DraftModel, SynthesisResponse, QuotaExceededResponse, StructuredProductInfo } from '@/lib/types'

type Props = {
  structuredInfo: StructuredProductInfo
  onComplete: (assessmentId: string, model: DraftModel) => void
}

export default function SeedScreen({ structuredInfo, onComplete }: Props) {
  const [description, setDescription] = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [quotaExceeded, setQuotaExceeded] = useState<QuotaExceededResponse | null>(null)

  const canSubmit = description.trim().length > 30 && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ structuredInfo, description: description.trim() }),
      })

      const data = await res.json()

      if (res.status === 429 && data?.error === 'quota_exceeded') {
        setQuotaExceeded(data as QuotaExceededResponse)
        return
      }

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

  if (quotaExceeded) {
    return <QuotaExceededScreen resetAt={quotaExceeded.resetAt} />
  }

  return (
    <div className="flex flex-col gap-8 p-6 bg-surface border border-border rounded-xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Describe your product&apos;s workflow
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          The structured fields already captured the basics — {structuredInfo.categories.join(', ').toLowerCase() || 'your product categories'},{' '}
          {structuredInfo.capabilities.length > 0 ? `${structuredInfo.capabilities.length} capabilities, ` : ''}
          who it&apos;s for. Now describe the workflow, the customer journey, and any unique
          features that weren&apos;t captured above — the assessment focuses on this nuance.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={
            'e.g. Customers apply through our mobile app, complete video KYC, and get an ' +
            'instant loan offer with a Key Fact Statement shown before confirmation. Loans ' +
            'disburse directly to the customer\'s bank account and repay via EMI.'
          }
          rows={6}
          className="resize-none"
          disabled={loading}
        />
        <p className="text-xs text-subtle">
          {description.trim().length < 30
            ? `${30 - description.trim().length} more characters to continue`
            : 'Ready to analyse'}
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between">
        <ScopeBoundaryNote />
        <Button variant="accent" onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? 'Analysing…' : 'Analyse product →'}
        </Button>
      </div>
    </div>
  )
}
