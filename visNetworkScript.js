/**
 * Creates the vis-network JavaScript for the visualization
 */

/**
 * Returns the vis-network implementation script
 * @returns {string} JavaScript code for vis-network implementation
 */
function getVisNetworkImplementation() {
    return `
    // Define vis-network directly in the code (simplified version)
    // This is a workaround for CSP issues
    
    // First, create a basic network visualization system
    const vis = (function() {
        class DataSet {
            constructor(items) {
                this.items = items || [];
                this.length = this.items.length;
            }
            
            get(id) {
                return this.items.find(item => item.id === id);
            }
            
            forEach(callback) {
                this.items.forEach(callback);
            }
        }
        
        class Network {
            constructor(container, data, options) {
                this.container = container;
                this.data = data;
                this.options = options;
                this.listeners = {};
                
                // Initialize the network visualization
                this.render();
            }
            
            render() {
                // Clear existing content
                this.container.innerHTML = '';
                
                // Create a simple representation of the network
                const networkDiv = document.createElement('div');
                networkDiv.style.width = '100%';
                networkDiv.style.height = '100%';
                networkDiv.style.position = 'relative';
                networkDiv.style.overflow = 'auto';
                networkDiv.style.backgroundColor = '#f9f9f9';
                
                // Add a canvas element (for visualization context)
                const canvas = document.createElement('canvas');
                canvas.width = this.container.clientWidth;
                canvas.height = this.container.clientHeight;
                canvas.style.position = 'absolute';
                canvas.style.top = '0';
                canvas.style.left = '0';
                networkDiv.appendChild(canvas);
                
                // Create SVG for network visualization
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                svg.setAttribute('viewBox', '0 0 ' + this.container.clientWidth + ' ' + this.container.clientHeight);                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
                svg.style.position = 'absolute';
                svg.style.top = '0';
                svg.style.left = '0';
                
                // Draw nodes
                const nodeSize = 60;
                const nodeSpacing = 150;
                const nodes = this.data.nodes.items;
                const edges = this.data.edges.items;
                
                // Position nodes using a simple force-directed algorithm
                function positionNodesOrganically(nodes, containerWidth, containerHeight) {
                    // Center of the container
                    const centerX = containerWidth / 2;
                    const centerY = containerHeight / 2;
                    const radius = Math.min(containerWidth, containerHeight) * 0.4;
                    
                    // First, position in a circle
                    nodes.forEach((node, index) => {
                        const angle = (index / nodes.length) * 2 * Math.PI;
                        node.x = centerX + radius * Math.cos(angle);
                        node.y = centerY + radius * Math.sin(angle);
                        
                        // Add some randomness
                        node.x += (Math.random() - 0.5) * 50;
                        node.y += (Math.random() - 0.5) * 50;
                        
                        // Initialize velocity for interactive simulation
                        node.vx = 0;
                        node.vy = 0;
                    });
                }
                // Use the container dimensions
                const containerWidth = this.container.clientWidth;
                const containerHeight = this.container.clientHeight;

                // Apply organic positioning to nodes
                positionNodesOrganically(nodes, containerWidth, containerHeight);

                // Now create the nodes with their new positions
                nodes.forEach((node, index) => {
                    // Create node element
                    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    nodeGroup.setAttribute('data-id', node.id);
                    nodeGroup.setAttribute('transform', 'translate(' + node.x + ', ' + node.y + ')');

                    // Create node shape
                    const nodeShape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    nodeShape.setAttribute('x', -nodeSize/2);
                    nodeShape.setAttribute('y', -nodeSize/2);
                    nodeShape.setAttribute('width', nodeSize);
                    nodeShape.setAttribute('height', nodeSize);

                    // Set node appearance based on type
                    if (node.group === 'interface') {
                        nodeShape.setAttribute('rx', 20);
                        nodeShape.setAttribute('ry', 20);
                        nodeShape.setAttribute('fill', '#c8e6c9');
                        nodeShape.setAttribute('stroke', '#2e7d32');
                    } else if (node.group === 'abstract_class') {
                        nodeShape.setAttribute('rx', 5);
                        nodeShape.setAttribute('ry', 5);
                        nodeShape.setAttribute('fill', '#e1bee7');
                        nodeShape.setAttribute('stroke', '#8e24aa');
                        nodeShape.setAttribute('stroke-dasharray', '5,5'); // Dashed border for abstract classes
                    } else {
                        nodeShape.setAttribute('rx', 5);
                        nodeShape.setAttribute('ry', 5);
                        nodeShape.setAttribute('fill', '#bbdefb');
                        nodeShape.setAttribute('stroke', '#1565c0');
                    }

                    nodeShape.setAttribute('stroke-width', '2');

                    // Add drop shadow for depth
                    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                    shadow.setAttribute('id', 'shadow-' + node.id);                    
                    const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow');
                    feDropShadow.setAttribute('dx', '2');
                    feDropShadow.setAttribute('dy', '2');
                    feDropShadow.setAttribute('stdDeviation', '2');
                    feDropShadow.setAttribute('flood-opacity', '0.3');
                    shadow.appendChild(feDropShadow);

                    // Add the filter to defs
                    let defs = svg.querySelector('defs');
                    if (!defs) {
                        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                        svg.prepend(defs);
                    }
                    defs.appendChild(shadow);

                    // Apply the shadow filter
                    nodeShape.setAttribute('filter', 'url(#shadow-' + node.id + ')');                    
                    
                    // Create node label
                    const nodeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    nodeLabel.setAttribute('text-anchor', 'middle');
                    nodeLabel.setAttribute('dominant-baseline', 'middle');
                    nodeLabel.setAttribute('font-size', '12px');
                    nodeLabel.setAttribute('font-weight', 'bold');
                    nodeLabel.setAttribute('fill', node.group === 'interface' ? '#1b5e20' : '#0d47a1');
                    nodeLabel.textContent = node.label;
                    
                    // Add elements to node group
                    nodeGroup.appendChild(nodeShape);
                    nodeGroup.appendChild(nodeLabel);
                    
                    // Add click handler
                    nodeGroup.addEventListener('click', () => {
                        if (this.listeners.click) {
                            this.listeners.click({ nodes: [node.id] });
                        }
                    });
                    
                    // Add to SVG
                    svg.appendChild(nodeGroup);
                });
                
                // Draw edges
                edges.forEach(edge => {
                    const fromNode = nodes.find(n => n.id === edge.from);
                    const toNode = nodes.find(n => n.id === edge.to);
                    
                    if (fromNode && toNode) {
                        // Calculate the direction vector
                        const dx = toNode.x - fromNode.x;
                        const dy = toNode.y - fromNode.y;
                        const length = Math.sqrt(dx * dx + dy * dy);
                        
                        // Normalize
                        const nx = dx / length;
                        const ny = dy / length;
                        
                        // End point with offset for the arrow
                        const arrowOffset = 30; // Increased offset for better visualization
                        const endX = toNode.x - nx * arrowOffset;
                        const endY = toNode.y - ny * arrowOffset;
                        
                        // Create edge line
                        const edgeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        edgeLine.setAttribute('x1', fromNode.x);
                        edgeLine.setAttribute('y1', fromNode.y);
                        edgeLine.setAttribute('x2', endX);
                        edgeLine.setAttribute('y2', endY);
                        edgeLine.setAttribute('data-from', edge.from);
                        edgeLine.setAttribute('data-to', edge.to);
                        
                        // Determine edge color based on relationship type
                        let edgeColor;
                        if (edge.label === 'extends') {
                            edgeColor = '#1E88E5';  // Blue for extends
                        } else if (edge.label === 'implements') {
                            edgeColor = '#43A047';  // Green for implements
                        } else {
                            edgeColor = '#FB8C00';  // Orange for other relationships
                        }
                        
                        // Use provided color if exists
                        if (edge.color && edge.color.color) {
                            edgeColor = edge.color.color;
                        }
                        
                        edgeLine.setAttribute('stroke', edgeColor);
                        edgeLine.setAttribute('stroke-width', edge.width || 2);
                        
                        if (edge.dashes || edge.label === 'implements') {
                            edgeLine.setAttribute('stroke-dasharray', '5,5');
                        }
                        
                        // Create unique ID for arrow marker
                        const markerId = 'arrow-' + fromNode.id + '-' + toNode.id;
                        
                        // Define arrow marker
                        const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                        arrowMarker.setAttribute('id', markerId);
                        arrowMarker.setAttribute('viewBox', '0 0 10 10');
                        arrowMarker.setAttribute('refX', '5');
                        arrowMarker.setAttribute('refY', '5');
                        arrowMarker.setAttribute('markerWidth', '8');  // Increased size
                        arrowMarker.setAttribute('markerHeight', '8'); // Increased size
                        arrowMarker.setAttribute('orient', 'auto');
                        
                        // Create arrow path
                        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
                        arrowPath.setAttribute('fill', edgeColor);
                        
                        arrowMarker.appendChild(arrowPath);
                        
                        // Add marker to defs section
                        let defs = svg.querySelector('defs');
                        if (!defs) {
                            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                            svg.prepend(defs);
                        }
                        defs.appendChild(arrowMarker);
                        
                        // Apply marker to line
                        edgeLine.setAttribute('marker-end', 'url(#' + markerId + ')');
                        
                        // Add edge to SVG before nodes for proper layering
                        svg.insertBefore(edgeLine, svg.firstChild);
                        
                        // Add edge label
                        if (edge.label) {
                            const midX = (fromNode.x + endX) / 2;
                            const midY = (fromNode.y + endY) / 2;
                            
                            // Add background rectangle for better readability
                            const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                            textBg.setAttribute('x', midX - 30);
                            textBg.setAttribute('y', midY - 10);
                            textBg.setAttribute('width', 60);
                            textBg.setAttribute('height', 20);
                            textBg.setAttribute('fill', 'white');
                            textBg.setAttribute('fill-opacity', '0.8');
                            textBg.setAttribute('data-edge', edge.from + '-' + edge.to);
                            
                            const edgeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                            edgeLabel.setAttribute('x', midX);
                            edgeLabel.setAttribute('y', midY);
                            edgeLabel.setAttribute('text-anchor', 'middle');
                            edgeLabel.setAttribute('dominant-baseline', 'middle');
                            edgeLabel.setAttribute('font-size', '10px');
                            edgeLabel.setAttribute('fill', '#666');
                            edgeLabel.setAttribute('data-edge', edge.from + '-' + edge.to);
                            edgeLabel.textContent = edge.label;
                            
                            svg.appendChild(textBg);
                            svg.appendChild(edgeLabel);
                        }
                    }
                });
                // Add interactivity - drag and drop functionality
                svg.addEventListener('mousedown', function(event) {
                    const draggedNode = findNodeAtPosition(event.clientX, event.clientY);
                    if (!draggedNode) return;
                    
                    function findNodeAtPosition(x, y) {
                        // Convert to SVG coordinates
                        const svgPoint = svg.createSVGPoint();
                        svgPoint.x = x;
                        svgPoint.y = y;
                        const svgCoords = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                        
                        // Check if a node is at this position
                        for (const node of nodes) {
                            const dx = node.x - svgCoords.x;
                            const dy = node.y - svgCoords.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            if (distance < nodeSize / 2) {
                                return node;
                            }
                        }
                        return null;
                    }
                    
                    function onMouseMove(e) {
                        const svgPoint = svg.createSVGPoint();
                        svgPoint.x = e.clientX;
                        svgPoint.y = e.clientY;
                        const svgCoords = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                        
                        draggedNode.x = svgCoords.x;
                        draggedNode.y = svgCoords.y;
                        
                        // Update node position
                        const nodeGroup = svg.querySelector('g[data-id="' + draggedNode.id + '"]');
                        if (nodeGroup) {
                            nodeGroup.setAttribute('transform', 'translate(' + draggedNode.x + ', ' + draggedNode.y + ')');
                        }
                        
                        // Update connected edges
                        edges.forEach(edge => {
                            if (edge.from === draggedNode.id || edge.to === draggedNode.id) {
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
                            }
                        });
                    }                    
                    function onMouseUp() {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    }
                    
                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
                networkDiv.appendChild(svg);
                this.container.appendChild(networkDiv);
            }
            
            fit() {
                // Get bounds of all nodes
                const nodes = this.data.nodes.items;
                if (nodes.length === 0) return;
                
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                
                nodes.forEach(node => {
                    minX = Math.min(minX, node.x - 40);
                    minY = Math.min(minY, node.y - 40);
                    maxX = Math.max(maxX, node.x + 40);
                    maxY = Math.max(maxY, node.y + 40);
                });
                
                // Calculate dimensions
                const width = maxX - minX;
                const height = maxY - minY;
                
                // Set viewBox to contain all nodes with padding
                const svg = this.container.querySelector('svg');
                if (svg) {
                    const padding = 50;
                    svg.setAttribute('viewBox', (minX - padding) + ' ' + (minY - padding) + ' ' + (width + padding * 2) + ' ' + (height + padding * 2));                }
            }
            
            redraw() {
                this.render();
            }
            
            on(event, callback) {
                this.listeners[event] = callback;
            }
            
            setOptions(options) {
                this.options = { ...this.options, ...options };
                this.render();
            }
        }
        
        return {
            DataSet,
            Network
        };
    })();
    `;
}

module.exports = {
    getVisNetworkImplementation
};