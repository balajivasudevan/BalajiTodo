/**
 * project-ui.js - Handles UI operations related to projects
 */

// Define ProjectUI module directly in the global scope
window.ProjectUI = {
    elements: null,
    notesExpandedProjects: new Set(),
    
    // Initialize with UI elements
    init: function(elements) {
        console.log('ProjectUI.init called');
        this.elements = elements;
        
        if (!elements || !elements.projectsContainer) {
            console.warn('ProjectUI initialized without proper elements');
        }
    },
    
    // Update project select dropdown
    updateDropdown: function() {
        console.log('ProjectUI.updateDropdown called');
        const projectSelect = this.elements?.projectSelect;
        
        if (!projectSelect) {
            console.error('ProjectUI: Cannot update dropdown, projectSelect not found');
            return;
        }
        
        // Clear existing options
        projectSelect.innerHTML = '';
        
        // Check if projects array exists
        if (typeof window.projects === 'undefined' || !Array.isArray(window.projects)) {
            console.error('ProjectUI: Cannot update dropdown, projects array not defined');
            return;
        }
        
        // Get active projects (non-archived ones)
        const activeProjects = window.projects.filter(p => !p.archived);
        
        // Sort projects with Inbox always first, then by order property
        const sortedProjects = [...activeProjects].sort((a, b) => {
            if (a.id === 'inbox') return -1;
            if (b.id === 'inbox') return 1;
            
            // Sort by order property if available
            const aOrder = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
            const bOrder = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            
            // Fall back to alphabetical
            return a.name.localeCompare(b.name);
        });
        
        // Add project options
        sortedProjects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            
            // Make Inbox the default selection
            if (project.id === 'inbox') {
                option.selected = true;
            }
            
            projectSelect.appendChild(option);
        });
    },
    
    // Render all projects
    renderList: function() {
        console.log('ProjectUI.renderList called');
        const projectsContainer = this.elements?.projectsContainer;
        
        if (!projectsContainer) {
            console.error('ProjectUI: Cannot render list, projectsContainer not found');
            return;
        }
        
        // Check if projects array exists
        if (typeof window.projects === 'undefined' || !Array.isArray(window.projects)) {
            console.error('ProjectUI: Cannot render list, projects array not defined');
            projectsContainer.innerHTML = '<div class="alert alert-danger">Error: projects data is missing</div>';
            return;
        }
        
        projectsContainer.innerHTML = '';
        
        // Add an action button at the top
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'd-flex justify-content-end mb-2';
        
        const collapseAllButton = document.createElement('button');
        collapseAllButton.className = 'btn btn-sm btn-outline-secondary';
        collapseAllButton.innerHTML = '<i class="bi bi-arrows-collapse"></i> Collapse All';
        collapseAllButton.addEventListener('click', () => {
            this.toggleCollapseAll();
        });
        
        actionsContainer.appendChild(collapseAllButton);
        projectsContainer.appendChild(actionsContainer);
        
        // Get active and archived projects
        const activeProjects = window.projects.filter(p => !p.archived);
        const archivedProjects = window.projects.filter(p => p.archived);
        
        // Ensure all projects have an order property if function exists
        if (typeof window.initializeProjectOrders === 'function') {
            window.initializeProjectOrders();
        }
        
        // Sort active projects with Inbox always first, then by order property
        const sortedActiveProjects = [...activeProjects].sort((a, b) => {
            if (a.id === 'inbox') return -1;
            if (b.id === 'inbox') return 1;
            
            // Sort by order property if available
            const aOrder = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
            const bOrder = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            
            // Fall back to alphabetical
            return a.name.localeCompare(b.name);
        });
        
        // Sort archived projects alphabetically
        const sortedArchivedProjects = [...archivedProjects].sort((a, b) => a.name.localeCompare(b.name));
        
        // Render active projects
        sortedActiveProjects.forEach(project => {
            const projectItem = this.createProjectItem(project);
            projectsContainer.appendChild(projectItem);
        });
        
        // Render archived projects if any
        if (archivedProjects.length > 0) {
            // Add a separator and header for archived projects
            const archivedHeader = document.createElement('div');
            archivedHeader.className = 'list-group-item text-muted mt-3 bg-dark';
            archivedHeader.innerHTML = `<i class="bi bi-archive me-2"></i>Archived Projects (${archivedProjects.length})`;
            projectsContainer.appendChild(archivedHeader);
            
            // Add archived projects
            sortedArchivedProjects.forEach(project => {
                const projectItem = this.createProjectItem(project);
                projectsContainer.appendChild(projectItem);
            });
        }
    },
    
    // Create a project item element
    createProjectItem: function(project) {
        const projectItem = document.createElement('div');
        projectItem.className = 'list-group-item d-flex flex-column project-item';
        projectItem.id = `project-${project.id}`;
        
        // Add classes for special projects
        if (project.id === 'inbox') {
            projectItem.classList.add('inbox-project');
        }
        
        // Main row with project info and actions
        const mainRow = document.createElement('div');
        mainRow.className = 'd-flex justify-content-between align-items-center';
        
        // Project info section (color, name, count)
        const projectInfo = document.createElement('div');
        projectInfo.className = 'd-flex align-items-center';
        
        const colorIndicator = document.createElement('span');
        colorIndicator.className = 'project-color';
        colorIndicator.style.backgroundColor = project.color;
        
        const projectName = document.createElement('span');
        projectName.className = 'project-name';
        projectName.textContent = project.name;
        
        // Double-click to edit project name
        projectName.addEventListener('dblclick', () => {
            if (!window.editingProjectId && !project.isDefault) {
                this.startProjectInlineEditing(project.id);
            }
        });
        
        const todoCount = document.createElement('span');
        todoCount.className = 'badge bg-primary rounded-pill ms-2';
        
        // Count non-archived todos for this project
        const count = window.todos ? 
            window.todos.filter(todo => todo.projectId === project.id && !todo.archived).length : 0;
            
        todoCount.textContent = count;
        
        // Add archived indicator if project is archived
        if (project.archived) {
            const archivedBadge = document.createElement('span');
            archivedBadge.className = 'badge bg-secondary ms-2';
            archivedBadge.innerHTML = '<i class="bi bi-archive"></i>';
            projectInfo.appendChild(archivedBadge);
        }
        
        projectInfo.appendChild(colorIndicator);
        projectInfo.appendChild(projectName);
        projectInfo.appendChild(todoCount);
        
        // Actions section (buttons)
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'project-actions';
        
        // Only add buttons if not the Inbox project
        if (!project.isDefault) {
            if (!project.archived) {
                // Archive button
                const archiveButton = document.createElement('button');
                archiveButton.className = 'btn btn-sm btn-outline-secondary me-1';
                archiveButton.innerHTML = '<i class="bi bi-archive"></i>';
                archiveButton.title = 'Archive Project';
                archiveButton.addEventListener('click', () => {
                    if (typeof window.archiveProject === 'function') {
                        window.archiveProject(project.id);
                    } else {
                        console.error('archiveProject function is not defined');
                    }
                });
                actionsContainer.appendChild(archiveButton);
            } else {
                // Unarchive button
                const unarchiveButton = document.createElement('button');
                unarchiveButton.className = 'btn btn-sm btn-outline-primary me-1';
                unarchiveButton.innerHTML = '<i class="bi bi-arrow-up-square"></i>';
                unarchiveButton.title = 'Unarchive Project';
                unarchiveButton.addEventListener('click', () => {
                    if (typeof window.unarchiveProject === 'function') {
                        window.unarchiveProject(project.id);
                    } else {
                        console.error('unarchiveProject function is not defined');
                    }
                });
                actionsContainer.appendChild(unarchiveButton);
            }
            
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-sm btn-outline-danger';
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            deleteButton.title = 'Delete Project';
            deleteButton.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete "${project.name}" project? Tasks will be moved to Inbox.`)) {
                    if (typeof window.deleteProject === 'function') {
                        window.deleteProject(project.id);
                    } else {
                        console.error('deleteProject function is not defined');
                    }
                }
            });
            actionsContainer.appendChild(deleteButton);
        } else {
            // Default badge for Inbox
            const defaultBadge = document.createElement('span');
            defaultBadge.className = 'badge bg-success ms-1';
            defaultBadge.textContent = 'Default';
            projectInfo.appendChild(defaultBadge);
        }
        
        mainRow.appendChild(projectInfo);
        mainRow.appendChild(actionsContainer);
        projectItem.appendChild(mainRow);
        
        return projectItem;
    },
    
    // Toggle collapse/expand all projects
    toggleCollapseAll: function() {
        console.log('ProjectUI.toggleCollapseAll called');
        
        if (typeof window.collapsedProjects === 'undefined') {
            console.error('collapsedProjects is not defined');
            return;
        }
        
        if (typeof window.projects === 'undefined' || !Array.isArray(window.projects)) {
            console.error('projects array is not defined');
            return;
        }
        
        // Get the toggle button
        const button = this.elements.projectsContainer.querySelector('.btn-outline-secondary');
        if (!button) return;
        
        // Determine current collapse state by checking button text
        const isExpanded = button.innerHTML.includes('Collapse');
        
        // Get all active projects (except Inbox)
        const activeProjects = window.projects.filter(p => !p.archived && p.id !== 'inbox');
        
        activeProjects.forEach(project => {
            if (isExpanded) {
                // Collapse all projects
                window.collapsedProjects.add(project.id);
            } else {
                // Expand all projects
                window.collapsedProjects.delete(project.id);
            }
        });
        
        // Save the collapsed state
        if (typeof window.saveCollapsedState === 'function') {
            window.saveCollapsedState();
        } else {
            console.error('saveCollapsedState function is not defined');
        }
        
        // Update the button text
        if (isExpanded) {
            button.innerHTML = '<i class="bi bi-arrows-expand"></i> Expand All';
        } else {
            button.innerHTML = '<i class="bi bi-arrows-collapse"></i> Collapse All';
        }
        
        // Refresh the todos view
        if (typeof window.UI !== 'undefined' && typeof window.UI.renderTodosByProject === 'function') {
            window.UI.renderTodosByProject();
        } else {
            console.error('UI.renderTodosByProject function is not defined');
        }
    },
    
    // Start inline editing for project name
    startProjectInlineEditing: function(projectId) {
        console.log('ProjectUI.startProjectInlineEditing called for', projectId);
        
        // Set the global editing flag if it exists
        if (typeof window.editingProjectId !== 'undefined') {
            window.editingProjectId = projectId;
        }
        
        const project = window.projects.find(p => p.id === projectId);
        if (!project) return;
        
        const projectContainer = document.getElementById(`project-${projectId}`);
        if (!projectContainer) return;
        
        const projectNameElement = projectContainer.querySelector('.project-name');
        if (!projectNameElement) return;
        
        // Store the original text
        const originalText = project.name;
        
        // Create an input field
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.className = 'form-control inline-edit-input';
        inputField.value = originalText;
        
        // Replace the text with the input field
        projectNameElement.innerHTML = '';
        projectNameElement.appendChild(inputField);
        
        // Focus the input field
        inputField.focus();
        
        // Helper function to save edit
        const saveEdit = () => {
            const newText = inputField.value.trim();
            if (newText && newText !== originalText) {
                if (typeof window.editProject === 'function') {
                    window.editProject(projectId, newText);
                } else {
                    console.error('editProject function is not defined');
                    projectNameElement.textContent = originalText;
                }
            } else {
                // If empty or unchanged, restore original
                projectNameElement.textContent = originalText;
            }
            
            if (typeof window.editingProjectId !== 'undefined') {
                window.editingProjectId = null;
            }
        };
        
        // Handle saving on enter, canceling on escape
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                projectNameElement.textContent = originalText;
                if (typeof window.editingProjectId !== 'undefined') {
                    window.editingProjectId = null;
                }
            }
        });
        
        // Handle clicking outside
        document.addEventListener('click', function handleClickOutside(event) {
            if ((typeof window.editingProjectId !== 'undefined' && window.editingProjectId === projectId) && 
                !inputField.contains(event.target)) {
                saveEdit();
                document.removeEventListener('click', handleClickOutside);
            }
        });
    },
    
    // Open notes modal for a specific project
    openProjectNotesModal: function(projectId) {
        console.log('ProjectUI.openProjectNotesModal called for', projectId);
        
        // Check if project exists
        const project = window.projects.find(p => p.id === projectId);
        if (!project) {
            console.error(`Project with ID ${projectId} not found`);
            return;
        }
        
        // Check if the modal exists, create it if not
        let modal = document.getElementById('project-notes-modal');
        if (!modal) {
            this.createProjectNotesModal();
            modal = document.getElementById('project-notes-modal');
            if (!modal) {
                console.error('Failed to create project notes modal');
                return;
            }
        }
        
        // Set current project ID as a data attribute on the modal
        modal.setAttribute('data-project-id', projectId);
        
        // Set project title
        const titleElement = document.getElementById('project-title');
        if (titleElement) {
            titleElement.textContent = project.name;
        }
        
        // Set existing notes if any
        const notesTextarea = document.getElementById('project-notes');
        if (notesTextarea) {
            notesTextarea.value = project.notes || '';
        }
        
        // Show the modal using Bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // Focus the textarea
            setTimeout(() => {
                if (notesTextarea) notesTextarea.focus();
            }, 300);
        } else {
            console.error('Bootstrap Modal not available');
            // Fallback - show the modal directly
            if (modal) {
                modal.style.display = 'block';
                if (notesTextarea) notesTextarea.focus();
            }
        }
    },
    
    // Create modal for project notes if it doesn't exist
    createProjectNotesModal: function() {
        console.log('ProjectUI.createProjectNotesModal called');
        
        // Don't create if it already exists
        if (document.getElementById('project-notes-modal')) return;
        
        // Create modal structure
        const modalHTML = `
        <div class="modal fade" id="project-notes-modal" tabindex="-1" aria-labelledby="projectNotesModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="projectNotesModalLabel"><i class="bi bi-sticky me-2"></i>Project Notes</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="project-notes-form">
                            <div class="mb-3">
                                <label for="project-title" class="form-label">Project</label>
                                <div id="project-title" class="form-control-plaintext"></div>
                            </div>
                            <div class="mb-3">
                                <label for="project-notes" class="form-label">Notes</label>
                                <textarea class="form-control" id="project-notes" rows="5" placeholder="Add notes about this project..."></textarea>
                            </div>
                            <div class="text-muted small mt-2">
                                <i class="bi bi-info-circle me-1"></i>
                                Project notes will be visible on the project page and can help organize your workflow.
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="save-project-notes-btn">
                            <i class="bi bi-save me-1"></i>Save Notes
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Add modal to the document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add event listener for save button
        const saveButton = document.getElementById('save-project-notes-btn');
        if (saveButton) {
            saveButton.addEventListener('click', this.saveProjectNotes.bind(this));
        }
    },
    
    // Save project notes from modal
    saveProjectNotes: function() {
        console.log('ProjectUI.saveProjectNotes called');
        
        const modal = document.getElementById('project-notes-modal');
        if (!modal) {
            console.error('Project notes modal not found');
            return;
        }
        
        const projectId = modal.getAttribute('data-project-id');
        if (!projectId) {
            console.error('No project ID found in modal');
            return;
        }
        
        const notesTextarea = document.getElementById('project-notes');
        if (!notesTextarea) {
            console.error('Project notes textarea not found');
            return;
        }
        
        const notesText = notesTextarea.value.trim();
        
        // Update the project notes
        if (typeof window.updateProjectNotes === 'function') {
            window.updateProjectNotes(projectId, notesText);
        } else {
            console.error('updateProjectNotes function is not defined');
            return;
        }
        
        // Close the modal using Bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        } else {
            // Fallback - hide directly
            modal.style.display = 'none';
        }
        
        // Show confirmation message
        if (typeof window.UI !== 'undefined' && typeof window.UI.showStatusMessage === 'function') {
            window.UI.showStatusMessage('Project notes saved!', 'success');
        } else {
            console.log('Project notes saved successfully!');
        }
    }
};

console.log('ProjectUI module defined in global scope');