// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');
const webviewManager = require('./webviewManager');
const javaFileProcessor = require('./javaFileProcessor');
const graphBuilder = require('./graphBuilder');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "parsepoint" is now active!');

    const disposable = vscode.commands.registerCommand('parsepoint.visualizeJavaInheritance', async function () {
        // Check if there is a workspace folder open
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder is open. Please open a folder first.');
            return;
        }

        // Display a message box to the user
        vscode.window.showInformationMessage('Analyzing Java files to build inheritance graph...');
        
        // Create the webview panel
        const panel = webviewManager.createWebviewPanel(context.extensionUri);

        // Initial loading message
        panel.webview.html = webviewManager.getLoadingWebviewContent();
        
        // Process Java files and create visualization
        await visualizeJavaInheritance(panel, context.extensionUri);
    });

    context.subscriptions.push(disposable);
}

/**
 * Process all Java files in workspace and create visualization
 * @param {vscode.WebviewPanel} panel 
 * @param {vscode.Uri} extensionUri
 */
async function visualizeJavaInheritance(panel, extensionUri) {
    if (!vscode.workspace.workspaceFolders) {
        panel.webview.html = webviewManager.getErrorWebviewContent("No workspace is open");
        return;
    }

    try {
        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        console.log('Workspace root:', workspaceRoot);
        
        // Get all Java files
        const javaFiles = await javaFileProcessor.findJavaFiles(workspaceRoot);
        
        if (javaFiles.length === 0) {
            panel.webview.html = webviewManager.getErrorWebviewContent("No Java files found in this workspace");
            return;
        }

        console.log(`Found ${javaFiles.length} Java files`);
        
        // Process all Java files to extract class information
        const classesInfo = await javaFileProcessor.processJavaFiles(javaFiles);
        
        if (classesInfo.length === 0) {
            panel.webview.html = webviewManager.getErrorWebviewContent("No class definitions found in Java files");
            return;
        }

        // Create graph data
        const graphData = graphBuilder.createGraphData(classesInfo);
        
        // Add debugging information
        console.log('Graph data generated:', JSON.stringify(graphData, null, 2));
        
        // Check if we have valid graph data
        if (!graphData.nodes || graphData.nodes.length === 0) {
            panel.webview.html = webviewManager.getErrorWebviewContent("No classes or interfaces found to visualize. Graph data is empty.");
            return;
        }
        
        // Generate HTML for visualization
        panel.webview.html = webviewManager.getVisualizationWebviewContent(graphData);
        
        // Set up message passing for debug info
        panel.webview.onDidReceiveMessage(
            message => {
                if (message.command === 'error') {
                    console.error('Webview error:', message.text);
                    vscode.window.showErrorMessage(`Visualization error: ${message.text}`);
                } else if (message.command === 'log') {
                    console.log('Webview log:', message.text);
                }
            }
        );
    } catch (error) {
        console.error('Error in visualizeJavaInheritance:', error);
        panel.webview.html = webviewManager.getErrorWebviewContent(`Error analyzing Java files: ${error.message}`);
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};