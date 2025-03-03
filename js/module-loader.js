/**
 * module-loader.js - Ensures all modules are properly loaded and initialized
 */

// Create a global namespace for our app
window.TodoApp = window.TodoApp || {};

// Module registry
TodoApp.modules = {};

// Register a module
TodoApp.registerModule = function(name, moduleObj) {
    console.log(`Registering module: ${name}`);
    TodoApp.modules[name] = moduleObj;
    return moduleObj;
};

// Get a module if it exists
TodoApp.getModule = function(name) {
    return TodoApp.modules[name] || null;
};

// Initialize all modules
TodoApp.initializeModules = function(elements) {
    console.log("Initializing all modules...");
    
    // Define modules in order of dependency
    const moduleInitOrder = [
        'StatusUI',
        'TodoUI', 
        'ProjectUI', 
        'TagUI',
        'ArchiveUI',
        'NotesUI',
        'KeyboardShortcuts',
        'UI'
    ];
    
    // Initialize each module
    moduleInitOrder.forEach(moduleName => {
        const module = TodoApp.getModule(moduleName);
        if (module && typeof module.init === 'function') {
            try {
                console.log(`Initializing module: ${moduleName}`);
                module.init(elements);
                console.log(`Successfully initialized: ${moduleName}`);
            } catch (error) {
                console.error(`Error initializing ${moduleName}:`, error);
            }
        } else {
            console.error(`Cannot initialize module: ${moduleName} - not found or missing init method`);
        }
    });
};

// Global to track loaded modules and dependencies
TodoApp.loadedScripts = {};

// Function to register a script as loaded
TodoApp.registerScriptLoaded = function(scriptName) {
    TodoApp.loadedScripts[scriptName] = true;
    console.log(`Script loaded: ${scriptName}`);
};

// Create fallback modules for critical functionality
// StatusUI fallback
TodoApp.registerModule('StatusUI', {
    init: function(elements) {
        console.log('StatusUI fallback initialized');
        this.elements = elements;
    },
    showMessage: function(message, type) {
        console.log(`[${type}] ${message}`);
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `alert alert-${type || 'info'}`;
            statusMessage.style.display = 'block';
            
            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        }
    },
    updateAutoSaveStatus: function(time) {}
});

// UI fallback
TodoApp.registerModule('UI', {
    init: function(elements) {
        console.log('UI fallback initialized');
        this.elements = elements || {};
    },
    showStatusMessage: function(message, type) {
        const StatusUI = TodoApp.getModule('StatusUI');
        if (StatusUI) {
            StatusUI.showMessage(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    },
    updateProjectsDropdown: function() {},
    renderTodosByProject: function() {},
    renderProjects: function() {}
});