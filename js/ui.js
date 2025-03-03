/**
 * ui.js - Main UI module that loads and coordinates UI components
 */

// Define UI module
window.UI = {
    // Load DOM element references once document is loaded
    init: function() {
        console.log('UI.init called');
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
        
        // Print debug info about found elements
        console.log('UI elements found:', 
            Object.keys(this.elements).filter(key => this.elements[key] !== null).join(', '));
        
        if (Object.values(this.elements).some(el => el === null)) {
            console.warn('Some UI elements missing:', 
                Object.keys(this.elements).filter(key => this.elements[key] === null).join(', '));
        }
        
        // Initialize UI modules
        this.initModules();
    },
    
    // Initialize all modules
    initModules: function() {
        console.log('Initializing UI modules...');
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
        console.log(`Trying to initialize module: ${moduleName}`);
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
        // Try global StatusUI
        if (typeof StatusUI !== 'undefined' && typeof StatusUI.showMessage === 'function') {
            StatusUI.showMessage(message, type);
            return;
        }
        
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
    },
    
    // Delegate methods to their respective modules with error handling
    updateProjectsDropdown: function() {
        // Try global ProjectUI
        if (typeof ProjectUI !== 'undefined' && typeof ProjectUI.updateDropdown === 'function') {
            ProjectUI.updateDropdown();
        } else {
            console.warn("ProjectUI.updateDropdown not found");
        }
    },
    
    renderTodosByProject: function() {
        // Try global TodoUI
        if (typeof TodoUI !== 'undefined' && typeof TodoUI.renderByProject === 'function') {
            TodoUI.renderByProject();
        } else {
            console.warn("TodoUI.renderByProject not found");
        }
    },
    
    renderProjects: function() {
        // Try global ProjectUI
        if (typeof ProjectUI !== 'undefined' && typeof ProjectUI.renderList === 'function') {
            ProjectUI.renderList();
        } else {
            console.warn("ProjectUI.renderList not found");
        }
    },
    
    startInlineEditing: function(todoId) {
        // Try global TodoUI
        if (typeof TodoUI !== 'undefined' && typeof TodoUI.startInlineEditing === 'function') {
            TodoUI.startInlineEditing(todoId);
        } else {
            console.warn("TodoUI.startInlineEditing not found");
        }
    }
};

console.log('UI module defined');