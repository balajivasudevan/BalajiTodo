/**
 * ui.js - Main UI module that loads and coordinates UI components
 */

// UI namespace - provides access to all UI modules
const UI = {
    // Load DOM element references once document is loaded
    init: function() {
        this.elements = {
            todoForm: document.getElementById('todo-form'),
            todoInput: document.getElementById('todo-input'),
            projectSelect: document.getElementById('project-select'),
            todoProjectsContainer: document.getElementById('todo-projects-container'),
            projectForm: document.getElementById('project-form'),
            projectInput: document.getElementById('project-input'),
            projectColor: document.getElementById('project-color'),
            projectsContainer: document.getElementById('projects-container'),
            filePathButton: document.getElementById('file-path-button'),
            filePathDisplay: document.getElementById('file-path-display'),
            autoSaveStatus: document.getElementById('auto-save-status'),
            statusMessage: document.getElementById('status-message')
        };
        
        // Initialize UI modules with existence checks for robustness
        this.tryInitModule('TodoUI');
        this.tryInitModule('ProjectUI');
        this.tryInitModule('StatusUI');
        this.tryInitModule('TagUI');
        this.tryInitModule('ArchiveUI');
        this.tryInitModule('NotesUI');
        this.tryInitModule('KeyboardShortcuts');
    },
    
    // Try to initialize a module if it exists
    tryInitModule: function(moduleName) {
        if (typeof window[moduleName] !== 'undefined' && typeof window[moduleName].init === 'function') {
            try {
                window[moduleName].init(this.elements);
                console.log(`Initialized ${moduleName} successfully`);
            } catch (error) {
                console.error(`Error initializing ${moduleName}:`, error);
            }
        } else {
            console.warn(`Module ${moduleName} not found or init method missing`);
        }
    },

    // Show status message (delegated to StatusUI)
    showStatusMessage: function(message, type) {
        if (typeof StatusUI !== 'undefined' && typeof StatusUI.showMessage === 'function') {
            StatusUI.showMessage(message, type);
        } else {
            // Fallback if StatusUI is not available
            const statusMessage = this.elements.statusMessage;
            if (statusMessage) {
                statusMessage.textContent = message;
                statusMessage.className = `alert alert-${type || 'info'}`;
                statusMessage.style.display = 'block';
                
                // Hide after 3 seconds
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 3000);
            } else {
                console.log(`Status message: ${message} (${type})`);
            }
        }
    },
    
    // Delegate methods to their respective modules with error handling
    updateProjectsDropdown: function() {
        if (typeof ProjectUI !== 'undefined' && typeof ProjectUI.updateDropdown === 'function') {
            ProjectUI.updateDropdown();
        }
    },
    
    renderTodosByProject: function() {
        if (typeof TodoUI !== 'undefined' && typeof TodoUI.renderByProject === 'function') {
            TodoUI.renderByProject();
        }
    },
    
    renderProjects: function() {
        if (typeof ProjectUI !== 'undefined' && typeof ProjectUI.renderList === 'function') {
            ProjectUI.renderList();
        }
    },
    
    startInlineEditing: function(todoId) {
        if (typeof TodoUI !== 'undefined' && typeof TodoUI.startInlineEditing === 'function') {
            TodoUI.startInlineEditing(todoId);
        }
    }
};

// Load other UI modules
// Note: In a production environment, you would use a module bundler like Webpack
// or ES modules. Here we're using script tags in HTML to load these files.