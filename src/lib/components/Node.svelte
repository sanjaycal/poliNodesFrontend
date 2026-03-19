<script lang="ts">
    import { graphState } from "$lib/state.svelte";
    import { PROVINCES, PARTIES, type NodeDefinition } from "$lib/types";

    let { node } = $props<{ node: NodeDefinition }>();

    function onHeaderPointerDown(e: PointerEvent) {
        e.stopPropagation();
        graphState.isDraggingNode = true;
        graphState.activeNodeId = node.id;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onSocketPointerDown(
        e: PointerEvent,
        type: "input" | "output",
        index: number,
    ) {
        e.stopPropagation();
        if (type === "output") {
            graphState.isCreatingEdge = true;
            graphState.edgeStart = { nodeId: node.id, socketIdx: index };
        } if (type === "input") {
            let selectedEdge = graphState.edges.filter(e => e.toNode===node.id && e.toSocket===index)[0];
            graphState.removeEdge(selectedEdge.id);
            graphState.isCreatingEdge = true;
            graphState.edgeStart = {nodeId: selectedEdge.fromNode, socketIdx: selectedEdge.fromSocket}
        }
    }

    function onSocketPointerUp(
        e: PointerEvent,
        type: "input" | "output",
        index: number,
    ) {
        e.stopPropagation();
        if (
            type === "input" &&
            graphState.isCreatingEdge &&
            graphState.edgeStart
        ) {
            graphState.addEdge(
                graphState.edgeStart.nodeId,
                graphState.edgeStart.socketIdx,
                node.id,
                index,
            );
        }
        graphState.isCreatingEdge = false;
        graphState.edgeStart = null;
    }
</script>

<div
    class="node"
    style="transform: translate({node.x}px, {node.y}px); width: {node.width}px;"
    id={node.id}
>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="header"
        style="background: {node.color};"
        onpointerdown={onHeaderPointerDown}
    >
        {node.title}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <span
            class="close-btn"
            onclick={(e) => {
                e.stopPropagation();
                graphState.removeNode(node.id);
            }}>×</span
        >
    </div>

    <div class="content">
        {#if node.type === "floatNode"}
            <div class="inline-input">
                <input type="tel" bind:value={node.attrs.value} />
            </div>
        {/if}
        {#if node.type === "provinceNode"}
            <div class="inline-input">
                <select bind:value={node.attrs.value}>
                    <option value="" disabled selected>Select province</option>
                    {#each PROVINCES as prov}
                        <option value={prov}>{prov}</option>
                    {/each}
                </select>
            </div>
        {/if}
        {#if node.type === "partyNode"}
            <div class="inline-input">
                <select bind:value={node.attrs.value}>
                    <option value="" disabled selected>Select party</option>
                    {#each PARTIES as party}
                        <option value={party}>{party}</option>
                    {/each}
                </select>
            </div>
        {/if}
        {#if node.type === "noteNode"}
            <div class="note-input">
                <textarea bind:value={node.attrs.text} placeholder="Enter note here..."></textarea>
            </div>
        {/if}

        <div class="sockets inputs">
            {#each node.inputTypes as sType, i}
                <div class="socket-wrapper">
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="socket input-socket shape-{sType}"
                        data-node-id={node.id}
                        data-socket-idx={i}
                        data-socket-type="input"
                        title={sType}
                        onpointerdown={(e) =>
                            onSocketPointerDown(e, "input", i)}
                        onpointerup={(e) => onSocketPointerUp(e, "input", i)}
                    ></div>
                    <span class="socket-label input-label"
                        >{node.inputLabels[i]}</span
                    >
                </div>
            {/each}
        </div>

        <div class="sockets outputs">
            {#each node.outputTypes as sType, i}
                <div class="socket-wrapper output-wrapper">
                    <span class="socket-label output-label"
                        >{node.outputLabels[i]}</span
                    >
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div
                        class="socket output-socket shape-{sType}"
                        data-node-id={node.id}
                        data-socket-idx={i}
                        data-socket-type="output"
                        title={sType}
                        onpointerdown={(e) =>
                            onSocketPointerDown(e, "output", i)}
                        onpointerup={(e) => onSocketPointerUp(e, "output", i)}
                    ></div>
                </div>
            {/each}
        </div>
    </div>

    {#if node.resultHTML}
        <div class="node-result">
            <div class="result-scrollbox">
                {@html node.resultHTML}
            </div>
        </div>
    {/if}
</div>

<style>
    .node {
        position: absolute;
        top: 0;
        left: 0;
        background: rgba(45, 55, 72, 0.9);
        border-radius: 0px;
        box-shadow: 0 0px 0px rgba(0, 0, 0, 0.3);
        pointer-events: auto;
        user-select: none;
        border: 1px solid #4a5568;
        display: flex;
        flex-direction: column;
    }

    .header {
        padding: 5px 10px;
        border-top-left-radius: 0px;
        border-top-right-radius: 0px;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: grab;
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    .header:active {
        cursor: grabbing;
    }

    .close-btn {
        cursor: pointer;
        padding: 0 4px;
        border-radius: 3px;
    }
    .close-btn:hover {
        background: rgba(0, 0, 0, 0.2);
    }

    .content {
        padding: 10px 0;
        display: flex;
        justify-content: space-between;
        min-height: 40px;
    }

    .sockets {
        display: flex;
        flex-direction: column;
        gap: 15px;
        justify-content: center;
    }

    .socket-wrapper {
        position: relative;
        height: 12px;
        display: flex;
        align-items: center;
    }

    .socket {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #cbd5e0;
        border: 2px solid #2d3748;
        cursor: crosshair;
        position: absolute;
        transition:
            transform 0.1s,
            background 0.1s;
    }

    .socket:hover {
        transform: scale(1.3);
        background: #fff;
    }

    .input-socket {
        left: -6px;
    }

    .output-socket {
        right: -6px;
    }

    .output-wrapper {
        justify-content: flex-end;
    }

    .socket-label {
        font-size: 0.75rem;
        color: #e2e8f0;
        pointer-events: none;
    }

    .input-label {
        margin-left: 12px;
    }

    .output-label {
        margin-right: 12px;
    }

    /* Socket Shapes */
    .shape-FLOAT {
        border-radius: 50%;
    }
    .shape-PROVINCE {
        border-radius: 3px;
        transform: rotate(45deg);
    }
    .shape-VOTECOUNTRIDINGTABLE {
        border-radius: 0;
    }
    .shape-RIDINGWINNERTABLE {
        border-radius: 0;
        transform: rotate(45deg);
    }
    .shape-RIDINGWINNERTABLE:hover {
        transform: rotate(45deg) scale(1.3);
    }
    .shape-COLLATEDSEATSTABLE {
        border-radius: 0;
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
    }
    .shape-PARTY {
        border-radius: 0;
        clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    }
    .shape-ANYTABLE {
        border-radius: 5px;
        background: repeating-linear-gradient(45deg, #cbd5e0, #cbd5e0 2px, #4a5568 2px, #4a5568 4px);
    }
    .shape-ANYRIDINGTABLE {
        border-radius: 5px;
        background: repeating-linear-gradient(45deg, #fbd38d, #fbd38d 2px, #dd6b20 2px, #dd6b20 4px);
    }
    .shape-ANYCOLLATEDTABLE {
        border-radius: 5px;
        background: repeating-linear-gradient(45deg, #d6bcfa, #d6bcfa 2px, #805ad5 2px, #805ad5 4px);
    }
    .shape-IMAGE {
        border-radius: 0;
        clip-path: polygon(
            25% 0%,
            75% 0%,
            100% 50%,
            75% 100%,
            25% 100%,
            0% 50%
        );
    }

    .inline-input {
        position: absolute;
        top: 35px;
        left: 5px;
        right: 70px;
    }
    .inline-input input,
    .inline-input select {
        width: 100%;
        background: #1a202c;
        color: white;
        border: 1px solid #4a5568;
        padding: 4px;
        border-radius: 0px;
        text-align: center;
    }

    .note-input {
        width: 100%;
        padding: 5px 10px;
        box-sizing: border-box;
    }
    .note-input textarea {
        width: 100%;
        min-height: 80px;
        background: #1a202c;
        color: white;
        border: 1px solid #4a5568;
        padding: 8px;
        resize: both;
        box-sizing: border-box;
        border-radius: 4px;
        font-family: inherit;
        font-size: 0.85rem;
    }

    .node-result {
        background: #fff;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        padding: 5px;
    }

    .result-scrollbox {
        overflow: auto;
        max-height: 400px;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
    }

    :global(.node-result svg) {
        width: 100%;
        height: auto;
    }
</style>
