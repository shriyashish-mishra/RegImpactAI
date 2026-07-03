'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteHeader       from '@/components/shell/SiteHeader'
import StepIndicator    from '@/components/shell/StepIndicator'
import SeedScreen       from '@/components/screens/SeedScreen'
import MirrorScreen     from '@/components/screens/MirrorScreen'
import DiscoveryScreen  from '@/components/screens/DiscoveryScreen'
import GeneratingScreen from '@/components/screens/GeneratingScreen'
import type { Step, DraftModel, ConfirmedModel, Question } from '@/lib/types'

const STEP_NUMBER: Record<Step, 1 | 2 | 3 | 4> = {
  seed:       1,
  mirror:     2,
  discovery:  3,
  generating: 4,
}

export default function Home() {
  const router = useRouter()

  const [step, setStep]                     = useState<Step>('seed')
  const [draftModel, setDraftModel]         = useState<DraftModel | null>(null)
  const [confirmedModel, setConfirmedModel] = useState<ConfirmedModel | null>(null)
  const [questions, setQuestions]           = useState<Question[]>([])
  const [assessmentId, setAssessmentId]     = useState<string | null>(null)

  function handleSynthesisComplete(id: string, model: DraftModel) {
    setAssessmentId(id)
    setDraftModel(model)
    setStep('mirror')
  }

  function handleModelConfirmed(model: ConfirmedModel) {
    setConfirmedModel(model)
    setStep('discovery')
  }

  function handleDiscoveryComplete(answeredQuestions: Question[]) {
    setQuestions(answeredQuestions)
    setStep('generating')
  }

  function handleGenerationComplete() {
    if (assessmentId) {
      router.push(`/report/${assessmentId}`)
    }
  }

  function handleStartOver() {
    setStep('seed')
    setDraftModel(null)
    setConfirmedModel(null)
    setQuestions([])
    setAssessmentId(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader current="live" />
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <StepIndicator currentStep={STEP_NUMBER[step]} />
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {step === 'seed' && (
          <SeedScreen onComplete={handleSynthesisComplete} />
        )}
        {step === 'mirror' && draftModel && assessmentId && (
          <MirrorScreen
            draftModel={draftModel}
            assessmentId={assessmentId}
            onConfirm={handleModelConfirmed}
            onStartOver={handleStartOver}
          />
        )}
        {step === 'discovery' && confirmedModel && (
          <DiscoveryScreen
            confirmedModel={confirmedModel}
            onComplete={handleDiscoveryComplete}
          />
        )}
        {step === 'generating' && confirmedModel && assessmentId && (
          <GeneratingScreen
            confirmedModel={confirmedModel}
            questions={questions}
            assessmentId={assessmentId}
            onComplete={handleGenerationComplete}
          />
        )}
      </main>
    </div>
  )
}
