import { type NodeDefinition, type EdgeDefinition, type Point, NODE_TYPES_CONFIG } from './types';

export class GraphState {
    nodes = $state<NodeDefinition[]>([]);
    edges = $state<EdgeDefinition[]>([]);
    
    // Viewport transform
    transform = $state({ x: 0, y: 0, scale: 1 });
    
    // Interaction state
    isDraggingNode = $state(false);
    activeNodeId = $state<string | null>(null);
    dragOffset = $state<Point>({ x: 0, y: 0 });

    // Edge creation state
    isCreatingEdge = $state(false);
    edgeStart = $state<{ nodeId: string; socketIdx: number } | null>(null);
    mousePos = $state<Point>({ x: 0, y: 0 });

    addNode(type: keyof typeof NODE_TYPES_CONFIG, x: number, y: number) {
        const config = NODE_TYPES_CONFIG[type];
        if (!config) return;
        
        const id = 'node_' + Math.random().toString(36).substring(2, 9);
        this.nodes.push({
            id,
            type: type as string,
            x,
            y,
            width: config.defaultWidth || 180,
            title: config.title,
            inputTypes: config.inputTypes,
            outputTypes: config.outputTypes,
            inputLabels: config.inputLabels,
            outputLabels: config.outputLabels,
            color: config.color,
            resultHTML: "",
            attrs: {}
        });
    }

    removeNode(id: string) {
        this.nodes = this.nodes.filter(n => n.id !== id);
        this.edges = this.edges.filter(e => e.fromNode !== id && e.toNode !== id);
    }

    addEdge(fromNode: string, fromSocket: number, toNode: string, toSocket: number) {
        // Prevent duplicate or inverse connections
        const exists = this.edges.find(e => 
            e.fromNode === fromNode && e.fromSocket === fromSocket &&
            e.toNode === toNode && e.toSocket === toSocket
        );
        if (exists) return;

        // Ensure we are connecting output to input
        const fromNodeObj = this.nodes.find(n => n.id === fromNode);
        const toNodeObj = this.nodes.find(n => n.id === toNode);
        if (!fromNodeObj || !toNodeObj) return;

        // Type checking
        const outType = fromNodeObj.outputTypes[fromSocket];
        const inType = toNodeObj.inputTypes[toSocket];

        if (outType !== inType) {
            // Allow ANY variant inputs to accept corresponding outputs
            let isAllowed = false;
            if (inType === 'TABLE_ANY' && outType.includes('TABLE')) {
                isAllowed = true;
            } else if (inType === 'TABLE_COLLATED_ANY' && outType.includes('COLLATED')) {
                isAllowed = true;
            } else if (inType === 'TABLE_RIDING_ANY' && outType.includes('RIDING')) {
                isAllowed = true;
            }
            
            // Also allow ANY outputs to feed into specific inputs if we are optimistic
            // (e.g., ANYRIDINGTABLE feeding into VOTECOUNTRIDINGTABLE)
            if (outType === 'TABLE_ANY' && inType.includes('TABLE')) isAllowed = true;
            if (outType === 'TABLE_COLLATED_ANY' && inType.includes('COLLATED')) isAllowed = true;
            if (outType === 'TABLE_RIDING_ANY' && inType.includes('RIDING')) isAllowed = true;

            if (!isAllowed) {
                console.warn(`Cannot connect ${outType} to ${inType}`);
                return;
            }
        }

        this.edges.push({
            id: 'edge_' + Math.random().toString(36).substring(2, 9),
            fromNode,
            fromSocket,
            toNode,
            toSocket
        });
    }

    removeEdge(id: string) {
        this.edges = this.edges.filter(e => e.id !== id);
    }

    // Coordinates conversion
    screenToWorld(x: number, y: number): Point {
        return {
            x: (x - this.transform.x) / this.transform.scale,
            y: (y - this.transform.y) / this.transform.scale
        };
    }
}

export const graphState = new GraphState();
