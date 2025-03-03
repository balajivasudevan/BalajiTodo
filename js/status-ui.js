/**
 * status-ui.js - Handles UI operations related to status messages and notifications
 */

// Define StatusUI module directly in the global scope
window.StatusUI = {
    elements: null,
    
    // Initialize with UI elements
    init: function(elements) {
        console.log('StatusUI.init called');
        this.elements = elements;
        if (!elements || !elements.statusMessage) {
            console.warn('StatusUI initialized without proper elements');
        }
    },
    
    // Display status message
    showMessage: function(message, type) {
        console.log(`StatusUI.showMessage: [${type}] ${message}`);
        const statusMessage = this.elements?.statusMessage;
        
        if (!statusMessage) {
            // Fallback if element not found
            console.log(`Status message (${type}): ${message}`);
            return;
        }
        
        // Create an appropriate icon based on the message type
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="bi bi-check-circle me-2"></i>';
                break;
            case 'danger':
                icon = '<i class="bi bi-exclamation-triangle me-2"></i>';
                break;
            case 'warning':
                icon = '<i class="bi bi-exclamation-circle me-2"></i>';
                break;
            case 'info':
                icon = '<i class="bi bi-info-circle me-2"></i>';
                break;
            default:
                icon = '';
        }
        
        statusMessage.innerHTML = icon + message;
        statusMessage.className = `alert alert-${type || 'info'}`;
        statusMessage.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    },
    
    // Update auto-save status
    updateAutoSaveStatus: function(time) {
        const autoSaveStatus = this.elements?.autoSaveStatus;
        if (!autoSaveStatus) return;
        
        if (time) {
            autoSaveStatus.innerHTML = `<i class="bi bi-cloud-check me-1"></i> Auto-saved at ${time}`;
        } else {
            autoSaveStatus.innerHTML = '<i class="bi bi-cloud-arrow-up me-1"></i> Auto-save enabled';
        }
    }
};

console.log('StatusUI module defined in global scope');