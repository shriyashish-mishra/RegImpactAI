import { buildReport } from '@/lib/report/mapper'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const result = await buildReport(id)

  if (!result.ok) {
    return Response.json({ error: 'Assessment not found' }, { status: 404 })
  }

  return Response.json(result.report)
}
