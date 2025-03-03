/**
 * keyboard-shortcuts.js - Handles displaying and managing keyboard shortcuts
 */

// KeyboardShortcuts module
const KeyboardShortcuts = {
    elements: null,
    isShortcutsVisible: false,
    
    // Initialize module
    init: function(elements) {
        this.elements = elements;
        this.createShortcutsButton();
        this.createShortcutsModal();
    },
    
    // Create button to show shortcuts
    createShortcutsButton: function() {
        const container = document.querySelector('.card-header');
        if (!container) return;
        
        // Create keyboard shortcut help button
        const btnHelp = document.createElement('button');
        btnHelp.className = 'btn btn-sm btn-outline-secondary ms-2 position-absolute end-0 me-3';
        btnHelp.innerHTML = '<i class="bi bi-keyboard"></i>';
        btnHelp.title = 'Keyboard Shortcuts';
        btnHelp.addEventListener('click', () => this.toggleShortcutsModal());
        
        // Add button to header
        container.style.position = 'relative';
        container.appendChild(btnHelp);
    },
    
    // Create modal to display keyboard shortcuts
    createShortcutsModal: function() {
        // Don't create if it already exists
        if (document.getElementById('shortcuts-modal')) return;
        
        // Create modal structure
        const modalHTML = `
        <div class="modal fade" id="shortcuts-modal" tabindex="-1" aria-labelledby="shortcutsModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="shortcutsModalLabel">
                            <i class="bi bi-keyboard me-2"></i>Keyboard Shortcuts
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Shortcut</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>N</kbd></td>
                                    <td>Focus on new task input</td>
                                </tr>
                                <tr>
                                    <td><kbd>Enter</kbd></td>
                                    <td>Add task (when focused on task input)</td>
                                </tr>
                                <tr>
                                    <td><kbd>Enter</kbd></td>
                                    <td>Save task (when editing inline)</td>
                                </tr>
                                <tr>
                                    <td><kbd>Esc</kbd></td>
                                    <td>Cancel edit (when editing inline)</td>
                                </tr>
                                <tr>
                                    <td><kbd>?</kbd></td>
                                    <td>Show this shortcuts help</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Add modal to the document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
    },
    
    // Show/hide the keyboard shortcuts modal
    toggleShortcutsModal: function() {
        const modal = document.getElementById('shortcuts-modal');
        if (!modal) return;
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }
};