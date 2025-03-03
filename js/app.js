/**
 * app.js - Main application file that initializes the app and sets up event listeners
 */

// Initialize the application when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    // Small delay to ensure all scripts are loaded
    setTimeout(initApp, 100);
});

function initApp() {
    console.log("Initializing Todo App...");
    
    // IMPORTANT: Load data from localStorage FIRST before initializing UI
    if (typeof Storage !== 'undefined' && typeof Storage.loadFromLocalStorage === 'function') {
        console.log("Loading data from localStorage...");
        Storage.loadFromLocalStorage();
    } else {
        console.error("Storage module not found or loadFromLocalStorage method missing");
        
        // Initialize default data structures if missing
        if (typeof window.todos === 'undefined' || !Array.isArray(window.todos)) {
            console.log("Creating default todos array");
            window.todos = [];
        }
        
        if (typeof window.projects === 'undefined' || !Array.isArray(window.projects)) {
            console.log("Creating default projects array");
            window.projects = [];
            
            // Create inbox project if there are no projects
            if (typeof createInboxProject === 'function') {
                console.log("Creating default Inbox project");
                createInboxProject();
            }
        }
    }
    
    // Load project collapse state
    if (typeof loadCollapsedState === 'function') {
        loadCollapsedState();
    } else {
        console.warn("loadCollapsedState function not found");
        // Create default if it doesn't exist
        if (typeof window.collapsedProjects === 'undefined') {
            window.collapsedProjects = new Set();
        }
    }
    
    // Initialize project ordering
    if (typeof initializeProjectOrders === 'function') {
        initializeProjectOrders();
    } else {
        console.warn("initializeProjectOrders function not found");
    }
    
    // Make sure todos and projects arrays exist before initializing UI
    window.todos = window.todos || [];
    window.projects = window.projects || [];
    
    // Initialize UI components AFTER data is loaded
    if (typeof UI !== 'undefined' && typeof UI.init === 'function') {
        console.log("Initializing UI...");
        UI.init();
    } else {
        console.error("UI module not found or init method missing");
        
        // Fallback to direct element access if UI is missing
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = 'Error: UI module not found. Please check the console for details.';
            statusMessage.className = 'alert alert-danger';
            statusMessage.style.display = 'block';
        }
        
        return;
    }
    
    // If we have a stored file path but no file handle yet, show a notification
    if (typeof filePath !== 'undefined' && filePath && 
        typeof fileHandle !== 'undefined' && !fileHandle && 
        typeof isFileSystemAccessSupported !== 'undefined' && isFileSystemAccessSupported) {
        if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
            UI.showStatusMessage('Click "Set File Path" to reconnect to your saved file.', 'info');
        }
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize archive badge if available
    if (typeof ArchiveUI !== 'undefined' && typeof ArchiveUI.updateArchiveBadge === 'function') {
        ArchiveUI.updateArchiveBadge();
    }
    
    // Initialize tag filters if available
    if (typeof TagUI !== 'undefined' && typeof TagUI.updateTagFilters === 'function') {
        TagUI.updateTagFilters();
    }
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Show welcome message
    if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
        UI.showStatusMessage('Welcome to the Todo App! Organize tasks with projects, tags and collapsible sections.', 'info');
    }
    
    console.log("Todo App initialization complete");
}

function setupEventListeners() {
    // Get UI elements
    let elements = {};
    
    if (typeof UI !== 'undefined' && UI.elements) {
        elements = UI.elements;
    } else {
        // Fallback to direct DOM access
        elements = {
            todoForm: document.getElementById('todo-form'),
            todoInput: document.getElementById('todo-input'),
            projectSelect: document.getElementById('project-select'),
            projectForm: document.getElementById('project-form'),
            projectInput: document.getElementById('project-input'),
            projectColor: document.getElementById('project-color'),
            filePathButton: document.getElementById('file-path-button')
        };
    }
    
    // Add todo
    if (elements.todoForm) {
        elements.todoForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (!elements.todoInput || !elements.projectSelect) return;
            
            const todoText = elements.todoInput.value.trim();
            const projectId = elements.projectSelect.value;
            
            if (todoText && typeof addTodo === 'function') {
                addTodo(todoText, projectId);
                elements.todoInput.value = '';
            }
        });
    }

    // Add project
    if (elements.projectForm) {
        elements.projectForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            if (!elements.projectInput || !elements.projectColor) return;
            
            const projectName = elements.projectInput.value.trim();
            const projectColorValue = elements.projectColor.value;
            
            if (projectName && typeof addProject === 'function') {
                addProject(projectName, projectColorValue);
                elements.projectInput.value = '';
            }
        });
    }

    // Set file path
    if (elements.filePathButton && typeof Storage !== 'undefined' && typeof Storage.setFilePath === 'function') {
        elements.filePathButton.addEventListener('click', Storage.setFilePath);
    }

    // Check File System Access API support
    if (typeof isFileSystemAccessSupported !== 'undefined' && !isFileSystemAccessSupported) {
        if (elements.filePathButton) {
            elements.filePathButton.textContent = 'File System API Not Supported';
            elements.filePathButton.disabled = true;
        }
        
        if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
            UI.showStatusMessage('Your browser does not support the File System Access API for direct file access. Try using Chrome.', 'warning');
        }
    }
}

