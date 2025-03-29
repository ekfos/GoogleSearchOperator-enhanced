// Utility function to show status messages
function showStatus(message, type = 'success') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = `status ${type}`;
    setTimeout(() => {
        status.className = 'status';
    }, 3000);
}

// Function to insert operator into Google search
async function insertOperator(operator) {
    try {
        // Get the current active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Check if we're on a Google search page
        if (!tab.url.includes('google.com')) {
            showStatus('Please navigate to Google search first', 'error');
            return;
        }

        // Send message to content script
        await chrome.tabs.sendMessage(tab.id, { 
            action: 'insertOperator', 
            operator: operator 
        });

        showStatus('Operator added successfully');
    } catch (error) {
        console.error('Error:', error);
        showStatus('Failed to insert operator', 'error');
    }
}

// Function to handle operator button clicks
function handleOperatorClick(event) {
    const button = event.currentTarget;
    const operator = button.getAttribute('data-operator');
    if (operator) {
        insertOperator(operator);
    }
}

// Function to handle custom operator submission
function handleCustomOperator(event) {
    event.preventDefault();
    const customOperator = document.getElementById('custom-operator').value.trim();
    
    if (customOperator) {
        insertOperator(customOperator);
        document.getElementById('custom-operator').value = ''; // Clear input
    } else {
        showStatus('Please enter a custom operator', 'error');
    }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers to all operator buttons
    const operatorButtons = document.querySelectorAll('.operator-btn');
    operatorButtons.forEach(button => {
        button.addEventListener('click', handleOperatorClick);
    });

    // Add handler for custom operator button
    const applyCustomBtn = document.getElementById('apply-custom');
    applyCustomBtn.addEventListener('click', handleCustomOperator);

    // Add handler for custom operator input (Enter key)
    const customOperatorInput = document.getElementById('custom-operator');
    customOperatorInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleCustomOperator(event);
        }
    });

    // Add hover animations for buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'translateY(-1px)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translateY(0)';
        });
    });
});

// Error handling for content script connection
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.error) {
        showStatus(message.error, 'error');
    } else if (message.success) {
        showStatus(message.success, 'success');
    }
});