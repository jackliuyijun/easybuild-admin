export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-sm text-muted-foreground">加载中...</span>
      </div>
    </div>
  )
}
