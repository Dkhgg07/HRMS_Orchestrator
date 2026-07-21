// Initialize project analysis member page
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication
    if (!Auth.isAuthenticated()) {
        Navigation.goToLogin();
        return;
    }

    // Get user data
    const user = Auth.getUser();
    
    // Get current project data from sessionStorage
    const projectData = JSON.parse(sessionStorage.getItem('currentProject') || '{}');
    
    // Display user info
    const userInfoEl = document.getElementById('userInfo');
    if (user) {
        userInfoEl.innerHTML = `
            <strong>${user.name}</strong><br>
            <small>Project Member - ${user.workInfo?.department || 'No Department'}</small>
            ${projectData.name ? `<br><em>Project: ${projectData.name}</em>` : ''}
        `;
    }

    // Update page title with project name
    if (projectData.name) {
        const titleEl = document.querySelector('h1');
        if (titleEl) {
            titleEl.textContent = `${projectData.name} - Member View`;
        }
    }

    // Load user's work data
    await loadUserWork();
});

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");
const assignedList = document.getElementById("assignedWork");
const completedList = document.getElementById("completedWork");
const checklist = document.getElementById("checklist");

let currentProject = {};
let userTasks = [];

async function loadUserWork() {
    try {
        // Get current project data from sessionStorage
        currentProject = JSON.parse(sessionStorage.getItem('currentProject') || '{}');
        
        if (!currentProject.id) {
            UI.showNotification('No project selected', 'error');
            return;
        }

        console.log('Loading user tasks for project:', currentProject.id);

        // Get user's tasks in this project
        const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/teams/${currentProject.id}/my-tasks`, {
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            userTasks = result.data.tasks || [];
            
            console.log('User tasks loaded:', userTasks);
            
            // Update the work display
            updateWorkDisplay();
            
        } else {
            console.error('Failed to load user tasks:', response.status);
            showEmptyTaskState();
        }
    } catch (error) {
        console.error('Error loading user tasks:', error);
        showEmptyTaskState();
    }
}

function updateWorkDisplay() {
    // Clear existing lists
    assignedList.innerHTML = '';
    completedList.innerHTML = '';

    // Separate tasks by status
    const assignedTasks = userTasks.filter(task => task.status !== 'completed');
    const completedTasks = userTasks.filter(task => task.status === 'completed');

    // Populate assigned work
    if (assignedTasks.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No tasks assigned yet';
        li.style.color = '#64748b';
        li.style.fontStyle = 'italic';
        assignedList.appendChild(li);
    } else {
        assignedTasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="margin-bottom: 0.5rem;">
                    <strong>${task.title}</strong>
                    ${task.description ? `<br><small style="color: #64748b;">${task.description}</small>` : ''}
                    <br><small style="color: #64748b;">
                        Priority: ${task.priority || 'medium'} | 
                        Status: ${task.status || 'assigned'}
                        ${task.dueDate ? ` | Due: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
                    </small>
                </div>
            `;
            assignedList.appendChild(li);
        });
    }

    // Populate completed work
    if (completedTasks.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No completed tasks yet';
        li.style.color = '#64748b';
        li.style.fontStyle = 'italic';
        completedList.appendChild(li);
    } else {
        completedTasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div style="margin-bottom: 0.5rem;">
                    <strong>${task.title}</strong>
                    ${task.description ? `<br><small style="color: #64748b;">${task.description}</small>` : ''}
                    <br><small style="color: #64748b;">
                        Completed: ${task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Recently'}
                    </small>
                </div>
            `;
            completedList.appendChild(li);
        });
    }

    // Render checklist
    renderChecklist();
}

function showEmptyTaskState() {
    assignedList.innerHTML = '<li style="color: #64748b; font-style: italic;">Unable to load tasks</li>';
    completedList.innerHTML = '<li style="color: #64748b; font-style: italic;">Unable to load completed tasks</li>';
}

async function markTaskComplete(taskId) {
    try {
        console.log('Marking task complete:', taskId);
        
        const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/teams/${currentProject.id}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify({
                status: 'completed'
            })
        });

        const result = await response.json();
        console.log('Task completion response:', result);

        if (response.ok) {
            UI.showNotification('Task marked as complete!', 'success');
            
            // Reload tasks to update the display
            await loadUserWork();
            
        } else {
            console.error('Failed to mark task complete:', result);
            UI.showNotification(`Failed to mark task complete: ${result.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Error marking task complete:', error);
        UI.showNotification('Failed to mark task complete. Please try again.', 'error');
    }
}

function renderChecklist() {
    checklist.innerHTML = "";

    // Get tasks that are assigned (not completed)
    const assignedTasks = userTasks.filter(task => task.status !== 'completed');
    
    if (assignedTasks.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No pending tasks";
        li.style.color = "#64748b";
        li.style.fontStyle = "italic";
        checklist.appendChild(li);
        return;
    }

    assignedTasks.forEach(task => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `task-${task._id}`;

        // Task is not completed, so checkbox is unchecked
        checkbox.checked = false;

        li.appendChild(checkbox);
        
        const label = document.createElement("label");
        label.htmlFor = `task-${task._id}`;
        label.innerHTML = `
            <strong>${task.title}</strong>
            ${task.description ? `<br><small style="color: #64748b;">${task.description}</small>` : ''}
        `;
        li.appendChild(label);
        
        checklist.appendChild(li);

        checkbox.addEventListener("change", async () => {
            if (checkbox.checked) {
                // Mark task as complete
                checkbox.disabled = true; // Prevent multiple clicks
                li.classList.add("done");
                
                try {
                    await markTaskComplete(task._id);
                } catch (error) {
                    // If failed, revert the checkbox
                    checkbox.checked = false;
                    checkbox.disabled = false;
                    li.classList.remove("done");
                }
            }
        });
    });
}

menuBtn.addEventListener("click", () => sidebar.classList.add("active"));
closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));