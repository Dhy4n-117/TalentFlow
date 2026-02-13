// --- STATE MANAGEMENT ---
// This is our "Single Source of Truth"
let candidates = JSON.parse(localStorage.getItem('talentFlowData')) || [];

// --- DOM ELEMENTS ---
const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const openModalBtn = document.getElementById('open-modal-btn');
const addForm = document.getElementById('add-candidate-form');
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderBoard();
    updateDashboardStats();
});

// --- CORE FUNCTIONS ---

// 1. SAVE DATA
function saveToLocal() {
    localStorage.setItem('talentFlowData', JSON.stringify(candidates));
    updateDashboardStats();
}

// 2. RENDER THE BOARD (The Heart of the App)
function renderBoard() {
    // Clear current lists
    document.getElementById('col-applied').innerHTML = '';
    document.getElementById('col-interview').innerHTML = '';
    document.getElementById('col-hired').innerHTML = '';

    // Loop through data and generate HTML
    candidates.forEach(candidate => {
        const card = document.createElement('div');
        card.classList.add('candidate-card');
        card.setAttribute('draggable', true); // ready for drag-drop later
        
        // Dynamic HTML for the card
        card.innerHTML = `
            <div class="card-header">
                <div class="user-meta">
                    <div class="avatar-circle">${candidate.name.charAt(0)}</div>
                    <div>
                        <h4>${candidate.name}</h4>
                        <p>${candidate.role}</p>
                    </div>
                </div>
                <button onclick="deleteCandidate(${candidate.id})" class="icon-btn delete-btn">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
            
            <div class="card-body">
                <span class="skill-tag ${getSkillColor(candidate.skill)}">${candidate.skill}</span>
                <span class="date">${new Date(candidate.date).toLocaleDateString()}</span>
            </div>

            ${getControls(candidate)} 
        `;

        // Inject into correct column based on status
        const columnId = `col-${candidate.status}`; // e.g., 'col-applied'
        document.getElementById(columnId).appendChild(card);
    });

    // Update the small counts in the headers
    updateColumnCounts();

    addDragListeners();
}

// Helper: Determine badge color
function getSkillColor(skill) {
    if (skill === 'React') return 'tag-blue';
    if (skill === 'Design') return 'tag-purple';
    if (skill === 'Python') return 'tag-yellow';
    return 'tag-gray';
}

// Helper: Generate the "Move" buttons based on status
function getControls(candidate) {
    if (candidate.status === 'applied') {
        return `<button onclick="moveCandidate(${candidate.id}, 'interview')" class="move-btn">
                    Move to Interview <i class="ph ph-arrow-right"></i>
                </button>`;
    } else if (candidate.status === 'interview') {
        return `<button onclick="moveCandidate(${candidate.id}, 'hired')" class="move-btn success">
                    Hire Candidate <i class="ph ph-check"></i>
                </button>`;
    } else {
        return `<div class="hired-badge"><i class="ph ph-check-circle"></i> Hired</div>`;
    }
}

// 3. ADD CANDIDATE
addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('c-name').value;
    const role = document.getElementById('c-role').value;
    const skill = document.getElementById('c-skill').value;

    const newCandidate = {
        id: Date.now(), // simple unique ID
        name: name,
        role: role,
        skill: skill,
        status: 'applied', // default start status
        date: new Date()
    };

    candidates.push(newCandidate);
    saveToLocal();
    renderBoard();
    
    // Close modal & reset form
    modal.classList.remove('open');
    addForm.reset();
});

// 4. MOVE CANDIDATE (Update Status)
window.moveCandidate = function(id, newStatus) {
    const candidate = candidates.find(c => c.id === id);
    if (candidate) {
        candidate.status = newStatus;
        saveToLocal();
        renderBoard();
    }
};

// 5. DELETE CANDIDATE
window.deleteCandidate = function(id) {
    if(confirm('Are you sure you want to remove this candidate?')) {
        candidates = candidates.filter(c => c.id !== id);
        saveToLocal();
        renderBoard();
    }
};

// 6. DASHBOARD STATS
function updateDashboardStats() {
    const total = candidates.length;
    const hired = candidates.filter(c => c.status === 'hired').length;
    const pending = total - hired;

    document.getElementById('total-count').innerText = total;
    document.getElementById('hired-count').innerText = hired;
    document.getElementById('pending-count').innerText = pending;
}

function updateColumnCounts() {
    document.getElementById('applied-count').innerText = candidates.filter(c => c.status === 'applied').length;
    document.getElementById('interview-count').innerText = candidates.filter(c => c.status === 'interview').length;
    document.getElementById('hired-count-badge').innerText = candidates.filter(c => c.status === 'hired').length;
}

// --- NAVIGATION & MODAL (From Phase 1) ---
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        views.forEach(v => v.classList.remove('active-view'));
        document.getElementById(btn.getAttribute('data-target')).classList.add('active-view');
    });
});

openModalBtn.addEventListener('click', () => modal.classList.add('open'));
closeModalBtn.addEventListener('click', () => modal.classList.remove('open'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

// Clear Data Feature (Settings Page)
const clearBtn = document.getElementById('clear-data-btn');
if(clearBtn) {
    clearBtn.addEventListener('click', () => {
        localStorage.removeItem('talentFlowData');
        candidates = [];
        renderBoard();
        updateDashboardStats();
        alert('All data cleared!');
    });
}
// --- DRAG AND DROP LOGIC ---
let draggedItem = null;

function addDragListeners() {
    const draggables = document.querySelectorAll('.candidate-card');
    const columns = document.querySelectorAll('.kanban-column');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggedItem = draggable;
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
            draggedItem = null;
        });
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow dropping
            const afterElement = getDragAfterElement(column, e.clientY);
            const list = column.querySelector('.card-list');
            
            if (afterElement == null) {
                list.appendChild(draggedItem);
            } else {
                list.insertBefore(draggedItem, afterElement);
            }
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            // Determine new status based on column ID (e.g., 'col-applied' -> 'applied')
            const listId = column.querySelector('.card-list').id;
            const newStatus = listId.replace('col-', '');
            
            // Update Data Model
            // We find the card ID from the button inside it (hacky but works for vanilla JS)
            const cardId = Number(draggedItem.querySelector('.delete-btn').getAttribute('onclick').match(/\d+/)[0]);
            
            const candidate = candidates.find(c => c.id === cardId);
            if (candidate && candidate.status !== newStatus) {
                candidate.status = newStatus;
                saveToLocal(); // Save to localStorage
                updateDashboardStats(); // Update numbers
                updateColumnCounts();
            }
        });
    });
}

// Helper to determine where to drop the card (above or below others)
function getDragAfterElement(column, y) {
    const draggableElements = [...column.querySelectorAll('.candidate-card:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// --- SIDEBAR TOGGLE LOGIC ---
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const appContainer = document.querySelector('.app-container');

sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    
    // Check if collapsed class is present to set the variable
    if (sidebar.classList.contains('collapsed')) {
        appContainer.style.setProperty('--sidebar-width', '80px');
    } else {
        appContainer.style.setProperty('--sidebar-width', '260px');
    }
});