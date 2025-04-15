/**
 * Extract class inheritance information from Java code
 * @param {string} javaCode Java source code
 * @returns {Array} Array of class information objects
 */
function extractClassInheritance(javaCode) {
    // Remove comments and string literals to avoid matching patterns in comments or strings
    const cleanedCode = javaCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')  // Remove comments
                             .replace(/"(?:\\"|[^"])*"/g, '""');          // Replace string literals
    
    const classes = [];
    // Modified patterns to be more robust and detect abstract classes
    const classPattern = /(?:public|private|protected)?\s+(?:(abstract)\s+)?(?:final)?\s*class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w,\s]+))?/g;
    const interfacePattern = /(?:public|private|protected)?\s+interface\s+(\w+)(?:\s+extends\s+([\w,\s]+))?/g;
    
    // Log for debugging
    console.log('Starting class extraction');
    
    // Extract classes
    let match;
    while ((match = classPattern.exec(cleanedCode)) !== null) {
        const isAbstract = match[1] === 'abstract';
        const className = match[2];
        const extendsClass = match[3] || null;
        const implementsInterfaces = match[4] ? match[4].split(',').map(i => i.trim()) : [];
        
        console.log(`Found class: ${className}, abstract: ${isAbstract}, extends: ${extendsClass}, implements: ${implementsInterfaces.join(', ')}`);
        
        classes.push({
            name: className,
            type: isAbstract ? 'abstract_class' : 'class',
            extends: extendsClass,
            implements: implementsInterfaces
        });
    }
    
    // Extract interfaces
    while ((match = interfacePattern.exec(cleanedCode)) !== null) {
        const interfaceName = match[1];
        const extendsInterfaces = match[2] ? match[2].split(',').map(i => i.trim()) : [];
        
        console.log(`Found interface: ${interfaceName}, extends: ${extendsInterfaces.join(', ')}`);
        
        classes.push({
            name: interfaceName,
            type: 'interface',
            extends: null, // Interfaces don't extend classes
            extendsInterfaces: extendsInterfaces
        });
    }
    
    console.log(`Extraction complete. Found ${classes.length} classes/interfaces.`);
    return classes;
}

module.exports = {
    extractClassInheritance
};