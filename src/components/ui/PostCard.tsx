"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy, Download } from "lucide-react"
import { useState } from "react"

export type Post = {
  angle?: string
  content: string
  hooks?: {
    questionHook?: string
    statementHook?: string
  }
  hashtags?: string[]
  finalCta?: string
}

function normalizeForLinkedIn(text: string) {
  if (!text) return ""
  return (
    text
      // strip common markdown emphasis/code markers
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      .replace(/`{1,3}([\s\S]*?)`{1,3}/g, "$1")
      // normalize list bullets to dash
      .replace(/^\s*[-*]\s+/gm, "- ")
      // tidy whitespace
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  )
}

function sanitizeHashtag(tag: string) {
  const core = (tag || "").trim().replace(/^#/, "").replace(/\s+/g, "")
  if (!core) return ""
  return `#${core.toLowerCase()}`
}

export function PostCard({ post, index }: { post: Post; index: number }) {
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedTags, setCopiedTags] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false) // track 'copy all'

  const tags = (post.hashtags || []).map((t) => t.trim()).filter(Boolean)

  const buildLinkedInText = () => {
    const hook = normalizeForLinkedIn(post.hooks?.questionHook || post.hooks?.statementHook || "")
    const body = normalizeForLinkedIn(post.content || "")
    const cta = normalizeForLinkedIn(post.finalCta || "")

    const cleanedTags = tags.map(sanitizeHashtag).filter(Boolean).join(" ")

    const parts: string[] = []
    if (hook) parts.push(hook)
    if (body) parts.push("", body)
    if (cta) parts.push("", cta)
    if (cleanedTags) parts.push("", cleanedTags)
    return parts.join("\n")
  }

  const saveText = () => {
    const blob = new Blob([buildLinkedInText()], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `post-${index}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const copy = async (text: string, setter: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 1200)
  }

  return (
    <Card className="border-border/70 bg-transparent">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Post {index}</span>
          {post.angle && <span className="truncate max-w-[60%]">{post.angle}</span>}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Hooks */}
        {post.hooks && (post.hooks.questionHook || post.hooks.statementHook) ? (
          <Tabs defaultValue={post.hooks.questionHook ? "question" : "statement"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="question">Question hook</TabsTrigger>
              <TabsTrigger value="statement">Statement hook</TabsTrigger>
            </TabsList>
            <TabsContent value="question">
              <p className="text-sm leading-6">{post.hooks?.questionHook}</p>
            </TabsContent>
            <TabsContent value="statement">
              <p className="text-sm leading-6">{post.hooks?.statementHook}</p>
            </TabsContent>
          </Tabs>
        ) : null}

        {/* Body */}
        <div className="rounded-md border border-border/60 p-3 bg-transparent">
          <p className="whitespace-pre-wrap text-pretty leading-7 text-sm">{post.content}</p>
        </div>

        {/* Hashtags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {sanitizeHashtag(tag)}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA */}
        {post.finalCta && (
          <div className="rounded-md border border-border/60 p-3 bg-transparent">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Call to action</span>
            <p className="text-sm leading-6 mt-1">{post.finalCta}</p>
          </div>
        )}

        {/* Utilities */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(post.content, setCopiedBody)}
            aria-label="Copy post body"
          >
            {copiedBody ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copiedBody ? "Copied" : "Copy body"}
          </Button>
          {tags.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => copy(tags.map(sanitizeHashtag).join(" "), setCopiedTags)}
              aria-label="Copy hashtags"
            >
              {copiedTags ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copiedTags ? "Copied" : "Copy tags"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(buildLinkedInText(), setCopiedAll)}
            aria-label="Copy full post (LinkedIn-ready)"
            title="Copy full post (LinkedIn-ready)"
          >
            {copiedAll ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copiedAll ? "Copied" : "Copy all"}
          </Button>
          <Button variant="outline" size="sm" onClick={saveText} aria-label="Download post">
            <Download className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
