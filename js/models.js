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
let activeTags = new Set(); // For storing active tag filters
let collapsedProjects = new Set(); // For storing IDs of collapsed projects

/**
 * Tag Operations
 */

// Extract tags from todo text
function extractTags(text) {
    const tagRegex = /\B@([a-zA-Z0-9_-]+)/g;
    const matches = text.match(tagRegex) || [];
    
    // Remove @ from the beginning of each tag
    return matches.map(tag => tag.substring(1));
}

// Get unique tags from all todos
function getAllTags() {
    const tagSet = new Set();
    
    todos.forEach(todo => {
        if (!todo.archived) {
            const tags = todo.tags || [];
            tags.forEach(tag => tagSet.add(tag));
        }
    });
    
    return Array.from(tagSet).sort();
}

// Toggle tag filter state
function toggleTagFilter(tag) {
    if (activeTags.has(tag)) {
        activeTags.delete(tag);
    } else {
        activeTags.add(tag);
    }
    
    UI.renderTodosByProject();
    TagUI.updateTagFilters();
    
    return activeTags.has(tag);
}

// Clear all tag filters
function clearTagFilters() {
    activeTags.clear();
    UI.renderTodosByProject();
    TagUI.updateTagFilters();
}

// Check if a todo should be visible based on tag filters
function shouldShowTodoWithTags(todo) {
    // If no tag filters are active, show all todos
    if (activeTags.size === 0) {
        return true;
    }
    
    // If todo has no tags, don't show when filters are active
    if (!todo.tags || todo.tags.length === 0) {
        return false;
    }
    
    // Check if the todo has at least one of the active tags
    return todo.tags.some(tag => activeTags.has(tag));
}

/**
 * Project Collapse/Expand
 */

// Toggle project collapse state
function toggleProjectCollapse(projectId) {
    if (collapsedProjects.has(projectId)) {
        collapsedProjects.delete(projectId);
    } else {
        collapsedProjects.add(projectId);
    }
    
    // Save the collapsed state to localStorage
    saveCollapsedState();
    
    return !collapsedProjects.has(projectId);
}

// Check if a project is collapsed
function isProjectCollapsed(projectId) {
    return collapsedProjects.has(projectId);
}

// Save collapsed state to localStorage
function saveCollapsedState() {
    localStorage.setItem('collapsedProjects', JSON.stringify(Array.from(collapsedProjects)));
}

// Load collapsed state from localStorage
function loadCollapsedState() {
    const stored = localStorage.getItem('collapsedProjects');
    if (stored) {
        collapsedProjects = new Set(JSON.parse(stored));
    }
}

/**
 * Project Ordering
 */

// Initialize project orders if they don't exist
function initializeProjectOrders() {
    // Check if any projects are missing an order property
    const needsOrdering = projects.some(p => p.order === undefined);
    
    if (needsOrdering) {
        // Sort projects alphabetically but with Inbox first
        const sortedProjects = [...projects].sort((a, b) => {
            if (a.id === 'inbox') return -1;
            if (b.id === 'inbox') return 1;
            return a.name.localeCompare(b.name);
        });
        
        // Assign orders
        sortedProjects.forEach((project, index) => {
            project.order = project.id === 'inbox' ? 0 : index;
        });
        
        // Save changes
        saveChanges();
    }
}

// Move a project up in the order
function moveProjectUp(projectId) {
    // Don't allow reordering the Inbox project
    if (projectId === 'inbox') {
        return;
    }
    
    // Find the project's current position
    const activeProjects = projects.filter(p => !p.archived);
    const sortedProjects = [...activeProjects].sort((a, b) => {
        if (a.id === 'inbox') return -1;
        if (b.id === 'inbox') return 1;
        const aOrder = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
        const bOrder = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
    });
    
    const currentIndex = sortedProjects.findIndex(p => p.id === projectId);
    
    // Can't move up if it's already at the top (after Inbox which is always first)
    if (currentIndex <= 1) {
        return;
    }
    
    // Call reorderProject with the new position
    reorderProject(projectId, currentIndex - 1);
}

