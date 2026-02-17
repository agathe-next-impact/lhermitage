import type { ReactNode } from "react"

interface Props {
  children: ReactNode
  sidebar: ReactNode
  lieu: ReactNode
}

export default function ExperienceLayout({ children, sidebar, lieu }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">{children}</div>
      <div className="lg:col-span-1 space-y-6">
        {sidebar}
        {lieu}
      </div>
    </div>
  )
}
