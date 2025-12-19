import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MermaidConverterService } from '@/services/mermaid/MermaidConverterService';
import { toast } from 'sonner'; // 使用现有的通知组件

export const MermaidImportControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mermaidCode, setMermaidCode] = useState('');
  const [canvasName, setCanvasName] = useState('Mermaid Import');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const converterService = new MermaidConverterService();

  const handleImport = async () => {
    if (!mermaidCode.trim()) {
      toast.error('请输入Mermaid代码');
      return;
    }

    setLoading(true);
    try {
      const result = await converterService.convertAndImport(mermaidCode, canvasName);
      
      if (result.success && result.nodes && result.edges) {
        toast.success(`成功导入 ${result.nodes.length} 个节点和 ${result.edges.length} 条边`);
        setIsOpen(false);
        setMermaidCode('');
      } else {
        throw new Error(result.error || '未知错误');
      }
    } catch (error) {
      console.error('导入失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      toast.error(`导入失败: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = ['.mmd', '.txt', '.mermaid', '.md'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (validExtensions.includes(fileExtension)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            setMermaidCode(result);
          }
        };
        reader.readAsText(file);
      } else {
        toast.error('不支持的文件格式，请上传 .mmd、.txt、.mermaid 或 .md 文件');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">导入Mermaid</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>导入Mermaid图表</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="canvasName" className="text-right">
              画布名称
            </Label>
            <Input
              id="canvasName"
              value={canvasName}
              onChange={(e) => setCanvasName(e.target.value)}
              className="col-span-3"
              placeholder="输入新画布名称"
            />
          </div>
          
          <div>
            <Label htmlFor="mermaidCode">Mermaid代码</Label>
            <Textarea
              id="mermaidCode"
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              placeholder={`在此粘贴或输入Mermaid代码，例如：
graph TD
    A[用户] --> B[订单]
    B --> C[支付]`}
              rows={12}
              className="font-mono text-sm"
            />
          </div>
        </div>
        
        <DialogFooter className="flex items-center gap-2">
          <Button 
            variant="outline" 
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            上传文件
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={loading || !mermaidCode.trim()}
          >
            {loading ? '导入中...' : '导入并保存'}
          </Button>
        </DialogFooter>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".mmd,.txt,.mermaid,.md"
          onChange={handleFileUpload}
        />
        
        <div className="text-sm text-gray-500 border-t pt-2">
          <p className="font-medium">支持的语法示例：</p>
          <div className="font-mono text-xs mt-1 bg-gray-100 p-2 rounded">
            {`graph TD
    A[节点A] --> B(节点B)
    B --> C{节点C}
    C --> D[节点D]`}
          </div>
          <p className="mt-2">导入的图表将自动布局并永久保存到您的工作空间中。</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};