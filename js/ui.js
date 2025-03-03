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
        
        // Initialize UI modules
        TodoUI.init(this.elements);
        ProjectUI.init(this.elements);
        StatusUI.init(this.elements);
        ArchiveUI.init(this.elements);
        NotesUI.init(this.elements);
        KeyboardShortcuts.init(this.elements);
    },

    // Show status message (delegated to StatusUI)
    showStatusMessage: function(message, type) {
        StatusUI.showMessage(message, type);
    },
    
    // Delegate methods to their respective modules
    updateProjectsDropdown: function() {
        ProjectUI.updateDropdown();
    },
    
    renderTodosByProject: function() {
        TodoUI.renderByProject();
    },
    
    renderProjects: function() {
        ProjectUI.renderList();
    },
    
    startInlineEditing: function(todoId) {
        TodoUI.startInlineEditing(todoId);
    }
};

// Load other UI modules
// Note: In a production environment, you would use a module bundler like Webpack
// or ES modules. Here we're using script tags in HTML to load these files.