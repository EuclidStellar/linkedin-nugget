
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
//   const fullPostContent = `${post.content}\n\n${post.finalCta}\n\n${post.hashtags.join(' ')}`;

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
//         <div className="mt-4 text-sm text-primary font-medium opacity-80">
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

'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, TestTube2 } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

export interface Post {
  angle: string;
  content: string;
  hooks: { questionHook: string; statementHook: string; };
  hashtags: string[];
  finalCta: string;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { isCopied, copy } = useCopyToClipboard();
  const fullPostContent = `${post.hooks.statementHook}\n\n${post.content}\n\n${post.finalCta}\n\n${post.hashtags.join(' ')}`;

  return (
    <Card className="w-full bg-card border shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold text-card-foreground">
            {post.angle}
          </CardTitle>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => copy(fullPostContent)}>
            {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
            {post.content}
            <p className="mt-4 font-medium text-foreground">{post.finalCta}</p>
        </div>
        <div className="mt-4 text-sm text-primary/80 font-medium">
          {post.hashtags.join(' ')}
        </div>
        <div className="mt-6 border-t pt-4">
            <h4 className="flex items-center text-sm font-semibold text-muted-foreground mb-2">
                <TestTube2 className="h-4 w-4 mr-2 text-primary/70"/> A/B Test Hooks
            </h4>
            <div className="text-sm text-muted-foreground space-y-2 pl-6">
                <p><strong>Q:</strong> <em>{post.hooks.questionHook}</em></p>
                <p><strong>S:</strong> <em>{post.hooks.statementHook}</em></p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}