<script lang="ts">
    import { graphState } from "$lib/state.svelte";
    import Node from "./Node.svelte";
    import Edge from "./Edge.svelte";

    let editorView = $state<HTMLElement>();

    function onWheel(e: WheelEvent) {
        if (e.ctrlKey) {
            e.preventDefault();
            const scaleSpeed = 0.001;
            const ds = -e.deltaY * scaleSpeed;
            const newScale = Math.min(
                Math.max(0.1, graphState.transform.scale + ds),
                3,
            );

            // Zoom pointing at mouse
            const rect = editorView!.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            // Compute offset shift
            const f = newScale / graphState.transform.scale;
            graphState.transform.x = mx - (mx - graphState.transform.x) * f;
            graphState.transform.y = my - (my - graphState.transform.y) * f;
            graphState.transform.scale = newScale;
        } else {
            // Panning
            graphState.transform.x -= e.deltaX;
            graphState.transform.y -= e.deltaY;
        }
    }

    let isPanning = false;

    function onPointerDown(e: PointerEvent) {
        if (
            e.target !== editorView &&
            !(e.target as HTMLElement).classList.contains("canvas-container")
        )
            return;
        if (e.button === 1 || e.button === 0) {
            isPanning = true;
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }
    }

    function onPointerMove(e: PointerEvent) {
        graphState.mousePos = { x: e.clientX, y: e.clientY };

        if (isPanning) {
            graphState.transform.x += e.movementX;
            graphState.transform.y += e.movementY;
        }

        if (graphState.activeNodeId && graphState.isDraggingNode) {
            const node = graphState.nodes.find(
                (n) => n.id === graphState.activeNodeId,
            );
            if (node) {
                // To move node accurately invariant to scale
                node.x += e.movementX / graphState.transform.scale;
                node.y += e.movementY / graphState.transform.scale;
            }
        }
    }

    function onPointerUp(e: PointerEvent) {
        isPanning = false;
        graphState.isDraggingNode = false;
        graphState.activeNodeId = null;

        if (graphState.isCreatingEdge) {
            graphState.isCreatingEdge = false;
            graphState.edgeStart = null;
        }
    }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="node-editor"
    bind:this={editorView}
    onwheel={onWheel}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
>
    <div
        class="canvas-container"
        style="transform: translate({graphState.transform.x}px, {graphState
            .transform.y}px) scale({graphState.transform.scale})"
    >
        <svg class="edges-layer">
            {#each graphState.edges as edge (edge.id)}
                <Edge {edge} />
            {/each}
            {#if graphState.isCreatingEdge && graphState.edgeStart}
                <Edge
                    tempStart={graphState.edgeStart}
                    {...{ mousePos: graphState.mousePos }}
                />
            {/if}
        </svg>

        <div class="nodes-layer">
            {#each graphState.nodes as node (node.id)}
                <Node {node} />
            {/each}
        </div>
    </div>
</div>

<style>
    .node-editor {
        width: 100%;
        height: 100%;
        background-color: #2b2b2b;
        background-image: linear-gradient(
                rgba(255, 255, 255, 0.05) 1px,
                transparent 1px
            ),
            linear-gradient(
                90deg,
                rgba(255, 255, 255, 0.05) 1px,
                transparent 1px
            );
        background-size: 20px 20px;
        overflow: hidden;
        position: relative;
        touch-action: none;
    }

    .canvas-container {
        position: absolute;
        top: 0;
        left: 0;
        transform-origin: 0 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    .edges-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
    }

    .nodes-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }
</style>
