/**
 * CSS styles for the visualization webview
 */

/**
 * Returns the CSS styles for the visualization
 * @returns {string} CSS styles
 */
function getVisualizationStyles() {
    return `
    body, html {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
    }
    #container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
    }
    #header {
        padding: 10px 20px;
        background-color: #0078d7;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    #controlPanel {
        padding: 10px;
        background-color: #f3f3f3;
        border-bottom: 1px solid #ddd;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    #graphContainer {
        flex-grow: 1;
        position: relative;
        min-height: 400px; /* Ensure minimum height */
        width: 100%;
        background-color: #fafafa;
    }
    #mynetwork {
        width: 100%;
        height: 100%;
        min-height: 400px; /* Ensure minimum height */
        border: 1px solid #ddd;
        background-color: white;
    }
    #nodeInfo {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: white;
        border: 1px solid #ddd;
        padding: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-width: 250px;
        display: none;
        z-index: 1000;
    }
    .legend {
        margin-top: 5px;
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
    }
    .legend-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 12px;
    }
    .legend-color {
        width: 15px;
        height: 15px;
        border-radius: 50%;
    }
    button {
        padding: 5px 10px;
        background-color: #0078d7;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    button:hover {
        background-color: #005a9e;
    }
    .stats {
        color: #666;
        font-size: 12px;
    }
    #debugPanel {
        padding: 10px;
        background-color: #f0f0f0;
        border-top: 1px solid #ddd;
        max-height: 200px;
        overflow: auto;
        display: none; /* Hide by default */
    }
    .debug-entry {
        margin: 2px 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 2px;
    }
    .error { color: #d32f2f; }
    .warning { color: #ff9800; }
    .info { color: #2196f3; }
    `;
}

module.exports = {
    getVisualizationStyles
};