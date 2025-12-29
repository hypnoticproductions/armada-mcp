const fs = require('fs');

// Read the main page
const indexHtml = fs.readFileSync('/workspace/armada-premium/dist/index.html', 'utf8');

// Add inline styles and scripts
const modifiedHtml = indexHtml.replace(
  '</head>',
  '<style>body{font-family:system-ui,sans-serif;margin:0;padding:20px;background:#f3f4f6;}.container{max-width:1200px;margin:0 auto;}header{background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);color:white;padding:30px;border-radius:10px;margin-bottom:30px;}h1{font-size:2.5em;margin:0 0 10px 0;}nav{display:flex;gap:20px;margin-top:20px;flex-wrap:wrap;}nav a{color:white;text-decoration:none;padding:10px 20px;background:rgba(255,255,255,0.1);border-radius:5px;transition:background 0.3s;}nav a:hover{background:rgba(255,255,255,0.2);}.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:15px;margin-top:30px;}.stat-card{background:white;padding:20px;border-radius:10px;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,0.1);}.stat-number{font-size:2em;font-weight:bold;color:#3b82f6;margin:0;}.stat-label{color:#6b7280;font-size:0.85em;margin-top:5px;}.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:30px;}.feature-card{background:white;padding:25px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1);}h2{color:#1a1a2e;margin-top:0;font-size:1.3em;}.feature-btn{display:inline-block;background:#3b82f6;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;margin-top:15px;transition:background 0.3s;}.feature-btn:hover{background:#2563eb;}</style>\n' +
  '<script>document.addEventListener("DOMContentLoaded",function(){console.log("ARMADA Premium System v1.0.0 loaded successfully");});</script>\n' +
  '</head>'
);

fs.writeFileSync('/workspace/armada-premium/dist/index.html', modifiedHtml);
console.log('✓ Updated index.html with standalone styles');
