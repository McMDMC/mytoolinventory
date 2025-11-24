document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-tool-form');
    const tableBody = document.querySelector('#tools-table tbody');

    // Initial Data (if localStorage is empty)
    const initialData = [
        {
            id: "1",
            name: "DeWalt Cordless Drill",
            serialNumber: "DCD777-12345",
            category: "Power Tools",
            condition: "Good"
        },
        {
            id: "2",
            name: "Stanley Hammer",
            serialNumber: "ST-HAM-001",
            category: "Hand Tools",
            condition: "New"
        }
    ];

    // Helper to get tools from LocalStorage
    function getTools() {
        const tools = localStorage.getItem('toolInventory');
        return tools ? JSON.parse(tools) : initialData; // Default to initial data if empty
    }

    // Helper to save tools to LocalStorage
    function saveTools(tools) {
        localStorage.setItem('toolInventory', JSON.stringify(tools));
    }

    // Render tools
    function renderTools() {
        const tools = getTools();
        tableBody.innerHTML = '';

        if (tools.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tools found.</td></tr>';
            return;
        }

        tools.forEach(tool => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${escapeHtml(tool.name)}</td>
                <td>${escapeHtml(tool.serialNumber)}</td>
                <td>${escapeHtml(tool.category || '-')}</td>
                <td>${escapeHtml(tool.condition || '-')}</td>
                <td>
                    <button class="btn-delete" data-id="${tool.id}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const newTool = Object.fromEntries(formData.entries());

        // Add ID
        newTool.id = Date.now().toString();

        const tools = getTools();
        tools.push(newTool);
        saveTools(tools);

        form.reset();
        renderTools();
    });

    // Handle Delete
    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id;

            if (!confirm('Are you sure you want to delete this tool?')) {
                return;
            }

            let tools = getTools();
            tools = tools.filter(tool => tool.id !== id);
            saveTools(tools);

            renderTools();
        }
    });

    // Utility to prevent XSS
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initial load
    // Check if we need to initialize localStorage for the first time
    if (!localStorage.getItem('toolInventory')) {
        saveTools(initialData);
    }
    renderTools();
});
