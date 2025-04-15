/**
 * Create graph data structure from class information
 * @param {Array} classesInfo Array of class information objects
 * @returns {Object} Graph data with nodes and edges
 */
function createGraphData(classesInfo) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map(); // To track duplicate nodes
    
    // Process each class
    classesInfo.forEach(cls => {
        // Add node if not already added
        if (!nodeMap.has(cls.name)) {
            const group = cls.type === 'interface' ? 'interface' : 
                          cls.type === 'abstract_class' ? 'abstract_class' : 'class';
            
            const node = {
                id: cls.name,
                label: cls.name,
                group: group,
                title: `${cls.type}: ${cls.name}<br>File: ${cls.file}`
            };
            nodes.push(node);
            nodeMap.set(cls.name, true);
        }
        
        // Add inheritance edge
        if (cls.extends) {
            edges.push({
                from: cls.name,
                to: cls.extends,
                label: 'extends',
                arrows: 'to',
                color: { color: '#1E88E5' }
            });
        }
        
        // Add implementation edges
        if (cls.implements && cls.implements.length > 0) {
            cls.implements.forEach(interfaceName => {
                edges.push({
                    from: cls.name,
                    to: interfaceName,
                    label: 'implements',
                    arrows: 'to',
                    dashes: true,
                    color: { color: '#43A047' }
                });
            });
        }
        
        // Add interface extension edges
        if (cls.extendsInterfaces && cls.extendsInterfaces.length > 0) {
            cls.extendsInterfaces.forEach(interfaceName => {
                edges.push({
                    from: cls.name,
                    to: interfaceName,
                    label: 'extends',
                    arrows: 'to',
                    color: { color: '#FB8C00' }
                });
            });
        }
    });
    return { nodes, edges };
}

module.exports = {
    createGraphData
};