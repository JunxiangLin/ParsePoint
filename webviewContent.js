/**
 * Main module for webview content management
 * This integrates the various webview components
 */
const webviewTemplates = require('./webviewTemplates');
const visualizationHtml = require('./visualizationHtml');
const visualizationScript = require('./visualizationScript');

/**
 * Returns the HTML content for loading state
 * @returns {string} HTML content for loading state
 */
function getLoadingWebviewContent() {
    return webviewTemplates.getLoadingContent();
}

/**
 * Returns the HTML content for error state
 * @param {string} errorMessage Error message to display
 * @returns {string} HTML content for error state
 */
function getErrorWebviewContent(errorMessage) {
    return webviewTemplates.getErrorContent(errorMessage);
}

/**
 * Returns the HTML content for visualization
 * @param {Object|string} graphData Graph data or stringified graph data
 * @returns {string} HTML content for visualization
 */
function getVisualizationWebviewContent(graphData) {
    // Handle both object and string formats of graph data
    let graphDataStr;
    if (typeof graphData === 'string') {
        graphDataStr = graphData;
    } else {
        try {
            graphDataStr = JSON.stringify(graphData);
        } catch (err) {
            console.error('Error stringifying graph data:', err);
            graphDataStr = '{"nodes":[],"edges":[]}';
        }
    }

    // Create the visualization script
    const scriptContent = visualizationScript.createVisualizationScript(graphDataStr);
    
    // Generate the full HTML
    return visualizationHtml.createVisualizationHtml(scriptContent);
}

module.exports = {
    getLoadingWebviewContent,
    getErrorWebviewContent,
    getVisualizationWebviewContent
};