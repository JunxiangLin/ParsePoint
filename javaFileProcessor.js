const fs = require('fs');
const path = require('path');
const classExtractor = require('./classExtractor');

/**
 * Recursively find all Java files in the workspace
 * @param {string} dir Directory to scan
 * @returns {Promise<string[]>} Array of Java file paths
 */
async function findJavaFiles(dir) {
    let javaFiles = [];
    
    try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            // Skip node_modules and .git directories
            if (entry.name === 'node_modules' || entry.name === '.git') {
                continue;
            }
            
            if (entry.isDirectory()) {
                // Recursively process subdirectories
                const subdirFiles = await findJavaFiles(fullPath);
                javaFiles = javaFiles.concat(subdirFiles);
            } else {
                // Check if file is a Java file
                const ext = path.extname(entry.name).toLowerCase();
                
                if (ext === '.java') {
                    javaFiles.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.error('Error reading directory:', dir, error);
    }
    
    return javaFiles;
}

/**
 * Process Java files to extract class information
 * @param {string[]} javaFiles Array of Java file paths
 * @returns {Promise<Array>} Array of class information objects
 */
async function processJavaFiles(javaFiles) {
    const allClasses = [];
    
    for (const filePath of javaFiles) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            const fileClasses = classExtractor.extractClassInheritance(content);
            
            // Add source file information
            fileClasses.forEach(cls => {
                cls.file = path.basename(filePath);
                cls.filePath = filePath;
            });
            
            allClasses.push(...fileClasses);
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    }
    
    return allClasses;
}

module.exports = {
    findJavaFiles,
    processJavaFiles
}