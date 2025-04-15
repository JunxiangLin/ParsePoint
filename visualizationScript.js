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
                            (node.group === 'class' ? '#bbdefb' : '#c8e6c9') + '; color: ' +
                            (node.group === 'class' ? '#1565c0' : '#2e7d32') + '; padding: 2px 8px; border-radius: 10px; font-size: 0.9rem;">' +
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
                    
                    nodeInfo.innerHTML = html;
                    nodeInfo.style.display = 'block';
                } else {
                    nodeInfo.style.display = 'none';
                }
            });

            
            // Layout buttons
            
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