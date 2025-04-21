
import { AnyBlock } from "@/types/workflow";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trash, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface WorkflowCanvasProps {
  blocks: AnyBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
  onDeleteBlock: (blockId: string) => void;
  onUpdateBlockTitle: (blockId: string, title: string) => void;
}

export const WorkflowCanvas = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onDeleteBlock,
  onUpdateBlockTitle
}: WorkflowCanvasProps) => {
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedBlock(index);
    // Required for Firefox
    e.dataTransfer.setData('text/plain', index.toString());
    // To show a nice "ghost" image
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 1x1 transparent GIF
    e.dataTransfer.setDragImage(dragImage, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedBlock === null) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Determine if we're in the top or bottom half of the element
    const isInTopHalf = y < height / 2;
    
    // Apply styling to indicate drop position
    const element = e.currentTarget as HTMLElement;
    element.style.borderTop = isInTopHalf ? '2px solid #3b82f6' : '';
    element.style.borderBottom = !isInTopHalf ? '2px solid #3b82f6' : '';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Reset borders when dragging out
    (e.currentTarget as HTMLElement).style.borderTop = '';
    (e.currentTarget as HTMLElement).style.borderBottom = '';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.borderTop = '';
    (e.currentTarget as HTMLElement).style.borderBottom = '';
    
    if (draggedBlock === null || draggedBlock === targetIndex) return;
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // Determine if we're in the top or bottom half of the element
    const isInTopHalf = y < height / 2;
    
    // Calculate the new index based on drop position
    let newIndex = targetIndex;
    if (!isInTopHalf) {
      newIndex = targetIndex + 1;
    }
    
    // Adjust for moving down
    if (draggedBlock < targetIndex) {
      newIndex -= 1;
    }
    
    onMoveBlock(draggedBlock, newIndex);
    setDraggedBlock(null);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <div className="max-w-2xl mx-auto space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center p-10 text-gray-500">
            <p>Drag blocks from the palette to build your workflow</p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <Card
              key={block.id}
              className={`${
                selectedBlockId === block.id ? 'ring-2 ring-primary' : ''
              } cursor-pointer`}
              onClick={() => onSelectBlock(block.id)}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 bg-gray-50 border-b">
                <div className="flex items-center space-x-2">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <Input
                    value={block.title}
                    onChange={(e) => onUpdateBlockTitle(block.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 text-sm focus:ring-0 w-auto border-transparent focus:border-gray-300"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBlock(block.id);
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Trash className="h-4 w-4 text-gray-500 hover:text-red-500" />
                </Button>
              </CardHeader>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">
                  {block.type.charAt(0).toUpperCase() + block.type.slice(1)} Block
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
