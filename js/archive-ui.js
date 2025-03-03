/**
 * archive-ui.js - Handles UI operations related to archived todos and projects
 */

// ArchiveUI module
const ArchiveUI = {
    elements: null,
    isArchiveExpanded: false,
    
    // Initialize with UI elements
    init: function(elements) {
        this.elements = elements;
        
        // Create archive container if it doesn't exist yet
        if (!document.getElementById('archive-container')) {
            this.createArchiveContainer();
        }
    },
    
    // Create the archive container in the DOM
    createArchiveContainer: function() {
        const todoProjectsContainer = this.elements.todoProjectsContainer;
        const parentElement = todoProjectsContainer.parentNode;
        
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
        
        // Update the badge to show/hide based on archived item count
        this.updateArchiveBadge();
    },
    
    // Toggle archive section visibility
    toggleArchiveSection: function() {
        const archiveContent = document.getElementById('archive-content');
        const toggleButton = document.getElementById('archive-toggle-button');
        
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
        archiveContent.innerHTML = '';
        
        // Get all archived todos
        const archivedTodos = todos.filter(todo => todo.archived);
        
        // Get all archived projects
        const archivedProjects = projects.filter(project => project.archived);
        
        // Check if there are any archived items
        if (archivedTodos.length === 0 && archivedProjects.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'alert alert-light text-center';
            emptyMessage.textContent = 'No archived items yet.';
            archiveContent.appendChild(emptyMessage);
            return;
        }
        
        // Create section for archived projects if any
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
            
            // Render each archived project
            archivedProjects.forEach(project => {
                const projectItem = this.createArchivedProjectItem(project);
                archivedProjectsSection.appendChild(projectItem);
            });
            
            archiveContent.appendChild(archivedProjectsSection);
        }
        
        // Group todos by project
        const todosByProject = {};
        
        // Get unique projects that have archived todos
        const projectIds = [...new Set(archivedTodos.map(todo => todo.projectId))];
        
        // Initialize project groups
        projectIds.forEach(projectId => {
            const project = projects.find(p => p.id === projectId);
            if (project) {
                todosByProject[projectId] = {
                    project: project,
                    todos: []
                };
            }
        });
        
        // Add todos to their projects
        archivedTodos.forEach(todo => {
            if (todo.projectId && todosByProject[todo.projectId]) {
                todosByProject[todo.projectId].todos.push(todo);
            }
        });
        
        // If there are archived todos, add a header
        if (archivedTodos.length > 0) {
            const todosHeader = document.createElement('div');
            todosHeader.className = 'card-header d-flex justify-content-between align-items-center mb-2 project-header';
            todosHeader.innerHTML = `
                <h6 class="mb-0">
                    <i class="bi bi-check2-square me-2"></i>
                    Archived Todos 
                    <span class="badge bg-secondary rounded-pill ms-2">${archivedTodos.length}</span>
                </h6>
            `;
            
            archiveContent.appendChild(todosHeader);
        }
        
        // Sort projects with Inbox always first
        const sortedProjects = Object.values(todosByProject).sort((a, b) => {
            if (a.project.id === 'inbox') return -1;
            if (b.project.id === 'inbox') return 1;
            return a.project.name.localeCompare(b.project.name);
        });
        
        // Render each project section
        sortedProjects.forEach(({ project, todos }) => {
            const projectSection = document.createElement('div');
            projectSection.className = 'project-container';
            
            // Create project header
            const projectHeader = document.createElement('div');
            projectHeader.className = 'card-header d-flex justify-content-between align-items-center mb-2 project-header';
            projectHeader.innerHTML = `
                <h6 class="mb-0">
                    <span class="project-color" style="background-color: ${project.color}"></span>
                    ${project.name} 
                    <span class="badge bg-secondary rounded-pill ms-2">${todos.length}</span>
                </h6>
            `;
            
            // Create todos container
            const todosContainer = document.createElement('div');
            todosContainer.className = 'archive-todos';
            
            // Add each todo
            todos.forEach(todo => {
                const todoItem = this.createArchivedTodoItem(todo, project);
                todosContainer.appendChild(todoItem);
            });
            
            // Assemble project section
            projectSection.appendChild(projectHeader);
            projectSection.appendChild(todosContainer);
            
            // Add to archive content
            archiveContent.appendChild(projectSection);
        });
    },
    
    // Create an archived project item
    createArchivedProjectItem: function(project) {
        const projectItem = document.createElement('div');
        projectItem.className = 'card mb-2 archived-project';
        projectItem.id = `archived-project-${project.id}`;
        projectItem.style.borderLeftColor = project.color;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-2';
        
        const row = document.createElement('div');
        row.className = 'd-flex align-items-center';
        
        // Project info
        const projectInfo = document.createElement('div');
        projectInfo.className = 'd-flex align-items-center flex-grow-1';
        
        const colorIndicator = document.createElement('span');
        colorIndicator.className = 'project-color';
        colorIndicator.style.backgroundColor = project.color;
        
        const projectName = document.createElement('span');
        projectName.className = 'project-name';
        projectName.textContent = project.name;
        
        projectInfo.appendChild(colorIndicator);
        projectInfo.appendChild(projectName);
        
        // Action buttons
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons ms-auto';
        
        // Notes button
        const notesButton = document.createElement('button');
        notesButton.className = 'btn btn-sm btn-outline-info me-1';
        notesButton.innerHTML = '<i class="bi bi-sticky"></i>';
        notesButton.title = 'View Project Notes';
        notesButton.onclick = () => {
            ProjectUI.openProjectNotesModal(project.id);
        };
        
        // Unarchive button
        const unarchiveButton = document.createElement('button');
        unarchiveButton.className = 'btn btn-sm btn-outline-primary me-1';
        unarchiveButton.innerHTML = '<i class="bi bi-arrow-up-square"></i>';
        unarchiveButton.title = 'Unarchive Project';
        unarchiveButton.addEventListener('click', () => {
            unarchiveProject(project.id);
        });
        
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
        
        actionButtons.appendChild(notesButton);
        actionButtons.appendChild(unarchiveButton);
        actionButtons.appendChild(deleteButton);
        
        row.appendChild(projectInfo);
        row.appendChild(actionButtons);
        
        cardBody.appendChild(row);
        
        // Add notes preview if any
        if (project.notes && project.notes.length > 0) {
            const notesPreview = document.createElement('div');
            notesPreview.className = 'notes-preview mt-1 small';
            notesPreview.innerHTML = `<i class="bi bi-sticky"></i> ${project.notes.length > 50 ? project.notes.substring(0, 50) + '...' : project.notes}`;
            cardBody.appendChild(notesPreview);
        }
        
        projectItem.appendChild(cardBody);
        return projectItem;
    },
    
    // Update archive visibility badge
    updateArchiveBadge: function() {
        const archiveContainer = document.getElementById('archive-container');
        if (!archiveContainer) return;
        
        const titleElement = archiveContainer.querySelector('.archive-title');
        if (!titleElement) return;
        
        // Count archived items
        const archivedTodoCount = todos.filter(todo => todo.archived).length;
        const archivedProjectCount = projects.filter(project => project.archived).length;
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
    },
    
    // Create a UI element for an archived todo
    createArchivedTodoItem: function(todo, project) {
        const todoElement = document.createElement('div');
        todoElement.className = 'card todo-card shadow-sm archived-todo';
        todoElement.id = `archived-todo-${todo.id}`;
        todoElement.style.borderLeftColor = project.color;
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-2';
        
        const row = document.createElement('div');
        row.className = 'd-flex align-items-center';
        
        // Todo text with completion indicator
        const textCol = document.createElement('div');
        textCol.className = 'todo-text completed';
        
        // Replace @tags with highlighted spans for display
        const displayText = todo.text.replace(/(\B@[a-zA-Z0-9_-]+\b)/g, '<span class="tag-reference">$1</span>');
        textCol.innerHTML = displayText;
        
        // Action buttons
        const actionCol = document.createElement('div');
        actionCol.className = 'action-buttons ms-auto';
        
        // Notes button
        const notesButton = document.createElement('button');
        notesButton.className = 'btn btn-sm btn-outline-info me-1';
        notesButton.innerHTML = '<i class="bi bi-sticky"></i>';
        notesButton.title = 'View/Edit Notes';
        notesButton.onclick = () => {
            NotesUI.openNotesModal(todo.id);
        };
        
        const unarchiveButton = document.createElement('button');
        unarchiveButton.className = 'btn btn-sm btn-outline-primary me-1';
        unarchiveButton.innerHTML = '<i class="bi bi-arrow-up-square"></i>';
        unarchiveButton.title = 'Unarchive';
        unarchiveButton.onclick = () => {
            unarchiveTodo(todo.id);
        };
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-outline-danger';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.onclick = () => {
            if (confirm('Are you sure you want to delete this archived task?')) {
                deleteTodo(todo.id);
            }
        };
        
        actionCol.appendChild(notesButton);
        actionCol.appendChild(unarchiveButton);
        actionCol.appendChild(deleteButton);
        
        row.appendChild(textCol);
        row.appendChild(actionCol);
        
        cardBody.appendChild(row);
        
        // Add tag pills if the todo has tags
        if (todo.tags && todo.tags.length > 0 && TagUI) {
            const tagPills = TagUI.createTagPills(todo.tags);
            if (tagPills) {
                cardBody.appendChild(tagPills);
            }
        }
        
        todoElement.appendChild(cardBody);
        
        // Add notes preview if notes exist
        if (NotesUI && todo.notes && todo.notes.length > 0) {
            NotesUI.addNotesIndicator(todoElement, todo);
        }
        
        return todoElement;
    }
};