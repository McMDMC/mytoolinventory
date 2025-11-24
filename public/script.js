document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-tool-form');
    const tableBody = document.querySelector('#tools-table tbody');

    // Fetch and render tools
    async function fetchTools() {
        try {
            const response = await fetch('/api/tools');
            if (!response.ok) {
                throw new Error('Failed to fetch tools');
            }
            const tools = await response.json();
            renderTools(tools);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to load tool inventory.');
        }
    }

    // Render table rows
    function renderTools(tools) {
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
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const newTool = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/tools', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTool)
            });

            if (!response.ok) {
                throw new Error('Failed to add tool');
            }

            form.reset();
            fetchTools(); // Refresh list
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to add tool.');
        }
    });

    // Handle Delete
    tableBody.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const id = e.target.dataset.id;

            if (!confirm('Are you sure you want to delete this tool?')) {
                return;
            }

            try {
                const response = await fetch(`/api/tools/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error('Failed to delete tool');
                }

                fetchTools(); // Refresh list
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete tool.');
            }
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
    fetchTools();
});
