/**
 * module-fallbacks.js - Ensure all required modules have at least stub implementations
 * Add this script before all other scripts to prevent errors when modules are missing
 */

// Create fallbacks for all required modules and global variables
(function() {
    console.log('Setting up module fallbacks...');

    // Ensure global data structures exist
    window.todos = window.todos || [];
    window.projects = window.projects || [];
    window.filePath = window.filePath || '';
    window.fileHandle = window.fileHandle || null;
    window.editingTodoId = window.editingTodoId || null;
    window.editingProjectId = window.editingProjectId || null;
    window.activeTags = window.activeTags || new Set();
    window.collapsedProjects = window.collapsedProjects || new Set();
    window.isFileSystemAccessSupported = window.isFileSystemAccessSupported || 'showOpenFilePicker' in window;

    // Create UI module fallback
    window.UI = window.UI || {
        init: function() { console.error('UI module missing, using fallback'); },
        elements: {},
        tryInitModule: function(name) { console.warn(`Cannot initialize ${name}, UI fallback active`); },
        showStatusMessage: function(msg, type) { console.log(`Status message (${type}): ${msg}`); },
        updateProjectsDropdown: function() { console.warn('UI.updateProjectsDropdown fallback called'); },
        renderTodosByProject: function() { console.warn('UI.renderTodosByProject fallback called'); },
        renderProjects: function() { console.warn('UI.renderProjects fallback called'); }
    };

    // Create TodoUI module fallback
    window.TodoUI = window.TodoUI || {
        init: function(elements) { console.error('TodoUI module missing, using fallback'); },
        renderByProject: function() { console.warn('TodoUI.renderByProject fallback called'); },
        toggleProjectCollapse: function() { console.warn('TodoUI.toggleProjectCollapse fallback called'); },
        createTodoItem: function() { return document.createElement('div'); },
        handleTodoReordering: function() { console.warn('TodoUI.handleTodoReordering fallback called'); },
        startInlineEditing: function() { console.warn('TodoUI.startInlineEditing fallback called'); }
    };

    // Create ProjectUI module fallback
    window.ProjectUI = window.ProjectUI || {
        init: function(elements) { console.error('ProjectUI module missing, using fallback'); },
        updateDropdown: function() { console.warn('ProjectUI.updateDropdown fallback called'); },
        renderList: function() { console.warn('ProjectUI.renderList fallback called'); },
        openProjectNotesModal: function() { console.warn('ProjectUI.openProjectNotesModal fallback called'); }
    };

    // Create StatusUI module fallback
    window.StatusUI = window.StatusUI || {
        init: function(elements) { console.error('StatusUI module missing, using fallback'); },
        showMessage: function(msg, type) { console.log(`Status message (${type}): ${msg}`); },
        updateAutoSaveStatus: function(time) { console.log(`Auto-save status update: ${time}`); }
    };

    // Create TagUI module fallback
    window.TagUI = window.TagUI || {
        init: function(elements) { console.error('TagUI module missing, using fallback'); },
        updateTagFilters: function() { console.warn('TagUI.updateTagFilters fallback called'); },
        createTagPills: function() { return null; }
    };

    // Create ArchiveUI module fallback
    window.ArchiveUI = window.ArchiveUI || {
        init: function(elements) { console.error('ArchiveUI module missing, using fallback'); },
        isArchiveExpanded: false,
        updateArchiveBadge: function() { console.warn('ArchiveUI.updateArchiveBadge fallback called'); },
        renderArchivedTodos: function() { console.warn('ArchiveUI.renderArchivedTodos fallback called'); }
    };

    // Create NotesUI module fallback
    window.NotesUI = window.NotesUI || {
        init: function(elements) { console.error('NotesUI module missing, using fallback'); },
        openNotesModal: function() { console.warn('NotesUI.openNotesModal fallback called'); },
        addNotesIndicator: function() { console.warn('NotesUI.addNotesIndicator fallback called'); }
    };

    // Create KeyboardShortcuts module fallback
    window.KeyboardShortcuts = window.KeyboardShortcuts || {
        init: function(elements) { console.error('KeyboardShortcuts module missing, using fallback'); },
        toggleShortcutsModal: function() { console.warn('KeyboardShortcuts.toggleShortcutsModal fallback called'); }
    };

    // Create Storage module fallback
    window.Storage = window.Storage || {
        loadFromLocalStorage: function() { console.error('Storage module missing, using fallback'); },
        saveToLocalStorage: function() { console.warn('Storage.saveToLocalStorage fallback called'); },
        setFilePath: function() { console.warn('Storage.setFilePath fallback called'); },
        saveToFile: function() { console.warn('Storage.saveToFile fallback called'); },
        loadFromFile: function() { console.warn('Storage.loadFromFile fallback called'); }
    };

    // Create fallbacks for key functions that should exist in models.js
    window.addTodo = window.addTodo || function() { console.error('addTodo function missing, using fallback'); };
    window.deleteTodo = window.deleteTodo || function() { console.error('deleteTodo function missing, using fallback'); };
    window.toggleComplete = window.toggleComplete || function() { console.error('toggleComplete function missing, using fallback'); };
    window.editTodo = window.editTodo || function() { console.error('editTodo function missing, using fallback'); };
    window.updateTodoNotes = window.updateTodoNotes || function() { console.error('updateTodoNotes function missing, using fallback'); };
    window.moveTodoToProject = window.moveTodoToProject || function() { console.error('moveTodoToProject function missing, using fallback'); };
    window.archiveTodo = window.archiveTodo || function() { console.error('archiveTodo function missing, using fallback'); };
    window.unarchiveTodo = window.unarchiveTodo || function() { console.error('unarchiveTodo function missing, using fallback'); };
    window.addProject = window.addProject || function() { console.error('addProject function missing, using fallback'); };
    window.editProject = window.editProject || function() { console.error('editProject function missing, using fallback'); };
    window.deleteProject = window.deleteProject || function() { console.error('deleteProject function missing, using fallback'); };
    window.saveChanges = window.saveChanges || function() { console.error('saveChanges function missing, using fallback'); };
    window.toggleProjectCollapse = window.toggleProjectCollapse || function() { console.error('toggleProjectCollapse function missing, using fallback'); };
    window.shouldShowTodoWithTags = window.shouldShowTodoWithTags || function() { return true; };
    window.reorderProject = window.reorderProject || function() { console.error('reorderProject function missing, using fallback'); };
    window.saveCollapsedState = window.saveCollapsedState || function() { console.error('saveCollapsedState function missing, using fallback'); };
    window.loadCollapsedState = window.loadCollapsedState || function() { console.error('loadCollapsedState function missing, using fallback'); };
    window.initializeProjectOrders = window.initializeProjectOrders || function() { console.error('initializeProjectOrders function missing, using fallback'); };

    console.log('Module fallbacks set up successfully');
})();