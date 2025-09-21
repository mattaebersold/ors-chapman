// Simple OAuth redirect server for Google authentication
// Run this with: node oauth-server.js

const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/auth/callback') {
    const idToken = parsedUrl.hash ? parsedUrl.hash.match(/id_token=([^&]+)/)?.[1] : null;
    const error = parsedUrl.query.error;
    
    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h2>Authentication Error</h2>
            <p>Error: ${error}</p>
            <script>
              // Post message to parent window (Expo WebBrowser)
              if (window.opener || window.parent) {
                const target = window.opener || window.parent;
                target.postMessage({ error: '${error}' }, '*');
              }
              setTimeout(() => window.close(), 2000);
            </script>
          </body>
        </html>
      `);
    } else if (idToken) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h2>Authentication Successful</h2>
            <p>You can close this window.</p>
            <script>
              // Post message to parent window (Expo WebBrowser)
              if (window.opener || window.parent) {
                const target = window.opener || window.parent;
                target.postMessage({ 
                  type: 'oauth_success', 
                  id_token: '${idToken}' 
                }, '*');
              }
              setTimeout(() => window.close(), 2000);
            </script>
          </body>
        </html>
      `);
    } else {
      // Handle implicit flow - token is in fragment
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h2>Processing Authentication...</h2>
            <script>
              // Extract token from URL fragment
              const fragment = window.location.hash.substring(1);
              const params = new URLSearchParams(fragment);
              const idToken = params.get('id_token');
              const error = params.get('error');
              
              if (error) {
                if (window.opener || window.parent) {
                  const target = window.opener || window.parent;
                  target.postMessage({ error }, '*');
                }
              } else if (idToken) {
                if (window.opener || window.parent) {
                  const target = window.opener || window.parent;
                  target.postMessage({ 
                    type: 'oauth_success', 
                    id_token: idToken 
                  }, '*');
                }
              }
              
              setTimeout(() => window.close(), 2000);
            </script>
          </body>
        </html>
      `);
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`OAuth redirect server running on http://localhost:${PORT}`);
  console.log('Add http://localhost:8080/auth/callback to your Google OAuth client');
});