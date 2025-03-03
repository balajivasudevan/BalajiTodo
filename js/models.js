/**
 * models.js - Contains data models and operations for todos and projects
 */

// Global data structures
let todos = [];
let projects = [];
let filePath = '';
let fileHandle = null;
let editingTodoId = null;
let editingProjectId = null;

/**
 * Todo Operations
 */

// Add a new todo
function addTodo(text, projectId) {
    // If no project is selected, use the Inbox project
    if (!projectId) {
        const inboxProject = projects.find(p => p.id === 'inbox');
        if (inboxProject) {
            projectId = inboxProject.id;
        }
    }
    
    const todo = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        archived: false,
        projectId: projectId,
        notes: "", // Initialize empty notes
        createdAt: new Date().toISOString()
    };
    
    todos.push(todo);
    saveChanges();
    UI.renderTodosByProject();
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveChanges();
    UI.renderTodosByProject();
    
    // Update archive if needed
    if (ArchiveUI && typeof ArchiveUI.updateArchiveBadge === 'function') {
        ArchiveUI.updateArchiveBadge();
        if (ArchiveUI.isArchiveExpanded) {
            ArchiveUI.renderArchivedTodos();
        }
    }
}

// Toggle todo completion status
function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    
    saveChanges();
    UI.renderTodosByProject();
}

// Edit a todo
function editTodo(id, newText, newProjectId) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { 
                ...todo, 
                text: newText,
                projectId: newProjectId || todo.projectId
            };
        }
        return todo;
    });
    
    saveChanges();
    UI.renderTodosByProject();
}

// Add or update notes for a todo
function updateTodoNotes(id, notes) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, notes: notes };
        }
        return todo;
    });
    
    saveChanges();
    UI.renderTodosByProject();
    
    // If visible in archive, update that too
    if (ArchiveUI.isArchiveExpanded) {
        ArchiveUI.renderArchivedTodos();
    }
}

// Move todo to another project
function moveTodoToProject(todoId, newProjectId) {
    // If same project, do nothing (reordering is handled separately)
    const todo = todos.find(t => t.id === todoId);
    if (todo && todo.projectId === newProjectId) {
        return;
    }
    
    todos = todos.map(todo => {
        if (todo.id === todoId) {
            return { ...todo, projectId: newProjectId };
        }
        return todo;
    });
    
    saveChanges();
    UI.renderTodosByProject();
}

/**
 * Archive Operations
 */

// Archive a completed todo
function archiveTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, archived: true };
        }
        return todo;
    });
    
    saveChanges();
    UI.renderTodosByProject();
    ArchiveUI.updateArchiveBadge();
    
    // If archive is expanded, update the archive view
    if (ArchiveUI.isArchiveExpanded) {
        ArchiveUI.renderArchivedTodos();
    }
}

// Unarchive a todo and return it to active todos
function unarchiveTodo(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, archived: false };
        }
        return todo;
    });
    
    saveChanges();
    UI.renderTodosByProject();
    ArchiveUI.updateArchiveBadge();
    
    // If archive is expanded, update the archive view
    if (ArchiveUI.isArchiveExpanded) {
        ArchiveUI.renderArchivedTodos();
    }
}

/**
 * Project Operations
 */

// Create default Inbox project
function createInboxProject() {
    const inboxProject = {
        id: 'inbox',
        name: 'Inbox',
        color: '#03DAC6', // Dark theme color
        notes: "",
        isDefault: true,
        archived: false,
        createdAt: new Date().toISOString()
    };
    
    projects.push(inboxProject);
    Storage.saveToLocalStorage();
}

// Add a new project
function addProject(name, color) {
    const project = {
        id: Date.now().toString(),
        name: name,
        color: color || '#BB86FC', // Default to dark theme primary color
        notes: "", // Initialize empty notes
        isDefault: false,
        archived: false,
        createdAt: new Date().toISOString()
    };
    
    projects.push(project);
    saveChanges();
    UI.updateProjectsDropdown();
    UI.renderProjects();
    UI.renderTodosByProject();
    return project;
}

