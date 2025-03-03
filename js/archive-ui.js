/**
 * archive-ui.js - Handles UI operations related to archived todos and projects
 */

// Define ArchiveUI module directly in the global scope
window.ArchiveUI = {
    elements: null,
    isArchiveExpanded: false,
    
    // Initialize with UI elements
    init: function(elements) {
        console.log('ArchiveUI.init called');
        this.elements = elements;
        
        // Create archive container
        this.createArchiveContainer();
        
        // Update archive badge
        this.updateArchiveBadge();
    },
    
    // Create the archive container in the DOM
    createArchiveContainer: function() {
        const todoProjectsContainer = this.elements?.todoProjectsContainer;
        if (!todoProjectsContainer) {
            console.error('ArchiveUI: Cannot create archive container, todoProjectsContainer not found');
            return;
        }
        
        const parentElement = todoProjectsContainer.parentNode;
        if (!parentElement) return;
        
        // Create main archive container
        const archiveContainer = document.createElement('div');
        archiveContainer.id = 'archive-container';
        archiveContainer.className = 'mt-4 pt-3 border-top';
        
        // Create header section
        const headerSection = document.createElement('div');
        headerSection.className = 'card-header d-flex justify-content-between align-items-center mb-2 project-header';
        
        // Create title with archive icon
        const titleElement = document.createElement('h5');
        titleElement.className = 'mb-0 archive-title';
        titleElement.innerHTML = '<i class="bi bi-archive"></i> Archived Items';
        
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.id = 'archive-toggle-button';
        toggleButton.className = 'btn btn-sm btn-outline-secondary';
        toggleButton.innerHTML = '<i class="bi bi-chevron-down"></i>';
        
        // Add click handler to toggle button
        toggleButton.onclick = () => {
            this.toggleArchiveSection();
        };
        
        // Add elements to header section
        headerSection.appendChild(titleElement);
        headerSection.appendChild(toggleButton);
        
        // Create content section (initially hidden)
        const contentSection = document.createElement('div');
        contentSection.id = 'archive-content';
        contentSection.style.display = 'none';
        
        // Add elements to main container
        archiveContainer.appendChild(headerSection);
        archiveContainer.appendChild(contentSection);
        
        // Add the archive container to the page
        parentElement.appendChild(archiveContainer);
    },
    
    // Toggle archive section visibility
    toggleArchiveSection: function() {
        const archiveContent = document.getElementById('archive-content');
        const toggleButton = document.getElementById('archive-toggle-button');
        
        if (!archiveContent || !toggleButton) return;
        
        // Toggle visibility
        if (this.isArchiveExpanded) {
            // Collapse
            archiveContent.style.display = 'none';
            toggleButton.innerHTML = '<i class="bi bi-chevron-down"></i>';
        } else {
            // Expand
            archiveContent.style.display = 'block';
            toggleButton.innerHTML = '<i class="bi bi-chevron-up"></i>';
            
            // Populate with archived items
            this.renderArchivedTodos();
        }
        
        // Toggle state
        this.isArchiveExpanded = !this.isArchiveExpanded;
    },
    
    // Render archived todos grouped by project
    renderArchivedTodos: function() {
        const archiveContent = document.getElementById('archive-content');
        if (!archiveContent) return;
        
        archiveContent.innerHTML = '';
        
        // Check if todos and projects arrays exist
        if (typeof window.todos === 'undefined' || !Array.isArray(window.todos) ||
            typeof window.projects === 'undefined' || !Array.isArray(window.projects)) {
            archiveContent.innerHTML = '<div class="alert alert-warning">No archived items found</div>';
            return;
        }
        
        // Get all archived todos
        const archivedTodos = window.todos.filter(todo => todo.archived);
        
        // Get all archived projects
        const archivedProjects = window.projects.filter(project => project.archived);
        
        // Check if there are any archived items
        if (archivedTodos.length === 0 && archivedProjects.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'alert alert-light text-center';
            emptyMessage.textContent = 'No archived items yet.';
            archiveContent.appendChild(emptyMessage);
            return;
        }
        
        // Show archived projects if any exist
        if (archivedProjects.length > 0) {
            const archivedProjectsSection = document.createElement('div');
            archivedProjectsSection.className = 'archived-projects mb-4';
            
            const projectsHeader = document.createElement('div');
            projectsHeader.className = 'card-header d-flex justify-content-between align-items-center mb-2 project-header';
            projectsHeader.innerHTML = `
                <h6 class="mb-0">
                    <i class="bi bi-folder me-2"></i>
                    Archived Projects 
                    <span class="badge bg-secondary rounded-pill ms-2">${archivedProjects.length}</span>
                </h6>
            `;
            
            archivedProjectsSection.appendChild(projectsHeader);
            
            // Simple message for archived projects
            const projectsMessage = document.createElement('div');
            projectsMessage.className = 'alert alert-light';
            projectsMessage.textContent = `${archivedProjects.length} archived projects.`;
            archivedProjectsSection.appendChild(projectsMessage);
            
            archiveContent.appendChild(archivedProjectsSection);
        }
        
        // Show archived todos if any exist
        if (archivedTodos.length > 0) {
            const archivedTodosSection = document.createElement('div');
            archivedTodosSection.className = 'archived-todos mb-4';
            
            const todosHeader = document.createElement('div');
            todosHeader.className = 'card-header d-flex justify-content-between align-items-center mb-2 project-header';
            todosHeader.innerHTML = `
                <h6 class="mb-0">
                    <i class="bi bi-check2-square me-2"></i>
                    Archived Todos 
                    <span class="badge bg-secondary rounded-pill ms-2">${archivedTodos.length}</span>
                </h6>
            `;
            
            archivedTodosSection.appendChild(todosHeader);
            
            // Simple message for archived todos
            const todosMessage = document.createElement('div');
            todosMessage.className = 'alert alert-light';
            todosMessage.textContent = `${archivedTodos.length} archived todos.`;
            archivedTodosSection.appendChild(todosMessage);
            
            archiveContent.appendChild(archivedTodosSection);
        }
    },
    
    // Update archive visibility badge
    updateArchiveBadge: function() {
        const archiveContainer = document.getElementById('archive-container');
        if (!archiveContainer) return;
        
        const titleElement = archiveContainer.querySelector('.archive-title');
        if (!titleElement) return;
        
        // Count archived items
        const archivedTodoCount = typeof window.todos !== 'undefined' && Array.isArray(window.todos) ? 
            window.todos.filter(todo => todo.archived).length : 0;
            
        const archivedProjectCount = typeof window.projects !== 'undefined' && Array.isArray(window.projects) ?
            window.projects.filter(project => project.archived).length : 0;
            
        const archivedCount = archivedTodoCount + archivedProjectCount;
        
        // Update title with count
        titleElement.innerHTML = `<i class="bi bi-archive"></i> Archived Items <span class="badge bg-secondary">${archivedCount}</span>`;
        
        // Show/hide archive section based on whether there are archived items
        if (archivedCount === 0) {
            archiveContainer.classList.add('d-none');
        } else {
            archiveContainer.classList.remove('d-none');
            
            // If archive is expanded and we have items, refresh the view
            if (this.isArchiveExpanded) {
                this.renderArchivedTodos();
            }
        }
    }
};

console.log('ArchiveUI module defined in global scope');