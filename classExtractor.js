/**
 * Extract class inheritance information from Java code
 * @param {string} javaCode Java source code
 * @returns {Array} Array of class information objects
 */
function extractClassInheritance(javaCode) {
    // Store original code for method extraction
    const originalCode = javaCode;
    
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
        
        // Get methods for this class using original code
        const methods = extractMethods(originalCode, className);
        
        classes.push({
            name: className,
            type: isAbstract ? 'abstract_class' : 'class',
            extends: extendsClass,
            implements: implementsInterfaces,
            methods: methods || []
        });
    }
    
    // Extract interfaces
    while ((match = interfacePattern.exec(cleanedCode)) !== null) {
        const interfaceName = match[1];
        const extendsInterfaces = match[2] ? match[2].split(',').map(i => i.trim()) : [];
        
        console.log(`Found interface: ${interfaceName}, extends: ${extendsInterfaces.join(', ')}`);
        
        // Get methods for this interface (just signatures, no implementation)
        const methods = extractMethods(originalCode, interfaceName, true);
        
        classes.push({
            name: interfaceName,
            type: 'interface',
            extends: null, // Interfaces don't extend classes
            extendsInterfaces: extendsInterfaces,
            methods: methods || []
        });
    }
    
    console.log(`Extraction complete. Found ${classes.length} classes/interfaces.`);
    return classes;
}

/**
 * Extract methods from a Java class or interface
 * @param {string} javaCode Java source code
 * @param {string} className Name of the class to extract methods from
 * @param {boolean} isInterface Whether the element is an interface
 * @returns {Array} Array of method information objects
 */
function extractMethods(javaCode, className, isInterface = false) {
    try {
        const methods = [];
        
        // Simplified approach for extracting class content
        // First find the class/interface declaration
        const classDeclarationRegex = isInterface
            ? new RegExp(`\\s*(?:public|private|protected)?\\s+interface\\s+${className}\\s*(?:extends\\s+[\\w,\\s]+)?\\s*\\{`, 'g')
            : new RegExp(`\\s*(?:public|private|protected)?\\s+(?:abstract\\s+)?(?:final\\s*)?class\\s+${className}\\s*(?:extends\\s+\\w+)?\\s*(?:implements\\s+[\\w,\\s]+)?\\s*\\{`, 'g');
        
        let match = classDeclarationRegex.exec(javaCode);
        if (!match) {
            console.log(`Couldn't find class/interface declaration for ${className}`);
            return methods;
        }
        
        // Find start position of class body
        const startPos = match.index + match[0].length;
        
        // Find the end of the class (matching closing brace)
        let braceCount = 1;
        let endPos = startPos;
        
        for (let i = startPos; i < javaCode.length; i++) {
            if (javaCode[i] === '{') braceCount++;
            else if (javaCode[i] === '}') braceCount--;
            
            if (braceCount === 0) {
                endPos = i;
                break;
            }
        }
        
        // Extract class content
        const classContent = javaCode.substring(startPos, endPos);
        
        // Extract javadoc comments for later association with methods
        const javadocs = {};
        const fullCode = javaCode; // Use the full source code to find javadocs
        
        // Look for javadoc followed by method declaration
        const methodWithJavadocPattern = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*(?:(?:public|protected|private|default)\s+)?(?:static\s+)?(?:final\s+)?(?:abstract\s+)?(?:[\w<>,\s\[\]]+)\s+(\w+)\s*\(/g;
        
        while ((match = methodWithJavadocPattern.exec(fullCode)) !== null) {
            const docstring = match[1].trim();
            const methodName = match[2];
            javadocs[methodName] = docstring;
        }
        
        // Simplified method pattern that works better with nested classes and complex structures
        const methodPattern = /(?:(?:public|protected|private|default)\s+)?(?:static\s+)?(?:final\s+)?(?:abstract\s+)?(?:[\w<>,\s\[\]]+)\s+(\w+)\s*\(([^)]*)\)/g;
        
        while ((match = methodPattern.exec(classContent)) !== null) {
            const methodName = match[1];
            const parameters = match[2].trim();
            
            // Skip constructors (method name equals class name)
            if (methodName === className) continue;
            
            // Get associated docstring if exists
            const docstring = javadocs[methodName] || '';
            
            methods.push({
                name: methodName,
                parameters: parameters,
                docstring: docstring
            });
        }
        
        console.log(`Extracted ${methods.length} methods from ${className}`);
        return methods;
    } catch (error) {
        console.error(`Error extracting methods from ${className}:`, error);
        return []; // Return empty array on error
    }
}

module.exports = {
    extractClassInheritance
};