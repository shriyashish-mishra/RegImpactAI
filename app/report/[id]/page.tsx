// Report page — server component.
// Reads persisted findings from Postgres by assessment_id.
// Fully implemented in Milestone 6 (Report).
// In Milestone 1 this is a stub that confirms the route resolves.

type Props = {
  params: Promise<{ id: string }>
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            Regulatory Impact Assessment
          </h1>
          <p className="text-slate-500 text-sm">
            Assessment <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">{id}</span>
          </p>
          <p className="text-slate-400 text-sm mt-4">
            Report rendering is implemented in Milestone 6.
          </p>
        </div>
      </div>
    </div>
  )
}
