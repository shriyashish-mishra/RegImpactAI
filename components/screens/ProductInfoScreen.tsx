'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ChipMultiSelect from '@/components/primitives/ChipMultiSelect'
import type { StructuredProductInfo, ProductCategory, Geography, TargetCustomer, RegulatedEntityType, Capability } from '@/lib/types'

type Props = {
  onComplete: (info: StructuredProductInfo) => void
}

const CATEGORIES: ProductCategory[] = [
  'Digital Lending', 'Payments', 'BNPL', 'Neobank', 'Invoice Financing',
  'Investment Platform', 'Insurance', 'Merchant Financing',
  'Lending Marketplace', 'Wealth Management', 'Other',
]

const GEOGRAPHIES: Geography[] = ['India', 'Singapore', 'UAE', 'UK', 'EU', 'Other']

const TARGET_CUSTOMERS: TargetCustomer[] = [
  'Retail Consumers', 'SMEs', 'Merchants', 'Enterprises', 'Banks', 'NBFCs', 'Government',
]

const REGULATED_ENTITIES: RegulatedEntityType[] = [
  'Partner NBFC', 'Scheduled Commercial Bank', 'Payment Aggregator', 'PPI Issuer',
  'Account Aggregator', 'Insurance Company', 'Partner Bank', 'Other',
]

const CAPABILITIES: Capability[] = [
  'Aadhaar eKYC', 'PAN Verification', 'Video KYC', 'CKYC', 'Credit Bureau Checks',
  'UPI', 'UPI AutoPay', 'eSign', 'Digital Loan Agreement', 'Loan Disbursement',
  'EMI', 'Collections', 'Fraud Detection', 'AI Underwriting', 'WhatsApp Notifications',
  'SMS', 'Email', 'Credit Reporting', 'Device Fingerprinting', 'Risk Engine',
  'OCR', 'Document Upload',
]

export default function ProductInfoScreen({ onComplete }: Props) {
  const [productName, setProductName]   = useState('')
  const [categories, setCategories]     = useState<ProductCategory[]>([])
  // India pre-selected as a default *selection*, not a hardcoded business
  // rule anywhere downstream — the user can remove it or add more.
  const [geographies, setGeographies]   = useState<Geography[]>(['India'])
  const [targetCustomers, setTargetCustomers] = useState<TargetCustomer[]>([])
  const [regulatedEntities, setRegulatedEntities] = useState<RegulatedEntityType[]>([])
  const [capabilities, setCapabilities] = useState<Capability[]>([])

  const canSubmit = productName.trim().length > 0 && categories.length > 0

  function handleSubmit() {
    if (!canSubmit) return
    onComplete({
      product_name:       productName.trim(),
      industry:           'FinTech',
      categories,
      geographies,
      target_customers:   targetCustomers,
      regulated_entities: regulatedEntities,
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
          A few structured fields first — these give the AI ground truth instead of making it
          guess, which means fewer inferred assumptions later and a more accurate assessment.
          Most products span more than one category, geography, or customer segment — select
          everything that applies.
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
      </div>

      <ChipMultiSelect label="Product Categories" options={CATEGORIES} selected={categories} onChange={setCategories} />
      <ChipMultiSelect label="Operating Geographies" options={GEOGRAPHIES} selected={geographies} onChange={setGeographies} />
      <ChipMultiSelect label="Target Customers" options={TARGET_CUSTOMERS} selected={targetCustomers} onChange={setTargetCustomers} />
      <ChipMultiSelect label="Regulated Entities / Partners" options={REGULATED_ENTITIES} selected={regulatedEntities} onChange={setRegulatedEntities} />
      <ChipMultiSelect label="Secondary Capabilities" options={CAPABILITIES} selected={capabilities} onChange={setCapabilities} />

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-xs text-subtle">
          {categories.length === 0 ? 'Select at least one product category to continue' : ' '}
        </span>
        <Button variant="accent" onClick={handleSubmit} disabled={!canSubmit}>
          Continue →
        </Button>
      </div>
    </div>
  )
}