// Move a project down in the order
function moveProjectDown(projectId) {
    // Don't allow reordering the Inbox project
    if (projectId === 'inbox') {
        return;
    }
    
    // Find the project's current position
    const activeProjects = projects.filter(p => !p.archived);
    const sortedProjects = [...activeProjects].sort((a, b) => {
        if (a.id === 'inbox') return -1;
        if (b.id === 'inbox') return 1;
        const aOrder = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
        const bOrder = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
    });
    
    const currentIndex = sortedProjects.findIndex(p => p.id === projectId);
    
    // Can't move down if it's already at the bottom
    if (currentIndex >= sortedProjects.length - 1) {
        return;
    }
    
    // Call reorderProject with the new position
    reorderProject(projectId, currentIndex + 1);
}

// Reorder a project to a different position
function reorderProject(projectId, newPosition) {
    console.log(`Reordering project ${projectId} to position ${newPosition}`);
    
    // Don't allow reordering the Inbox project
    if (projectId === 'inbox') {
        return;
    }
    
    // Find the project to move
    const projectToMove = projects.find(p => p.id === projectId);
    if (!projectToMove) {
        console.error(`Project with ID ${projectId} not found`);
        return;
    }
    
    // Get current order and update it
    const activeProjects = projects.filter(p => !p.archived);
    
    // Sort existing projects by order (ensure all projects have an order value)
    const sortedProjects = [...activeProjects].sort((a, b) => {
        if (a.id === 'inbox') return -1;
        if (b.id === 'inbox') return 1;
        const aOrder = a.order !== undefined ? a.order : Number.MAX_SAFE_INTEGER;
        const bOrder = b.order !== undefined ? b.order : Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
    });
    
    // Remove the project we're moving from the sorted list
    const updatedProjects = sortedProjects.filter(p => p.id !== projectId);
    
    // Make sure newPosition is valid
    if (newPosition < 1) {
        newPosition = 1; // Position after Inbox (which is always first)
    } else if (newPosition > updatedProjects.length) {
        newPosition = updatedProjects.length;
    }
    
    // Insert project at the new position
    updatedProjects.splice(newPosition, 0, projectToMove);
    
    // Reassign order values to all projects
    updatedProjects.forEach((project, index) => {
        if (project.id === 'inbox') {
            project.order = 0; // Inbox always has order 0
        } else {
            project.order = index; // Assign sequential order values
        }
    });
    
    // Update the projects array with new order values
    projects = projects.map(project => {
        const updatedProject = updatedProjects.find(p => p.id === project.id);
        if (updatedProject) {
            return { ...project, order: updatedProject.order };
        }
        return project;
    });
    
    console.log("Projects after reordering:", projects.map(p => ({ id: p.id, name: p.name, order: p.order })));
    
    // Save changes
    saveChanges();
    
    // Update UI
    UI.updateProjectsDropdown();
    UI.renderProjects();
    UI.renderTodosByProject();
}

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
    
    // Extract tags from text
    const tags = extractTags(text);
    
    const todo = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        archived: false,
        projectId: projectId,
        notes: "", // Initialize empty notes
        tags: tags,  // Add tags array
        createdAt: new Date().toISOString()
    };
    
    todos.push(todo);
    saveChanges();
    UI.renderTodosByProject();
    
    // Update tag filters UI
    if (TagUI && typeof TagUI.updateTagFilters === 'function') {
        TagUI.updateTagFilters();
    }
}

