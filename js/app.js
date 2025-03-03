/**
 * app.js - Main application file that initializes the app and sets up event listeners
 */

// Initialize the application when the document is loaded
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Initialize UI components
    UI.init();
    
    // Load data from localStorage
    Storage.loadFromLocalStorage();
    
    // If we have a stored file path but no file handle yet, show a notification
    if (filePath && !fileHandle && isFileSystemAccessSupported) {
        UI.showStatusMessage('Click "Set File Path" to reconnect to your saved file.', 'info');
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize archive badge
    if (ArchiveUI && typeof ArchiveUI.updateArchiveBadge === 'function') {
        ArchiveUI.updateArchiveBadge();
    }
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Initialize keyboard shortcuts help
    if (KeyboardShortcuts && typeof KeyboardShortcuts.init === 'function') {
        KeyboardShortcuts.init(UI.elements);
    }
    
    // Show welcome message with dark theme
    UI.showStatusMessage('Welcome to the Todo App (Dark Theme)!', 'info');
}

function setupEventListeners() {
    const elements = UI.elements;
    
    // Add todo
    elements.todoForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const todoText = elements.todoInput.value.trim();
        const projectId = elements.projectSelect.value;
        
        if (todoText) {
            addTodo(todoText, projectId);
            elements.todoInput.value = '';
        }
    });

    // Add project
    elements.projectForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const projectName = elements.projectInput.value.trim();
        const projectColorValue = elements.projectColor.value;
        
        if (projectName) {
            addProject(projectName, projectColorValue);
            elements.projectInput.value = '';
        }
    });

    // Set file path
    elements.filePathButton.addEventListener('click', Storage.setFilePath);

    // Check File System Access API support
    if (!isFileSystemAccessSupported) {
        elements.filePathButton.textContent = 'File System API Not Supported';
        elements.filePathButton.disabled = true;
        UI.showStatusMessage('Your browser does not support the File System Access API for direct file access. Try using Chrome.', 'warning');
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
            const bootstrap = window.bootstrap;
            
            if (bootstrap && todosTab) {
                const tab = new bootstrap.Tab(todosTab);
                tab.show();
            }
            
            // Then focus on the todo input
            const todoInput = document.getElementById('todo-input');
            if (todoInput) {
                todoInput.focus();
            }
            
            // Show a notification to the user
            UI.showStatusMessage('New task shortcut activated (Ctrl+Shift+N)', 'info');
        }
        
        // ? - Show keyboard shortcuts modal (only when not in an input)
        if (!isInInput && event.key === '?' && !event.ctrlKey && !event.altKey && !event.metaKey) {
            event.preventDefault();
            if (KeyboardShortcuts) {
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
                
                if (todoText) {
                    addTodo(todoText, projectId);
                    todoInput.value = '';
                }
            }
        });
    }
    
    // Note: Enter key handling for inline editing is already set up in the TodoUI.startInlineEditing method
}