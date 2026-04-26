
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://127.0.0.1:8000'; // Assuming the backend runs locally

    // --- Sales Section ---
    const sellVinInput = document.getElementById('sales-vin');
    const sellButton = document.getElementById('sell-button');

    sellButton.addEventListener('click', async () => {
        const vin = sellVinInput.value.trim();
        if (!vin) {
            alert('Please enter a VIN.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vin}/sell`, {
                method: 'POST',
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'Failed to sell vehicle');
            }

            alert(result.message);
            sellVinInput.value = '';
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // --- Service Section ---
    const serviceVinInput = document.getElementById('service-vin');
    const viewComponentsButton = document.getElementById('view-components-button');
    const componentsView = document.getElementById('components-view');
    const componentsTitle = document.getElementById('components-title');
    const componentsTable = document.getElementById('components-table');

    viewComponentsButton.addEventListener('click', async () => {
        const vin = serviceVinInput.value.trim();
        if (!vin) {
            alert('Please enter a VIN.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/vehicles/${vin}/components`);
            if (!response.ok) {
                throw new Error('Failed to fetch components.');
            }
            const components = await response.json();

            // Display components
            componentsTitle.textContent = `Components for VIN: ${vin}`;
            componentsTable.innerHTML = `
                <tr>
                    <th>Serial Number</th>
                    <th>Part Name</th>
                    <th>Warranty Status</th>
                </tr>
                ${components.map(c => `
                    <tr>
                        <td>${c.serial_number}</td>
                        <td>${c.part_name}</td>
                        <td>${c.warranty_status}</td>
                    </tr>
                `).join('')}
            `;
            componentsView.style.display = 'block';
        } catch (error) {
            alert(`Error: ${error.message}`);
            componentsView.style.display = 'none';
        }
    });

    // --- Claim Submission ---
    const claimSerialInput = document.getElementById('claim-serial');
    const claimDateInput = document.getElementById('claim-date');
    const claimDescriptionInput = document.getElementById('claim-description');
    const claimButton = document.getElementById('claim-button');

    claimButton.addEventListener('click', async () => {
        const vin = serviceVinInput.value.trim(); // VIN is already in the service input
        const serialNumber = claimSerialInput.value.trim();
        const failureDate = claimDateInput.value;
        const description = claimDescriptionInput.value.trim();

        if (!vin || !serialNumber || !failureDate) {
            alert('VIN, Part Serial Number, and Failure Date are required.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/claims`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vin: vin,
                    part_serial_number: serialNumber,
                    failure_date: failureDate,
                    description: description,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.detail || 'Failed to submit claim');
            }

            alert(result.message);
            // Clear inputs after submission
            claimSerialInput.value = '';
            claimDateInput.value = '';
            claimDescriptionInput.value = '';

        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
});
