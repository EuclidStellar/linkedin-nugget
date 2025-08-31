"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import { ThinkingDisplay } from "@/components/ui/ThinkingDisplay"
import { PostCard, type Post } from "@/components/ui/PostCard"
import { PostForm } from "@/components/ui/PostForm"

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thoughts, setThoughts] = useState<string>("")
  const [posts, setPosts] = useState<Post[]>([])

  const resetState = () => {
    setThoughts("")
    setPosts([])
    setError(null)
  }

  async function handleSubmit(formData: FormData) {
    if (isLoading) return
    resetState()
    setIsLoading(true)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      })

      if (!res.body) throw new Error("The response body is empty.")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        const lines = chunk.split("\n\n").filter((l) => l.startsWith("data: "))

        for (const line of lines) {
          try {
            const json = JSON.parse(line.replace("data: ", ""))
            if (json.thought) setThoughts((prev) => prev + json.thought)
            if (json.posts) setPosts(json.posts)
            if (json.error) throw new Error(json.error)
          } catch {
            // swallow parse errors for partial frames
          }
        }
      }
    } catch (e: any) {
      setError(e.message || "Unexpected error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center w-full min-h-screen p-4 md:p-8 gap-8">
      {/* Container for Form and Header with a constrained width */}
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            Thinking AI Post Generator
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance mt-4 font-sans">
            Minimal LinkedIn Post Creator
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Stream the agent’s reasoning and get polished posts with hooks, hashtags, and a CTA.
          </p>
        </header>

        <Card className="border-border">
          <CardContent className="p-4 md:p-6">
            <PostForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitButton={
                <Button className="w-full md:w-auto" disabled={isLoading} variant="secondary">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    "Generate posts"
                  )}
                </Button>
              }
            />
          </CardContent>
        </Card>

        {thoughts && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="plan" className="border-border">
              <AccordionTrigger>
                <span className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <Sparkles className="h-4 w-4 mr-2 text-muted-foreground" />
                  Show thinking
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <ThinkingDisplay thoughts={thoughts} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {isLoading && posts.length === 0 && (
          <div className="space-y-4">
            <SkeletonLine />
            <SkeletonLine />
            <SkeletonBlock />
          </div>
        )}

        {error &&
          (error === "GEMINI_OVERLOADED" ? (
            <div className="text-amber-900 bg-amber-100 p-4 rounded-md text-sm border border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900">
              <strong className="font-semibold">Model Overloaded</strong>
              <p className="mt-1">
                The AI model is currently experiencing high demand. Please wait a moment, then refresh the page and try again.
              </p>
            </div>
          ) : (
            <div className="text-destructive-foreground bg-destructive p-3 rounded-md text-sm border border-destructive/60">
              <strong className="font-medium">Error:</strong> {error}
            </div>
          ))}
      </div>

      {/* Container for Posts with a wider layout */}
      {posts.length > 0 && (
        <section
          aria-label="Generated posts"
          className={`w-full ${
            posts.length === 2
              ? "max-w-7xl grid grid-cols-1 md:grid-cols-2 md:gap-10 gap-8"
              : "max-w-2xl space-y-6"
          }`}
        >
          {posts.map((post, i) => (
            <div key={i}>
              <PostCard post={post} index={i + 1} />
            </div>
          ))}
        </section>
      )}
    </main>
  )
}

function SkeletonLine() {
  return <div className="h-4 w-2/3 rounded bg-muted/40" />
}
function SkeletonBlock() {
  return <div className="h-24 w-full rounded bg-muted/40" />
}