// Edit a project
function editProject(id, newName) {
    projects = projects.map(project => {
        if (project.id === id) {
            return { ...project, name: newName };
        }
        return project;
    });
    
    saveChanges();
    UI.updateProjectsDropdown();
    UI.renderProjects();
    UI.renderTodosByProject();
}

// Update project notes
function updateProjectNotes(id, notes) {
    projects = projects.map(project => {
        if (project.id === id) {
            return { ...project, notes: notes };
        }
        return project;
    });
    
    saveChanges();
    UI.renderProjects();
}

// Archive a project and all its todos
function archiveProject(id) {
    // Don't allow archiving the Inbox project
    if (id === 'inbox') {
        UI.showStatusMessage('Cannot archive the Inbox project.', 'danger');
        return false;
    }
    
    // Check if there are any incomplete todos in this project
    const projectTodos = todos.filter(todo => todo.projectId === id && !todo.archived);
    const hasIncompleteTodos = projectTodos.some(todo => !todo.completed);
    
    if (hasIncompleteTodos) {
        UI.showStatusMessage('Cannot archive project with incomplete tasks.', 'warning');
        return false;
    }
    
    // Archive the project
    projects = projects.map(project => {
        if (project.id === id) {
            return { ...project, archived: true };
        }
        return project;
    });
    
    // Archive all todos in this project
    todos = todos.map(todo => {
        if (todo.projectId === id && !todo.archived) {
            return { ...todo, archived: true };
        }
        return todo;
    });
    
    saveChanges();
    UI.updateProjectsDropdown();
    UI.renderProjects();
    UI.renderTodosByProject();
    ArchiveUI.updateArchiveBadge();
    
    // If archive is expanded, update the archive view
    if (ArchiveUI.isArchiveExpanded) {
        ArchiveUI.renderArchivedTodos();
    }
    
    return true;
}

// Unarchive a project and all its todos
function unarchiveProject(id) {
    // Unarchive the project
    projects = projects.map(project => {
        if (project.id === id) {
            return { ...project, archived: false };
        }
        return project;
    });
    
    // Unarchive all todos in this project
    todos = todos.map(todo => {
        if (todo.projectId === id && todo.archived) {
            return { ...todo, archived: false };
        }
        return todo;
    });
    
    saveChanges();
    UI.updateProjectsDropdown();
    UI.renderProjects();
    UI.renderTodosByProject();
    ArchiveUI.updateArchiveBadge();
    
    // If archive is expanded, update the archive view
    if (ArchiveUI.isArchiveExpanded) {
        ArchiveUI.renderArchivedTodos();
    }
}

// Delete a project
function deleteProject(id) {
    // Don't allow deleting the Inbox project
    if (id === 'inbox') {
        UI.showStatusMessage('Cannot delete the Inbox project.', 'danger');
        return;
    }
    
    // Find the Inbox project to move tasks to
    const inboxProject = projects.find(p => p.id === 'inbox');
    
    if (!inboxProject) {
        UI.showStatusMessage('Error: Inbox project not found.', 'danger');
        return;
    }
    
    // Remove the project
    projects = projects.filter(project => project.id !== id);
    
    // Move todos from this project to Inbox
    todos = todos.map(todo => {
        if (todo.projectId === id) {
            return { ...todo, projectId: inboxProject.id };
        }
        return todo;
    });
    
    saveChanges();
    UI.updateProjectsDropdown();
    UI.renderProjects();
    UI.renderTodosByProject();
}

// Combined save function for autosave
async function saveChanges() {
    // Always save to localStorage
    Storage.saveToLocalStorage();
    
    // If we have a file handle, save to file too
    if (fileHandle) {
        await Storage.saveToFile(false);
    }
}