
// 'use client';

// import { useState } from "react";
// import { Loader2, Send, Sparkles } from "lucide-react";
// import { Post, PostCard } from "@/components/ui/PostCard";
// import { ThinkingDisplay } from "@/components/ui/ThinkingDisplay";
// import { AnimatePresence, motion } from "framer-motion";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
//           const jsonString = line.replace('data: ', '');
//           if (jsonString.trim() === "") continue;
//           const data = JSON.parse(jsonString);

//           if (data.thought) setThoughts(prev => prev + data.thought);
//           if (data.posts) setPosts(data.posts);
//           if (data.error) throw new Error(data.error);
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
//           <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AI Post Generator</h1>
//           <p className="mt-2 text-lg text-muted-foreground">Powered by Gemini 2.5 Pro's reasoning engine.</p>
//         </header>

//         <form onSubmit={handleSubmit} className="w-full space-y-6 mb-12">
//           <div className="space-y-2">
//             <Label htmlFor="topic">Topic</Label>
//             <Textarea
//               id="topic"
//               name="topic"
//               placeholder="e.g., Cold-start strategies for marketplaces"
//               className="min-h-[100px] bg-secondary"
//               required
//             />
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="tone">Tone</Label>
//               <Input id="tone" name="tone" defaultValue="Professional" />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="audience">Audience</Label>
//               <Input id="audience" name="audience" defaultValue="Tech Professionals" />
//             </div>
//           </div>
//           <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
//             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
//             {isLoading ? 'Generating...' : 'Generate Posts'}
//           </Button>
//         </form>

//         <AnimatePresence>
//           <div className="w-full space-y-8 flex flex-col items-center">
//             {thoughts && (
//               <Accordion type="single" collapsible className="w-full">
//                 <AccordionItem value="item-1">
//                   <AccordionTrigger>
//                     <span className="flex items-center">
//                       <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
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

'use client';

import { useState } from "react";
import { Post, PostCard } from "@/components/ui/PostCard";
import { ThinkingDisplay } from "@/components/ui/ThinkingDisplay";
import { AnimatePresence, motion } from "framer-motion";
import { PostForm } from "@/components/ui/PostForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles } from "lucide-react";

export default function GeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thoughts, setThoughts] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);

  const resetState = () => {
    setThoughts('');
    setPosts([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    resetState();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.body) throw new Error("The response body is empty.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const jsonString = line.replace('data: ', '');
            if (jsonString.trim() === "") continue;
            const data = JSON.parse(jsonString);

            if (data.thought) setThoughts(prev => prev + data.thought);
            if (data.posts) setPosts(data.posts);
            if (data.error) throw new Error(data.error);
          } catch (e) {
            console.error("Error parsing stream chunk:", e);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center w-full min-h-screen p-4 md:p-8">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Thinking AI Post Generator</h1>
          <p className="mt-2 text-lg text-muted-foreground">Powered by Gemini 2.5 Pro's reasoning engine.</p>
        </header>

        <div className="w-full mb-12">
          <PostForm handleSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        <AnimatePresence>
          <div className="w-full space-y-8 flex flex-col items-center">
            {thoughts && (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-border/40">
                  <AccordionTrigger>
                    <span className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                      <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
                      Show Agent's Thought Process
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ThinkingDisplay thoughts={thoughts} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}

            {posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <h2 className="text-2xl font-bold text-center mb-6">Generated Posts</h2>
                <div className="space-y-6">
                  {posts.map((post, i) => <PostCard key={i} post={post} />)}
                </div>
              </motion.div>
            )}

            {error && (
               <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-destructive-foreground bg-destructive p-4 rounded-lg w-full">
                 <strong>Error:</strong> {error}
               </motion.div>
            )}
          </div>
        </AnimatePresence>
      </div>
    </main>
  );
}