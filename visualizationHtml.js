/**
 * HTML structure for the visualization webview
 */
const webviewStyles = require('./webviewStyles');

/**
 * Returns the HTML structure for the visualization
 * @returns {string} HTML structure
 */
function getVisualizationStructure() {
    return `
    <div id="container">
        <div id="header">
            <h2>Java Inheritance Visualization</h2>
            <div class="stats">
                Classes: <span id="class-count">0</span> | 
                Interfaces: <span id="interface-count">0</span> | 
                Relationships: <span id="edge-count">0</span>
            </div>
        </div>
        <div id="controlPanel">
            <button id="resetBtn">↻ Reset View</button>
            <button id="clusterBtn">⟲ Group Related Nodes</button>
            <button id="toggleDebugBtn" style="margin-left: auto;">Show Debug Panel</button>
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color" style="background-color: #1E88E5;"></div>
                    <span>Extends</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: #43A047;"></div>
                    <span>Implements</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background-color: #FB8C00;"></div>
                    <span>Interface Extends</span>
                </div>
            </div>
        </div>
        <div id="graphContainer">
            <div id="mynetwork"></div>
            <div id="nodeInfo"></div>
        </div>
        <div id="debugPanel"></div>
    </div>
    `;
}

/**
 * Creates the full HTML content for visualization
 * @param {string} scriptContent JavaScript for visualization
 * @returns {string} Full HTML content
 */
function createVisualizationHtml(scriptContent) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Java Inheritance Graph</title>
        <style>
            ${webviewStyles.getVisualizationStyles()}
        </style>
    </head>
    <body>
        ${getVisualizationStructure()}
        <script>
            ${scriptContent}
        </script>
    </body>
    </html>`;
}

module.exports = {
    getVisualizationStructure,
    createVisualizationHtml
};