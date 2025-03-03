/**
 * notes-ui.js - Handles UI operations related to todo notes
 */

// NotesUI module
const NotesUI = {
    elements: null,
    
    // Initialize with UI elements
    init: function(elements) {
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
        document.getElementById('save-notes-btn').addEventListener('click', this.saveNotes.bind(this));
    },
    
    // Open notes modal for a specific todo
    openNotesModal: function(todoId) {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;
        
        // Set current todo ID as a data attribute on the modal
        const modal = document.getElementById('notes-modal');
        modal.setAttribute('data-todo-id', todoId);
        
        // Set task title
        document.getElementById('task-title').textContent = todo.text;
        
        // Set existing notes if any
        document.getElementById('task-notes').value = todo.notes || '';
        
        // Show the modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Focus the textarea
        setTimeout(() => {
            document.getElementById('task-notes').focus();
        }, 300);
    },
    
    // Save notes from modal to todo
    saveNotes: function() {
        const modal = document.getElementById('notes-modal');
        const todoId = modal.getAttribute('data-todo-id');
        const notesText = document.getElementById('task-notes').value.trim();
        
        // Update the todo notes
        updateTodoNotes(todoId, notesText);
        
        // Close the modal
        const bsModal = bootstrap.Modal.getInstance(modal);
        bsModal.hide();
        
        // Show confirmation
        UI.showStatusMessage('Notes saved successfully!', 'success');
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
            
            cardBody.insertBefore(notesArea, mainRow.nextSibling);
        }
        
        // Set the notes preview content
        const preview = this.getNotesPreview(todo.notes);
        notesArea.innerHTML = `<i class="bi bi-sticky"></i> ${preview}`;
    }
};