/**
 * project-ui.js - Handles UI operations related to projects
 */

// ProjectUI module
const ProjectUI = {
    elements: null,
    notesExpandedProjects: new Set(),
    
    // Initialize with UI elements
    init: function(elements) {
        this.elements = elements;
        this.createProjectModal();
    },
    
    // Create modal for project notes
    createProjectModal: function() {
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
        document.getElementById('save-project-notes-btn').addEventListener('click', this.saveProjectNotes.bind(this));
    },
    
    // Open notes modal for a specific project
    openProjectNotesModal: function(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        // Set current project ID as a data attribute on the modal
        const modal = document.getElementById('project-notes-modal');
        modal.setAttribute('data-project-id', projectId);
        
        // Set project title
        document.getElementById('project-title').textContent = project.name;
        
        // Set existing notes if any
        document.getElementById('project-notes').value = project.notes || '';
        
        // Show the modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Focus the textarea
        setTimeout(() => {
            document.getElementById('project-notes').focus();
        }, 300);
    },
    
    // Save notes from modal to project
    saveProjectNotes: function() {
        const modal = document.getElementById('project-notes-modal');
        const projectId = modal.getAttribute('data-project-id');
        const notesText = document.getElementById('project-notes').value.trim();
        
        // Update the project notes
        updateProjectNotes(projectId, notesText);
        
        // Close the modal
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
        
        // Show confirmation
        UI.showStatusMessage('Project notes saved!', 'success');
    },
    
    // Toggle project notes visibility
    toggleProjectNotes: function(projectId) {
        const projectContainer = document.getElementById(`project-${projectId}`);
        const notesSection = projectContainer.querySelector('.project-notes-section');
        
        if (this.notesExpandedProjects.has(projectId)) {
            // Hide notes
            if (notesSection) {
                notesSection.classList.add('d-none');
            }
            this.notesExpandedProjects.delete(projectId);
        } else {
            // Show notes
            if (notesSection) {
                notesSection.classList.remove('d-none');
            } else {
                // Create notes section if it doesn't exist
                this.createProjectNotesSection(projectId, projectContainer);
            }
            this.notesExpandedProjects.add(projectId);
        }
    },
    
    // Create project notes section
    createProjectNotesSection: function(projectId, projectContainer) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        const notesSection = document.createElement('div');
        notesSection.className = 'project-notes-section card-body border-top pb-2 pt-2';
        
        if (!project.notes || project.notes.length === 0) {
            notesSection.innerHTML = `
                <div class="text-muted fst-italic small">
                    <i class="bi bi-info-circle me-1"></i>
                    No notes for this project yet. Add notes to help organize your workflow.
                </div>
            `;
        } else {
            notesSection.innerHTML = `
                <div class="project-notes-content">
                    ${project.notes.replace(/\n/g, '<br>')}
                </div>
            `;
        }
        
        projectContainer.appendChild(notesSection);
    },
    
    // Update project select dropdown
    updateDropdown: function() {
        const projectSelect = this.elements.projectSelect;
        
        // Clear existing options
        projectSelect.innerHTML = '';
        
        // Sort projects with Inbox always first, and filter out archived projects
        const sortedProjects = [...projects]
            .filter(p => !p.archived)
            .sort((a, b) => {
                if (a.id === 'inbox') return -1;
                if (b.id === 'inbox') return 1;
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
    
    // Start inline editing for project name
    startProjectInlineEditing: function(projectId) {
        editingProjectId = projectId;
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        const projectContainer = document.getElementById(`project-${projectId}`);
        const projectNameElement = projectContainer.querySelector('.project-name');
        
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
                editProject(projectId, newText);
            } else {
                // If empty or unchanged, restore original
                projectNameElement.textContent = originalText;
            }
            editingProjectId = null;
        };
        
        // Handle saving on enter, canceling on escape
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                projectNameElement.textContent = originalText;
                editingProjectId = null;
            }
        });
        
        // Handle clicking outside
        document.addEventListener('click', function handleClickOutside(event) {
            if (editingProjectId === projectId && !inputField.contains(event.target)) {
                saveEdit();
                document.removeEventListener('click', handleClickOutside);
            }
        });
    },
    
    // Render projects list
    renderList: function() {
        const projectsContainer = this.elements.projectsContainer;
        projectsContainer.innerHTML = '';
        
        // Sort projects with Inbox always first
        const activeProjects = [...projects]
            .filter(p => !p.archived)
            .sort((a, b) => {
                if (a.id === 'inbox') return -1;
                if (b.id === 'inbox') return 1;
                return a.name.localeCompare(b.name);
            });
        
        const archivedProjects = [...projects]
            .filter(p => p.archived)
            .sort((a, b) => a.name.localeCompare(b.name));
        
        // Render active projects
        activeProjects.forEach(project => {
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
            archivedProjects.forEach(project => {
                const projectItem = this.createProjectItem(project);
                projectsContainer.appendChild(projectItem);
            });
        }
    },
    
    // Create a project item element
    createProjectItem: function(project) {
        const projectItem = document.createElement('div');
        projectItem.className = 'list-group-item d-flex flex-column';
        projectItem.id = `project-${project.id}`;
        
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
        
        // Add double-click to edit project name
        projectName.addEventListener('dblclick', () => {
            if (!editingProjectId && !project.isDefault) {
                this.startProjectInlineEditing(project.id);
            }
        });
        
        const todoCount = document.createElement('span');
        todoCount.className = 'badge bg-primary rounded-pill ms-2';
        const count = todos.filter(todo => todo.projectId === project.id && !todo.archived).length;
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
        
        // Notes button
        const notesButton = document.createElement('button');
        notesButton.className = 'btn btn-sm btn-outline-info me-1';
        notesButton.innerHTML = '<i class="bi bi-sticky"></i>';
        notesButton.title = 'Project Notes';
        notesButton.addEventListener('click', () => {
            this.openProjectNotesModal(project.id);
        });
        
        // Toggle notes visibility button (show/hide notes in list)
        const toggleNotesButton = document.createElement('button');
        toggleNotesButton.className = 'btn btn-sm btn-outline-secondary me-1';
        toggleNotesButton.innerHTML = '<i class="bi bi-arrows-expand"></i>';
        toggleNotesButton.title = 'Show/Hide Notes';
        toggleNotesButton.addEventListener('click', () => {
            this.toggleProjectNotes(project.id);
        });
        
        actionsContainer.appendChild(notesButton);
        actionsContainer.appendChild(toggleNotesButton);
        
        // Only add archive/unarchive/delete buttons if not the Inbox project
        if (!project.isDefault) {
            if (project.archived) {
                // Unarchive button
                const unarchiveButton = document.createElement('button');
                unarchiveButton.className = 'btn btn-sm btn-outline-primary me-1';
                unarchiveButton.innerHTML = '<i class="bi bi-arrow-up-square"></i>';
                unarchiveButton.title = 'Unarchive Project';
                unarchiveButton.addEventListener('click', () => {
                    unarchiveProject(project.id);
                });
                actionsContainer.appendChild(unarchiveButton);
            } else {
                // Archive button
                const archiveButton = document.createElement('button');
                archiveButton.className = 'btn btn-sm btn-outline-secondary me-1';
                archiveButton.innerHTML = '<i class="bi bi-archive"></i>';
                archiveButton.title = 'Archive Project';
                archiveButton.addEventListener('click', () => {
                    archiveProject(project.id);
                });
                actionsContainer.appendChild(archiveButton);
            }
            
            // Delete button
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-sm btn-outline-danger';
            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
            deleteButton.title = 'Delete Project';
            deleteButton.addEventListener('click', () => {
                if (confirm(`Are you sure you want to delete "${project.name}" project? Tasks will be moved to Inbox.`)) {
                    deleteProject(project.id);
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
        
        // If this project's notes are expanded, show them
        if (this.notesExpandedProjects.has(project.id) && project.notes && project.notes.length > 0) {
            this.createProjectNotesSection(project.id, projectItem);
        }
        
        return projectItem;
    }
};