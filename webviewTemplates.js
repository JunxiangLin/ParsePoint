/**
 * Basic webview templates for different states
 */

/**
 * Returns the HTML content for loading state
 * @returns {string} HTML content for loading state
 */
function getLoadingContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Java Inheritance Graph</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 20px;
                text-align: center;
            }
            h1 {
                color: #0078d7;
            }
            .loader {
                border: 5px solid #f3f3f3;
                border-top: 5px solid #0078d7;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 2s linear infinite;
                margin: 30px auto;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <h1>Java Inheritance Graph</h1>
        <div class="loader"></div>
        <p>Analyzing Java files and building inheritance graph...</p>
    </body>
    </html>`;
}

/**
 * Returns the HTML content for error state
 * @param {string} errorMessage Error message to display
 * @returns {string} HTML content for error state
 */
function getErrorContent(errorMessage) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Java Inheritance Graph</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                padding: 20px;
                text-align: center;
            }
            h1 {
                color: #0078d7;
            }
            .error {
                color: #d32f2f;
                margin: 30px;
                padding: 15px;
                border: 1px solid #ffcdd2;
                background-color: #ffebee;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <h1>Java Inheritance Graph</h1>
        <div class="error">
            <p>${errorMessage}</p>
        </div>
    </body>
    </html>`;
}

module.exports = {
    getLoadingContent,
    getErrorContent
};