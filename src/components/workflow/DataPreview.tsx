
import { AnyBlock } from "@/types/workflow";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

interface DataPreviewProps {
  blocks: AnyBlock[];
  selectedBlockId: string | null;
}

export const DataPreview = ({ blocks, selectedBlockId }: DataPreviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // This would be sample data, in a real app this would be fetched from the server
  const sampleData = [
    { id: 1, name: "John Doe", email: "john@example.com", age: 30 },
    { id: 2, name: "Jane Smith", email: "jane@example.com", age: 25 },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 40 }
  ];

  if (!isExpanded) {
    return (
      <div className="h-10 border-t border-gray-200 bg-white flex items-center justify-between px-4">
        <span className="text-sm text-gray-500">Data Preview</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(true)}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="h-72 border-t border-gray-200 bg-white flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        <span className="text-sm font-medium">Data Preview</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsExpanded(false)}
          className="h-6 w-6 p-0"
        >
          <ChevronUp className="h-4 w-4 rotate-180" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="rounded border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(sampleData[0]).map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sampleData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-2 whitespace-nowrap text-sm text-gray-500"
                    >
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
