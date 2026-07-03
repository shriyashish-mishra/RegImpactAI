type Props = {
  index: number
  label: string
}

/**
 * The recurring "V_01 / SECTION_NAME" monospace section marker from the
 * design reference — used to open every major section across the redesigned
 * pages so the "versioned engineering document" rhythm is consistent
 * everywhere, not just where it was first introduced.
 */
export default function SectionLabel({ index, label }: Props) {
  return (
    <span className="font-mono text-xs uppercase tracking-widest text-accent">
      V_{String(index).padStart(2, '0')} / {label}
    </span>
  )
}
