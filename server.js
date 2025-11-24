const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json());
app.use(express.static('public'));

// Helper to read DB
async function readDb() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        // If file doesn't exist, return empty array
        if (err.code === 'ENOENT') {
            return [];
        }
        throw err;
    }
}

// Helper to write DB
async function writeDb(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// GET all tools
app.get('/api/tools', async (req, res) => {
    try {
        const tools = await readDb();
        res.json(tools);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read database' });
    }
});

// POST new tool
app.post('/api/tools', async (req, res) => {
    try {
        const newTool = req.body;
        if (!newTool.name || !newTool.serialNumber) {
            return res.status(400).json({ error: 'Name and Serial Number are required' });
        }

        const tools = await readDb();

        // Generate a simple unique ID
        newTool.id = Date.now().toString();

        tools.push(newTool);
        await writeDb(tools);

        res.status(201).json(newTool);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save tool' });
    }
});

// DELETE tool
app.delete('/api/tools/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let tools = await readDb();

        const initialLength = tools.length;
        tools = tools.filter(tool => tool.id !== id);

        if (tools.length === initialLength) {
            return res.status(404).json({ error: 'Tool not found' });
        }

        await writeDb(tools);
        res.status(200).json({ message: 'Tool deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete tool' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
