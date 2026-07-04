'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import type { StructuredProductInfo, ProductCategory, TargetCustomer, RegulatedEntityType, Capability } from '@/lib/types'

type Props = {
  onComplete: (info: StructuredProductInfo) => void
}

const CATEGORIES: ProductCategory[] = [
  'Digital Lending', 'BNPL', 'Payments', 'Wallet', 'Neobank',
  'Invoice Financing', 'Wealth Management', 'Investment Platform',
  'Insurance', 'Lending Marketplace', 'Other',
]

const TARGET_CUSTOMERS: TargetCustomer[] = [
  'Retail Consumers', 'SMEs', 'Enterprises', 'Merchants', 'Banks', 'NBFCs',
]

const REGULATED_ENTITIES: RegulatedEntityType[] = [
  'RBI Regulated NBFC', 'Bank', 'FinTech partnered with NBFC',
  'Payment Aggregator', 'PPI Issuer', 'Other',
]

const CAPABILITIES: Capability[] = [
  'Aadhaar eKYC', 'PAN Verification', 'Video KYC', 'CKYC', 'Credit Bureau Checks',
  'UPI', 'UPI AutoPay', 'eSign', 'Digital Loan Agreement', 'Loan Disbursement',
  'EMI', 'Collections', 'Fraud Detection', 'AI Underwriting', 'WhatsApp Notifications',
  'SMS', 'Email', 'Credit Reporting', 'Device Fingerprinting', 'Risk Engine',
  'OCR', 'Document Upload',
]

export default function ProductInfoScreen({ onComplete }: Props) {
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState<ProductCategory>('Digital Lending')
  const [targetCustomer, setTargetCustomer] = useState<TargetCustomer>('Retail Consumers')
  const [regulatedEntity, setRegulatedEntity] = useState<RegulatedEntityType>('FinTech partnered with NBFC')
  const [capabilities, setCapabilities] = useState<Capability[]>([])

  const canSubmit = productName.trim().length > 0

  function toggleCapability(cap: Capability) {
    setCapabilities(prev => prev.includes(cap) ? prev.filter(c => c !== cap) : [...prev, cap])
  }

  function handleSubmit() {
    if (!canSubmit) return
    onComplete({
      product_name:     productName.trim(),
      industry:         'FinTech',
      category,
      geography:        'India',
      target_customer:  targetCustomer,
      regulated_entity: regulatedEntity,
      capabilities,
    })
  }

  return (
    <div className="flex flex-col gap-8 p-6 bg-surface border border-border rounded-xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">
          Basic product information
        </h1>
        <p className="text-muted text-sm leading-relaxed">
          A few structured fields first — these give Gemini ground truth instead of making it
          guess, which means fewer inferred assumptions later and a more accurate assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="product-name" className="text-xs font-medium text-subtle uppercase tracking-wide">
            Product Name
          </label>
          <Input
            id="product-name"
            value={productName}
            onChange={e => setProductName(e.target.value)}
            placeholder="e.g. QuickCredit"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-subtle uppercase tracking-wide">Industry</label>
          <div className="flex h-9 items-center rounded-md border border-border bg-surface-raised px-3 text-sm text-muted">
            FinTech
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-subtle uppercase tracking-wide">Operating Geography</label>
          <div className="flex h-9 items-center rounded-md border border-border bg-surface-raised px-3 text-sm text-muted">
            India
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-xs font-medium text-subtle uppercase tracking-wide">
            Primary Product Category
          </label>
          <Select id="category" value={category} onChange={e => setCategory(e.target.value as ProductCategory)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="target-customer" className="text-xs font-medium text-subtle uppercase tracking-wide">
            Target Customer
          </label>
          <Select id="target-customer" value={targetCustomer} onChange={e => setTargetCustomer(e.target.value as TargetCustomer)}>
            {TARGET_CUSTOMERS.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="regulated-entity" className="text-xs font-medium text-subtle uppercase tracking-wide">
            Regulated Entity
          </label>
          <Select id="regulated-entity" value={regulatedEntity} onChange={e => setRegulatedEntity(e.target.value as RegulatedEntityType)}>
            {REGULATED_ENTITIES.map(r => <option key={r} value={r}>{r}</option>)}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-medium text-subtle uppercase tracking-wide">
          Secondary Capabilities <span className="text-subtle/70 normal-case">(select all that apply)</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {CAPABILITIES.map(cap => {
            const selected = capabilities.includes(cap)
            return (
              <button
                key={cap}
                type="button"
                onClick={() => toggleCapability(cap)}
                aria-pressed={selected}
                className={[
                  'text-xs font-medium px-3 py-1.5 rounded-full border transition-colors',
                  selected
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'bg-surface-raised border-border text-muted hover:border-subtle hover:text-foreground',
                ].join(' ')}
              >
                {cap}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button variant="accent" onClick={handleSubmit} disabled={!canSubmit}>
          Continue →
        </Button>
      </div>
    </div>
  )
}
