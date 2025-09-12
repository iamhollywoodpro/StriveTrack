import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from public directory
app.use(express.static(join(__dirname, 'public')));

// Serve the main index.html for root route
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 StriveTrack server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${join(__dirname, 'public')}`);
});