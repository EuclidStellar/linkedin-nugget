
// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Copy, Check, TestTube2 } from "lucide-react";
// import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

// export interface Post {
//   angle: string;
//   content: string;
//   hooks: { questionHook: string; statementHook: string; };
//   hashtags: string[];
//   finalCta: string;
// }

// interface PostCardProps {
//   post: Post;
// }

// export function PostCard({ post }: PostCardProps) {
//   const { isCopied, copy } = useCopyToClipboard();
//   const fullPostContent = `${post.hooks.statementHook}\n\n${post.content}\n\n${post.finalCta}\n\n${post.hashtags.join(' ')}`;

//   return (
//     <Card className="w-full bg-card border shadow-sm hover:shadow-md transition-shadow duration-300">
//       <CardHeader>
//         <div className="flex justify-between items-center">
//           <CardTitle className="text-base font-semibold text-card-foreground">
//             {post.angle}
//           </CardTitle>
//           <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => copy(fullPostContent)}>
//             {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
//             {post.content}
//             <p className="mt-4 font-medium text-foreground">{post.finalCta}</p>
//         </div>
//         <div className="mt-4 text-sm text-primary/80 font-medium">
//           {post.hashtags.join(' ')}
//         </div>
//         <div className="mt-6 border-t pt-4">
//             <h4 className="flex items-center text-sm font-semibold text-muted-foreground mb-2">
//                 <TestTube2 className="h-4 w-4 mr-2 text-primary/70"/> A/B Test Hooks
//             </h4>
//             <div className="text-sm text-muted-foreground space-y-2 pl-6">
//                 <p><strong>Q:</strong> <em>{post.hooks.questionHook}</em></p>
//                 <p><strong>S:</strong> <em>{post.hooks.statementHook}</em></p>
//             </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }

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

export function PostCard({ post, index }: { post: Post; index: number }) {
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedTags, setCopiedTags] = useState(false)
  const [copiedAll, setCopiedAll] = useState(false) // track 'copy all'

  const tags = (post.hashtags || []).map((t) => t.trim()).filter(Boolean)

  const buildAllText = () => {
    const parts = [
      post.angle ? `Angle: ${post.angle}` : "",
      post.content,
      tags.length ? tags.join(" ") : "",
      post.finalCta ? `CTA: ${post.finalCta}` : "",
    ].filter(Boolean)
    return parts.join("\n\n")
  }

  const saveText = () => {
    const blob = new Blob([buildAllText()], { type: "text/plain;charset=utf-8" })
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
    <Card className="border-border/70">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Post {index}</span>
          {post.angle && <span className="truncate max-w-[60%]">Angle: {post.angle}</span>}
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
        <div className="rounded-md border border-border/60 p-3 bg-background/60">
          <p className="whitespace-pre-wrap text-pretty leading-7 text-sm">{post.content}</p>
        </div>

        {/* Hashtags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* CTA */}
        {post.finalCta && (
          <div className="rounded-md border border-border/60 p-3 bg-muted/10">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">CTA</span>
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
              onClick={() => copy(tags.join(" "), setCopiedTags)}
              aria-label="Copy hashtags"
            >
              {copiedTags ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copiedTags ? "Copied" : "Copy tags"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => copy(buildAllText(), setCopiedAll)}
            aria-label="Copy full post"
          >
            {copiedAll ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copiedAll ? "Copied" : "Copy all"}
          </Button>
          <Button variant="default" size="sm" onClick={saveText} aria-label="Download post">
            <Download className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
