/**
 * CSS styles for the visualization webview
 */

/**
 * Returns the CSS styles for the visualization
 * @returns {string} CSS styles
 */
// Update the CSS styles function in webviewStyles.js
function getVisualizationStyles() {
    return `
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    body {
        background-color: #fafafa;
        color: #333;
        height: 100vh;
        overflow: hidden;
    }
    
    #container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        overflow: hidden;
    }
    
    #header {
        background: linear-gradient(135deg, #2b5876, #4e4376);
        color: white;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 10;
    }
    
    #header h2 {
        margin: 0;
        font-weight: 500;
        font-size: 1.5rem;
    }
    
    .stats {
        display: flex;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.15);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.9rem;
    }
    
    .stats span {
        font-weight: 600;
        margin: 0 4px;
    }
    
    #controlPanel {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        padding: 12px 16px;
        background-color: #f0f2f5;
        border-bottom: 1px solid #ddd;
        gap: 10px;
    }
    
    button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background-color: #fff;
        color: #333;
        cursor: pointer;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        transition: all 0.2s ease;
    }
    
    button:hover {
        background-color: #f5f5f5;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }
    
    button:active {
        background-color: #e0e0e0;
        transform: translateY(1px);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    .legend {
        display: flex;
        margin-left: 15px;
        gap: 12px;
        padding: 8px 15px;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    }
    
    .legend-item {
        display: flex;
        align-items: center;
        font-size: 0.85rem;
        color: #555;
    }
    
    .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 3px;
        margin-right: 6px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    #graphContainer {
        display: flex;
        flex: 1;
        overflow: hidden;
        position: relative;
        height: calc(100vh - 120px); /* Adjust based on header and control panel height */
    }

    #mynetwork {
        flex: 1;
        background-color: #fcfcfc;
        background-image: 
            linear-gradient(#f1f1f1 1px, transparent 1px),
            linear-gradient(90deg, #f1f1f1 1px, transparent 1px);
        background-size: 25px 25px;
        overflow: auto;
        position: relative;
    }
    
    #nodeInfo {
        width: 300px;
        padding: 20px;
        background-color: white;
        box-shadow: -3px 0 10px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        display: none;
        animation: slideIn 0.3s ease;
        z-index: 5;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    #nodeInfo h3 {
        color: #1565c0;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid #f0f0f0;
    }
    
    #nodeInfo p {
        margin: 8px 0;
        line-height: 1.5;
    }
    
    #nodeInfo strong {
        color: #555;
    }
    
    #debugPanel {
        display: none;
        height: 200px;
        background-color: #282c34;
        color: #abb2bf;
        padding: 10px;
        font-family: 'Courier New', monospace;
        overflow-y: auto;
        font-size: 0.85rem;
        border-top: 2px solid #1e2227;
    }
    
    .debug-entry {
        padding: 4px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .debug-entry.error {
        color: #e06c75;
    }
    
    .debug-entry.warning {
        color: #e5c07b;
    }
    `;
}

module.exports = {
    getVisualizationStyles
};