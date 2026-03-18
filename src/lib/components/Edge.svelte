<script lang="ts">
    import { graphState } from "$lib/state.svelte";
    import type { EdgeDefinition, Point } from "$lib/types";

    let { edge, tempStart, mousePos } = $props<{
        edge?: EdgeDefinition;
        tempStart?: { nodeId: string; socketIdx: number };
        mousePos?: Point;
    }>();

    // Constant offset for socket relative to node top-left
    const INPUT_X_OFFSET = 0;
    // Base y offset for content div + socket spacing
    const getYOffset = (idx: number) => 45 + idx * 27; // approx

    function getPoints(): { start: Point; end: Point } {
        if (edge) {
            const fromNode = graphState.nodes.find(
                (n) => n.id === edge!.fromNode,
            );
            const toNode = graphState.nodes.find((n) => n.id === edge!.toNode);
            if (!fromNode || !toNode)
                return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };

            return {
                start: {
                    x: fromNode.x + fromNode.width,
                    y: fromNode.y + getYOffset(edge.fromSocket),
                },
                end: {
                    x: toNode.x + INPUT_X_OFFSET,
                    y: toNode.y + getYOffset(edge.toSocket),
                },
            };
        } else if (tempStart && mousePos) {
            // we are drawing a temporary edge from an output
            const fromNode = graphState.nodes.find(
                (n) => n.id === tempStart.nodeId,
            );
            if (!fromNode) return { start: { x: 0, y: 0 }, end: mousePos };

            return {
                start: {
                    x: fromNode.x + fromNode.width,
                    y: fromNode.y + getYOffset(tempStart.socketIdx),
                },
                end: graphState.screenToWorld(mousePos.x, mousePos.y - 50),
            };
        }
        return { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
    }

    let coords = $derived(getPoints());

    let pathData = $derived(`
        M ${coords.start.x} ${coords.start.y}
          ${coords.end.x} ${coords.end.y}
    `);

    //C ${coords.start.x + 80} ${coords.start.y},
    //  ${coords.end.x - 80} ${coords.end.y},
</script>

<path d={pathData} class="edge-path" />

<style>
    .edge-path {
        fill: none;
        stroke: #a0aec0;
        stroke-width: 3;
        transition: stroke 0.2s;
    }
</style>