// Delete a todo
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveChanges();
    UI.renderTodosByProject();
    
    // Update tag filters UI
    if (TagUI && typeof TagUI.updateTagFilters === 'function') {
        TagUI.updateTagFilters();
    }
    
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
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Extract tags from new text
    const tags = extractTags(newText);
    
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { 
                ...todo, 
                text: newText,
                tags: tags,
                projectId: newProjectId || todo.projectId
            };
        }
        return todo;
    });
    
    saveChanges();
    UI.renderTodosByProject();
    
    // Update tag filters UI
    if (TagUI && typeof TagUI.updateTagFilters === 'function') {
        TagUI.updateTagFilters();
    }
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
    if (ArchiveUI && ArchiveUI.isArchiveExpanded) {
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
    
    if (ArchiveUI) {
        ArchiveUI.updateArchiveBadge();
        
        // Update tag filters UI
        if (TagUI && typeof TagUI.updateTagFilters === 'function') {
            TagUI.updateTagFilters();
        }
        
        // If archive is expanded, update the archive view
        if (ArchiveUI.isArchiveExpanded) {
            ArchiveUI.renderArchivedTodos();
        }
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
    
    if (ArchiveUI) {
        ArchiveUI.updateArchiveBadge();
        
        // Update tag filters UI
        if (TagUI && typeof TagUI.updateTagFilters === 'function') {
            TagUI.updateTagFilters();
        }
        
        // If archive is expanded, update the archive view
        if (ArchiveUI.isArchiveExpanded) {
            ArchiveUI.renderArchivedTodos();
        }
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
        order: 0, // Inbox is always first
        createdAt: new Date().toISOString()
    };
    
    projects.push(inboxProject);
    Storage.saveToLocalStorage();
}

// Add a new project
function addProject(name, color) {
    // Calculate the highest order value for placement
    const highestOrder = Math.max(0, ...projects.map(p => p.order || 0));
    
    const project = {
        id: Date.now().toString(),
        name: name,
        color: color || '#BB86FC', // Default to dark theme primary color
        notes: "", // Initialize empty notes
        isDefault: false,
        archived: false,
        order: highestOrder + 1, // Place at the end of the list
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
    
    if (ArchiveUI) {
        ArchiveUI.updateArchiveBadge();
        
        // Update tag filters UI
        if (TagUI && typeof TagUI.updateTagFilters === 'function') {
            TagUI.updateTagFilters();
        }
        
        // If archive is expanded, update the archive view
        if (ArchiveUI.isArchiveExpanded) {
            ArchiveUI.renderArchivedTodos();
        }
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
    
    if (ArchiveUI) {
        ArchiveUI.updateArchiveBadge();
        
        // Update tag filters UI
        if (TagUI && typeof TagUI.updateTagFilters === 'function') {
            TagUI.updateTagFilters();
        }
        
        // If archive is expanded, update the archive view
        if (ArchiveUI.isArchiveExpanded) {
            ArchiveUI.renderArchivedTodos();
        }
    }
}

// Delete a project
function deleteProject(id) {
    console.log("Deleting project:", id);
    
    // Don't allow deleting the Inbox project
    if (id === 'inbox') {
        if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
            UI.showStatusMessage('Cannot delete the Inbox project.', 'danger');
        }
        return;
    }
    
    // Ensure inbox project exists
    let inboxProject = window.projects.find(p => p.id === 'inbox');
    if (!inboxProject) {
        // Create inbox project if it doesn't exist
        console.log("Creating Inbox project because it's missing");
        inboxProject = {
            id: 'inbox',
            name: 'Inbox',
            color: '#03DAC6',
            notes: "",
            isDefault: true,
            archived: false,
            order: 0,
            createdAt: new Date().toISOString()
        };
        window.projects.push(inboxProject);
    }
    
    console.log("Before delete, projects count:", window.projects.length);
    console.log("Projects before:", window.projects.map(p => p.id));
    
    // Find the project to delete (for debugging)
    const projectToDelete = window.projects.find(p => p.id === id);
    if (!projectToDelete) {
        console.error("Project not found for deletion:", id);
        return;
    }
    
    // Remove the project
    window.projects = window.projects.filter(project => project.id !== id);
    
    console.log("After delete, projects count:", window.projects.length);
    console.log("Projects after:", window.projects.map(p => p.id));
    
    // Move todos from this project to Inbox
    window.todos = window.todos.map(todo => {
        if (todo.projectId === id) {
            return { ...todo, projectId: inboxProject.id };
        }
        return todo;
    });
    
    // Save changes to storage
    if (typeof saveChanges === 'function') {
        saveChanges();
    } else if (typeof Storage !== 'undefined' && typeof Storage.saveToLocalStorage === 'function') {
        Storage.saveToLocalStorage();
    } else {
        console.error("No way to save changes after deleting project");
    }
    
    // Update UI
    if (typeof UI !== 'undefined') {
        if (typeof UI.updateProjectsDropdown === 'function') {
            UI.updateProjectsDropdown();
        }
        
        if (typeof UI.renderProjects === 'function') {
            UI.renderProjects();
        }
        
        if (typeof UI.renderTodosByProject === 'function') {
            UI.renderTodosByProject();
        }
        
        if (typeof UI.showStatusMessage === 'function') {
            UI.showStatusMessage(`Project "${projectToDelete.name}" deleted successfully.`, 'success');
        }
    }
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