import { useState } from "react";
import { BlockPalette } from "@/components/workflow/BlockPalette";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";
import { PropertyInspector } from "@/components/workflow/PropertyInspector";
import { DataPreview } from "@/components/workflow/DataPreview";
import { AnyBlock, Block, BlockType } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Save, Play } from "lucide-react";

const WorkflowBuilder = () => {
  const [blocks, setBlocks] = useState<AnyBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState<string>("New Workflow");
  
  const addBlock = (blockType: BlockType, title: string) => {
    const getInitialConfig = (type: BlockType): AnyBlock['config'] => {
      switch (type) {
        case BlockType.SOURCE:
          return {
            sourceType: 'api' as const,
            connectionId: '',
            query: '',
            filePath: '',
            fileId: '',
            fileName: '',
            fileType: '',
            sheetName: '',
            sheets: [],
          };
        case BlockType.TRANSFORM:
          return {
            transformType: 'map' as const,
            expression: '',
            fieldMappings: {},
          };
        case BlockType.FILTER:
          return {
            condition: '',
            field: '',
            operator: 'equals' as const,
            value: null,
          };
        case BlockType.JOIN:
          return {
            joinType: 'inner' as const,
            rightSourceId: '',
            joinConditions: [],
          };
        case BlockType.OUTPUT:
          return {
            outputType: 'api' as const,
            connectionId: '',
            destination: '',
          };
        case BlockType.CONDITION:
          return {
            condition: '',
            trueBlockIds: [],
            falseBlockIds: [],
          };
        default:
          throw new Error(`Unsupported block type: ${type}`);
      }
    };

    const newBlock = {
      id: `block-${Date.now()}`,
      type: blockType,
      title,
      config: getInitialConfig(blockType),
      position: blocks.length
    };
    
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };
  
  const updateBlockConfig = (blockId: string, config: Record<string, any>) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, config } : block
    ));
  };

  const updateBlockTitle = (blockId: string, title: string) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? { ...block, title } : block
    ));
  };
  
  const moveBlock = (fromIndex: number, toIndex: number) => {
    const updatedBlocks = [...blocks];
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1);
    updatedBlocks.splice(toIndex, 0, movedBlock);
    
    // Update position properties
    const blocksWithUpdatedPositions = updatedBlocks.map((block, index) => ({
      ...block,
      position: index
    }));
    
    setBlocks(blocksWithUpdatedPositions);
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };
  
  const selectedBlock = blocks.find(block => block.id === selectedBlockId);
  
  const saveWorkflow = () => {
    // This would save the workflow to the database
    console.log("Saving workflow:", { name: workflowName, blocks });
    // In a real implementation, you would call an API here
  };

  const runWorkflow = () => {
    // This would run the workflow
    console.log("Running workflow:", { name: workflowName, blocks });
    // In a real implementation, you would call an API here
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">Workflow Builder</h1>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={saveWorkflow}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm" variant="secondary" onClick={runWorkflow}>
            <Play className="h-4 w-4 mr-2" />
            Run
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <BlockPalette onAddBlock={addBlock} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <WorkflowCanvas 
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={setSelectedBlockId}
            onMoveBlock={moveBlock}
            onDeleteBlock={deleteBlock}
            onUpdateBlockTitle={updateBlockTitle}
          />
          
          <DataPreview blocks={blocks} selectedBlockId={selectedBlockId} />
        </div>
        
        <PropertyInspector 
          block={selectedBlock}
          onUpdateConfig={(config) => {
            if (selectedBlockId) {
              updateBlockConfig(selectedBlockId, config);
            }
          }}
        />
      </div>
    </div>
  );
};

export default WorkflowBuilder;
