# Todo App with Projects

A browser-based todo application with project organization, drag-and-drop functionality, and local file storage.

## Features

- **Project Organization**: Group tasks by project
- **Default Inbox**: Every task belongs to a project, with "Inbox" as the default
- **Inline Editing**: Double-click on any task to edit it directly
- **Drag and Drop**: Easily move tasks between projects
- **Auto-Save**: Changes are saved automatically to localStorage and to file (when selected)
- **Bootstrap UI**: Modern, responsive design with Bootstrap 5
- **Offline Capable**: Works entirely in the browser without a server
- **Color-Coded Projects**: Visual organization with color indicators

## File Structure

```
todo-app/
├── index.html                  # Main HTML file
├── css/
│   └── styles.css              # Custom styling
├── js/
│   ├── models.js               # Data models and operations
│   ├── storage.js              # Data persistence (localStorage & file system)
│   ├── ui.js                   # Main UI coordinator
│   ├── todo-ui.js              # Todo-specific UI operations
│   ├── project-ui.js           # Project-specific UI operations
│   ├── status-ui.js            # Status messages and notifications
│   └── app.js                  # Application initialization
└── README.md                   # This file
```

## Installation

1. Download all files maintaining the directory structure
2. Open `index.html` in a modern browser (Chrome recommended for File System API support)
3. Start adding tasks and projects

## Usage

### Managing Tasks

- **Create a Task**: Enter a task in the input field and select a project (defaults to Inbox)
- **Edit a Task**: Double-click on a task or click the edit button
- **Complete a Task**: Check the checkbox next to a task
- **Move a Task**: Drag and drop a task between project areas
- **Delete a Task**: Click the trash icon

### Managing Projects

- **Create a Project**: Go to the Projects tab, enter a name and choose a color
- **Delete a Project**: Click the trash icon next to a project in the Projects tab

### Data Persistence

- **Automatic Saving**: All changes are automatically saved to localStorage
- **File Storage**: Click "Set File Path" to save/load from a JSON file on your computer
- **Persistent Link**: Once set up, the app will automatically save to your selected file

## Browser Compatibility

- **Full Support**: Chrome, Edge (Chromium-based versions)
- **Limited Support**: Firefox, Safari (File System API not supported)

## Technologies Used

- HTML5, CSS3, JavaScript
- Bootstrap 5 for UI components
- File System Access API for file operations
- Drag and Drop API for task movement

## Extending the App

The modular design makes it easy to add new features:

1. Add new UI components by creating additional UI module files
2. Extend data models in `models.js`
3. Add new storage options in `storage.js`
4. Update event listeners in `app.js`