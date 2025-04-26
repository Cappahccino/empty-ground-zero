import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, FileText } from "lucide-react";
import { SourceBlock } from "@/types/workflow";
import { FileService } from '@/lib/services/fileService';

interface FileSourcePropertiesProps {
  block: SourceBlock;
  onUpdateConfig: (config: SourceBlock['config']) => void;
}

export function FileSourceProperties({ block, onUpdateConfig }: FileSourcePropertiesProps) {
  const [files, setFiles] = useState<{ id: string; name: string; type: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("existing");
  const [selectedFile, setSelectedFile] = useState<string | null>(block.config.fileId || null);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(block.config.sheetName || null);
  const [fileSheets, setFileSheets] = useState<string[]>(block.config.sheets || []);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Fetch available files when component mounts
  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch available sheets when file changes
  useEffect(() => {
    if (selectedFile) {
      fetchSheets(selectedFile);
    }
  }, [selectedFile]);

  // Update block config when selections change
  useEffect(() => {
    if (selectedFile) {
      const selectedFileObj = files.find(f => f.id === selectedFile);
      const updatedConfig = {
        ...block.config,
        fileId: selectedFile,
        fileName: selectedFileObj?.name || '',
        fileType: selectedFileObj?.type || '',
        sheetName: selectedSheet || undefined,
        sheets: fileSheets
      };
      
      onUpdateConfig(updatedConfig);
    }
  }, [selectedFile, selectedSheet, fileSheets]);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/workflow/files');
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      // Fallback to mock data for development
      const data = [
        { id: 'file1', name: 'sales_data.xlsx', type: 'xlsx' },
        { id: 'file2', name: 'users.csv', type: 'csv' },
        { id: 'file3', name: 'inventory.xlsx', type: 'xlsx' }
      ];
      setFiles(data);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSheets = async (fileId: string) => {
    try {
      const response = await fetch(`/api/workflow/files/${fileId}/sheets`);
      if (!response.ok) {
        throw new Error('Failed to fetch sheets');
      }
      const sheets = await response.json();
      setFileSheets(sheets);
      
      // Auto-select first sheet if none is selected
      if (sheets.length > 0 && !selectedSheet) {
        setSelectedSheet(sheets[0]);
      }
    } catch (error) {
      console.error('Error fetching sheets:', error);
      // Fallback to mock data for development
      const mockSheets: Record<string, string[]> = {
        'file1': ['Sales 2023', 'Sales 2022', 'Products'],
        'file3': ['Inventory', 'Orders', 'Suppliers']
      };
      
      const sheets = mockSheets[fileId] || [];
      setFileSheets(sheets);
      
      if (sheets.length > 0 && !selectedSheet) {
        setSelectedSheet(sheets[0]);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    try {
      setIsLoading(true);
      const fileService = new FileService();
      // TODO: get workflowId/nodeId from block or context if available
      const fileRecord = await fileService.uploadFile(uploadFile /*, { workflowId, nodeId }*/);
      setFiles(prev => [...prev, fileRecord]);
      setSelectedFile(fileRecord.id);
      setActiveTab('existing');
      setUploadFile(null);
    } catch (error: any) {
      alert(error.message || 'Failed to upload file.');
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">File Source</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Existing Files</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
        </TabsList>
        
        <TabsContent value="existing" className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select File</label>
            <Select
              value={selectedFile || ''}
              onValueChange={setSelectedFile}
              disabled={isLoading || files.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a file" />
              </SelectTrigger>
              <SelectContent>
                {files.map(file => (
                  <SelectItem key={file.id} value={file.id}>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      <span>{file.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {fileSheets.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Sheet</label>
              <Select 
                value={selectedSheet || ''} 
                onValueChange={setSelectedSheet}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sheet" />
                </SelectTrigger>
                <SelectContent>
                  {fileSheets.map(sheet => (
                    <SelectItem key={sheet} value={sheet}>
                      {sheet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {files.length === 0 && !isLoading && (
            <div className="text-sm text-gray-500 text-center py-4">
              No files found. Please upload a file.
            </div>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchFiles}
            disabled={isLoading}
          >
            Refresh Files
          </Button>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <label htmlFor="file-upload" className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500">
                  Click to select file
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only"
                    accept=".csv,.xlsx,.xls"
                    onChange={e => e.target.files && setUploadFile(e.target.files[0])}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
            
            {uploadFile && (
              <div className="space-y-2">
                <div className="text-sm p-2 bg-gray-50 rounded flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="flex-1 truncate">{uploadFile.name}</span>
                </div>
                <Button 
                  className="w-full"
                  onClick={handleFileUpload}
                  disabled={isLoading}
                >
                  {isLoading ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 