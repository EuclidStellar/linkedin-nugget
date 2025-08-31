
// 'use client';

// import { useState } from "react";
// import { Post, PostCard } from "@/components/ui/PostCard";
// import { ThinkingDisplay } from "@/components/ui/ThinkingDisplay";
// import { AnimatePresence, motion } from "framer-motion";
// import { PostForm } from "@/components/ui/PostForm";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// import { Sparkles } from "lucide-react";

// export default function GeneratorPage() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [thoughts, setThoughts] = useState<string>('');
//   const [posts, setPosts] = useState<Post[]>([]);

//   const resetState = () => {
//     setThoughts('');
//     setPosts([]);
//     setError(null);
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (isLoading) return;

//     resetState();
//     setIsLoading(true);

//     const formData = new FormData(e.currentTarget);
//     const data = Object.fromEntries(formData.entries());

//     try {
//       const response = await fetch('/api/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(data),
//       });

//       if (!response.body) throw new Error("The response body is empty.");

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder();

//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) break;

//         const chunk = decoder.decode(value);
//         const lines = chunk.split('\n\n').filter(line => line.startsWith('data: '));

//         for (const line of lines) {
//           try {
//             const jsonString = line.replace('data: ', '');
//             if (jsonString.trim() === "") continue;
//             const data = JSON.parse(jsonString);

//             if (data.thought) setThoughts(prev => prev + data.thought);
//             if (data.posts) setPosts(data.posts);
//             if (data.error) throw new Error(data.error);
//           } catch (e) {
//             console.error("Error parsing stream chunk:", e);
//           }
//         }
//       }
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <main className="flex flex-col items-center w-full min-h-screen p-4 md:p-8">
//       <div className="w-full max-w-2xl flex flex-col items-center">
//         <header className="text-center mb-10">
//           <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Thinking AI Post Generator</h1>
//           <p className="mt-2 text-lg text-muted-foreground">Powered by Gemini 2.5 Pro's reasoning engine.</p>
//         </header>

//         <div className="w-full mb-12">
//           <PostForm handleSubmit={handleSubmit} isLoading={isLoading} />
//         </div>

//         <AnimatePresence>
//           <div className="w-full space-y-8 flex flex-col items-center">
//             {thoughts && (
//               <Accordion type="single" collapsible className="w-full">
//                 <AccordionItem value="item-1" className="border-border/40">
//                   <AccordionTrigger>
//                     <span className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
//                       <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
//                       Show Agent's Thought Process
//                     </span>
//                   </AccordionTrigger>
//                   <AccordionContent>
//                     <ThinkingDisplay thoughts={thoughts} />
//                   </AccordionContent>
//                 </AccordionItem>
//               </Accordion>
//             )}

//             {posts.length > 0 && (
//               <motion.div
//                 initial={{ opacity: 0, y: 10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="w-full"
//               >
//                 <h2 className="text-2xl font-bold text-center mb-6">Generated Posts</h2>
//                 <div className="space-y-6">
//                   {posts.map((post, i) => <PostCard key={i} post={post} />)}
//                 </div>
//               </motion.div>
//             )}

//             {error && (
//                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-destructive-foreground bg-destructive p-4 rounded-lg w-full">
//                  <strong>Error:</strong> {error}
//                </motion.div>
//             )}
//           </div>
//         </AnimatePresence>
//       </div>
//     </main>
//   );
// }

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
    <main className="flex flex-col items-center w-full min-h-screen p-4 md:p-8">
      <div className="w-full max-w-xl flex flex-col gap-8">
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

        {posts.length > 0 && (
          <section aria-label="Generated posts" className="space-y-4">
            {posts.map((post, i) => (
              <PostCard key={i} post={post} index={i + 1} />
            ))}
          </section>
        )}

        {error && (
          <div className="text-destructive-foreground bg-destructive p-3 rounded-md text-sm border border-destructive/60">
            <strong className="font-medium">Error:</strong> {error}
          </div>
        )}
      </div>
    </main>
  )
}

function SkeletonLine() {
  return <div className="h-4 w-2/3 rounded bg-muted/40" />
}
function SkeletonBlock() {
  return <div className="h-24 w-full rounded bg-muted/40" />
}
