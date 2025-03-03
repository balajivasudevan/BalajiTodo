/**
 * tag-ui.js - Handles UI operations related to tags
 */

// TagUI module
const TagUI = {
    elements: null,
    
    // Initialize with UI elements
    init: function(elements) {
        this.elements = elements;
        this.createTagFilterContainer();
        this.updateTagFilters();
    },
    
    // Create tag filter container in the DOM
    createTagFilterContainer: function() {
        // Find where to place the tag filter container (just before todo-projects-container)
        const todoProjectsContainer = this.elements.todoProjectsContainer;
        const parent = todoProjectsContainer.parentNode;
        
        // Create container for tag filters
        const tagFilterContainer = document.createElement('div');
        tagFilterContainer.id = 'tag-filter-container';
        tagFilterContainer.className = 'mb-3';
        
        // Add heading and clear button row
        const headerRow = document.createElement('div');
        headerRow.className = 'd-flex justify-content-between align-items-center mb-2';
        
        const heading = document.createElement('h6');
        heading.className = 'mb-0';
        heading.innerHTML = '<i class="bi bi-tags me-2"></i>Filter by Tags';
        
        const clearButton = document.createElement('button');
        clearButton.id = 'clear-tag-filters';
        clearButton.className = 'btn btn-sm btn-outline-secondary';
        clearButton.innerHTML = 'Clear filters';
        clearButton.addEventListener('click', () => clearTagFilters());
        
        headerRow.appendChild(heading);
        headerRow.appendChild(clearButton);
        
        // Add tags container
        const tagsContainer = document.createElement('div');
        tagsContainer.id = 'tag-filters';
        tagsContainer.className = 'tags-container';
        
        // Assemble the components
        tagFilterContainer.appendChild(headerRow);
        tagFilterContainer.appendChild(tagsContainer);
        
        // Insert before the todo-projects-container
        parent.insertBefore(tagFilterContainer, todoProjectsContainer);
    },
    
    // Update tag filters based on available tags
    updateTagFilters: function() {
        const tagsContainer = document.getElementById('tag-filters');
        const clearButton = document.getElementById('clear-tag-filters');
        
        if (!tagsContainer) return;
        
        // Clear existing tag filters
        tagsContainer.innerHTML = '';
        
        // Get all unique tags from non-archived todos
        const allTags = getAllTags();
        
        // Show/hide the clear button based on active filters
        if (activeTags.size > 0) {
            clearButton.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
        }
        
        // If no tags exist, show a message
        if (allTags.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'text-muted small fst-italic';
            emptyMessage.textContent = 'No tags found. Add tags to tasks using @tagname format.';
            tagsContainer.appendChild(emptyMessage);
            
            // Hide the entire container if no tags and no active filters
            if (activeTags.size === 0) {
                document.getElementById('tag-filter-container').style.display = 'none';
            } else {
                document.getElementById('tag-filter-container').style.display = 'block';
            }
            
            return;
        }
        
        // Show the tag filter container since we have tags
        document.getElementById('tag-filter-container').style.display = 'block';
        
        // Create tag filter pills
        allTags.forEach(tag => {
            const tagPill = document.createElement('span');
            tagPill.className = 'badge rounded-pill me-2 mb-2 tag-filter';
            tagPill.textContent = tag;
            
            // Add active class if this tag is being filtered
            if (activeTags.has(tag)) {
                tagPill.classList.add('bg-primary');
            } else {
                tagPill.classList.add('bg-secondary');
            }
            
            // Add click handler to toggle filter
            tagPill.addEventListener('click', () => {
                const isActive = toggleTagFilter(tag);
                
                // Update the appearance based on active state
                if (isActive) {
                    tagPill.classList.remove('bg-secondary');
                    tagPill.classList.add('bg-primary');
                } else {
                    tagPill.classList.remove('bg-primary');
                    tagPill.classList.add('bg-secondary');
                }
            });
            
            tagsContainer.appendChild(tagPill);
        });
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
            
            // Add click handler to enable this tag filter
            pill.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering other click events (like todo item click)
                
                // Add this tag to active filters
                activeTags.clear(); // Clear existing filters
                activeTags.add(tag); // Add only this tag
                
                // Update UI
                UI.renderTodosByProject();
                this.updateTagFilters();
            });
            
            pillsContainer.appendChild(pill);
        });
        
        return pillsContainer;
    },
    
    // Parse text with highlighted tags
    parseTextWithTags: function(text) {
        if (!text) return '';
        
        // Replace @tag with a styled span
        return text.replace(/(\B@[a-zA-Z0-9_-]+\b)/g, '<span class="tag-highlight">$1</span>');
    }
};