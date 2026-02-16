// --- STATE MANAGEMENT ---
let candidates = JSON.parse(localStorage.getItem('talentFlowData')) || [];
let currentViewMode = 'board'; // 'board' or 'list'

// --- DOM ELEMENTS ---
const viewBoardBtn = document.getElementById('view-board-btn');
const viewListBtn = document.getElementById('view-list-btn');
const kanbanView = document.getElementById('kanban-view');
const listView = document.getElementById('list-view');
const searchInput = document.getElementById('search-input');
const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const modal = document.getElementById('modal');
const addForm = document.getElementById('add-candidate-form');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderApp();
    
    // Listeners for View Toggles
    viewBoardBtn.addEventListener('click', () => switchViewMode('board'));
    viewListBtn.addEventListener('click', () => switchViewMode('list'));
    
    // Listener for Search
    searchInput.addEventListener('input', renderApp);
});

// --- CORE RENDER FUNCTION ---
function renderApp() {
    updateStats();
    
    // Filter Logic
    const searchTerm = searchInput.value.toLowerCase();
    const filteredCandidates = candidates.filter(c => 
        c.name.toLowerCase().includes(searchTerm) || 
        c.role.toLowerCase().includes(searchTerm)
    );

    // Render based on active view
    if (currentViewMode === 'board') {
        renderBoard(filteredCandidates);
    } else {
        renderList(filteredCandidates);
    }
}

// Switch between Kanban and List
function switchViewMode(mode) {
    currentViewMode = mode;
    if (mode === 'board') {
        kanbanView.classList.remove('hidden');
        listView.classList.add('hidden');
        viewBoardBtn.classList.add('active');
        viewListBtn.classList.remove('active');
    } else {
        kanbanView.classList.add('hidden');
        listView.classList.remove('hidden');
        viewBoardBtn.classList.remove('active');
        viewListBtn.classList.add('active');
    }
    renderApp();
}

// --- RENDER BOARD VIEW ---
function renderBoard(data) {
    // Clear and rebuild columns
    ['applied', 'interview', 'hired'].forEach(status => {
        const col = document.getElementById(`col-${status}`);
        col.innerHTML = '';
        
        // Update Count Badges
        const items = data.filter(c => c.status === status);
        const countSpan = document.getElementById(`${status}-count`) || document.getElementById(`${status}-count-badge`);
        if(countSpan) countSpan.innerText = items.length;

        // Generate Cards
        items.forEach(c => {
            const card = document.createElement('div');
            card.className = 'candidate-card';
            card.draggable = true;
            card.dataset.id = c.id;
            
            // Safety check for old data without ratings
            const rating = c.rating || 3; 

            card.innerHTML = `
                <div class="card-top">
                    <div class="avatar">${c.name.charAt(0)}</div>
                    <div class="star-rating">${'★'.repeat(rating)}</div>
                </div>
                <h4>${c.name}</h4>
                <p style="color:var(--text-light); font-size:0.85rem">${c.role}</p>
                <p style="font-size:0.75rem; margin-top:8px; opacity:0.5; margin-bottom:10px">${c.skill}</p>
                
                <div class="move-controls">
                    ${status !== 'applied' ? `<button onclick="moveItem(${c.id}, 'prev')" class="mini-btn">← Prev</button>` : ''}
                    <button onclick="deleteCandidate(${c.id})" class="mini-btn" style="color:#ef4444">✕</button>
                    ${status !== 'hired' ? `<button onclick="moveItem(${c.id}, 'next')" class="mini-btn">Next →</button>` : ''}
                </div>
            `;
            
            // Drag Events
            card.addEventListener('dragstart', () => card.classList.add('dragging'));
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                // Drop logic is handled by column listeners
            });
            
            col.appendChild(card);
        });
    });
    
    // Attach listeners to columns (only needs to be done once, but safe here)
    addDragOverListeners();
}

