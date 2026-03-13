import { Loader2 } from "lucide-react";

// Full-page centered spinner for initial loading states
export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}
