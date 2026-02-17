import type { ReactNode } from "react"

interface Props {
  children: ReactNode
  sidebar: ReactNode
}

export default function ServicesLayout({ children, sidebar }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">{children}</div>
      <div className="lg:col-span-1">{sidebar}</div>
    </div>
  )
}
