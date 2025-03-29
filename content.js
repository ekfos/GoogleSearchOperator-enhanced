// Function to highlight the search input briefly
function highlightSearchInput(input) {
    const originalBorder = input.style.border;
    const originalBoxShadow = input.style.boxShadow;
    
    input.style.border = '2px solid #4285f4';
    input.style.boxShadow = '0 0 5px rgba(66, 133, 244, 0.5)';
    
    setTimeout(() => {
        input.style.border = originalBorder;
        input.style.boxShadow = originalBoxShadow;
    }, 1000);
}

// Function to insert operator into search input
function insertOperatorIntoSearch(operator) {
    try {
        // Find the search input
        const searchInput = document.querySelector('input[name="q"]');
        if (!searchInput) {
            throw new Error('Search input not found');
        }

        // Get current cursor position
        const cursorPos = searchInput.selectionStart;
        const currentValue = searchInput.value;

        // Handle different operator types
        let newValue;
        let newCursorPos;

        switch(operator) {
            case '"':
                // For exact phrase, wrap the selected text in quotes
                const selectedText = currentValue.substring(
                    searchInput.selectionStart,
                    searchInput.selectionEnd
                );
                if (selectedText) {
                    newValue = currentValue.substring(0, searchInput.selectionStart) +
                              `"${selectedText}"` +
                              currentValue.substring(searchInput.selectionEnd);
                    newCursorPos = searchInput.selectionEnd + 2;
                } else {
                    newValue = currentValue.substring(0, cursorPos) +
                              '""' +
                              currentValue.substring(cursorPos);
                    newCursorPos = cursorPos + 1;
                }
                break;

            case '-':
                // For exclusion, add space if needed
                const spaceBeforeIfNeeded = cursorPos > 0 && 
                                          currentValue[cursorPos - 1] !== ' ' ? ' ' : '';
                newValue = currentValue.substring(0, cursorPos) +
                          `${spaceBeforeIfNeeded}-` +
                          currentValue.substring(cursorPos);
                newCursorPos = cursorPos + spaceBeforeIfNeeded.length + 1;
                break;

            default:
                // For other operators, add space if needed
                const spaceIfNeeded = cursorPos > 0 && 
                                    currentValue[cursorPos - 1] !== ' ' ? ' ' : '';
                newValue = currentValue.substring(0, cursorPos) +
                          `${spaceIfNeeded}${operator}` +
                          currentValue.substring(cursorPos);
                newCursorPos = cursorPos + spaceIfNeeded.length + operator.length;
        }

        // Update input value and cursor position
        searchInput.value = newValue;
        searchInput.setSelectionRange(newCursorPos, newCursorPos);
        
        // Focus the input and trigger input event
        searchInput.focus();
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Highlight the input to provide visual feedback
        highlightSearchInput(searchInput);

        // Send success message back to popup
        chrome.runtime.sendMessage({ 
            success: 'Operator inserted successfully' 
        });

    } catch (error) {
        console.error('Error inserting operator:', error);
        chrome.runtime.sendMessage({ 
            error: 'Failed to insert operator: ' + error.message 
        });
    }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'insertOperator') {
        insertOperatorIntoSearch(request.operator);
    }
    return true; // Keep the message channel open for async responses
});

// Initialize mutation observer to handle dynamic search input changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'subtree') {
            const searchInput = document.querySelector('input[name="q"]');
            if (searchInput && !searchInput.dataset.operatorEnhancerInitialized) {
                searchInput.dataset.operatorEnhancerInitialized = 'true';
                // Add any necessary initialization here
            }
        }
    });
});

// Start observing the document for dynamic changes
observer.observe(document.body, {
    childList: true,
    subtree: true
});