import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Star, Trophy, Clock } from "lucide-react";
import type { Activity, User } from "@shared/schema";

interface ActivityWithUser extends Activity {
  user?: User;
}

export default function FriendActivity() {
  const { data: activities = [] } = useQuery<ActivityWithUser[]>({
    queryKey: ["/api/activities/friends"],
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case "level_created":
        return {
          action: "created a new level",
          target: activity.data.levelName,
          color: "text-purple-400",
        };
      case "level_completed":
        return {
          action: "completed your level",
          target: activity.data.levelName,
          color: "text-indigo-400",
        };
      case "record_set":
        return {
          action: "set a new record on",
          target: activity.data.levelName,
          color: "text-amber-400",
        };
      case "friend_added":
        return {
          action: "became friends with you",
          target: "",
          color: "text-emerald-400",
        };
      default:
        return {
          action: "did something",
          target: "",
          color: "text-gray-400",
        };
    }
  };

  if (activities.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Users className="w-6 h-6 text-emerald-400 mr-3" />
            Friend Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No friend activity yet.</p>
            <p className="text-gray-500 text-sm">Add friends to see their activity here!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mb-12">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Users className="w-6 h-6 text-emerald-400 mr-3" />
          Friend Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const { action, target, color } = getActivityDescription(activity);
            const username = activity.user?.username || "Unknown Player";
            const initials = username.slice(0, 2).toUpperCase();
            
            return (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" alt={username} />
                  <AvatarFallback className="bg-indigo-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <p className="text-white">
                    <span className="font-semibold">{username}</span>
                    <span className="text-gray-400 mx-1">{action}</span>
                    {target && (
                      <span className={`font-semibold ${color}`}>"{target}"</span>
                    )}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{formatTimeAgo(activity.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {activity.type === "level_completed" && activity.data.rating && (
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm">{activity.data.rating}</span>
                    </div>
                  )}
                  
                  {activity.type === "record_set" && activity.data.time && (
                    <div className="text-right">
                      <p className="text-amber-400 font-bold text-sm">{activity.data.time}</p>
                      <p className="text-xs text-gray-500">New Record!</p>
                    </div>
                  )}
                  
                  {activity.type === "level_created" && (
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      Play Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
