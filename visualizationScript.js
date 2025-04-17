/**
 * Creates the main visualization JavaScript
 */
const visNetworkScript = require('./visNetworkScript');

/**
 * Performs a BFS traversal from a selected node up to a specified maximum depth
 * Tracks both node distance and cumulative method count
 * 
 * @param {string} startNodeId - ID of the starting node
 * @param {Array} nodes - Array of all nodes in the graph
 * @param {Array} edges - Array of all edges in the graph
 * @param {number} maxDepth - Maximum traversal depth
 * @returns {Object} - Results of the BFS traversal
 */
function performBfsTraversal(startNodeId, nodes, edges, maxDepth) {
    // Create a map for easier node lookup
    const nodeMap = {};
    nodes.forEach(node => {
        nodeMap[node.id] = node;
    });
    
    // Track visited nodes to avoid cycles
    const visited = new Set();
    
    // Store results: node ID -> {distance, methodCount}
    const results = {};
    
    // Initialize queue with starting node
    // Each queue item contains: [nodeId, distance, cumulativeMethodCount]
    const queue = [[startNodeId, 0, nodeMap[startNodeId].methods ? nodeMap[startNodeId].methods.length : 0]];
    
    // Mark starting node as visited
    visited.add(startNodeId);
    
    // Add starting node to results
    results[startNodeId] = {
        distance: 0,
        methodCount: nodeMap[startNodeId].methods ? nodeMap[startNodeId].methods.length : 0,
        name: nodeMap[startNodeId].label
    };
    
    // Process queue until empty or max depth reached
    while (queue.length > 0) {
        // Dequeue the next node
        const [currentNodeId, distance, methodCount] = queue.shift();
        
        // Skip if we've exceeded max depth
        if (distance >= maxDepth) {
            continue;
        }
        
        // Find all connected nodes
        const connectedNodes = [];
        
        edges.forEach(edge => {
            let connectedNodeId;
            
            // Check both directions of edges (from and to)
            if (edge.from === currentNodeId) {
                connectedNodeId = edge.to;
            } else if (edge.to === currentNodeId) {
                connectedNodeId = edge.from;
            }
            
            // If there's a connected node and it hasn't been visited yet
            if (connectedNodeId && !visited.has(connectedNodeId)) {
                // Add the connected node to our list
                connectedNodes.push({
                    id: connectedNodeId,
                    relation: edge.from === currentNodeId ? edge.label : edge.label + ' (reverse)'
                });
            }
        });
        
        // Process all connected nodes
        for (const connectedNode of connectedNodes) {
            // Mark as visited
            visited.add(connectedNode.id);
            
            // Calculate new cumulative method count
            const node = nodeMap[connectedNode.id];
            const newMethodCount = methodCount + (node.methods ? node.methods.length : 0);
            
            // Add to results
            results[connectedNode.id] = {
                distance: distance + 1,
                methodCount: newMethodCount,
                name: node.label,
                relation: connectedNode.relation
            };
            
            // Add to queue for further processing
            queue.push([connectedNode.id, distance + 1, newMethodCount]);
        }
    }
    
    return results;
}

/**
 * Creates HTML to display BFS traversal results
 * 
 * @param {Object} bfsResults - Results from the BFS traversal
 * @param {string} startNodeId - ID of the starting node
 * @returns {string} - HTML string to display the results
 */
