export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#56939F]" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}
