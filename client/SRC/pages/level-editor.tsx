import { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { 
  MousePointer, 
  Square, 
  Bug, 
  Gem, 
  Play, 
  Flag, 
  X,
  Save,
  Share,
  TestTube
} from "lucide-react";
import type { User, Level, InsertLevel } from "@shared/schema";

interface LevelElement {
  type: "platform" | "enemy" | "collectible" | "spawn" | "goal";
  x: number;
  y: number;
  width?: number;
  height?: number;
  size?: number;
  color?: string;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRID_SIZE = 20;

export default function LevelEditor() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [levelName, setLevelName] = useState("Untitled Level");
  const [levelDescription, setLevelDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [selectedTool, setSelectedTool] = useState("select");
  const [elements, setElements] = useState<LevelElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: existingLevel } = useQuery<Level>({
    queryKey: ["/api/levels", params.id],
    enabled: !!params.id,
  });

  // Load existing level data
  useEffect(() => {
    if (existingLevel) {
      setLevelName(existingLevel.name);
      setLevelDescription(existingLevel.description || "");
      setDifficulty(existingLevel.difficulty);
      setElements(existingLevel.levelData.elements || []);
    }
  }, [existingLevel]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#1e3a8a"; // Blue gradient background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw elements
    elements.forEach((element, index) => {
      const isSelected = selectedElement === index;
      
      switch (element.type) {
        case "platform":
          ctx.fillStyle = element.color || "#22c55e";
          ctx.fillRect(element.x, element.y, element.width || 100, element.height || 20);
          if (isSelected) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.strokeRect(element.x, element.y, element.width || 100, element.height || 20);
          }
          break;
          
        case "enemy":
          ctx.fillStyle = element.color || "#ef4444";
          ctx.fillRect(element.x, element.y, element.size || 20, element.size || 20);
          if (isSelected) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.strokeRect(element.x, element.y, element.size || 20, element.size || 20);
          }
          break;
          
        case "collectible":
          ctx.fillStyle = element.color || "#fbbf24";
          ctx.beginPath();
          ctx.arc(element.x + (element.size || 20) / 2, element.y + (element.size || 20) / 2, (element.size || 20) / 2, 0, Math.PI * 2);
          ctx.fill();
          if (isSelected) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
          
        case "spawn":
          ctx.fillStyle = element.color || "#6366f1";
          ctx.beginPath();
          ctx.arc(element.x + (element.size || 20) / 2, element.y + (element.size || 20) / 2, (element.size || 20) / 2, 0, Math.PI * 2);
          ctx.fill();
          if (isSelected) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          break;
          
        case "goal":
          ctx.fillStyle = element.color || "#8b5cf6";
          ctx.fillRect(element.x, element.y, element.size || 30, element.size || 30);
          if (isSelected) {
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.strokeRect(element.x, element.y, element.size || 30, element.size || 30);
          }
          break;
      }
    });
  }, [elements, selectedElement]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE) * GRID_SIZE;
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE) * GRID_SIZE;

    if (selectedTool === "select") {
      // Find clicked element
      const clickedIndex = elements.findIndex(element => {
        const width = element.width || element.size || 20;
        const height = element.height || element.size || 20;
        return x >= element.x && x <= element.x + width && y >= element.y && y <= element.y + height;
      });
      
      setSelectedElement(clickedIndex >= 0 ? clickedIndex : null);
    } else {
      // Add new element
      const newElement: LevelElement = {
        type: selectedTool as any,
        x,
        y,
      };

      switch (selectedTool) {
        case "platform":
          newElement.width = 100;
          newElement.height = 20;
          break;
        case "enemy":
        case "collectible":
        case "spawn":
          newElement.size = 20;
          break;
        case "goal":
          newElement.size = 30;
          break;
      }

      setElements([...elements, newElement]);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== "select" || selectedElement === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const element = elements[selectedElement];

    setIsDragging(true);
    setDragOffset({
      x: x - element.x,
      y: y - element.y,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || selectedElement === null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - dragOffset.x) / GRID_SIZE) * GRID_SIZE;
    const y = Math.floor((e.clientY - rect.top - dragOffset.y) / GRID_SIZE) * GRID_SIZE;

    const updatedElements = [...elements];
    updatedElements[selectedElement] = {
      ...updatedElements[selectedElement],
      x: Math.max(0, Math.min(x, CANVAS_WIDTH - (updatedElements[selectedElement].width || updatedElements[selectedElement].size || 20))),
      y: Math.max(0, Math.min(y, CANVAS_HEIGHT - (updatedElements[selectedElement].height || updatedElements[selectedElement].size || 20))),
    };
    
    setElements(updatedElements);
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const deleteSelectedElement = () => {
    if (selectedElement !== null) {
      const updatedElements = elements.filter((_, index) => index !== selectedElement);
      setElements(updatedElements);
      setSelectedElement(null);
    }
  };

  const saveLevelMutation = useMutation({
    mutationFn: async (published: boolean) => {
      const levelData: InsertLevel = {
        name: levelName,
        description: levelDescription,
        difficulty,
        levelData: { elements },
        published,
        creatorId: user?.id || "",
      };

      if (params.id) {
        return apiRequest("PATCH", `/api/levels/${params.id}`, { ...levelData });
      } else {
        return apiRequest("POST", "/api/levels", levelData);
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Level saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/levels"] });
      setLocation("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save level. Please try again.",
        variant: "destructive",
      });
    },
  });

  const tools = [
    { id: "select", name: "Select", icon: MousePointer },
    { id: "platform", name: "Platform", icon: Square },
    { id: "enemy", name: "Enemy", icon: Bug },
    { id: "collectible", name: "Collectible", icon: Gem },
    { id: "spawn", name: "Spawn Point", icon: Play },
    { id: "goal", name: "Goal", icon: Flag },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation user={user} />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Toolbox */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h3 className="font-semibold text-white mb-4">Tools</h3>
          
          <div className="space-y-2 mb-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    selectedTool === tool.id 
                      ? "bg-indigo-600 hover:bg-indigo-700" 
                      : "hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tool.name}
                </Button>
              );
            })}
          </div>

          {selectedElement !== null && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-semibold text-white mb-3">Properties</h4>
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedElement}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Delete Element
              </Button>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gradient-to-b from-blue-900 to-blue-600 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        </div>
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Level Name"
            value={levelName}
            onChange={(e) => setLevelName(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Input
            placeholder="Description (optional)"
            value={levelDescription}
            onChange={(e) => setLevelDescription(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => saveLevelMutation.mutate(false)}
            disabled={saveLevelMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={() => saveLevelMutation.mutate(true)}
            disabled={saveLevelMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Share className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
