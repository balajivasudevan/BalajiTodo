/**
 * storage.js - Handles data persistence (localStorage and file operations)
 */

// Check if the File System Access API is supported
window.isFileSystemAccessSupported = 'showOpenFilePicker' in window;

// Storage namespace
window.Storage = {
    // Load data from localStorage on page load
    loadFromLocalStorage: function() {
        console.log("Storage.loadFromLocalStorage called");
        
        try {
            const storedTodos = localStorage.getItem('todos');
            const storedProjects = localStorage.getItem('projects');
            const storedFilePath = localStorage.getItem('filePath');
            
            if (storedTodos) {
                window.todos = JSON.parse(storedTodos);
                console.log(`Loaded ${window.todos.length} todos from localStorage`);
            } else {
                console.log("No todos found in localStorage");
                window.todos = [];
            }
            
            if (storedProjects) {
                window.projects = JSON.parse(storedProjects);
                console.log(`Loaded ${window.projects.length} projects from localStorage`);
            } else {
                console.log("No projects found in localStorage");
                window.projects = [];
                
                // Create default Inbox project if no projects exist
                this.ensureInboxExists();
            }
            
            if (storedFilePath) {
                window.filePath = storedFilePath;
                console.log(`Loaded file path: ${window.filePath}`);
                
                const filePathDisplay = document.getElementById('file-path-display');
                if (filePathDisplay) {
                    filePathDisplay.textContent = window.filePath;
                }
            }
        } catch (error) {
            console.error("Error loading from localStorage:", error);
            
            // Initialize with defaults on error
            window.todos = window.todos || [];
            window.projects = window.projects || [];
            
            // Create default Inbox project if no projects exist
            this.ensureInboxExists();
        }
    },

    // Save data to localStorage
    saveToLocalStorage: function() {
        console.log("Storage.saveToLocalStorage called");
        
        try {
            localStorage.setItem('todos', JSON.stringify(window.todos));
            localStorage.setItem('projects', JSON.stringify(window.projects));
            
            if (window.filePath) {
                localStorage.setItem('filePath', window.filePath);
            }
            
            console.log("Data saved to localStorage successfully");
        } catch (error) {
            console.error("Error saving to localStorage:", error);
            
            // Show error message
            if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                UI.showStatusMessage('Error saving data to localStorage. Your browser might be in private mode or storage quota exceeded.', 'danger');
            }
        }
    },
    
    // Ensure inbox project exists
    ensureInboxExists: function() {
        // Check if Inbox project already exists
        if (window.projects && Array.isArray(window.projects)) {
            const inboxExists = window.projects.some(p => p.id === 'inbox');
            if (!inboxExists) {
                console.log("Creating Inbox project");
                // Create inbox project
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
                
                window.projects.push(inboxProject);
                this.saveToLocalStorage();
            }
        }
    },

    // Save todos and projects to the selected file
    saveToFile: async function(showMessage = true) {
        console.log("Storage.saveToFile called");
        
        if (!window.fileHandle) {
            if (showMessage && typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                UI.showStatusMessage('No file selected. Please set a file path first.', 'warning');
            }
            return;
        }
        
        try {
            // Prepare data object
            const data = {
                todos: window.todos,
                projects: window.projects,
                lastSaved: new Date().toISOString()
            };
            
            // Convert to JSON
            const fileData = JSON.stringify(data, null, 2);
            
            // Create a writable stream and write to it
            const writable = await window.fileHandle.createWritable();
            await writable.write(fileData);
            await writable.close();
            
            if (showMessage && typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                UI.showStatusMessage('Data saved to file successfully!', 'success');
            } else if (!showMessage && typeof StatusUI !== 'undefined' && typeof StatusUI.updateAutoSaveStatus === 'function') {
                // Update auto-save status with timestamp
                const now = new Date();
                const time = now.toLocaleTimeString();
                StatusUI.updateAutoSaveStatus(time);
            }
            
            console.log("Data saved to file successfully");
        } catch (error) {
            console.error('Error saving to file:', error);
            if (showMessage && typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                UI.showStatusMessage('Error saving to file.', 'danger');
            }
        }
    },

    // Load todos and projects from the selected file
    loadFromFile: async function() {
        console.log("Storage.loadFromFile called");
        
        if (!window.fileHandle) {
            if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                UI.showStatusMessage('No file selected. Please set a file path first.', 'warning');
            }
            return;
        }
        
        try {
            // Get file data
            const file = await window.fileHandle.getFile();
            const fileContent = await file.text();
            
            // Parse JSON data
            const data = JSON.parse(fileContent);
            
            // Update todos and projects
            if (data.todos) {
                window.todos = data.todos;
                console.log(`Loaded ${window.todos.length} todos from file`);
            }
            
            if (data.projects) {
                window.projects = data.projects;
                console.log(`Loaded ${window.projects.length} projects from file`);
                
                // Ensure Inbox project exists
                this.ensureInboxExists();
            }
            
            // Update UI
            this.saveToLocalStorage();
            
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
                    UI.showStatusMessage('Data loaded from file successfully!', 'success');
                }
            }
            
            console.log("Data loaded from file successfully");
        } catch (error) {
            console.error('Error loading from file:', error);
            if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                UI.showStatusMessage('Error loading from file. Invalid format or access denied.', 'danger');
            }
        }
    }
};

