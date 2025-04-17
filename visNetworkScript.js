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
                function positionNodesOrganically(nodes, edges, containerWidth, containerHeight) {
                    // Center of the container
                    const centerX = containerWidth / 2;
                    const centerY = containerHeight / 2;
                    const radius = Math.min(containerWidth, containerHeight) * 0.4;
                    
                    // First, position in a circle
                    nodes.forEach((node, index) => {
                        const angle = (index / nodes.length) * 2 * Math.PI;
                        node.x = centerX + radius * Math.cos(angle);
                        node.y = centerY + radius * Math.sin(angle);
                        
                        // Initialize velocity and forces
                        node.vx = 0;
                        node.vy = 0;
                        node.fx = 0;
                        node.fy = 0;
                    });
                    
                    // Create a map for quick node lookup
                    const nodeMap = {};
                    nodes.forEach(node => {
                        nodeMap[node.id] = node;
                    });
                    
                    // Run force-directed algorithm simulation
                    // Parameters for the simulation
                    const repulsionForce = 60500;  // Repulsion between all nodes
                    const springForce = 0.05;    // Attraction force for connected nodes
                    const springLength = 120;    // Ideal distance between connected nodes
                    const gravity = 0.01;        // Force pulling toward the center
                    const damping = 0.09;         // Damping factor to stabilize the simulation
                    
                    // Run the simulation for a number of iterations
                    const iterations = 100;
                    for (let i = 0; i < iterations; i++) {
                        // Reset forces
                        nodes.forEach(node => {
                            node.fx = 0;
                            node.fy = 0;
                        });
                        
                        // Calculate repulsion forces between all pairs of nodes
                        for (let j = 0; j < nodes.length; j++) {
                            for (let k = j + 1; k < nodes.length; k++) {
                                const nodeA = nodes[j];
                                const nodeB = nodes[k];
                                
                                const dx = nodeB.x - nodeA.x;
                                const dy = nodeB.y - nodeA.y;
                                const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                                
                                // Repulsion force is inversely proportional to distance
                                const force = repulsionForce / (distance * distance);
                                
                                // Apply force in the opposite direction of the other node
                                const forceX = (dx / distance) * force;
                                const forceY = (dy / distance) * force;
                                
                                nodeA.fx -= forceX;
                                nodeA.fy -= forceY;
                                nodeB.fx += forceX;
                                nodeB.fy += forceY;
                            }
                        }
                        
                        // Calculate spring forces for connected nodes (edges)
                        edges.forEach(edge => {
                            const source = nodeMap[edge.from];
                            const target = nodeMap[edge.to];
                            
                            if (source && target) {
                                const dx = target.x - source.x;
                                const dy = target.y - source.y;
                                const distance = Math.max(1, Math.sqrt(dx * dx + dy * dy));
                                
                                // Force is proportional to the difference from ideal length
                                const force = springForce * (distance - springLength);
                                
                                const forceX = (dx / distance) * force;
                                const forceY = (dy / distance) * force;
                                
                                // Make relationships more important by using a multiplier
                                // Give different weights to different relationship types
                                let relationMultiplier = 1;
                                if (edge.label === 'extends') {
                                    relationMultiplier = 2; // Stronger connection for inheritance
                                } else if (edge.label === 'implements') {
                                    relationMultiplier = 1.5; // Medium connection for implementation
                                }
                                
                                source.fx += forceX * relationMultiplier;
                                source.fy += forceY * relationMultiplier;
                                target.fx -= forceX * relationMultiplier;
                                target.fy -= forceY * relationMultiplier;
                            }
                        });
                        
                        // Apply center gravity to keep nodes from drifting too far
                        nodes.forEach(node => {
                            const dx = centerX - node.x;
                            const dy = centerY - node.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            node.fx += dx * gravity;
                            node.fy += dy * gravity;
                        });
                        
                        // Update positions based on calculated forces
                        nodes.forEach(node => {
                            // Update velocity with damping
                            node.vx = (node.vx + node.fx) * damping;
                            node.vy = (node.vy + node.fy) * damping;
                            
                            // Update position
                            node.x += node.vx;
                            node.y += node.vy;
                            
                            // Keep nodes within the container bounds with some padding
                            const padding = 50;
                            node.x = Math.max(padding, Math.min(containerWidth - padding, node.x));
                            node.y = Math.max(padding, Math.min(containerHeight - padding, node.y));
                        });
                    }
                }

                // Use the container dimensions
                const containerWidth = this.container.clientWidth;
                const containerHeight = this.container.clientHeight;

                // Apply organic positioning to nodes
                positionNodesOrganically(nodes, edges, containerWidth, containerHeight);

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
                    // Create a function to apply forces to connected nodes when dragging
                    function applyInteractiveForces(draggedNode, nodes, edges, nodeMap) {
                        // Create a set to track processed nodes to avoid infinite loops
                        const processedNodes = new Set([draggedNode.id]);
                        
                        // Create an array to hold nodes that need processing
                        // Each entry contains the node ID and the "source" node that's affecting it
                        let nodesToProcess = [{
                            id: draggedNode.id,
                            sourceNode: null,
                            level: 0
                        }];
                        
                        // Maximum propagation level to prevent too much cascade
                        const maxLevel = 3;
                        
                        // Strength factors that decrease with propagation level
                        const strengthByLevel = [1, 0.6, 0.3];
                        
                        // Process nodes level by level to propagate forces
                        for (let i = 0; i < nodesToProcess.length; i++) {
                            const current = nodesToProcess[i];
                            
                            // Skip if we've reached max propagation level
                            if (current.level >= maxLevel) continue;
                            
                            // Get the current node's object
                            const currentNode = nodeMap[current.id];
                            if (!currentNode) continue;
                            
                            // Find all nodes connected to this node
                            edges.forEach(edge => {
                                let connectedId = null;
                                let relationshipType = null;
                                
                                // Determine which node is connected and the relationship type
                                if (edge.from === current.id) {
                                    connectedId = edge.to;
                                    relationshipType = edge.label;
                                } else if (edge.to === current.id) {
                                    connectedId = edge.from;
                                    relationshipType = edge.label + '_reverse';
                                }
                                
                                // Skip if no connection or already processed
                                if (!connectedId || processedNodes.has(connectedId)) return;
                                
                                const connectedNode = nodeMap[connectedId];
                                if (!connectedNode) return;
                                
                                // Mark as processed to avoid cycles
                                processedNodes.add(connectedId);
                                
                                // Calculate force strength based on level and relationship type
                                let strength = strengthByLevel[current.level] || 0.1;
                                
                                // Adjust strength based on relationship type
                                if (relationshipType === 'extends' || relationshipType === 'extends_reverse') {
                                    strength *= 1.5; // Stronger for inheritance
                                } else if (relationshipType === 'implements' || relationshipType === 'implements_reverse') {
                                    strength *= 1.2; // Medium for implementation
                                }
                                
                                // Calculate vector from source to connected node
                                const dx = connectedNode.x - currentNode.x;
                                const dy = connectedNode.y - currentNode.y;
                                const distance = Math.sqrt(dx * dx + dy * dy);
                                
                                // MODIFICATION: Enforce minimum distance (based on node size)
                                const minDistance = nodeSize * 1.2;
                                
                                // Determine the optimal distance based on relationship
                                let optimalDistance = 150; // Default distance
                                if (relationshipType === 'extends' || relationshipType === 'extends_reverse') {
                                    optimalDistance = 120; // Closer for inheritance
                                }
                                
                                // Calculate force based on difference from optimal distance
                                let forceMultiplier = 0;
                                
                                if (distance < minDistance) {
                                    // ADDED: Strong repulsion when nodes are too close (regardless of relationship)
                                    forceMultiplier = -strength * 2.0;
                                } else if (distance > optimalDistance * 1.5) {
                                    // Too far - attraction
                                    forceMultiplier = strength * 1.2;
                                } else if (distance < optimalDistance * 0.8) {
                                    // Too close - gentle repulsion
                                    forceMultiplier = -strength * 0.7;
                                } else {
                                    // Near optimal - weak force to maintain distance
                                    forceMultiplier = strength * 0.1 * (distance - optimalDistance) / optimalDistance;
                                }
                                
                                // Calculate movement distances
                                const moveX = dx * forceMultiplier;
                                const moveY = dy * forceMultiplier;
                                
                                // Update connected node position
                                const nodeGroup = svg.querySelector('g[data-id="' + connectedId + '"]');
                                if (nodeGroup) {
                                    connectedNode.x -= moveX;
                                    connectedNode.y -= moveY;
                                    nodeGroup.setAttribute('transform', 'translate(' + connectedNode.x + ', ' + connectedNode.y + ')');
                                    
                                    // Update any edges connected to this node
                                    updateConnectedEdges(connectedId, connectedNode, edges, nodeMap);
                                }
                                
                                // Add this node to the processing queue to propagate forces
                                nodesToProcess.push({
                                    id: connectedId,
                                    sourceNode: currentNode,
                                    level: current.level + 1
                                });
                            });
                        }
                        
                        // ADDED: After processing edges, check for overlaps with any nodes
                        nodes.forEach(otherNode => {
                            if (otherNode.id === draggedNode.id) return;
                            
                            const dx = otherNode.x - draggedNode.x;
                            const dy = otherNode.y - draggedNode.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            // If nodes are overlapping
                            const minDistance = nodeSize * 1.2;
                            if (distance < minDistance) {
                                // Push other node away
                                const pushFactor = (minDistance - distance) / distance;
                                otherNode.x += dx * pushFactor;
                                otherNode.y += dy * pushFactor;
                                
                                // Update other node position
                                const otherNodeGroup = svg.querySelector('g[data-id="' + otherNode.id + '"]');
                                if (otherNodeGroup) {
                                    otherNodeGroup.setAttribute('transform', 'translate(' + otherNode.x + ', ' + otherNode.y + ')');
                                    
                                    // Update connected edges
                                    updateConnectedEdges(otherNode.id, otherNode, edges, nodeMap);
                                }
                            }
                        });
                    }
                    // Helper function to update edges connected to a node
                    function updateConnectedEdges(nodeId, node, edges, nodeMap) {
                        edges.forEach(edge => {
                            if (edge.from === nodeId || edge.to === nodeId) {
                                const fromNode = nodeMap[edge.from];
                                const toNode = nodeMap[edge.to];
                                
                                if (fromNode && toNode) {
                                    const edgeLine = svg.querySelector('line[data-from="' + edge.from + '"][data-to="' + edge.to + '"]');
                                    if (edgeLine) {
                                        // Calculate the direction vector
                                        const dx = toNode.x - fromNode.x;
                                        const dy = toNode.y - fromNode.y;
                                        const length = Math.sqrt(dx * dx + dy * dy);
                                        
                                        // Normalize
                                        const nx = length ? dx / length : 0;
                                        const ny = length ? dy / length : 0;
                                        
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

                    function onMouseMove(e) {
                        const svgPoint = svg.createSVGPoint();
                        svgPoint.x = e.clientX;
                        svgPoint.y = e.clientY;
                        const svgCoords = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                        
                        // Update dragged node position
                        draggedNode.x = svgCoords.x;
                        draggedNode.y = svgCoords.y;
                        
                        // Update node position in the SVG
                        const nodeGroup = svg.querySelector('g[data-id="' + draggedNode.id + '"]');
                        if (nodeGroup) {
                            nodeGroup.setAttribute('transform', 'translate(' + draggedNode.x + ', ' + draggedNode.y + ')');
                        }
                        
                        // Create node map for quick lookup
                        const nodeMap = {};
                        nodes.forEach(node => {
                            nodeMap[node.id] = node;
                        });
                        
                        // Apply multi-level interactive forces
                        applyInteractiveForces(draggedNode, nodes, edges, nodeMap);
                        
                        // UPDATE: Check and prevent overlaps after each movement
                        preventNodeOverlaps(draggedNode, nodes);
                        
                        // Update edges connected to the dragged node
                        updateConnectedEdges(draggedNode.id, draggedNode, edges, nodeMap);
                    }

      
                    function onMouseUp() {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    }

                    function preventNodeOverlaps(movedNode, allNodes) {
                        // Minimum distance between node centers (based on node size)
                        const minDistance = nodeSize * 1.2; // 20% padding
                        
                        // Check for overlaps with other nodes
                        for (let i = 0; i < allNodes.length; i++) {
                            const otherNode = allNodes[i];
                            
                            // Skip if same node
                            if (otherNode.id === movedNode.id) continue;
                            
                            // Calculate distance between nodes
                            const dx = otherNode.x - movedNode.x;
                            const dy = otherNode.y - movedNode.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);
                            
                            // If nodes are overlapping or too close
                            if (distance < minDistance) {
                                // Calculate how much to move the static node
                                const moveRequired = minDistance - distance;
                                
                                // Direction vector
                                const angle = Math.atan2(dy, dx);
                                
                                // Only move the static node (since we're actively dragging the moved node)
                                otherNode.x += Math.cos(angle) * moveRequired;
                                otherNode.y += Math.sin(angle) * moveRequired;
                                
                                // Update the static node position in SVG
                                const otherNodeGroup = svg.querySelector('g[data-id="' + otherNode.id + '"]');
                                if (otherNodeGroup) {
                                    otherNodeGroup.setAttribute('transform', 'translate(' + otherNode.x + ', ' + otherNode.y + ')');
                                    
                                    // Update the connected edges for this node too
                                    updateConnectedEdges(otherNode.id, otherNode, edges, nodeMap);
                                }
                            }
                        }
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