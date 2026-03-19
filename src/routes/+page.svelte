<script lang="ts">
    import { graphState } from "$lib/state.svelte";
    import { NODE_TYPES_CONFIG } from "$lib/types";
    import NodeEditor from "$lib/components/NodeEditor.svelte";

    let isComputing = $state(false);
    let showAddMenu = $state(false);
    let expandedCategory = $state<string | null>(null);

    const nodeCategories = {
        Inputs: [
            "floatNode",
            "provinceNode",
            "dataSourceNode",
            "partyNode",
            "noteNode",
        ],
        Converters: [
            "findWinnerNode",
            "collateWinnersNode",
            "collateVotesNode",
            "extractCollatedNode",
            "convertToPercentagesRidingNode",
            "convertToPercentagesCollatedNode",
        ],
        Math: ["addNode", "subtractNode", "multiplyNode", "divideNode"],
        Swings: ["uniformSwingNode", "proportionalSwingNode"],
        Filters: ["filterProvinceNode"],
        Combine: ["mergeTablesNode", "mixVoteCountTableNode"],
        Outputs: ["barChartNode", "tableViewNode", "floatDisplayNode"],
    };

    function triggerSave() {
        const data = {
            nodes: graphState.nodes,
            edges: graphState.edges,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "graph.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    function triggerLoad(e: Event) {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (re) => {
            const data = JSON.parse(re.target?.result as string);
            graphState.nodes = data.nodes || [];
            graphState.edges = data.edges || [];
        };
        reader.readAsText(file);
    }

    async function triggerRun() {
        isComputing = true;

        // Clear previous results
        for (const n of graphState.nodes) {
            n.resultHTML = "";
        }

        try {
            const res = await fetch("/api/compute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nodes: graphState.nodes,
                    edges: graphState.edges,
                }),
            });
            const data = await res.json();

            const resultsRaw = data.results || {};
            for (const key of Object.keys(resultsRaw)) {
                const node = graphState.nodes.find((n) => n.id === key);
                if (node) {
                    node.resultHTML = resultsRaw[key];
                }
            }
        } catch (e) {
            console.error(e);
            alert("Error communicating with backend.");
        }
        isComputing = false;
    }
</script>

<div class="layout">
    <div class="toolbar">
        <div class="group category-menu-container">
            <button
                class="add-btn"
                onclick={() => (showAddMenu = !showAddMenu)}
            >
                + Add Node
            </button>
            {#if showAddMenu}
                <div class="add-menu">
                    {#each Object.entries(nodeCategories) as [cat, nodes]}
                        <div class="category">
                            <button
                                class="cat-btn"
                                onclick={() =>
                                    (expandedCategory =
                                        expandedCategory === cat ? null : cat)}
                            >
                                {cat}
                                {expandedCategory === cat ? "▼" : "▶"}
                            </button>
                            {#if expandedCategory === cat}
                                <div class="node-list">
                                    {#each nodes as type}
                                        {@const config =
                                            NODE_TYPES_CONFIG[type]}
                                        <button
                                            class="node-btn"
                                            style="border-left: 3px solid {config.color};"
                                            onclick={() => {
                                                graphState.addNode(
                                                    type as keyof typeof NODE_TYPES_CONFIG,
                                                    -graphState.transform.x /
                                                        graphState.transform
                                                            .scale +
                                                        100,
                                                    -graphState.transform.y /
                                                        graphState.transform
                                                            .scale +
                                                        100,
                                                );
                                                showAddMenu = false;
                                                expandedCategory = null;
                                            }}
                                        >
                                            {config.title}
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="group right">
            <button onclick={triggerSave}>Save JSON</button>

            <label class="file-btn">
                Load JSON
                <input
                    type="file"
                    accept=".json"
                    onchange={triggerLoad}
                    style="display:none;"
                />
            </label>

            <button class="run-btn" onclick={triggerRun} disabled={isComputing}>
                {isComputing ? "Running..." : "▶ Run Preview"}
            </button>
        </div>
    </div>

    <div class="workspace">
        <NodeEditor />
    </div>
</div>

<style>
    .layout {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
    }

    .toolbar {
        background: #1a202c;
        border-bottom: 1px solid #2d3748;
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 10;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    .group {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    .category-menu-container {
        position: relative;
    }

    .add-btn {
        background: #4a5568;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 0px;
        cursor: pointer;
    }

    .add-btn:hover {
        background: #2b6cb0;
    }

    .add-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 18px;
        background: #2d3748;
        border: 1px solid #4a5568;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        min-width: 200px;
        z-index: 100;
        display: flex;
        flex-direction: column;
    }

    .category {
        display: flex;
        flex-direction: column;
    }

    .cat-btn {
        background: none;
        color: white;
        border: none;
        padding: 8px 12px;
        text-align: left;
        cursor: pointer;
        border-bottom: 1px solid #4a5568;
        display: flex;
        justify-content: space-between;
    }

    .cat-btn:hover {
        background: #4a5568;
    }

    .node-list {
        display: flex;
        flex-direction: column;
        background: #1a202c;
    }

    .node-btn {
        background: none;
        color: #e2e8f0;
        border: none;
        padding: 8px 12px 8px 24px;
        text-align: left;
        cursor: pointer;
        font-size: 0.9em;
    }

    .node-btn:hover {
        background: #2d3748;
        color: white;
    }

    .file-btn {
        cursor: pointer;
        background: #2d3748;
        color: white;
        border: 1px solid #4a5568;
        padding: 0.5rem 1rem;
        border-radius: 0px;
        font-size: 0.9rem;
        transition: background 0.2s;
    }

    .file-btn:hover {
        background: #4a5568;
    }

    .run-btn {
        background: #38a169;
        border-color: #2f855a;
    }

    .run-btn:hover {
        background: #48bb78;
    }

    .run-btn:disabled {
        background: #718096;
        cursor: not-allowed;
    }

    .workspace {
        flex: 1;
        position: relative;
    }
</style>
