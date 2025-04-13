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
                
                // Position nodes in a grid
                const containerWidth = this.container.clientWidth;
                const containerHeight = this.container.clientHeight;
                const rows = Math.ceil(Math.sqrt(nodes.length));
                const cols = Math.ceil(nodes.length / rows);

                // Calculate max dimensions needed
                const maxWidth = cols * nodeSpacing + nodeSpacing;
                const maxHeight = rows * nodeSpacing + nodeSpacing;

                // Position nodes in a grid with centering
                nodes.forEach((node, index) => {
                    const row = Math.floor(index / cols);
                    const col = index % cols;
                    
                    // Center the grid in the available space
                    const offsetX = Math.max(0, (containerWidth - maxWidth) / 2);
                    const offsetY = Math.max(0, (containerHeight - maxHeight) / 2);
                    
                    // Store position for edge drawing
                    node.x = col * nodeSpacing + nodeSpacing + offsetX;
                    node.y = row * nodeSpacing + nodeSpacing + offsetY;
                    
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
                    nodeShape.setAttribute('rx', node.group === 'interface' ? 20 : 5);
                    nodeShape.setAttribute('ry', node.group === 'interface' ? 20 : 5);
                    nodeShape.setAttribute('fill', node.group === 'interface' ? '#c8e6c9' : '#bbdefb');
                    nodeShape.setAttribute('stroke', node.group === 'interface' ? '#2e7d32' : '#1565c0');
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
                        // Create edge line
                        const edgeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                        edgeLine.setAttribute('x1', fromNode.x);
                        edgeLine.setAttribute('y1', fromNode.y);
                        edgeLine.setAttribute('x2', toNode.x);
                        edgeLine.setAttribute('y2', toNode.y);
                        
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

                        
                        // Add edge to SVG before nodes for proper layering
                        svg.insertBefore(edgeLine, svg.firstChild);
                        
                        // Add edge label
                        if (edge.label) {
                            const midX = (fromNode.x + toNode.x) / 2;
                            const midY = (fromNode.y + toNode.y) / 2;
                            
                            // Add background rectangle for better readability
                            const textBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                            textBg.setAttribute('x', midX - 30);
                            textBg.setAttribute('y', midY - 10);
                            textBg.setAttribute('width', 60);
                            textBg.setAttribute('height', 20);
                            textBg.setAttribute('fill', 'white');
                            textBg.setAttribute('fill-opacity', '0.8');
                            
                            const edgeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                            edgeLabel.setAttribute('x', midX);
                            edgeLabel.setAttribute('y', midY);
                            edgeLabel.setAttribute('text-anchor', 'middle');
                            edgeLabel.setAttribute('dominant-baseline', 'middle');
                            edgeLabel.setAttribute('font-size', '10px');
                            edgeLabel.setAttribute('fill', '#666');
                            edgeLabel.textContent = edge.label;
                            
                            svg.appendChild(textBg);
                            svg.appendChild(edgeLabel);
                        }
                    }
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