function createBfsResultsHtml(bfsResults, startNodeId) {
    // Group results by distance
    const resultsByDistance = {};
    
    Object.keys(bfsResults).forEach(nodeId => {
        const info = bfsResults[nodeId];
        if (!resultsByDistance[info.distance]) {
            resultsByDistance[info.distance] = [];
        }
        resultsByDistance[info.distance].push({
            id: nodeId,
            ...info
        });
    });
    
    // Create HTML output
    let html = '<div class="bfs-results">';
    html += '<h3>BFS Traversal Results</h3>';
    html += '<p>Starting from: <strong>' + bfsResults[startNodeId].name + '</strong></p>';
    
    // Create a table for the results
    html += '<table class="bfs-table">';
    html += '<thead><tr><th>Distance</th><th>Node</th><th>Relation</th><th>Methods Count</th></tr></thead>';
    html += '<tbody>';
    
    // Add rows for each distance level
    Object.keys(resultsByDistance).sort((a, b) => a - b).forEach(distance => {
        const nodes = resultsByDistance[distance];
        
        // Add a row for each node at this distance
        nodes.forEach(node => {
            const isStartNode = node.id === startNodeId;
            
            html += '<tr class="' + (isStartNode ? 'start-node' : '') + '">';
            html += '<td>' + distance + '</td>';
            html += '<td>' + node.name + '</td>';
            html += '<td>' + (isStartNode ? 'START' : node.relation) + '</td>';
            html += '<td>' + node.methodCount + '</td>';
            html += '</tr>';
        });
    });
    
    html += '</tbody></table>';
    html += '</div>';
    
    return html;
}

/**
 * Adds BFS-related CSS styles to the document
 */
function addBfsCssStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
    .bfs-results {
        padding: 12px;
        background-color: #f5f5f5;
        border-radius: 6px;
        margin-top: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .bfs-results h3 {
        margin-top: 0;
        color: #333;
        font-size: 1.1rem;
    }
    
    .bfs-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 0.9rem;
    }
    
    .bfs-table th, .bfs-table td {
        border: 1px solid #ddd;
        padding: 6px 8px;
        text-align: left;
    }
    
    .bfs-table th {
        background-color: #e1e1e1;
        font-weight: 600;
    }
    
    .bfs-table tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    
    .bfs-table tr:hover {
        background-color: #efefef;
    }
    
    .bfs-table tr.start-node {
        background-color: #e3f2fd;
    }
    
    .bfs-table tr.start-node:hover {
        background-color: #bbdefb;
    }
    `;
    
    document.head.appendChild(styleElement);
}

// Update the addBfsCssStyles function to be more robust
function addBfsCssStyles() {
    try {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
        .bfs-results {
            padding: 12px;
            background-color: #f5f5f5;
            border-radius: 6px;
            margin-top: 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .bfs-results h3 {
            margin-top: 0;
            color: #333;
            font-size: 1.1rem;
        }
        
        .bfs-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 0.9rem;
        }
        
        .bfs-table th, .bfs-table td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
        }
        
        .bfs-table th {
            background-color: #e1e1e1;
            font-weight: 600;
        }
        
        .bfs-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        
        .bfs-table tr:hover {
            background-color: #efefef;
        }
        
        .bfs-table tr.start-node {
            background-color: #e3f2fd;
        }
        
        .bfs-table tr.start-node:hover {
            background-color: #bbdefb;
        }
        `;
        
        document.head.appendChild(styleElement);
        return true;
    } catch (err) {
        console.error('Error adding BFS CSS styles:', err);
        return false;
    }
}

