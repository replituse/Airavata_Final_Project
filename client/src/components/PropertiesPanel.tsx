import { useNetworkStore } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function PropertiesPanel() {
  const { 
    nodes, 
    edges, 
    selectedElementId, 
    selectedElementType, 
    updateNodeData, 
    updateEdgeData 
  } = useNetworkStore();

  if (!selectedElementId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/10">
        <div className="text-center p-6">
          <p className="font-medium">No Element Selected</p>
          <p className="text-sm mt-1">Select a node or conduit on the canvas to edit its properties.</p>
        </div>
      </div>
    );
  }

  const isNode = selectedElementType === 'node';
  const element = isNode 
    ? nodes.find(n => n.id === selectedElementId) 
    : edges.find(e => e.id === selectedElementId);

  if (!element) return null;

  const handleChange = (key: string, value: any) => {
    const numValue = parseFloat(value);
    const finalValue = isNaN(numValue) ? value : numValue;
    
    if (isNode) {
      updateNodeData(selectedElementId, { [key]: finalValue });
    } else {
      updateEdgeData(selectedElementId, { [key]: finalValue });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-card border-l border-border">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="capitalize">{element.data?.type || element.type}</span>
          <span className="text-muted-foreground font-normal text-sm">#{selectedElementId}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        {/* Common Properties */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground/80">General</h4>
          <div className="grid gap-2">
            <Label htmlFor="label">Label / ID</Label>
            <Input 
              id="label" 
              value={element.data?.label || ''} 
              onChange={(e) => handleChange('label', e.target.value)} 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="comment">Comment</Label>
            <Input 
              id="comment" 
              placeholder="Internal comment (c/C style)"
              value={element.data?.comment || ''} 
              onChange={(e) => handleChange('comment', e.target.value)} 
            />
          </div>
        </div>

        <Separator />

        {/* Specific Properties based on Type */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground/80">Parameters</h4>
          
          {!isNode && (
            <div className="grid gap-2 mb-4">
              <Label>Connection Type</Label>
              <RadioGroup 
                value={element.data?.type || 'conduit'} 
                onValueChange={(v) => handleChange('type', v)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="conduit" id="conduit" />
                  <Label htmlFor="conduit">Conduit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dummy" id="dummy" />
                  <Label htmlFor="dummy">Dummy Pipe</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {isNode && (element.data?.type === 'node' || element.data?.type === 'junction' || element.data?.type === 'reservoir' || element.data?.type === 'surgeTank' || element.data?.type === 'flowBoundary') && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="nodeNum">Node Number</Label>
                <Input 
                  id="nodeNum" 
                  type="number" 
                  value={element.data?.nodeNumber || 0} 
                  onChange={(e) => handleChange('nodeNumber', e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="elev">Elevation (m)</Label>
                <Input 
                  id="elev" 
                  type="number" 
                  value={element.data?.elevation || 0} 
                  onChange={(e) => handleChange('elevation', e.target.value)} 
                />
              </div>
            </>
          )}

          {isNode && element.data?.type === 'surgeTank' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="topElev">Top Elevation (m)</Label>
                <Input 
                  id="topElev" 
                  type="number" 
                  value={element.data?.topElevation || 0} 
                  onChange={(e) => handleChange('topElevation', e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="botElev">Bottom Elevation (m)</Label>
                <Input 
                  id="botElev" 
                  type="number" 
                  value={element.data?.bottomElevation || 0} 
                  onChange={(e) => handleChange('bottomElevation', e.target.value)} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="diam">Diameter (m)</Label>
                <Input 
                  id="diam" 
                  type="number" 
                  value={element.data?.diameter || 0} 
                  onChange={(e) => handleChange('diameter', e.target.value)} 
                />
              </div>
            </>
          )}

          {!isNode && (element.data?.type === 'conduit' || !element.data?.type) && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (m)</Label>
                  <Input 
                    id="length" 
                    type="number" 
                    value={element.data?.length || 0} 
                    onChange={(e) => handleChange('length', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diam">Diameter (m)</Label>
                  <Input 
                    id="diam" 
                    type="number" 
                    value={element.data?.diameter || 0} 
                    onChange={(e) => handleChange('diameter', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="celerity">Wave Speed (m/s)</Label>
                  <Input 
                    id="celerity" 
                    type="number" 
                    value={element.data?.celerity || 0} 
                    onChange={(e) => handleChange('celerity', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="friction">Friction (f)</Label>
                  <Input 
                    id="friction" 
                    type="number" 
                    step="0.001"
                    value={element.data?.friction || 0} 
                    onChange={(e) => handleChange('friction', e.target.value)} 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="segments">Num Segments</Label>
                <Input 
                  id="segments" 
                  type="number" 
                  value={element.data?.numSegments || 1} 
                  onChange={(e) => handleChange('numSegments', e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cplus">CPLUS (opt)</Label>
                  <Input 
                    id="cplus" 
                    type="number" 
                    value={element.data?.cplus || ''} 
                    onChange={(e) => handleChange('cplus', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cminus">CMINUS (opt)</Label>
                  <Input 
                    id="cminus" 
                    type="number" 
                    value={element.data?.cminus || ''} 
                    onChange={(e) => handleChange('cminus', e.target.value)} 
                  />
                </div>
              </div>
            </>
          )}

          {!isNode && element.data?.type === 'dummy' && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="diam">Diameter (m)</Label>
                <Input 
                  id="diam" 
                  type="number" 
                  value={element.data?.diameter || 0} 
                  onChange={(e) => handleChange('diameter', e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cplus">CPLUS (opt)</Label>
                  <Input 
                    id="cplus" 
                    type="number" 
                    value={element.data?.cplus || ''} 
                    onChange={(e) => handleChange('cplus', e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cminus">CMINUS (opt)</Label>
                  <Input 
                    id="cminus" 
                    type="number" 
                    value={element.data?.cminus || ''} 
                    onChange={(e) => handleChange('cminus', e.target.value)} 
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </div>
  );
}
