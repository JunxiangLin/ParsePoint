const vscode = require('vscode');
const webviewContent = require('./webviewContent');

/**
 * Create a new webview panel for visualization
 * @param {vscode.ExtensionUri} extensionUri
 * @returns {vscode.WebviewPanel} The created webview panel
 */
function createWebviewPanel(extensionUri) {
    return vscode.window.createWebviewPanel(
        'parsepoint',
        'Java Inheritance Visualization',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableFindWidget: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'media')
            ]
        }
    );
}

/**
 * Returns the HTML content for loading state
 * @returns {string} HTML content
 */
function getLoadingWebviewContent() {
    return webviewContent.getLoadingWebviewContent();
}

/**
 * Returns the HTML content for error state
 * @param {string} errorMessage Error message to display
 * @returns {string} HTML content
 */
function getErrorWebviewContent(errorMessage) {
    return webviewContent.getErrorWebviewContent(errorMessage);
}

/**
 * Returns the HTML content for visualization
 * @param {Object} graphData Graph data with nodes and edges
 * @returns {string} HTML content
 */
function getVisualizationWebviewContent(graphData) {
    return webviewContent.getVisualizationWebviewContent(graphData);
}

module.exports = {
    createWebviewPanel,
    getLoadingWebviewContent,
    getErrorWebviewContent,
    getVisualizationWebviewContent
};