function setupKeyboardShortcuts() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        // Skip shortcut handling if in an input field or text area (except specific overrides)
        const isInInput = event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA';
        
        // Ctrl+Shift+N - Focus on new task input
        if (event.ctrlKey && event.shiftKey && event.key === 'N') {
            event.preventDefault();
            
            // First make sure we're on the todos tab
            const todosTab = document.getElementById('todos-tab');
            
            if (typeof bootstrap !== 'undefined' && bootstrap.Tab && todosTab) {
                const tab = new bootstrap.Tab(todosTab);
                tab.show();
            }
            
            // Then focus on the todo input
            const todoInput = document.getElementById('todo-input');
            if (todoInput) {
                todoInput.focus();
                
                if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                    UI.showStatusMessage('New task shortcut activated (Ctrl+Shift+N)', 'info');
                }
            }
        }
        
        // Ctrl+Shift+T - Clear all tag filters
        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
            event.preventDefault();
            
            if (typeof clearTagFilters === 'function') {
                clearTagFilters();
                
                if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                    UI.showStatusMessage('All tag filters cleared', 'info');
                }
            }
        }
        
        // Ctrl+Shift+E - Expand all projects
        if (event.ctrlKey && event.shiftKey && event.key === 'E') {
            event.preventDefault();
            
            if (typeof collapsedProjects !== 'undefined' && typeof saveCollapsedState === 'function') {
                // Get all active projects (except Inbox)
                if (typeof projects !== 'undefined') {
                    const activeProjects = projects.filter(p => !p.archived && p.id !== 'inbox');
                    
                    // Expand all projects
                    activeProjects.forEach(project => {
                        collapsedProjects.delete(project.id);
                    });
                    
                    // Save the collapsed state
                    saveCollapsedState();
                    
                    // Refresh the todos view to apply the changes
                    if (typeof UI !== 'undefined' && typeof UI.renderTodosByProject === 'function') {
                        UI.renderTodosByProject();
                    }
                    
                    if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                        UI.showStatusMessage('All projects expanded', 'info');
                    }
                }
            }
        }
        
        // Ctrl+Shift+C - Collapse all projects
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
            event.preventDefault();
            
            if (typeof collapsedProjects !== 'undefined' && typeof saveCollapsedState === 'function') {
                // Get all active projects (except Inbox)
                if (typeof projects !== 'undefined') {
                    const activeProjects = projects.filter(p => !p.archived && p.id !== 'inbox');
                    
                    // Collapse all projects
                    activeProjects.forEach(project => {
                        collapsedProjects.add(project.id);
                    });
                    
                    // Save the collapsed state
                    saveCollapsedState();
                    
                    // Refresh the todos view to apply the changes
                    if (typeof UI !== 'undefined' && typeof UI.renderTodosByProject === 'function') {
                        UI.renderTodosByProject();
                    }
                    
                    if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                        UI.showStatusMessage('All projects collapsed', 'info');
                    }
                }
            }
        }
        
        // ? - Show keyboard shortcuts modal (only when not in an input)
        if (!isInInput && event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
            event.preventDefault();
            
            if (typeof KeyboardShortcuts !== 'undefined' && typeof KeyboardShortcuts.toggleShortcutsModal === 'function') {
                KeyboardShortcuts.toggleShortcutsModal();
            }
        }
    });
    
    // Make sure Enter key in the todo input submits the form
    const todoInput = document.getElementById('todo-input');
    if (todoInput) {
        todoInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                
                const todoText = todoInput.value.trim();
                const projectSelect = document.getElementById('project-select');
                const projectId = projectSelect ? projectSelect.value : null;
                
                if (todoText && typeof addTodo === 'function') {
                    addTodo(todoText, projectId);
                    todoInput.value = '';
                }
            }
        });
        
        // Add helper to highlight @tag input
        todoInput.addEventListener('input', function() {
            const text = todoInput.value;
            const lastAtSymbol = text.lastIndexOf('@');
            
            // If we're typing a tag, add highlighting class
            if (lastAtSymbol !== -1) {
                todoInput.classList.add('tag-input-active');
            } else {
                todoInput.classList.remove('tag-input-active');
            }
        });
    }
}