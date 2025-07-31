import { Link } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, FolderSync, WifiIcon } from "lucide-react";
import type { User } from "@shared/schema";

interface NavigationProps {
  user?: User;
}

export default function Navigation({ user }: NavigationProps) {
  const username = user?.username || "Guest";
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center">
              <Gamepad2 className="w-8 h-8 text-indigo-400 mr-2" />
              <span className="text-xl font-bold text-white">GameForge</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Discover
              </Link>
              <Link href="/editor" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Create
              </Link>
              <Link href="/friends" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Friends
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* FolderSync Status Indicator */}
            <Badge variant="secondary" className="flex items-center bg-emerald-900/50 text-emerald-400 border-emerald-700">
              <WifiIcon className="w-3 h-3 mr-1" />
              <span>Synced</span>
            </Badge>
            
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" alt={username} />
                <AvatarFallback className="bg-indigo-600 text-white text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-white hidden sm:block">
                {username}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
