import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { Star, Play, Clock, Edit } from "lucide-react";
import { Link } from "wouter";
import type { Level, LevelProgress } from "@shared/schema";

interface LevelCardProps {
  level: Level;
}

export default function LevelCard({ level }: LevelCardProps) {
  const queryClient = useQueryClient();

  const { data: progress } = useQuery<LevelProgress | null>({
    queryKey: ["/api/progress", level.id],
  });

  const playLevelMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/levels/${level.id}/play`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/levels"] });
    },
  });

  const handlePlay = () => {
    playLevelMutation.mutate();
  };

  const rating = level.ratingCount > 0 ? (level.rating / level.ratingCount / 10).toFixed(1) : "0.0";
  const completionPercentage = progress?.completionPercentage || 0;

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-indigo-500 transition-all transform hover:scale-105 cursor-pointer overflow-hidden">
      {/* Level preview - using placeholder pattern since we can't generate images */}
      <div className="w-full h-40 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
        <div className="text-white text-lg font-semibold opacity-75">
          {level.name}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white truncate">
            {level.name}
          </h3>
          <div className="flex items-center text-yellow-400">
            <Star className="w-3 h-3 mr-1" />
            <span className="text-xs">{rating}</span>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {level.description || "No description available."}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Play className="w-3 h-3 mr-1" />
            <span>{level.plays} plays</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span className="capitalize">{level.difficulty}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        {progress && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress 
              value={completionPercentage} 
              className="h-2"
            />
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            size="sm"
            onClick={handlePlay}
            disabled={playLevelMutation.isPending}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            <Play className="w-3 h-3 mr-1" />
            Play
          </Button>
          
          {/* Show edit button for own levels */}
          <Link href={`/editor/${level.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Edit className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
