"use client"

import { Button } from "@/components/ui/button"
import { Copy, ClipboardCheck } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function ThinkingDisplay({ thoughts }: { thoughts: string }) {
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new thoughts arrive
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [thoughts])

  return (
    <div className="rounded-md border border-border bg-transparent">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/80">
        <p className="text-xs text-muted-foreground">Reasoning</p>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await navigator.clipboard.writeText(thoughts)
            setCopied(true)
            setTimeout(() => setCopied(false), 1400)
          }}
        >
          {copied ? <ClipboardCheck className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <div ref={scrollRef} className="max-h-64 overflow-auto">
        <pre className="whitespace-pre-wrap px-4 py-3 text-sm leading-6 font-mono text-muted-foreground border-l-2 border-border">
          {thoughts}
        </pre>
      </div>
    </div>
  )
}
