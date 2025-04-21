
import { BlockType } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Database, Filter, GitMerge, Workflow, ArrowRight, SplitSquareVertical } from "lucide-react";

interface BlockPaletteProps {
  onAddBlock: (blockType: BlockType, title: string) => void;
}

export const BlockPalette = ({ onAddBlock }: BlockPaletteProps) => {
  const blockCategories = [
    {
      name: "Sources",
      blocks: [
        { type: BlockType.SOURCE, title: "Data Source", icon: <Database className="w-4 h-4" /> }
      ]
    },
    {
      name: "Transformations",
      blocks: [
        { type: BlockType.TRANSFORM, title: "Transform Data", icon: <Workflow className="w-4 h-4" /> }
      ]
    },
    {
      name: "Filters",
      blocks: [
        { type: BlockType.FILTER, title: "Filter Data", icon: <Filter className="w-4 h-4" /> }
      ]
    },
    {
      name: "Joins",
      blocks: [
        { type: BlockType.JOIN, title: "Join Data", icon: <GitMerge className="w-4 h-4" /> }
      ]
    },
    {
      name: "Conditionals",
      blocks: [
        { type: BlockType.CONDITION, title: "Condition", icon: <SplitSquareVertical className="w-4 h-4" /> }
      ]
    },
    {
      name: "Outputs",
      blocks: [
        { type: BlockType.OUTPUT, title: "Data Output", icon: <ArrowRight className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-4">
      <h2 className="text-sm font-semibold text-gray-600 mb-4">Block Palette</h2>
      
      {blockCategories.map((category) => (
        <div key={category.name} className="mb-6">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            {category.name}
          </h3>
          <div className="space-y-2">
            {category.blocks.map((block) => (
              <Button
                key={`${block.type}-${block.title}`}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => onAddBlock(block.type, block.title)}
              >
                {block.icon}
                <span className="ml-2">{block.title}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