// Modify the createVisualizationScript function to include the BFS functions in the string template
function createVisualizationScript(graphDataStr) {
    // Add the vis-network implementation
    const visNetworkImplementation = visNetworkScript.getVisNetworkImplementation();
    
    // Main visualization script
    return `
    ${visNetworkImplementation}

    // BFS implementation
    ${performBfsTraversal.toString()}
    
    ${createBfsResultsHtml.toString()}
    
    ${addBfsCssStyles.toString()}

    // Graph data from extension
    let graphData;
    try {
        graphData = ${graphDataStr};
        
        // Update stats
        document.getElementById('class-count').textContent = 
            graphData.nodes.filter(n => n.group === 'class').length;
        document.getElementById('interface-count').textContent = 
            graphData.nodes.filter(n => n.group === 'interface').length;
        document.getElementById('edge-count').textContent = 
            graphData.edges.length;
        
    } catch (err) {
        console.error("Error parsing graph data:", err.message);
        graphData = {nodes: [], edges: []};
    }

    // Debug functionality
    const debugPanel = document.getElementById('debugPanel');
    
    function addDebugEntry(message, type = 'info') {
        console.log(message);
        
        // Add to debug panel
        if (debugPanel) {
            const entry = document.createElement('div');
            entry.className = 'debug-entry ' + type;
            entry.textContent = message;
            debugPanel.appendChild(entry);
            debugPanel.scrollTop = debugPanel.scrollHeight;
        }
        
        // Try to send to extension
        try {
            const vscode = acquireVsCodeApi();
            vscode.postMessage({ 
                command: type === 'error' ? 'error' : 'log', 
                text: message 
            });
        } catch (err) {
            console.error('Failed to send message to extension:', err);
        }
    }
    
    // Add BFS controls to the control panel
    function addBfsControls() {
        try {
            const controlPanel = document.getElementById('controlPanel');
            if (!controlPanel) {
                console.error('Control panel element not found');
                return false;
            }
            
            // Create a container for the BFS controls
            const bfsControls = document.createElement('div');
            bfsControls.className = 'bfs-controls';
            bfsControls.style.marginLeft = '15px';
            bfsControls.style.display = 'flex';
            bfsControls.style.alignItems = 'center';
            bfsControls.style.gap = '8px';
            
            // Add a label
            const label = document.createElement('span');
            label.textContent = 'BFS Depth:';
            label.style.fontSize = '0.9rem';
            
            // Add a select dropdown for BFS depth
            const depthSelect = document.createElement('select');
            depthSelect.id = 'bfsDepthSelect';
            depthSelect.style.padding = '4px 8px';
            depthSelect.style.borderRadius = '4px';
            depthSelect.style.border = '1px solid #ccc';
            
            // Add options for different depths
            for (let i = 1; i <= 10; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                if (i === 3) option.selected = true; // Default to depth 3
                depthSelect.appendChild(option);
            }
            
            // Add components to the control container
            bfsControls.appendChild(label);
            bfsControls.appendChild(depthSelect);
            
            // Add the BFS controls to the control panel
            controlPanel.appendChild(bfsControls);
            return true;
        } catch (err) {
            console.error('Error adding BFS controls:', err);
            return false;
        }
    }
    
    // Toggle debug panel
    const toggleDebugBtn = document.getElementById('toggleDebugBtn');
    if (toggleDebugBtn) {
        toggleDebugBtn.addEventListener('click', function() {
            if (debugPanel) {
                if (debugPanel.style.display === 'none') {
                    debugPanel.style.display = 'block';
                    this.textContent = 'Hide Debug Panel';
                } else {
                    debugPanel.style.display = 'none';
                    this.textContent = 'Show Debug Panel';
                }
            }
        });
    }
    
    // Log initialization
    addDebugEntry("Initializing visualization...");
    
    function displayFallbackView() {
        const graphContainer = document.getElementById('graphContainer');
        if (!graphContainer) {
            console.error('Graph container not found for fallback view');
            return;
        }
        
        // Create fallback rendering
        const fallbackContent = document.createElement('div');
        fallbackContent.style.padding = '20px';
        fallbackContent.style.backgroundColor = '#f5f5f5';
        fallbackContent.style.border = '1px solid #ddd';
        fallbackContent.style.borderRadius = '4px';
        fallbackContent.style.margin = '20px';
        fallbackContent.style.overflowY = 'auto';
        fallbackContent.style.maxHeight = '600px';
        
        const header = document.createElement('h3');
        header.textContent = 'Visualization library failed to load - Showing raw data:';
        fallbackContent.appendChild(header);
        
        const nodeList = document.createElement('div');
        nodeList.innerHTML = '<h4>Classes and Interfaces:</h4>';
        const nodeUl = document.createElement('ul');
        
        for (const node of graphData.nodes) {
            const li = document.createElement('li');
            li.textContent = node.label + ' (' + node.group + ')';
            nodeUl.appendChild(li);
        }
        
        nodeList.appendChild(nodeUl);
        fallbackContent.appendChild(nodeList);
        
        const edgeList = document.createElement('div');
        edgeList.innerHTML = '<h4>Relationships:</h4>';
        const edgeUl = document.createElement('ul');
        
        for (const edge of graphData.edges) {
            const li = document.createElement('li');
            li.textContent = edge.from + ' ' + edge.label + ' ' + edge.to;
            edgeUl.appendChild(li);
        }
        
        edgeList.appendChild(edgeUl);
        fallbackContent.appendChild(edgeList);
        
        // Clear and append the fallback content
        graphContainer.innerHTML = '';
        graphContainer.appendChild(fallbackContent);
    }
    
    function initializeVisualization() {
        try {
            addDebugEntry('Starting visualization initialization');
            
            // First, add BFS styles
            if (!addBfsCssStyles()) {
                addDebugEntry('Failed to add BFS CSS styles', 'warning');
            }
            
            // Add BFS controls to the control panel
            if (!addBfsControls()) {
                addDebugEntry('Failed to add BFS controls', 'warning');
            }
            
            // Get the container for the network
            const container = document.getElementById('mynetwork');
            if (!container) {
                addDebugEntry('Network container element not found', 'error');
                displayFallbackView();
                return;
            }
            
            // Check container dimensions
            const containerRect = container.getBoundingClientRect();
            addDebugEntry("Container size: " + Math.round(containerRect.width) + "x" + Math.round(containerRect.height));
            
            if (containerRect.width < 50 || containerRect.height < 50) {
                addDebugEntry('Warning: Network container has very small dimensions', 'warning');
                
                // Try to force dimensions
                container.style.width = '100%';
                container.style.height = '500px';
                container.style.border = '2px solid red';
                addDebugEntry('Forced container dimensions to 100% width and 500px height', 'info');
            }
            
            // Create datasets
            addDebugEntry('Creating vis.js datasets');
            
            // Make sure vis is defined
            if (typeof vis === 'undefined') {
                addDebugEntry('vis-network library not loaded!', 'error');
                displayFallbackView();
                return;
            }
            
            try {
                const nodes = new vis.DataSet(graphData.nodes);
                const edges = new vis.DataSet(graphData.edges);
                addDebugEntry("Created datasets: " + nodes.length + " nodes, " + edges.length + " edges");
                
                const data = {
                    nodes: nodes,
                    edges: edges
                };
                
                // Initialize node positions using the force-directed layout
                try {
                    addDebugEntry('Applying force-directed layout to initial node positions');
                    if (typeof positionNodesOrganically === 'function') {
                        positionNodesOrganically(graphData.nodes, graphData.edges, containerRect.width, containerRect.height);
                    } else {
                        addDebugEntry('positionNodesOrganically function not found', 'error');
                    }
                } catch (err) {
                    addDebugEntry('Error in initial layout: ' + err.message, 'error');
                }
                
                // Configuration options
                const defaultOptions = {
                    nodes: {
                        shape: 'box',
                        margin: 10,
                        font: {
                            size: 14,
                            color: '#333',
                            face: 'system-ui, sans-serif'
                        },
                        borderWidth: 2,
                        shadow: true,
                        shapeProperties: {
                            borderRadius: 6
                        }
                    },
                    edges: {
                        font: {
                            size: 12,
                            align: 'middle',
                            background: 'white'
                        },
                        width: 2,
                        selectionWidth: 3,
                        smooth: {
                            type: 'continuous',
                            roundness: 0.5
                        },
                        arrows: {
                            to: {
                                enabled: true,
                                scaleFactor: 0.8
                            }
                        }
                    },
                    groups: {
                        'class': {
                            color: { background: '#bbdefb', border: '#1565c0' },
                            shadow: { enabled: true, size: 5, x: 3, y: 3 }
                        },
                        'abstract_class': {
                            color: { background: '#e1bee7', border: '#8e24aa' }, // Purple for abstract classes
                            shape: 'box',
                            shadow: { enabled: true, size: 5, x: 3, y: 3 },
                            borderDashes: [5, 5] // Dashed border for abstract classes
                        },
                        'interface': {
                            color: { background: '#c8e6c9', border: '#2e7d32' },
                            shape: 'hexagon',
                            shadow: { enabled: true, size: 5, x: 3, y: 3 }
                        }
                    },
                    physics: {
                        enabled: true,
                        solver: 'forceAtlas2Based',
                        forceAtlas2Based: {
                            gravitationalConstant: -100,
                            centralGravity: 0.01,
                            springLength: 150,
                            springConstant: 0.08,
                            damping: 0.4
                        },
                        stabilization: {
                            enabled: true,
                            iterations: 1000,
                            updateInterval: 50
                        },
                        timestep: 0.5,
                        adaptiveTimestep: true
                    },
                    interaction: {
                        dragNodes: true,  // Allow node dragging
                        dragView: true,
                        hover: true,
                        tooltipDelay: 200,
                        zoomView: true,
                        navigationButtons: true
                    }
                };
                
                // Create the network with error handling
                let network;
                try {
                    addDebugEntry('Creating network instance');
                    network = new vis.Network(container, data, defaultOptions);
                    
                    // Add zooming buttons for better navigation
                    const zoomContainer = document.createElement('div');
                    zoomContainer.className = 'zoom-controls';
                    zoomContainer.style.position = 'absolute';
                    zoomContainer.style.bottom = '20px';
                    zoomContainer.style.right = '20px';
                    zoomContainer.style.zIndex = '10';

                    const zoomInBtn = document.createElement('button');
                    zoomInBtn.textContent = '+';
                    zoomInBtn.style.fontSize = '18px';
                    zoomInBtn.style.width = '30px';
                    zoomInBtn.style.height = '30px';
                    zoomInBtn.style.marginRight = '5px';
                    zoomInBtn.addEventListener('click', () => {
                        const scale = network.getScale() * 1.2;
                        network.moveTo({ scale: scale });
                    });

                    const zoomOutBtn = document.createElement('button');
                    zoomOutBtn.textContent = '−';
                    zoomOutBtn.style.fontSize = '18px';
                    zoomOutBtn.style.width = '30px';
                    zoomOutBtn.style.height = '30px';
                    zoomOutBtn.addEventListener('click', () => {
                        const scale = network.getScale() * 0.8;
                        network.moveTo({ scale: scale });
                    });

                    zoomContainer.appendChild(zoomInBtn);
                    zoomContainer.appendChild(zoomOutBtn);
                    container.parentNode.appendChild(zoomContainer);

                    addDebugEntry('Network created successfully');
                } catch (err) {
                    addDebugEntry('Failed to create network: ' + err.message, 'error');
                    displayFallbackView();
                    return;
                }
                
                // Handle node click events to show detailed information
                const nodeInfo = document.getElementById('nodeInfo');
                if (!nodeInfo) {
                    addDebugEntry('Node info panel not found', 'warning');
                }
                
                network.on("click", function(params) {
                    addDebugEntry('Network click event detected');
                    if (params.nodes.length > 0) {
                        const nodeId = params.nodes[0];
                        const node = nodes.get(nodeId);
                        
                        // Find all relationships
                        const connections = {
                            parents: [],
                            children: [],
                            implementedBy: [],
                            implements: []
                        };
                        
                        edges.forEach(edge => {
                            if (edge.from === nodeId && edge.label === 'extends') {
                                connections.parents.push({ id: edge.to, label: nodes.get(edge.to).label });
                            }
                            if (edge.to === nodeId && edge.label === 'extends') {
                                connections.children.push({ id: edge.from, label: nodes.get(edge.from).label });
                            }
                            if (edge.from === nodeId && edge.label === 'implements') {
                                connections.implements.push({ id: edge.to, label: nodes.get(edge.to).label });
                            }
                            if (edge.to === nodeId && edge.label === 'implements') {
                                connections.implementedBy.push({ id: edge.from, label: nodes.get(edge.from).label });
                            }
                        });
                        
                        // Build HTML for node info with improved styling
                        let html = '<h3>' + node.label + '</h3>';
                        html += '<p><strong>Type:</strong> <span style="background-color: ' +
                                (node.group === 'class' ? '#bbdefb' : node.group === 'abstract_class' ? '#e1bee7' : '#c8e6c9') + 
                                '; color: ' + (node.group === 'class' ? '#1565c0' : node.group === 'abstract_class' ? '#8e24aa' : '#2e7d32') + 
                                '; padding: 2px 8px; border-radius: 10px; font-size: 0.9rem;">' +
                                node.group + '</span></p>';
                        
                        if (connections.parents.length > 0) {
                            html += '<p><strong>Extends:</strong></p><ul>';
                            connections.parents.forEach(parent => {
                                html += '<li style="margin-left: 20px; margin-top: 5px;">' + parent.label + '</li>';
                            });
                            html += '</ul>';
                        }
                        
                        if (connections.implements.length > 0) {
                            html += '<p><strong>Implements:</strong></p><ul>';
                            connections.implements.forEach(impl => {
                                html += '<li style="margin-left: 20px; margin-top: 5px;">' + impl.label + '</li>';
                            });
                            html += '</ul>';
                        }
                        
                        if (connections.children.length > 0) {
                            html += '<p><strong>Extended by:</strong></p><ul>';
                            connections.children.forEach(child => {
                                html += '<li style="margin-left: 20px; margin-top: 5px;">' + child.label + '</li>';
                            });
                            html += '</ul>';
                        }
                        
                        if (connections.implementedBy.length > 0) {
                            html += '<p><strong>Implemented by:</strong></p><ul>';
                            connections.implementedBy.forEach(impl => {
                                html += '<li style="margin-left: 20px; margin-top: 5px;">' + impl.label + '</li>';
                            });
                            html += '</ul>';
                        }

                        try {
                            // Get BFS depth from select dropdown
                            const depthSelect = document.getElementById('bfsDepthSelect');
                            const bfsDepth = depthSelect ? parseInt(depthSelect.value, 10) : 3;

                            // Perform BFS traversal
                            addDebugEntry('Performing BFS traversal with depth: ' + bfsDepth);
                            const bfsResults = performBfsTraversal(nodeId, data.nodes.items, data.edges.items, bfsDepth);

                            // Add BFS results to the HTML
                            html += createBfsResultsHtml(bfsResults, nodeId);
                        } catch (err) {
                            addDebugEntry('Error in BFS traversal: ' + err.message, 'error');
                            html += '<div class="bfs-results"><h3>BFS Traversal Error</h3><p>' + err.message + '</p></div>';
                        }
                        
                        if (nodeInfo) {
                            nodeInfo.innerHTML = html;
                            nodeInfo.style.display = 'block';
                        }
                    } else if (nodeInfo) {
                        nodeInfo.style.display = 'none';
                    }
                });
                
                // Layout buttons
                const resetBtn = document.getElementById('resetBtn');
                if (resetBtn) {
                    resetBtn.addEventListener('click', function() {
                        addDebugEntry('Resetting view');
                        network.setOptions(defaultOptions);
                        network.fit();
                    });
                }
                
                // Add event listener for the cluster button
                const clusterBtn = document.getElementById('clusterBtn');
                if (clusterBtn) {
                    clusterBtn.addEventListener('click', function() {
                        addDebugEntry('Running force-directed layout to group related nodes');
                        
                        try {
                            // Get current node positions
                            const nodes = data.nodes.items;
                            const edges = data.edges.items;
                            
                            // Run the force-directed layout algorithm
                            if (typeof positionNodesOrganically === 'function') {
                                positionNodesOrganically(nodes, edges, container.clientWidth, container.clientHeight);
                            } else {
                                addDebugEntry('positionNodesOrganically function not found', 'error');
                                return;
                            }
                            
                            // Check if svg is defined
                            const svg = document.querySelector('svg');
                            if (!svg) {
                                addDebugEntry('SVG element not found for updating positions', 'error');
                                return;
                            }
                            
                            // Update the node positions in the SVG
                            nodes.forEach(node => {
                                const nodeGroup = svg.querySelector('g[data-id="' + node.id + '"]');
                                if (nodeGroup) {
                                    nodeGroup.setAttribute('transform', 'translate(' + node.x + ', ' + node.y + ')');
                                }
                            });
                            
                            // Update all edge positions
                            edges.forEach(edge => {
                                const fromNode = nodes.find(n => n.id === edge.from);
                                const toNode = nodes.find(n => n.id === edge.to);
                                
                                if (fromNode && toNode) {
                                    const edgeLine = svg.querySelector('line[data-from="' + edge.from + '"][data-to="' + edge.to + '"]');
                                    if (edgeLine) {
                                        // Calculate the direction vector
                                        const dx = toNode.x - fromNode.x;
                                        const dy = toNode.y - fromNode.y;
                                        const length = Math.sqrt(dx * dx + dy * dy);
                                        
                                        // Normalize
                                        const nx = dx / length;
                                        const ny = dy / length;
                                        
                                        // End point with offset for the arrow
                                        const arrowOffset = 30;
                                        const endX = toNode.x - nx * arrowOffset;
                                        const endY = toNode.y - ny * arrowOffset;
                                        
                                        // Update line coordinates
                                        edgeLine.setAttribute('x1', fromNode.x);
                                        edgeLine.setAttribute('y1', fromNode.y);
                                        edgeLine.setAttribute('x2', endX);
                                        edgeLine.setAttribute('y2', endY);
                                        
                                        // Update label position
                                        const midX = (fromNode.x + endX) / 2;
                                        const midY = (fromNode.y + endY) / 2;
                                        
                                        const edgeLabel = svg.querySelector('text[data-edge="' + edge.from + '-' + edge.to + '"]');
                                        const edgeLabelBg = svg.querySelector('rect[data-edge="' + edge.from + '-' + edge.to + '"]');
                                        
                                        if (edgeLabel) {
                                            edgeLabel.setAttribute('x', midX);
                                            edgeLabel.setAttribute('y', midY);
                                        }
                                        
                                        if (edgeLabelBg) {
                                            edgeLabelBg.setAttribute('x', midX - 30);
                                            edgeLabelBg.setAttribute('y', midY - 10);
                                        }
                                    }
                                }
                            });
                            
                            addDebugEntry('Node grouping complete');
                        } catch (err) {
                            addDebugEntry('Error during node grouping: ' + err.message, 'error');
                        }
                    });
                }
                
                // Force network to fit view and redraw after a short delay
                setTimeout(() => {
                    try {
                        addDebugEntry('Fitting network to view');
                        network.fit();
                        network.redraw();
                        addDebugEntry('Network fitted and redrawn after timeout');
                    } catch (err) {
                        addDebugEntry('Error in delayed redraw: ' + err.message, 'error');
                    }
                }, 500);
                
            } catch (err) {
                addDebugEntry('Error creating network: ' + err.message, 'error');
                displayFallbackView();
            }
            
        } catch (err) {
            addDebugEntry('Unhandled error in visualization initialization: ' + err.message, 'error');
            displayFallbackView();
        }
    }
        
    // Initialize the visualization
    initializeVisualization();
    `;
}

module.exports = {
    createVisualizationScript
};