// Set up direct file handling functions
function handleOpenFile() {
    console.log("handleOpenFile called");
    
    if (!window.isFileSystemAccessSupported) {
        if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
            UI.showStatusMessage('Your browser does not support the File System Access API. Try using Chrome.', 'danger');
        }
        return;
    }
    
    // Open existing file directly from the click event
    (async function() {
        try {
            const options = {
                types: [
                    {
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json'],
                        },
                    },
                ],
            };
            
            const [handle] = await window.showOpenFilePicker(options);
            window.fileHandle = handle;
            
            // Get file name for display
            window.filePath = window.fileHandle.name;
            
            const filePathDisplay = document.getElementById('file-path-display');
            if (filePathDisplay) {
                filePathDisplay.textContent = window.filePath;
            }
            
            // Load data from the file
            await Storage.loadFromFile();
            
            // Save file path to localStorage
            localStorage.setItem('filePath', window.filePath);
            
            if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                UI.showStatusMessage(`File ${window.filePath} opened successfully!`, 'success');
            }
        } catch (error) {
            console.error('Error opening file:', error);
            // If user cancelled, don't show error
            if (error.name !== 'AbortError') {
                if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                    UI.showStatusMessage('Error opening file.', 'danger');
                }
            }
        }
    })();
}

function handleCreateFile() {
    console.log("handleCreateFile called");
    
    if (!window.isFileSystemAccessSupported) {
        if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
            UI.showStatusMessage('Your browser does not support the File System Access API. Try using Chrome.', 'danger');
        }
        return;
    }
    
    // Create new file directly from the click event
    (async function() {
        try {
            const options = {
                types: [
                    {
                        description: 'JSON Files',
                        accept: {
                            'application/json': ['.json'],
                        },
                    },
                ],
                suggestedName: 'todo-app-data.json'
            };
            
            window.fileHandle = await window.showSaveFilePicker(options);
            
            // Get file name for display
            window.filePath = window.fileHandle.name;
            
            const filePathDisplay = document.getElementById('file-path-display');
            if (filePathDisplay) {
                filePathDisplay.textContent = window.filePath;
            }
            
            // Save current data to the new file
            await Storage.saveToFile(true);
            
            // Save file path to localStorage
            localStorage.setItem('filePath', window.filePath);
            
            if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                UI.showStatusMessage(`File ${window.filePath} created successfully!`, 'success');
            }
        } catch (error) {
            console.error('Error creating file:', error);
            // If user cancelled, don't show error
            if (error.name !== 'AbortError') {
                if (typeof UI !== 'undefined' && typeof UI.showStatusMessage === 'function') {
                    UI.showStatusMessage('Error creating file.', 'danger');
                }
            }
        }
    })();
}

// Set up file path button with direct handler
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up file path button handlers');
    
    // For the main file path button
    const filePathButton = document.getElementById('file-path-button');
    if (filePathButton) {
        // Remove any existing click listeners
        filePathButton.replaceWith(filePathButton.cloneNode(true));
        
        // Get the fresh button reference
        const newFilePathButton = document.getElementById('file-path-button');
        
        // Add the prompt handler
        newFilePathButton.addEventListener('click', function() {
            const choice = confirm('Choose OK to open an existing file, or Cancel to create a new file.');
            if (choice) {
                handleOpenFile();
            } else {
                handleCreateFile();
            }
        });
    }
    
    // Also ensure inbox exists on load
    if (Storage && typeof Storage.ensureInboxExists === 'function') {
        Storage.ensureInboxExists();
    }
});

console.log('Storage module defined in global scope');