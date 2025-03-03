/**
 * tag-ui.js - Minimal implementation for TagUI
 */

// Define TagUI directly in the global scope
window.TagUI = {
    elements: null,
    
    // Initialize with UI elements
    init: function(elements) {
        console.log('TagUI.init called');
        this.elements = elements || {};
    },
    
    // Update tag filters 
    updateTagFilters: function() {
        console.log('TagUI.updateTagFilters called');
        // Minimal implementation
    },
    
    // Create tag pills for a todo item
    createTagPills: function(tags) {
        if (!tags || tags.length === 0) return null;
        
        const pillsContainer = document.createElement('div');
        pillsContainer.className = 'tag-pills mt-1';
        
        tags.forEach(tag => {
            const pill = document.createElement('span');
            pill.className = 'badge rounded-pill bg-info me-1 tag-pill';
            pill.textContent = tag;
            pill.title = `Filter by tag: ${tag}`;
            pillsContainer.appendChild(pill);
        });
        
        return pillsContainer;
    }
};

console.log('TagUI module defined in global scope');