// --- RENDER LIST VIEW ---
function renderList(data) {
    const container = document.getElementById('list-rows-container');
    container.innerHTML = '';
    
    data.forEach(c => {
        const row = document.createElement('div');
        row.className = 'list-row';
        const rating = c.rating || 3;
        
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px">
                <div class="avatar" style="width:24px; height:24px; font-size:0.7rem">${c.name.charAt(0)}</div>
                <span>${c.name}</span>
            </div>
            <span>${c.role}</span>
            <span style="text-transform:capitalize; color:var(--primary)">${c.status}</span>
            <span style="color:var(--orange-accent)">${'★'.repeat(rating)}</span>
            <button onclick="deleteCandidate(${c.id})" style="color:#ef4444; background:none; border:none; cursor:pointer">
                <i class="ph ph-trash"></i>
            </button>
        `;
        container.appendChild(row);
    });
}

// --- DRAG & DROP LOGIC ---
function addDragOverListeners() {
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.addEventListener('dragover', e => {
            e.preventDefault();
            const draggingCard = document.querySelector('.dragging');
            if(draggingCard) {
                col.querySelector('.card-list').appendChild(draggingCard);
            }
        });

        // Detect Drop to update state
        col.addEventListener('drop', e => {
            e.preventDefault();
            const draggingCard = document.querySelector('.dragging');
            if(draggingCard) {
                const id = Number(draggingCard.dataset.id);
                // Determine new status from the column ID (col-applied -> applied)
                const newStatus = col.querySelector('.card-list').id.replace('col-', '');
                updateStatus(id, newStatus);
            }
        });
    });
}

function updateStatus(id, newStatus) {
    const candidate = candidates.find(c => c.id === id);
    if(candidate && candidate.status !== newStatus) {
        candidate.status = newStatus;
        saveData();
        showToast(`Moved to ${newStatus}`, 'success');
    }
}

// Manual Move for Mobile Buttons
window.moveItem = function(id, direction) {
    const candidate = candidates.find(c => c.id === id);
    if(!candidate) return;
    
    const statuses = ['applied', 'interview', 'hired'];
    let idx = statuses.indexOf(candidate.status);
    
    if(direction === 'next' && idx < 2) idx++;
    if(direction === 'prev' && idx > 0) idx--;
    
    updateStatus(id, statuses[idx]);
}


// --- ACTIONS ---
addForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('c-name').value;
    const role = document.getElementById('c-role').value;
    const skill = document.getElementById('c-skill').value;
    const rating = document.getElementById('c-rating').value;

    if(name && role) {
        candidates.push({
            id: Date.now(),
            name, role, skill,
            rating: Number(rating),
            status: 'applied',
            date: new Date()
        });
        saveData();
        modal.classList.remove('open');
        addForm.reset();
        showToast('Candidate Added', 'success');
    }
});

window.deleteCandidate = function(id) {
    if(confirm('Delete this candidate permanently?')) {
        candidates = candidates.filter(c => c.id !== id);
        saveData();
        showToast('Candidate Deleted', 'error');
    }
};

function saveData() {
    localStorage.setItem('talentFlowData', JSON.stringify(candidates));
    renderApp();
}

function updateStats() {
    document.getElementById('total-count').innerText = candidates.length;
    document.getElementById('hired-count').innerText = candidates.filter(c => c.status === 'hired').length;
    document.getElementById('pending-count').innerText = candidates.length - candidates.filter(c => c.status === 'hired').length;
}

// --- UTILS & NAVIGATION ---
function showToast(msg, type) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    t.style.borderLeftColor = type === 'success' ? 'var(--green-accent)' : '#ef4444';
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Handle Navigation (syncs desktop sidebar and mobile bottom nav)
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        
        // Active State for Buttons
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll(`[data-target="${target}"]`).forEach(b => b.classList.add('active'));
        
        // Active State for Views
        views.forEach(v => v.classList.remove('active-view'));
        document.getElementById(target).classList.add('active-view');
    });
});

// Modal Logic
document.getElementById('open-modal-btn').onclick = () => modal.classList.add('open');
document.getElementById('close-modal-btn').onclick = () => modal.classList.remove('open');
modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };

// Reset Data
const clearBtn = document.getElementById('clear-data-btn');
if(clearBtn) {
    clearBtn.onclick = () => {
        if(confirm('Clear all data?')) {
            localStorage.removeItem('talentFlowData');
            candidates = [];
            renderApp();
            showToast('Data Reset', 'error');
        }
    }
}
