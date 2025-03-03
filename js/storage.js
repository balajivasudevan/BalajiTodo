/**
 * storage.js - Handles data persistence (localStorage and file operations)
 */

// Check if the File System Access API is supported
const isFileSystemAccessSupported = 'showOpenFilePicker' in window;

// Storage namespace
const Storage = {
    // Load data from localStorage on page load
    loadFromLocalStorage: function() {
        const storedTodos = localStorage.getItem('todos');
        const storedProjects = localStorage.getItem('projects');
        const storedFilePath = localStorage.getItem('filePath');
        
        if (storedTodos) {
            todos = JSON.parse(storedTodos);
        }
        
        if (storedProjects) {
            projects = JSON.parse(storedProjects);
        } else {
            // Create default Inbox project if no projects exist
            createInboxProject();
        }
        
        if (storedFilePath) {
            filePath = storedFilePath;
            document.getElementById('file-path-display').textContent = filePath;
        }
        
        UI.updateProjectsDropdown();
        UI.renderTodosByProject();
    },

    // Save data to localStorage
    saveToLocalStorage: function() {
        localStorage.setItem('todos', JSON.stringify(todos));
        localStorage.setItem('projects', JSON.stringify(projects));
        if (filePath) {
            localStorage.setItem('filePath', filePath);
        }
    },

    // Set file path using File System Access API
    setFilePath: async function() {
        if (!isFileSystemAccessSupported) {
            UI.showStatusMessage('Your browser does not support the File System Access API. Try using Chrome.', 'danger');
            return;
        }
        
        try {
            // Ask if they want to create a new file or open existing
            const choice = confirm('Choose OK to open an existing file, or Cancel to create a new file.');
            
            if (choice) {
                // Open existing file
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
                fileHandle = handle;
                
                // Get file name for display
                filePath = fileHandle.name;
                document.getElementById('file-path-display').textContent = filePath;
                
                // Load data from the file
                await Storage.loadFromFile();
            } else {
                // Create new file
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
                
                fileHandle = await window.showSaveFilePicker(options);
                
                // Get file name for display
                filePath = fileHandle.name;
                document.getElementById('file-path-display').textContent = filePath;
                
                // Save current data to the new file
                await Storage.saveToFile(true);
            }
            
            // Save file path to localStorage
            localStorage.setItem('filePath', filePath);
            
            UI.showStatusMessage(`File ${filePath} set successfully!`, 'success');
        } catch (error) {
            console.error('Error setting file path:', error);
            // If user cancelled, don't show error
            if (error.name !== 'AbortError') {
                UI.showStatusMessage('Error setting file path.', 'danger');
            }
        }
    },

    // Save todos and projects to the selected file
    saveToFile: async function(showMessage = true) {
        if (!fileHandle) {
            if (showMessage) {
                UI.showStatusMessage('No file selected. Please set a file path first.', 'warning');
            }
            return;
        }
        
        try {
            // Prepare data object
            const data = {
                todos: todos,
                projects: projects,
                lastSaved: new Date().toISOString()
            };
            
            // Convert to JSON
            const fileData = JSON.stringify(data, null, 2);
            
            // Create a writable stream and write to it
            const writable = await fileHandle.createWritable();
            await writable.write(fileData);
            await writable.close();
            
            if (showMessage) {
                UI.showStatusMessage('Data saved to file successfully!', 'success');
            } else {
                // Update auto-save status with timestamp
                const now = new Date();
                const time = now.toLocaleTimeString();
                StatusUI.updateAutoSaveStatus(time);
            }
        } catch (error) {
            console.error('Error saving to file:', error);
            if (showMessage) {
                UI.showStatusMessage('Error saving to file.', 'danger');
            }
        }
    },

    // Load todos and projects from the selected file
    loadFromFile: async function() {
        if (!fileHandle) {
            UI.showStatusMessage('No file selected. Please set a file path first.', 'warning');
            return;
        }
        
        try {
            // Get file data
            const file = await fileHandle.getFile();
            const fileContent = await file.text();
            
            // Parse JSON data
            const data = JSON.parse(fileContent);
            
            // Update todos and projects
            if (data.todos) {
                todos = data.todos;
            }
            
            if (data.projects) {
                projects = data.projects;
                
                // Ensure Inbox project exists
                const hasInbox = projects.some(p => p.id === 'inbox');
                if (!hasInbox) {
                    createInboxProject();
                }
            }
            
            // Update UI
            this.saveToLocalStorage();
            UI.updateProjectsDropdown();
            UI.renderProjects();
            UI.renderTodosByProject();
            
            UI.showStatusMessage('Data loaded from file successfully!', 'success');
        } catch (error) {
            console.error('Error loading from file:', error);
            UI.showStatusMessage('Error loading from file. Invalid format or access denied.', 'danger');
        }
    }
};