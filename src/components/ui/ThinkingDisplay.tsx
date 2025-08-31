// // 'use client';

// // import { motion } from "framer-motion";
// // import { Sparkles } from "lucide-react";
// // import { marked } from 'marked';

// // interface ThinkingDisplayProps {
// //   thoughts: string;
// // }

// // export function ThinkingDisplay({ thoughts }: ThinkingDisplayProps) {
// //   if (!thoughts) return null;

// //   // Sanitize and parse markdown from thoughts
// //   const parsedThoughts = marked.parse(thoughts.replace(/<br>/g, '\n'), {
// //     gfm: true,
// //     breaks: true,
// //   });

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 10 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       className="w-full max-w-3xl p-6 border rounded-lg bg-card/50 shadow-sm"
// //     >
// //       <div className="flex items-center mb-4 text-card-foreground">
// //         <Sparkles className="h-5 w-5 mr-3 text-primary animate-pulse" />
// //         <h3 className="font-semibold text-lg">Agent's Thought Process</h3>
// //       </div>
// //       <div
// //         className="prose prose-sm prose-slate dark:prose-invert max-w-none"
// //         dangerouslySetInnerHTML={{ __html: parsedThoughts as string }}
// //       />
// //     </motion.div>
// //   );
// // }


// 'use client';

// import { motion } from "framer-motion";
// import { marked } from 'marked';

// interface ThinkingDisplayProps {
//   thoughts: string;
// }

// export function ThinkingDisplay({ thoughts }: ThinkingDisplayProps) {
//   if (!thoughts) return null;

//   // Sanitize and parse markdown from thoughts for better formatting
//   const parsedThoughts = marked.parse(thoughts.replace(/<br>/g, '\n'), {
//     gfm: true,
//     breaks: true,
//   });

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="w-full p-4 border-l-4"
//     >
//       <div
//         className="prose prose-sm prose-slate dark:prose-invert max-w-none"
//         dangerouslySetInnerHTML={{ __html: parsedThoughts as string }}
//       />
//     </motion.div>
//   );
// }


'use client';

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { marked } from 'marked';

interface ThinkingDisplayProps {
  thoughts: string;
}

export function ThinkingDisplay({ thoughts }: ThinkingDisplayProps) {
  if (!thoughts) return null;

  // Sanitize and parse markdown from thoughts
  const parsedThoughts = marked.parse(thoughts.replace(/<br>/g, '\n'), {
    gfm: true,
    breaks: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl p-6 border rounded-lg bg-card/50 shadow-sm"
    >
      <div
        className="prose prose-sm prose-slate dark:prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground"
        dangerouslySetInnerHTML={{ __html: parsedThoughts as string }}
      />
    </motion.div>
  );
}