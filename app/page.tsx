'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SiteHeader        from '@/components/shell/SiteHeader'
import StepIndicator     from '@/components/shell/StepIndicator'
import LandingStory      from '@/components/screens/LandingStory'
import ProductInfoScreen from '@/components/screens/ProductInfoScreen'
import SeedScreen        from '@/components/screens/SeedScreen'
import MirrorScreen      from '@/components/screens/MirrorScreen'
import DiscoveryScreen   from '@/components/screens/DiscoveryScreen'
import GeneratingScreen  from '@/components/screens/GeneratingScreen'
import type { Step, StructuredProductInfo, DraftModel, ConfirmedModel, Question } from '@/lib/types'

const STEP_NUMBER: Record<Step, 1 | 2 | 3 | 4 | 5> = {
  product_info: 1,
  seed:         2,
  mirror:       3,
  discovery:    4,
  generating:   5,
}

export default function Home() {
  const router = useRouter()

  const [step, setStep]                     = useState<Step>('product_info')
  const [structuredInfo, setStructuredInfo] = useState<StructuredProductInfo | null>(null)
  const [draftModel, setDraftModel]         = useState<DraftModel | null>(null)
  const [confirmedModel, setConfirmedModel] = useState<ConfirmedModel | null>(null)
  const [questions, setQuestions]           = useState<Question[]>([])
  const [assessmentId, setAssessmentId]     = useState<string | null>(null)

  function handleProductInfoComplete(info: StructuredProductInfo) {
    setStructuredInfo(info)
    setStep('seed')
  }

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
    setStep('product_info')
    setStructuredInfo(null)
    setDraftModel(null)
    setConfirmedModel(null)
    setQuestions([])
    setAssessmentId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current="live" />

      {step === 'product_info' ? (
        <main className="mx-auto max-w-3xl px-6">
          <LandingStory />
          <div className="pb-10">
            <ProductInfoScreen onComplete={handleProductInfoComplete} />
          </div>
        </main>
      ) : (
        <>
          <div className="border-b border-border bg-surface">
            <div className="mx-auto max-w-3xl px-6 py-4">
              <StepIndicator currentStep={STEP_NUMBER[step]} />
            </div>
          </div>
          <main className="mx-auto max-w-3xl px-6 py-10">
            {step === 'seed' && structuredInfo && (
              <SeedScreen structuredInfo={structuredInfo} onComplete={handleSynthesisComplete} />
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
        </>
      )}
    </div>
  )
}
