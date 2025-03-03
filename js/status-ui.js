/**
 * status-ui.js - Handles UI operations related to status messages and notifications
 */

// StatusUI module
const StatusUI = {
    elements: null,
    
    // Initialize with UI elements
    init: function(elements) {
        this.elements = elements;
    },
    
    // Display status message
    showMessage: function(message, type) {
        const statusMessage = this.elements.statusMessage;
        
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
        statusMessage.className = `alert alert-${type}`;
        statusMessage.style.display = 'block';
        
        // Hide message after 3 seconds
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    },
    
    // Update auto-save status
    updateAutoSaveStatus: function(time) {
        const autoSaveStatus = this.elements.autoSaveStatus;
        if (time) {
            autoSaveStatus.innerHTML = `<i class="bi bi-cloud-check me-1"></i> Auto-saved at ${time}`;
        } else {
            autoSaveStatus.innerHTML = '<i class="bi bi-cloud-arrow-up me-1"></i> Auto-save enabled';
        }
    }
};