'use client'

import { useState } from 'react'
import { Button }        from '@/components/ui/button'
import { Textarea }      from '@/components/ui/textarea'
import ScopeBoundaryNote from '@/components/primitives/ScopeBoundaryNote'
import type { DraftModel } from '@/lib/types'

type Props = {
  onComplete: (assessmentId: string, model: DraftModel) => void
}

const STUB_MODEL: DraftModel = {
  product_name: 'Acme Lending',
  narration: [
    'Reading product description…',
    'Identifying regulated activities…',
    'Mapping to RBI regulatory areas…',
  ],
  elements: [
    { element_type: 'activity', label: 'Digital lending — personal loans', status: 'inferred', is_negative: false, confidence: 'high' },
    { element_type: 'activity', label: 'BNPL / deferred payment',          status: 'inferred', is_negative: false, confidence: 'moderate' },
    { element_type: 'screen',   label: 'Loan offer screen',                status: 'inferred', is_negative: false, confidence: 'moderate' },
    { element_type: 'screen',   label: 'KYC onboarding',                   status: 'inferred', is_negative: false, confidence: 'high' },
    { element_type: 'screen',   label: 'Repayment & collections',          status: 'inferred', is_negative: false, confidence: 'moderate' },
    { element_type: 'activity', label: 'UPI payments',                     status: 'inferred', is_negative: true,  confidence: 'high' },
  ],
  triggered_areas: [
    { area_code: 'DLG',     area_name: 'Digital Lending Guidelines',  status: 'triggered',     reason: 'Product offers direct digital loans to borrowers.' },
    { area_code: 'KYC_AML', area_name: 'KYC Master Direction / AML',  status: 'triggered',     reason: 'Onboarding requires customer due diligence.' },
    { area_code: 'PPI',     area_name: 'Prepaid Payment Instruments', status: 'not_triggered', reason: 'No wallet or PPI product detected.' },
  ],
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

    // Stub — replaced by real /api/synthesize call in Milestone 3
    await new Promise(r => setTimeout(r, 1200))
    const stubId = crypto.randomUUID()
    onComplete(stubId, STUB_MODEL)

    setLoading(false)
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
