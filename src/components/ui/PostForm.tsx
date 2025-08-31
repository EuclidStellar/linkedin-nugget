// 'use client';

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Loader2 } from "lucide-react";

// interface PostFormProps {
//   handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
//   isLoading: boolean;
// }

// export function PostForm({ handleSubmit, isLoading }: PostFormProps) {
//   return (
//     <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
//       <div className="space-y-2">
//         <Label htmlFor="topic">Topic</Label>
//         <Textarea
//           id="topic"
//           name="topic"
//           placeholder="e.g., Cold-start strategies for marketplaces"
//           className="min-h-[100px] bg-secondary"
//           required
//         />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <Label htmlFor="tone">Tone</Label>
//           <Input id="tone" name="tone" placeholder="Professional & witty" defaultValue="Professional" />
//         </div>
//         <div className="space-y-2">
//           <Label htmlFor="audience">Audience</Label>
//           <Input id="audience" name="audience" placeholder="Startup Founders" defaultValue="Tech Professionals" />
//         </div>
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="cta">Call to Action (Optional)</Label>
//         <Input id="cta" name="cta" placeholder="What are your favorite strategies? Comment below!" />
//       </div>
//       <Button type="submit" className="w-full" disabled={isLoading}>
//         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//         {isLoading ? 'Generating...' : 'Generate Posts'}
//       </Button>
//     </form>
//   );
// }


'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

interface PostFormProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function PostForm({ handleSubmit, isLoading }: PostFormProps) {
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Textarea
          id="topic"
          name="topic"
          placeholder="e.g., Cold-start strategies for marketplaces"
          className="min-h-[100px] bg-secondary/50"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Input id="tone" name="tone" defaultValue="Professional" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="audience">Audience</Label>
          <Input id="audience" name="audience" defaultValue="Tech Professionals" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cta">Call to Action (Optional)</Label>
        <Input id="cta" name="cta" placeholder="What are your favorite strategies? Comment below!" />
      </div>
      <Button type="submit" className="w-full !mt-8" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
        {isLoading ? 'Generating...' : 'Generate Posts'}
      </Button>
    </form>
  );
}