"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy, Download, Timer, ToyBrick } from "lucide-react"
import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export type Post = {
  angle?: string
  content: string
  hooks?: {
    questionHook?: string
    statementHook?: string
  }
  hashtags?: string[]
  finalCta?: string
  metadata?: {
    generationTime?: number
    tokens?: number
  }
}

type HookGroup = {
  title: string
  options: string[]
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
  const [copiedAll, setCopiedAll] = useState(false)
  
  const [selectedHook, setSelectedHook] = useState<"question" | "statement">(
    post.hooks?.questionHook ? "question" : "statement"
  )

  const tags = (post.hashtags || []).map((t) => t.trim()).filter(Boolean)

  const [selectedQuestionHook, setSelectedQuestionHook] = useState<string>("")
  const [selectedStatementHook, setSelectedStatementHook] = useState<string>("")
  const [questionHookGroups, setQuestionHookGroups] = useState<HookGroup[]>([])
  const [statementHookGroups, setStatementHookGroups] = useState<HookGroup[]>([])

  useEffect(() => {
    if (post.hooks?.questionHook) {
      const groups = parseGroupedHookOptions(post.hooks.questionHook)
      setQuestionHookGroups(groups)
      if (groups.length > 0 && groups[0].options.length > 0) {
        setSelectedQuestionHook(groups[0].options[0])
      }
    }

    if (post.hooks?.statementHook) {
      const groups = parseGroupedHookOptions(post.hooks.statementHook)
      setStatementHookGroups(groups)
      if (groups.length > 0 && groups[0].options.length > 0) {
        setSelectedStatementHook(groups[0].options[0])
      }
    }
  }, [post.hooks])

  function parseGroupedHookOptions(text: string): HookGroup[] {
    if (!text) return []

    const cleanText = text
      .replace(/^Here are a few options.*?:/i, "")
      .replace(/Choose the one that best fits.*/i, "")
      .trim()

    const sections = cleanText.split(/\*\*(.*?)\*\*/g).filter(Boolean)
    if (sections.length <= 1) {
      const options =
        cleanText.match(/\d+\.\s*".*?"/g)?.map(o => o.replace(/^\d+\.\s*/, "").replace(/"/g, "")) ||
        (cleanText ? [cleanText.trim()] : [])
      return options.length > 0 ? [{ title: "Suggested Hooks", options }] : []
    }

    const groups: HookGroup[] = []
    for (let i = 0; i < sections.length; i += 2) {
      const title = sections[i].replace(/:/g, "").trim()
      const content = sections[i + 1] || ""
      const options =
        content.match(/\d+\.\s*".*?"/g)?.map(o => o.replace(/^\d+\.\s*/, "").replace(/"/g, "")) || []
      
      if (title && options.length > 0) {
        groups.push({ title, options })
      }
    }
    return groups
  }

  const getCurrentHook = () => {
    if (selectedHook === "question") {
      return selectedQuestionHook
    }
    return selectedStatementHook
  }

  const buildLinkedInText = () => {
    const hook = normalizeForLinkedIn(getCurrentHook())
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

  const buildContentAndTags = () => {
    const body = normalizeForLinkedIn(post.content || "")
    const cleanedTags = tags.map(sanitizeHashtag).filter(Boolean).join(" ")
    const parts: string[] = []
    if (body) parts.push(body)
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
    <Card className="border-border/70 bg-transparent w-full max-w-none flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Post {index}</span>
          {post.angle && <span className="truncate max-w-[60%]">{post.angle}</span>}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4 flex-grow flex flex-col">
        {/* A/B Test Hooks Selection */}
        {(questionHookGroups.length > 0 || statementHookGroups.length > 0) && (
          <div className="w-full">
            <div className="mb-2 flex items-center">
              <span className="text-xs uppercase tracking-wide text-muted-foreground mr-2">
                A/B Test Hooks:
              </span>
              <Tabs
                value={selectedHook}
                onValueChange={(v) => setSelectedHook(v as "question" | "statement")}
                className="flex-1"
              >
                <TabsList className="grid w-full grid-cols-2 h-8">
                  <TabsTrigger value="question" className="text-xs">
                    Question
                  </TabsTrigger>
                  <TabsTrigger value="statement" className="text-xs">
                    Statement
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="rounded-md border border-border/60 p-1 bg-transparent">
              <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {(selectedHook === 'question' ? questionHookGroups : statementHookGroups).map((group, groupIndex) => (
                  <AccordionItem value={`item-${groupIndex}`} key={groupIndex} className="border-b-0">
                    <AccordionTrigger className="text-sm font-medium px-3 py-2 hover:no-underline hover:bg-accent/50 rounded-md">
                      {group.title}
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-1">
                      <RadioGroup
                        value={selectedHook === 'question' ? selectedQuestionHook : selectedStatementHook}
                        onValueChange={selectedHook === 'question' ? setSelectedQuestionHook : setSelectedStatementHook}
                        className="space-y-1 px-3"
                      >
                        {group.options.map((option, i) => (
                          <div key={i} className="flex items-start gap-3 p-2 rounded-md hover:bg-accent/50">
                            <RadioGroupItem 
                              id={`${selectedHook}-${index}-${groupIndex}-${i}`} 
                              value={option} 
                              className="mt-1.5"
                            />
                            <label 
                              htmlFor={`${selectedHook}-${index}-${groupIndex}-${i}`} 
                              className="text-sm leading-relaxed cursor-pointer"
                            >
                              {option}
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        )}

        {/* Post Preview Card */}
        <div className="flex-grow flex flex-col rounded-md border border-border/60 bg-secondary/30 p-4 space-y-4">
          <p className="font-semibold text-foreground leading-snug">{getCurrentHook()}</p>
          <div className="w-full border-t border-border/60"></div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground flex-grow">{post.content}</p>
        </div>

        {/* CTA and Hashtags */}
        <div className="space-y-3">
          {post.finalCta && (
            <div className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3 py-1.5">
              {post.finalCta}
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {sanitizeHashtag(tag)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Utilities */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(buildContentAndTags(), setCopiedBody)}
            className="text-xs h-7 px-2"
            aria-label="Copy content and tags"
            title="Copy content and tags"
          >
            {copiedBody ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            Content + Tags
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(buildLinkedInText(), setCopiedAll)}
            className="text-xs h-7 px-2"
            aria-label="Copy all (Hook + Content + Tags)"
            title="Copy all (Hook + Content + Tags)"
          >
            {copiedAll ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            Copy All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveText}
            className="text-xs h-7 px-2"
            aria-label="Save as text file"
            title="Save as text file"
          >
            <Download className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>

        {/* Metadata */}
        {post.metadata && (
          <div className="flex items-center justify-end gap-4 pt-3 border-t border-border/60">
            {post.metadata.generationTime && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Generation Time">
                <Timer className="h-3.5 w-3.5" />
                <span>{(post.metadata.generationTime / 1000).toFixed(2)}s</span>
              </div>
            )}
            {post.metadata.tokens && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title="Estimated Tokens">
                <ToyBrick className="h-3.5 w-3.5" />
                <span>{post.metadata.tokens}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
