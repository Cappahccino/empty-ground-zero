
import { AnyBlock, BlockType } from "@/types/workflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEffect, useState } from "react";

interface PropertyInspectorProps {
  block: AnyBlock | undefined;
  onUpdateConfig: (config: Record<string, any>) => void;
}

export const PropertyInspector = ({ block, onUpdateConfig }: PropertyInspectorProps) => {
  const [localConfig, setLocalConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (block) {
      setLocalConfig(block.config || {});
    } else {
      setLocalConfig({});
    }
  }, [block]);

  const handleChange = (key: string, value: any) => {
    const updatedConfig = { ...localConfig, [key]: value };
    setLocalConfig(updatedConfig);
    onUpdateConfig(updatedConfig);
  };

  if (!block) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4">
        <p className="text-gray-500 text-center text-sm">
          Select a block to edit its properties
        </p>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-4">Properties</h2>
        
        <Card className="mb-4">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">Block Details</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-3 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="blockType">
                Type
              </Label>
              <Input
                id="blockType"
                value={block.type.charAt(0).toUpperCase() + block.type.slice(1)}
                disabled
                className="h-8 text-sm"
              />
            </div>
          </CardContent>
        </Card>
        
        {block.type === BlockType.SOURCE && (
          <Card className="mb-4">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Source Configuration</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="sourceType">
                  Source Type
                </Label>
                <select
                  id="sourceType"
                  className="w-full border border-gray-300 rounded h-8 text-sm px-2"
                  value={localConfig.sourceType || ''}
                  onChange={(e) => handleChange('sourceType', e.target.value)}
                >
                  <option value="">Select source type</option>
                  <option value="api">API</option>
                  <option value="db">Database</option>
                  <option value="file">File</option>
                  <option value="googleSheets">Google Sheets</option>
                </select>
              </div>
              
              {localConfig.sourceType === 'api' && (
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="apiUrl">
                    API URL
                  </Label>
                  <Input
                    id="apiUrl"
                    value={localConfig.apiUrl || ''}
                    onChange={(e) => handleChange('apiUrl', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="https://api.example.com/data"
                  />
                </div>
              )}
              
              {localConfig.sourceType === 'db' && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="connectionId">
                      Connection
                    </Label>
                    <select
                      id="connectionId"
                      className="w-full border border-gray-300 rounded h-8 text-sm px-2"
                      value={localConfig.connectionId || ''}
                      onChange={(e) => handleChange('connectionId', e.target.value)}
                    >
                      <option value="">Select connection</option>
                      <option value="connection1">My Database</option>
                      <option value="connection2">Analytics DB</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="query">
                      SQL Query
                    </Label>
                    <textarea
                      id="query"
                      value={localConfig.query || ''}
                      onChange={(e) => handleChange('query', e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-sm h-20"
                      placeholder="SELECT * FROM users"
                    ></textarea>
                  </div>
                </>
              )}
              
              {localConfig.sourceType === 'file' && (
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="filePath">
                    File Path
                  </Label>
                  <Input
                    id="filePath"
                    value={localConfig.filePath || ''}
                    onChange={(e) => handleChange('filePath', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="/path/to/file.csv"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {block.type === BlockType.TRANSFORM && (
          <Card className="mb-4">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Transform Configuration</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="transformType">
                  Transform Type
                </Label>
                <select
                  id="transformType"
                  className="w-full border border-gray-300 rounded h-8 text-sm px-2"
                  value={localConfig.transformType || ''}
                  onChange={(e) => handleChange('transformType', e.target.value)}
                >
                  <option value="">Select transform type</option>
                  <option value="map">Map</option>
                  <option value="reduce">Reduce</option>
                  <option value="format">Format</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              {localConfig.transformType === 'custom' && (
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="expression">
                    Custom Expression
                  </Label>
                  <textarea
                    id="expression"
                    value={localConfig.expression || ''}
                    onChange={(e) => handleChange('expression', e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 text-sm h-20"
                    placeholder="row => ({ ...row, fullName: `${row.firstName} ${row.lastName}` })"
                  ></textarea>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {block.type === BlockType.FILTER && (
          <Card className="mb-4">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Filter Configuration</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="field">
                  Field
                </Label>
                <Input
                  id="field"
                  value={localConfig.field || ''}
                  onChange={(e) => handleChange('field', e.target.value)}
                  className="h-8 text-sm"
                  placeholder="age"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="operator">
                  Operator
                </Label>
                <select
                  id="operator"
                  className="w-full border border-gray-300 rounded h-8 text-sm px-2"
                  value={localConfig.operator || ''}
                  onChange={(e) => handleChange('operator', e.target.value)}
                >
                  <option value="">Select operator</option>
                  <option value="equals">Equals</option>
                  <option value="notEquals">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="greaterThan">Greater Than</option>
                  <option value="lessThan">Less Than</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="value">
                  Value
                </Label>
                <Input
                  id="value"
                  value={localConfig.value || ''}
                  onChange={(e) => handleChange('value', e.target.value)}
                  className="h-8 text-sm"
                  placeholder="18"
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {block.type === BlockType.OUTPUT && (
          <Card className="mb-4">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Output Configuration</CardTitle>
            </CardHeader>
            <CardContent className="px-4 py-3 space-y-3">
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="outputType">
                  Output Type
                </Label>
                <select
                  id="outputType"
                  className="w-full border border-gray-300 rounded h-8 text-sm px-2"
                  value={localConfig.outputType || ''}
                  onChange={(e) => handleChange('outputType', e.target.value)}
                >
                  <option value="">Select output type</option>
                  <option value="api">API</option>
                  <option value="db">Database</option>
                  <option value="file">File</option>
                  <option value="notification">Notification</option>
                </select>
              </div>
              
              {localConfig.outputType === 'file' && (
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="destination">
                    File Path
                  </Label>
                  <Input
                    id="destination"
                    value={localConfig.destination || ''}
                    onChange={(e) => handleChange('destination', e.target.value)}
                    className="h-8 text-sm"
                    placeholder="/path/to/output.csv"
                  />
                </div>
              )}
              
              {localConfig.outputType === 'db' && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="connectionId">
                      Connection
                    </Label>
                    <select
                      id="connectionId"
                      className="w-full border border-gray-300 rounded h-8 text-sm px-2"
                      value={localConfig.connectionId || ''}
                      onChange={(e) => handleChange('connectionId', e.target.value)}
                    >
                      <option value="">Select connection</option>
                      <option value="connection1">My Database</option>
                      <option value="connection2">Analytics DB</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="destination">
                      Table Name
                    </Label>
                    <Input
                      id="destination"
                      value={localConfig.destination || ''}
                      onChange={(e) => handleChange('destination', e.target.value)}
                      className="h-8 text-sm"
                      placeholder="processed_data"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
