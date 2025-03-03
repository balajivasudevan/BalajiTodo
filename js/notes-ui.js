/**
 * notes-ui.js - Handles UI operations related to todo notes
 */

// Define NotesUI module directly in the global scope
window.NotesUI = {
    elements: null,
    
    // Initialize with UI elements
    init: function(elements) {
        console.log('NotesUI.init called');
        this.elements = elements;
        this.createNotesModal();
    },
    
    // Create modal for notes editing
    createNotesModal: function() {
        // Don't create if it already exists
        if (document.getElementById('notes-modal')) return;
        
        // Create modal structure
        const modalHTML = `
        <div class="modal fade" id="notes-modal" tabindex="-1" aria-labelledby="notesModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="notesModalLabel"><i class="bi bi-sticky me-2"></i>Task Notes</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="notes-form">
                            <div class="mb-3">
                                <label for="task-title" class="form-label">Task</label>
                                <div id="task-title" class="form-control-plaintext"></div>
                            </div>
                            <div class="mb-3">
                                <label for="task-notes" class="form-label">Notes</label>
                                <textarea class="form-control" id="task-notes" rows="5" placeholder="Add notes about this task..."></textarea>
                            </div>
                            <div class="text-muted small mt-2">
                                <i class="bi bi-info-circle me-1"></i>
                                Notes will be saved with your task and visible in both active and archived states.
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" id="save-notes-btn">
                            <i class="bi bi-save me-1"></i>Save Notes
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // Add modal to the document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Add event listener for save button
        const saveButton = document.getElementById('save-notes-btn');
        if (saveButton) {
            saveButton.addEventListener('click', this.saveNotes.bind(this));
        }
    },
    
    // Open notes modal for a specific todo
    openNotesModal: function(todoId) {
        if (typeof window.todos === 'undefined' || !Array.isArray(window.todos)) {
            console.error('NotesUI: Cannot open notes modal, todos array not defined');
            return;
        }
        
        const todo = window.todos.find(t => t.id === todoId);
        if (!todo) {
            console.error(`NotesUI: Todo with ID ${todoId} not found`);
            return;
        }
        
        // Get or create the modal
        let modal = document.getElementById('notes-modal');
        if (!modal) {
            this.createNotesModal();
            modal = document.getElementById('notes-modal');
            if (!modal) {
                console.error('NotesUI: Failed to create notes modal');
                return;
            }
        }
        
        // Set current todo ID as a data attribute on the modal
        modal.setAttribute('data-todo-id', todoId);
        
        // Set task title
        const titleElement = document.getElementById('task-title');
        if (titleElement) {
            titleElement.textContent = todo.text;
        }
        
        // Set existing notes if any
        const notesTextarea = document.getElementById('task-notes');
        if (notesTextarea) {
            notesTextarea.value = todo.notes || '';
        }
        
        // Show the modal using Bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            
            // Focus the textarea
            setTimeout(() => {
                if (notesTextarea) notesTextarea.focus();
            }, 300);
        } else {
            // Fallback to show the modal manually
            modal.style.display = 'block';
            if (notesTextarea) notesTextarea.focus();
        }
    },
    
    // Save notes from modal to todo
    saveNotes: function() {
        const modal = document.getElementById('notes-modal');
        if (!modal) {
            console.error('NotesUI: Notes modal not found');
            return;
        }
        
        const todoId = modal.getAttribute('data-todo-id');
        if (!todoId) {
            console.error('NotesUI: No todo ID found in modal');
            return;
        }
        
        const notesTextarea = document.getElementById('task-notes');
        if (!notesTextarea) {
            console.error('NotesUI: Notes textarea not found');
            return;
        }
        
        const notesText = notesTextarea.value.trim();
        
        // Update the todo notes
        if (typeof window.updateTodoNotes === 'function') {
            window.updateTodoNotes(todoId, notesText);
        } else {
            console.error('NotesUI: updateTodoNotes function is not defined');
            return;
        }
        
        // Close the modal using Bootstrap
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
        } else {
            // Fallback to hide manually
            modal.style.display = 'none';
        }
        
        // Show confirmation
        if (typeof window.UI !== 'undefined' && typeof window.UI.showStatusMessage === 'function') {
            window.UI.showStatusMessage('Notes saved successfully!', 'success');
        } else if (typeof window.StatusUI !== 'undefined' && typeof window.StatusUI.showMessage === 'function') {
            window.StatusUI.showMessage('Notes saved successfully!', 'success');
        } else {
            console.log('NotesUI: Notes saved successfully!');
        }
    },
    
    // Get a preview of notes for display in the todo card
    getNotesPreview: function(notes, maxLength = 50) {
        if (!notes || notes.length === 0) return null;
        
        if (notes.length <= maxLength) {
            return notes;
        }
        
        return notes.substring(0, maxLength) + '...';
    },
    
    // Add notes indicator to a todo element
    addNotesIndicator: function(todoElement, todo) {
        if (!todoElement || !todo || !todo.notes) return;
        
        // Find or create notes indicator area
        let notesArea = todoElement.querySelector('.notes-preview');
        
        if (!todo.notes || todo.notes.length === 0) {
            // Remove notes area if it exists but there are no notes
            if (notesArea) {
                notesArea.remove();
            }
            return;
        }
        
        // Create notes area if it doesn't exist
        if (!notesArea) {
            notesArea = document.createElement('div');
            notesArea.className = 'notes-preview mt-1 small';
            
            // Find where to insert it (after the main row)
            const cardBody = todoElement.querySelector('.card-body');
            const mainRow = todoElement.querySelector('.d-flex');
            
            if (cardBody && mainRow) {
                cardBody.insertBefore(notesArea, mainRow.nextSibling);
            } else if (cardBody) {
                cardBody.appendChild(notesArea);
            }
        }
        
        // Set the notes preview content
        const preview = this.getNotesPreview(todo.notes);
        notesArea.innerHTML = `<i class="bi bi-sticky"></i> ${preview}`;
    }
};

console.log('NotesUI module defined in global scope');