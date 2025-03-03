/**
 * todo-ui.js - Handles UI operations related to todos
 */

// TodoUI module
const TodoUI = {
    elements: null,
    
    // Initialize with UI elements
    init: function(elements) {
        this.elements = elements;
    },
    
    // Render todos grouped by project
    renderByProject: function() {
        const todoProjectsContainer = this.elements.todoProjectsContainer;
        todoProjectsContainer.innerHTML = '';
        
        // Group todos by project
        const todosByProject = {};
        
        // Initialize with all active projects (non-archived ones)
        projects.filter(p => !p.archived).forEach(project => {
            todosByProject[project.id] = {
                project: project,
                todos: []
            };
        });
        
        // Add todos to their projects (only non-archived todos)
        todos.filter(todo => !todo.archived).forEach(todo => {
            // Check if this todo should be shown based on tag filters
            if (activeTags && activeTags.size > 0 && !shouldShowTodoWithTags(todo)) {
                return; // Skip this todo if it doesn't match tag filters
            }
            
            // Find the project this todo belongs to
            const project = projects.find(p => p.id === todo.projectId);
            
            // If project exists and is not archived, add todo to its group
            if (project && !project.archived && todosByProject[todo.projectId]) {
                todosByProject[todo.projectId].todos.push(todo);
            } else {
                // If project doesn't exist or is archived, move todo to Inbox
                const inboxProject = projects.find(p => p.id === 'inbox');
                if (inboxProject) {
                    todo.projectId = inboxProject.id;
                    todosByProject[inboxProject.id].todos.push(todo);
                }
            }
        });
        
        // Sort projects with Inbox always first, then by order property
        const sortedProjects = Object.values(todosByProject).sort((a, b) => {
            if (a.project.id === 'inbox') return -1;
            if (b.project.id === 'inbox') return 1;
            
            // Sort by order property if available
            const aOrder = a.project.order || Number.MAX_SAFE_INTEGER;
            const bOrder = b.project.order || Number.MAX_SAFE_INTEGER;
            if (aOrder !== bOrder) {
                return aOrder - bOrder;
            }
            
            // Fall back to alphabetical
            return a.project.name.localeCompare(b.project.name);
        });
        
        // Render each project section
        sortedProjects.forEach(({ project, todos }) => {
            // Skip empty projects when filters are active
            if (activeTags && activeTags.size > 0 && todos.length === 0) {
                return;
            }
            
            const projectSection = document.createElement('div');
            projectSection.className = 'project-container';
            projectSection.id = `project-section-${project.id}`;
            
            const projectHeader = document.createElement('div');
            projectHeader.className = 'card-header d-flex justify-content-between align-items-center mb-2 project-header';
            
            // Create left side of header with project info
            const projectTitleSection = document.createElement('div');
            projectTitleSection.className = 'd-flex align-items-center';
            
            // Add collapse/expand toggle
            const collapseToggle = document.createElement('button');
            collapseToggle.className = 'btn btn-sm btn-link text-decoration-none me-1 collapse-toggle';
            
            // Check if collapsedProjects is defined before using it
            const isCollapsed = typeof collapsedProjects !== 'undefined' && collapsedProjects.has(project.id);
            
            collapseToggle.innerHTML = isCollapsed 
                ? '<i class="bi bi-chevron-right"></i>' 
                : '<i class="bi bi-chevron-down"></i>';
            collapseToggle.title = isCollapsed ? 'Expand' : 'Collapse';
            collapseToggle.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleProjectCollapse(project.id);
            };
            
            // Create a link to the project
            const projectTitle = document.createElement('h5');
            projectTitle.className = 'mb-0 d-flex align-items-center';
            projectTitle.innerHTML = `
                <span class="project-color" style="background-color: ${project.color}"></span>
                ${project.name} 
                <span class="badge bg-secondary rounded-pill ms-2">${todos.length}</span>
            `;
            
            // If project has notes, add a notes indicator
            if (project.notes && project.notes.length > 0 && typeof NotesUI !== 'undefined') {
                const notesIndicator = document.createElement('button');
                notesIndicator.className = 'btn btn-sm btn-outline-info ms-2';
                notesIndicator.innerHTML = '<i class="bi bi-sticky"></i>';
                notesIndicator.title = 'Project has notes';
                notesIndicator.onclick = (e) => {
                    e.preventDefault();
                    if (typeof ProjectUI !== 'undefined') {
                        ProjectUI.openProjectNotesModal(project.id);
                    }
                };
                projectTitle.appendChild(notesIndicator);
            }
            
            projectTitleSection.appendChild(collapseToggle);
            projectTitleSection.appendChild(projectTitle);
            
            // Add project reordering buttons
            const projectActionButtons = document.createElement('div');
            projectActionButtons.className = 'project-actions';
            
            if (project.id !== 'inbox') {
                // Move up button
                const moveUpButton = document.createElement('button');
                moveUpButton.className = 'btn btn-sm btn-outline-secondary me-1';
                moveUpButton.innerHTML = '<i class="bi bi-arrow-up"></i>';
                moveUpButton.title = 'Move Up';
                moveUpButton.onclick = (e) => {
                    e.preventDefault();
                    
                    // Find current position
                    const currentIndex = sortedProjects.findIndex(p => p.project.id === project.id);
                    if (currentIndex > 1) { // Skip moving if already at top (after Inbox)
                        reorderProject(project.id, currentIndex - 1);
                    }
                };
                
                // Move down button
                const moveDownButton = document.createElement('button');
                moveDownButton.className = 'btn btn-sm btn-outline-secondary';
                moveDownButton.innerHTML = '<i class="bi bi-arrow-down"></i>';
                moveDownButton.title = 'Move Down';
                moveDownButton.onclick = (e) => {
                    e.preventDefault();
                    
                    // Find current position
                    const currentIndex = sortedProjects.findIndex(p => p.project.id === project.id);
                    if (currentIndex < sortedProjects.length - 1) { // Skip moving if already at bottom
                        reorderProject(project.id, currentIndex + 1);
                    }
                };
                
                projectActionButtons.appendChild(moveUpButton);
                projectActionButtons.appendChild(moveDownButton);
            }
            
            projectHeader.appendChild(projectTitleSection);
            projectHeader.appendChild(projectActionButtons);
            
            // Create dropzone for this project
            const dropzone = document.createElement('div');
            dropzone.className = 'dropzone';
            dropzone.id = `dropzone-${project.id}`;
            dropzone.setAttribute('data-project-id', project.id);
            
            // Apply collapse state
            if (isCollapsed) {
                dropzone.classList.add('collapsed');
                dropzone.style.display = 'none';
            }
            
            // Attach drag and drop events
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('drag-over');
            });
            
            dropzone.addEventListener('dragleave', (e) => {
                // Only remove the class if we're not dragging over a child element
                if (!e.relatedTarget || !dropzone.contains(e.relatedTarget)) {
                    dropzone.classList.remove('drag-over');
                }
            });
            
            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('drag-over');
                
                const todoId = e.dataTransfer.getData('text/plain');
                const sourceProjectId = e.dataTransfer.getData('source-project');
                
                // Check if this is the same project and handle reordering
                if (sourceProjectId === project.id) {
                    // Find position in project where item was dropped
                    this.handleTodoReordering(todoId, project.id, e.clientY);
                } else {
                    // Move to another project
                    moveTodoToProject(todoId, project.id);
                }
            });
            
            // Add todo items to the project section
            if (todos.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-list-message';
                
                if (activeTags && activeTags.size > 0) {
                    emptyMessage.textContent = 'No tasks with selected tags in this project.';
                } else {
                    emptyMessage.textContent = 'No tasks in this project. Drag tasks here or add new ones.';
                }
                
                dropzone.appendChild(emptyMessage);
            } else {
                todos.forEach(todo => {
                    const todoItem = this.createTodoItem(todo, project);
                    dropzone.appendChild(todoItem);
                });
            }
            
            projectSection.appendChild(projectHeader);
            projectSection.appendChild(dropzone);
            todoProjectsContainer.appendChild(projectSection);
        });
        
        // If no projects are shown due to tag filters, show a message
        if (activeTags && activeTags.size > 0 && todoProjectsContainer.children.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'alert alert-info';
            emptyMessage.innerHTML = '<i class="bi bi-info-circle me-2"></i>No tasks found with the selected tags.';
            todoProjectsContainer.appendChild(emptyMessage);
        }
    },
    
    // Toggle project collapse state
    toggleProjectCollapse: function(projectId) {
        // Check if toggleProjectCollapse function exists before calling it
        if (typeof toggleProjectCollapse !== 'function') {
            console.error('toggleProjectCollapse function is not defined');
            return;
        }
        
        const isExpanded = toggleProjectCollapse(projectId);
        const projectSection = document.getElementById(`project-section-${projectId}`);
        if (!projectSection) return;
        
        const collapseToggle = projectSection.querySelector('.collapse-toggle');
        const dropzone = document.getElementById(`dropzone-${projectId}`);
        
        if (isExpanded) {
            // Project is now expanded
            collapseToggle.innerHTML = '<i class="bi bi-chevron-down"></i>';
            collapseToggle.title = 'Collapse';
            dropzone.style.display = 'block';
            dropzone.classList.remove('collapsed');
        } else {
            // Project is now collapsed
            collapseToggle.innerHTML = '<i class="bi bi-chevron-right"></i>';
            collapseToggle.title = 'Expand';
            dropzone.style.display = 'none';
            dropzone.classList.add('collapsed');
        }
    },

    // Create a todo item element
    createTodoItem: function(todo, project) {
        const todoElement = document.createElement('div');
        todoElement.className = 'card todo-card shadow-sm';
        todoElement.id = `todo-${todo.id}`;
        todoElement.style.borderLeftColor = project.color;
        
        // Make the todo draggable
        todoElement.draggable = true;
        todoElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', todo.id);
            e.dataTransfer.setData('source-project', todo.projectId);
            
            // Set effectAllowed to indicate this is a move operation
            e.dataTransfer.effectAllowed = 'move';
            
            todoElement.classList.add('dragging');
            
            // Delay hiding to ensure drag image is captured
            requestAnimationFrame(() => {
                todoElement.style.opacity = '0.4';
            });
        });
        
        todoElement.addEventListener('dragend', () => {
            todoElement.classList.remove('dragging');
            todoElement.style.opacity = '1';
        });
        
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body p-2';
        
        const row = document.createElement('div');
        row.className = 'd-flex align-items-center';
        
        // Checkbox for completion status
        const checkboxCol = document.createElement('div');
        checkboxCol.className = 'me-3';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleComplete(todo.id));
        checkboxCol.appendChild(checkbox);
        
        // Todo text
        const textCol = document.createElement('div');
        textCol.className = 'todo-text';
        
        // Replace @tags with highlighted spans for display
        const displayText = todo.text.replace(/(\B@[a-zA-Z0-9_-]+\b)/g, '<span class="tag-reference">$1</span>');
        textCol.innerHTML = displayText;
        
        if (todo.completed) {
            textCol.classList.add('completed');
        }
        
        // Double-click to edit
        textCol.addEventListener('dblclick', () => {
            if (!editingTodoId) {
                this.startInlineEditing(todo.id);
            }
        });
        
        // Action buttons
        const actionCol = document.createElement('div');
        actionCol.className = 'action-buttons ms-auto';
        
        // Notes button
        const notesButton = document.createElement('button');
        notesButton.className = 'btn btn-sm btn-outline-info me-1';
        notesButton.innerHTML = '<i class="bi bi-sticky"></i>';
        notesButton.title = 'Add Notes';
        notesButton.addEventListener('click', () => {
            if (typeof NotesUI !== 'undefined') {
                NotesUI.openNotesModal(todo.id);
            }
        });
        
        actionCol.appendChild(notesButton);
        
        // Show archive button for completed todos
        if (todo.completed) {
            const archiveButton = document.createElement('button');
            archiveButton.className = 'btn btn-sm btn-outline-secondary me-1';
            archiveButton.innerHTML = '<i class="bi bi-archive"></i>';
            archiveButton.title = 'Archive';
            archiveButton.addEventListener('click', () => {
                archiveTodo(todo.id);
            });
            
            actionCol.appendChild(archiveButton);
        }
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-outline-danger';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTodo(todo.id);
            }
        });
        
        actionCol.appendChild(deleteButton);
        
        row.appendChild(checkboxCol);
        row.appendChild(textCol);
        row.appendChild(actionCol);
        
        cardBody.appendChild(row);
        
        // Add tag pills if the todo has tags
        if (todo.tags && todo.tags.length > 0 && typeof TagUI !== 'undefined') {
            const tagPills = TagUI.createTagPills(todo.tags);
            if (tagPills) {
                cardBody.appendChild(tagPills);
            }
        }
        
        todoElement.appendChild(cardBody);
        
        // Add notes preview if notes exist
        if (typeof NotesUI !== 'undefined' && todo.notes && todo.notes.length > 0) {
            NotesUI.addNotesIndicator(todoElement, todo);
        }
        
        return todoElement;
    },
    
    // Handle todo reordering within a project
    handleTodoReordering: function(todoId, projectId, dropY) {
        // Get all todos in this project
        const projectTodos = todos.filter(t => t.projectId === projectId);
        
        // Get all todo elements in this project's dropzone
        const dropzone = document.getElementById(`dropzone-${projectId}`);
        const todoElements = dropzone.querySelectorAll('.todo-card');
        
        // Find position to insert the todo
        let insertPosition = projectTodos.length; // Default to end
        
        for (let i = 0; i < todoElements.length; i++) {
            const element = todoElements[i];
            const rect = element.getBoundingClientRect();
            const elemMiddle = rect.top + (rect.height / 2);
            
            if (dropY < elemMiddle) {
                // Get the position in the array corresponding to this element
                const elementId = element.id.replace('todo-', '');
                insertPosition = projectTodos.findIndex(t => t.id === elementId);
                break;
            }
        }
        
        // Get the todo being moved
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;
        
        // Remove todo from the array
        todos = todos.filter(t => t.id !== todoId);
        
        // Find where to insert it
        const firstTodos = todos.filter(t => t.projectId !== projectId);
        const projectTodosWithoutMovedItem = todos.filter(t => t.projectId === projectId);
        
        // Insert at the correct position in the project todos
        projectTodosWithoutMovedItem.splice(insertPosition, 0, todo);
        
        // Rebuild todos array
        todos = [...firstTodos, ...projectTodosWithoutMovedItem];
        
        // Save changes
        saveChanges();
        this.renderByProject();
    },
    
    // Start inline editing
    startInlineEditing: function(todoId) {
        editingTodoId = todoId;
        const todo = todos.find(t => t.id === todoId);
        const todoElement = document.getElementById(`todo-${todoId}`);
        const todoTextElement = todoElement.querySelector('.todo-text');
        
        // Store the original text
        const originalText = todo.text;
        
        // Create an input field
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.className = 'form-control inline-edit-input';
        inputField.value = originalText;
        
        // Replace the text with the input field
        todoTextElement.innerHTML = '';
        todoTextElement.appendChild(inputField);
        
        // Focus the input field
        inputField.focus();
        
        // Helper function to save edit
        const saveEdit = () => {
            const newText = inputField.value.trim();
            if (newText) {
                editTodo(todoId, newText);
            } else {
                // If empty, restore original
                todoTextElement.textContent = originalText;
            }
            editingTodoId = null;
        };
        
        // Handle saving on enter, canceling on escape
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                todoTextElement.textContent = originalText;
                editingTodoId = null;
            }
        });
        
        // Handle clicking outside
        document.addEventListener('click', function handleClickOutside(event) {
            if (editingTodoId === todoId && !inputField.contains(event.target)) {
                saveEdit();
                document.removeEventListener('click', handleClickOutside);
            }
        });
    }
};