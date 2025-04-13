/**
 * Creates the main visualization JavaScript
 */
const visNetworkScript = require('./visNetworkScript');

/**
 * Returns the JavaScript code for the visualization
 * @param {string} graphDataStr Stringified graph data
 * @returns {string} JavaScript code for visualization
 */
function createVisualizationScript(graphDataStr) {
    // Add the vis-network implementation
    const visNetworkImplementation = visNetworkScript.getVisNetworkImplementation();
    
    // Main visualization script
    return `
    ${visNetworkImplementation}

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
        const entry = document.createElement('div');
        entry.className = 'debug-entry ' + type;
        entry.textContent = message;
        debugPanel.appendChild(entry);
        debugPanel.scrollTop = debugPanel.scrollHeight;
        
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
    
    // Toggle debug panel
    document.getElementById('toggleDebugBtn').addEventListener('click', function() {
        if (debugPanel.style.display === 'none') {
            debugPanel.style.display = 'block';
            this.textContent = 'Hide Debug Panel';
        } else {
            debugPanel.style.display = 'none';
            this.textContent = 'Show Debug Panel';
        }
    });
    
    // Log initialization
    addDebugEntry("Initializing visualization...");
    
    function displayFallbackView() {
        const graphContainer = document.getElementById('graphContainer');
        
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
            
            // Get the container for the network
            const container = document.getElementById('mynetwork');
            if (!container) {
                addDebugEntry('Network container element not found', 'error');
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
            const nodes = new vis.DataSet(graphData.nodes);
            const edges = new vis.DataSet(graphData.edges);
            addDebugEntry("Created datasets: " + nodes.length + " nodes, " + edges.length + " edges");
            
            const data = {
                nodes: nodes,
                edges: edges
            };
            
            // Configuration options
            const defaultOptions = {
                nodes: {
                    shape: 'box',
                    margin: 10,
                    font: {
                        size: 14
                    },
                    borderWidth: 2,
                    shadow: true
                },
                edges: {
                    font: {
                        size: 12,
                        align: 'middle'
                    },
                    width: 2
                },
                groups: {
                    'class': {
                        color: { background: '#bbdefb', border: '#1565c0' }
                    },
                    'interface': {
                        color: { background: '#c8e6c9', border: '#2e7d32' },
                        shape: 'hexagon'
                    }
                },
                physics: {
                    enabled: true,
                    solver: 'forceAtlas2Based'
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 300
                }
            };
            
            // Create the network with error handling
            let network;
            try {
                addDebugEntry('Creating network instance');
                network = new vis.Network(container, data, defaultOptions);
                addDebugEntry('Network created successfully');
            } catch (err) {
                addDebugEntry('Failed to create network: ' + err.message, 'error');
                displayFallbackView();
                return;
            }
            
            // Handle node click events to show detailed information
            const nodeInfo = document.getElementById('nodeInfo');
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
                            connections.parents.push(edge.to);
                        }
                        if (edge.to === nodeId && edge.label === 'extends') {
                            connections.children.push(edge.from);
                        }
                        if (edge.from === nodeId && edge.label === 'implements') {
                            connections.implements.push(edge.to);
                        }
                        if (edge.to === nodeId && edge.label === 'implements') {
                            connections.implementedBy.push(edge.from);
                        }
                    });
                    
                    // Build HTML for node info
                    let html = '<h3>' + node.label + '</h3>';
                    html += '<p><strong>Type:</strong> ' + node.group + '</p>';
                    
                    if (connections.parents.length > 0) {
                        html += '<p><strong>Extends:</strong> ' + connections.parents.join(', ') + '</p>';
                    }
                    
                    if (connections.implements.length > 0) {
                        html += '<p><strong>Implements:</strong> ' + connections.implements.join(', ') + '</p>';
                    }
                    
                    if (connections.children.length > 0) {
                        html += '<p><strong>Extended by:</strong> ' + connections.children.join(', ') + '</p>';
                    }
                    
                    if (connections.implementedBy.length > 0) {
                        html += '<p><strong>Implemented by:</strong> ' + connections.implementedBy.join(', ') + '</p>';
                    }
                    
                    nodeInfo.innerHTML = html;
                    nodeInfo.style.display = 'block';
                } else {
                    nodeInfo.style.display = 'none';
                }
            });
            
            // Layout buttons
            document.getElementById('hierarchicalBtn').addEventListener('click', function() {
                addDebugEntry('Switching to hierarchical layout');
                const hierarchicalOptions = {
                    physics: {
                        enabled: false
                    },
                    layout: {
                        hierarchical: {
                            direction: 'UD',
                            sortMethod: 'directed',
                            nodeSpacing: 150,
                            treeSpacing: 200
                        }
                    }
                };
                network.setOptions(hierarchicalOptions);
            });
            
            document.getElementById('forceDirectedBtn').addEventListener('click', function() {
                addDebugEntry('Switching to force-directed layout');
                network.setOptions({
                    physics: {
                        enabled: true,
                        solver: 'forceAtlas2Based'
                    },
                    layout: { hierarchical: false }
                });
            });
            
            document.getElementById('resetBtn').addEventListener('click', function() {
                addDebugEntry('Resetting view');
                network.setOptions(defaultOptions);
                network.fit();
            });
            
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