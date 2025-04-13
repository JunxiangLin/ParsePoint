/**
 * Main entry point that exports all modules
 */

module.exports = {
    // Extension core
    extension: require('./extension'),
    
    // Java processing
    javaFileProcessor: require('./javaFileProcessor'),
    classExtractor: require('./classExtractor'),
    graphBuilder: require('./graphBuilder'),
    
    // Webview components
    webviewManager: require('./webviewManager'),
    webviewContent: require('./webviewContent'),
    
    // Utilities
    utils: require('./utils')
};