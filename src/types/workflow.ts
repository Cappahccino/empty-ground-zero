
export enum BlockType {
  SOURCE = 'source',
  TRANSFORM = 'transform',
  FILTER = 'filter',
  JOIN = 'join',
  OUTPUT = 'output',
  CONDITION = 'condition'
}

export interface Block {
  id: string;
  type: BlockType;
  title: string;
  config: Record<string, any>;
  position: number; // For top-down ordering
}

export interface SourceBlock extends Block {
  type: BlockType.SOURCE;
  config: {
    sourceType: 'api' | 'db' | 'file' | 'googleSheets';
    connectionId?: string;
    query?: string;
    filePath?: string;
  };
}

export interface TransformBlock extends Block {
  type: BlockType.TRANSFORM;
  config: {
    transformType: 'map' | 'reduce' | 'format' | 'custom';
    expression?: string;
    fieldMappings?: Record<string, string>;
  };
}

export interface FilterBlock extends Block {
  type: BlockType.FILTER;
  config: {
    condition: string;
    field?: string;
    operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    value?: any;
  };
}

export interface JoinBlock extends Block {
  type: BlockType.JOIN;
  config: {
    joinType: 'inner' | 'left' | 'right' | 'full';
    rightSourceId?: string;
    joinConditions: Array<{
      leftField: string;
      rightField: string;
    }>;
  };
}

export interface OutputBlock extends Block {
  type: BlockType.OUTPUT;
  config: {
    outputType: 'api' | 'db' | 'file' | 'notification';
    connectionId?: string;
    destination?: string;
  };
}

export interface ConditionBlock extends Block {
  type: BlockType.CONDITION;
  config: {
    condition: string;
    trueBlockIds: string[];
    falseBlockIds: string[];
  };
}

export type AnyBlock = SourceBlock | TransformBlock | FilterBlock | JoinBlock | OutputBlock | ConditionBlock;

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  blocks: AnyBlock[];
  createdAt: string;
  updatedAt: string;
}
