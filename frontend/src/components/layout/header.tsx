import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-xl text-foreground hover:text-primary transition-colors"
        >
          <Home className="size-5 text-primary" />
          <span>Homey</span>
        </Link>
      </div>
    </header>
  );
}
