// Initialize project analysis leader page
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
            <small>Project Leader - ${user.workInfo?.department || 'No Department'}</small>
            ${projectData.name ? `<br><em>Project: ${projectData.name}</em>` : ''}
        `;
    }

    // Update page title with project name
    if (projectData.name) {
        const titleEl = document.querySelector('h1');
        if (titleEl) {
            titleEl.textContent = `${projectData.name} - Team Leader Analysis`;
        }
    }

    // Load team data from backend (placeholder - replace with actual API call)
    await loadTeamData();
});

const sidebar = document.getElementById("sidebar");
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");

menuBtn.addEventListener("click", () => sidebar.classList.add("active"));
closeBtn.addEventListener("click", () => sidebar.classList.remove("active"));

// Team data - will be loaded from backend
let teamData = {};
let currentProject = {};
let teamMembers = [];

async function loadTeamData() {
    try {
        // Get current project data from sessionStorage
        currentProject = JSON.parse(sessionStorage.getItem('currentProject') || '{}');
        
        if (!currentProject.id) {
            UI.showNotification('No project selected', 'error');
            return;
        }

        console.log('Loading team data for project:', currentProject.id);

        // Get team details with members and tasks
        const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/teams/${currentProject.id}`, {
            headers: {
                'Authorization': `Bearer ${Auth.getToken()}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            const team = result.data.team;
            
            console.log('Team data loaded:', team);
            
            // Store team members
            teamMembers = team.members || [];
            
            // Process team tasks for easy lookup
            teamData = {};
            teamMembers.forEach(member => {
                const userName = `${member.user.personalInfo.firstName} ${member.user.personalInfo.lastName}`;
                teamData[userName] = {
                    id: member.user._id,
                    email: member.user.email,
                    department: member.user.workInfo?.department || 'No Department',
                    role: member.role,
                    assigned: [],
                    completed: []
                };
            });
            
            // Categorize tasks by member
            if (team.tasks) {
                team.tasks.forEach(task => {
                    // Check if task has proper assignedTo data
                    if (task.assignedTo && task.assignedTo.personalInfo) {
                        const assigneeName = `${task.assignedTo.personalInfo.firstName} ${task.assignedTo.personalInfo.lastName}`;
                        if (teamData[assigneeName]) {
                            if (task.status === 'completed') {
                                teamData[assigneeName].completed.push(task);
                            } else {
                                teamData[assigneeName].assigned.push(task);
                            }
                        }
                    } else {
                        console.warn('Task missing assignedTo data:', task);
                    }
                });
            }
            
            // Update the member cards display
            updateMemberCards();
            updateMemberSelect();
            
        } else {
            console.error('Failed to load team data:', response.status);
            UI.showNotification('Failed to load team data', 'error');
        }
    } catch (error) {
        console.error('Error loading team data:', error);
        UI.showNotification('Failed to load team data', 'error');
    }
}

function updateMemberCards() {
    const memberCardsContainer = document.getElementById('memberCards');
    if (!memberCardsContainer) return;
    
    memberCardsContainer.innerHTML = '';
    
    if (teamMembers.length === 0) {
        memberCardsContainer.innerHTML = '<p style="color: #64748b; text-align: center;">No team members found</p>';
        return;
    }
    
    teamMembers.forEach(member => {
        const userName = `${member.user.personalInfo.firstName} ${member.user.personalInfo.lastName}`;
        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';
        memberCard.onclick = () => showMember(userName);
        
        const roleIcon = member.role === 'leader' ? '👑' : '👤';
        memberCard.innerHTML = `
            ${roleIcon} ${userName}
            <small style="display: block; opacity: 0.8;">${member.user.workInfo?.department || 'No Department'}</small>
        `;
        
        memberCardsContainer.appendChild(memberCard);
    });
}

function updateMemberSelect() {
    const memberSelect = document.getElementById('memberSelect');
    if (!memberSelect) return;
    
    memberSelect.innerHTML = '';
    
    // Only include non-leader members for task assignment
    const assignableMembers = teamMembers.filter(member => member.role !== 'leader');
    
    if (assignableMembers.length === 0) {
        memberSelect.innerHTML = '<option value="">No members to assign tasks to</option>';
        return;
    }
    
    assignableMembers.forEach(member => {
        const userName = `${member.user.personalInfo.firstName} ${member.user.personalInfo.lastName}`;
        const option = document.createElement('option');
        option.value = member.user._id;
        option.textContent = userName;
        memberSelect.appendChild(option);
    });
}

function showMember(name) {
    const memberData = teamData[name];
    if (!memberData) {
        UI.showNotification('Member data not found', 'error');
        return;
    }
    
    document.getElementById("memberName").textContent = `${name} - ${memberData.role === 'leader' ? 'Project Leader' : 'Member'} Details`;
    
    // Render assigned tasks
    renderTaskList("assignedList", memberData.assigned);
    
    // Render completed tasks
    renderTaskList("completedList", memberData.completed);
}

function renderTaskList(elementId, tasks) {
    const ul = document.getElementById(elementId);
    if (!ul) return;
    
    ul.innerHTML = "";
    
    if (tasks.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No tasks";
        li.style.color = "#64748b";
        li.style.fontStyle = "italic";
        ul.appendChild(li);
        return;
    }
    
    tasks.forEach(task => {
        const li = document.createElement("li");
        
        if (typeof task === 'string') {
            // Handle old format (for backward compatibility)
            li.textContent = task;
        } else {
            // Handle new task object format
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
        }
        
        ul.appendChild(li);
    });
}

async function assignWork() {
    const task = document.getElementById("taskInput").value.trim();
    const memberId = document.getElementById("memberSelect").value;
    const priority = document.getElementById("prioritySelect").value;
    
    if (!task) {
        UI.showNotification('Please enter a task description', 'error');
        return;
    }
    
    if (!memberId) {
        UI.showNotification('Please select a team member', 'error');
        return;
    }
    
    if (!currentProject.id) {
        UI.showNotification('No project selected', 'error');
        return;
    }

    try {
        console.log('Assigning task:', { task, memberId, priority, projectId: currentProject.id });
        
        // Directly attempt the task assignment
        const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/teams/${currentProject.id}/assign-task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify({
                title: task,
                assignedTo: memberId,
                priority: priority
            })
        });

        const result = await response.json();
        console.log('Task assignment response:', result);

        if (response.ok) {
            document.getElementById("taskInput").value = "";
            document.getElementById("prioritySelect").value = "medium"; // Reset to default
            UI.showNotification(`Task assigned with ${priority} priority`, 'success');
            
            // Reload team data to show the new task
            await loadTeamData();
            
            // Find the member name to show their updated details
            const assignedMember = teamMembers.find(member => member.user._id === memberId);
            if (assignedMember) {
                const memberName = `${assignedMember.user.personalInfo.firstName} ${assignedMember.user.personalInfo.lastName}`;
                showMember(memberName);
            }
            
        } else {
            console.error('Task assignment failed:', result);
            UI.showNotification(`Failed to assign task: ${result.error || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Error assigning task:', error);
        
        // Check if it's a JSON parse error (HTML response)
        if (error.message.includes('Unexpected token')) {
            UI.showNotification('Backend server needs to be restarted to enable task assignment. Please restart the server.', 'error');
        } else {
            UI.showNotification('Failed to assign task. Please try again.', 'error');
        }
    }
}

// Show dialog to remove a team member
function showRemoveMemberDialog() {
    if (teamMembers.length <= 1) {
        UI.showNotification('Cannot remove members. Project must have at least one member.', 'error');
        return;
    }

    const dialog = document.createElement('div');
    dialog.className = 'custom-dialog-overlay';
    dialog.innerHTML = `
        <div class="custom-dialog">
            <div class="dialog-header">
                <h3><i class="fa fa-user-minus" style="margin-right: 0.5rem; color: #f59e0b;"></i>Remove Team Member</h3>
                <button class="close-dialog">&times;</button>
            </div>
            <div class="dialog-body">
                <label for="removeMemberSelect" style="color: #fff; font-weight: 500; margin-bottom: 0.5rem; display: block;">Select member to remove:</label>
                <select id="removeMemberSelect" style="
                    width: 100%; 
                    padding: 0.8rem; 
                    border-radius: 8px; 
                    border: 1px solid rgba(255,255,255,0.2);
                    background: rgba(17,24,39,0.8);
                    color: #fff;
                    font-size: 1rem;
                    margin-bottom: 1rem;
                ">
                    <option value="">Select member...</option>
                </select>
                <div style="
                    background: rgba(239,68,68,0.1); 
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: 8px; 
                    padding: 1rem; 
                    margin-top: 1rem;
                ">
                    <p style="color: #fca5a5; font-size: 0.9rem; margin: 0; display: flex; align-items: center;">
                        <i class="fa fa-exclamation-triangle" style="margin-right: 0.5rem; color: #ef4444;"></i>
                        <strong>Warning:</strong> This action cannot be undone. The member will lose access to this project and all their assigned tasks.
                    </p>
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn-secondary cancel-btn">Cancel</button>
                <button class="btn-danger remove-btn">Remove Member</button>
            </div>
        </div>
    `;
    
    // Add modern dark theme styles
    dialog.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); 
        backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000; 
        font-family: 'Montserrat', sans-serif;
        animation: fadeIn 0.2s ease-out;
    `;
    
    const dialogBox = dialog.querySelector('.custom-dialog');
    dialogBox.style.cssText = `
        background: linear-gradient(180deg, #0e1a2f 0%, #0a1323 100%);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px; 
        padding: 0; 
        min-width: 450px; 
        max-width: 500px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        color: #fff;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Style dialog header
    const header = dialog.querySelector('.dialog-header');
    header.style.cssText = `
        background: linear-gradient(45deg, rgba(245,158,11,0.1), rgba(239,68,68,0.1));
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding: 1.5rem;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    // Style dialog body
    const body = dialog.querySelector('.dialog-body');
    body.style.cssText = `
        padding: 1.5rem;
    `;
    
    // Style dialog footer
    const footer = dialog.querySelector('.dialog-footer');
    footer.style.cssText = `
        padding: 1.5rem;
        border-top: 1px solid rgba(255,255,255,0.1);
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        border-radius: 0 0 16px 16px;
        background: rgba(0,0,0,0.2);
    `;
    
    // Style buttons
    const cancelBtn = dialog.querySelector('.cancel-btn');
    cancelBtn.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: #fff;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
    `;
    
    const removeBtn = dialog.querySelector('.remove-btn');
    removeBtn.style.cssText = `
        background: linear-gradient(45deg, #ef4444, #dc2626);
        border: none;
        color: #fff;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(239,68,68,0.3);
    `;
    
    // Style close button
    const closeBtn = dialog.querySelector('.close-dialog');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: rgba(255,255,255,0.6);
        font-size: 1.5rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    `;
    
    // Add hover effects
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.background = 'rgba(255,255,255,0.2)';
        cancelBtn.style.transform = 'translateY(-1px)';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.background = 'rgba(255,255,255,0.1)';
        cancelBtn.style.transform = 'translateY(0)';
    };
    
    removeBtn.onmouseenter = () => {
        removeBtn.style.background = 'linear-gradient(45deg, #dc2626, #b91c1c)';
        removeBtn.style.transform = 'translateY(-1px)';
        removeBtn.style.boxShadow = '0 6px 16px rgba(239,68,68,0.4)';
    };
    removeBtn.onmouseleave = () => {
        removeBtn.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
        removeBtn.style.transform = 'translateY(0)';
        removeBtn.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
    };
    
    closeBtn.onmouseenter = () => {
        closeBtn.style.background = 'rgba(255,255,255,0.1)';
        closeBtn.style.color = '#fff';
    };
    closeBtn.onmouseleave = () => {
        closeBtn.style.background = 'none';
        closeBtn.style.color = 'rgba(255,255,255,0.6)';
    };
    
    document.body.appendChild(dialog);
    
    // Populate member select (exclude the current user/leader)
    const removeMemberSelect = document.getElementById('removeMemberSelect');
    const currentUserId = Auth.getUser()?.id;
    
    teamMembers.forEach(member => {
        if (member.user._id !== currentUserId) { // Don't allow removing self
            const option = document.createElement('option');
            option.value = member.user._id;
            option.textContent = `${member.user.personalInfo.firstName} ${member.user.personalInfo.lastName} (${member.role})`;
            removeMemberSelect.appendChild(option);
        }
    });
    
    // Event listeners
    dialog.querySelector('.close-dialog').onclick = () => dialog.remove();
    dialog.querySelector('.cancel-btn').onclick = () => dialog.remove();
    
    dialog.querySelector('.remove-btn').onclick = async () => {
        const memberIdToRemove = removeMemberSelect.value;
        
        if (!memberIdToRemove) {
            showErrorDialog('Please select a member to remove');
            return;
        }
        
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/teams/${currentProject.id}/members/${memberIdToRemove}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                dialog.remove();
                showSuccessDialog('Member removed from project successfully');
                // Reload team data
                await loadTeamData();
            } else {
                showErrorDialog(`Failed to remove member: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error removing member:', error);
            showErrorDialog('Failed to remove member. Please try again.');
        }
    };
    
    // Close on outside click
    dialog.onclick = (e) => { if (e.target === dialog) dialog.remove(); };
}

// Show dialog to delete the entire project
function showDeleteProjectDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'custom-dialog-overlay';
    dialog.innerHTML = `
        <div class="custom-dialog">
            <div class="dialog-header">
                <h3><i class="fa fa-trash-alt" style="margin-right: 0.5rem; color: #ef4444;"></i>Delete Project</h3>
                <button class="close-dialog">&times;</button>
            </div>
            <div class="dialog-body">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="
                        width: 80px; 
                        height: 80px; 
                        border-radius: 50%; 
                        background: rgba(239,68,68,0.1);
                        border: 3px solid rgba(239,68,68,0.3);
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        margin: 0 auto 1rem;
                    ">
                        <i class="fa fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444;"></i>
                    </div>
                    <h4 style="color: #fff; margin: 0;">Are you sure you want to delete</h4>
                    <p style="color: #1fad82; font-weight: 600; font-size: 1.1rem; margin: 0.5rem 0;">"${currentProject.name || 'this project'}"?</p>
                </div>
                
                <div style="
                    background: rgba(239,68,68,0.1); 
                    border: 1px solid rgba(239,68,68,0.3);
                    border-radius: 12px; 
                    padding: 1.5rem; 
                    margin-bottom: 1.5rem;
                ">
                    <h5 style="color: #fca5a5; margin: 0 0 1rem 0; display: flex; align-items: center;">
                        <i class="fa fa-exclamation-triangle" style="margin-right: 0.5rem; color: #ef4444;"></i>
                        <strong>PERMANENT DELETION WARNING</strong>
                    </h5>
                    <ul style="color: #fca5a5; font-size: 0.9rem; margin: 0; padding-left: 1.2rem;">
                        <li>All project data will be permanently deleted</li>
                        <li>All team members will lose access</li>
                        <li>All tasks and progress will be lost</li>
                        <li>Project code will become invalid</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="color: #fff; font-weight: 600; margin-bottom: 0.5rem; display: block;">
                        Type <strong style="color: #ef4444;">DELETE</strong> to confirm:
                    </label>
                    <input type="text" id="confirmDeleteInput" placeholder="Type DELETE to confirm" style="
                        width: 100%; 
                        padding: 0.8rem; 
                        border-radius: 8px; 
                        border: 2px solid rgba(239,68,68,0.3);
                        background: rgba(17,24,39,0.8);
                        color: #fff;
                        font-size: 1rem;
                        text-transform: uppercase;
                        text-align: center;
                        font-weight: 600;
                        letter-spacing: 2px;
                        transition: all 0.2s ease;
                    ">
                </div>
            </div>
            <div class="dialog-footer">
                <button class="btn-secondary cancel-btn">Cancel</button>
                <button class="btn-danger delete-btn" disabled>Delete Project Forever</button>
            </div>
        </div>
    `;
    
    // Add modern dark theme styles with animations
    dialog.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.8); 
        backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center;
        z-index: 10000; 
        font-family: 'Montserrat', sans-serif;
        animation: fadeIn 0.2s ease-out;
    `;
    
    const dialogBox = dialog.querySelector('.custom-dialog');
    dialogBox.style.cssText = `
        background: linear-gradient(180deg, #0e1a2f 0%, #0a1323 100%);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px; 
        padding: 0; 
        min-width: 500px; 
        max-width: 550px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        color: #fff;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Style dialog header  
    const header = dialog.querySelector('.dialog-header');
    header.style.cssText = `
        background: linear-gradient(45deg, rgba(239,68,68,0.1), rgba(220,38,38,0.1));
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding: 1.5rem;
        border-radius: 16px 16px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    // Style dialog body
    const body = dialog.querySelector('.dialog-body');
    body.style.cssText = `
        padding: 2rem;
    `;
    
    // Style dialog footer
    const footer = dialog.querySelector('.dialog-footer');
    footer.style.cssText = `
        padding: 1.5rem;
        border-top: 1px solid rgba(255,255,255,0.1);
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        border-radius: 0 0 16px 16px;
        background: rgba(0,0,0,0.2);
    `;
    
    // Style buttons
    const cancelBtn = dialog.querySelector('.cancel-btn');
    cancelBtn.style.cssText = `
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: #fff;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s ease;
    `;
    
    const deleteBtn = dialog.querySelector('.delete-btn');
    deleteBtn.style.cssText = `
        background: linear-gradient(45deg, #6b7280, #4b5563);
        border: none;
        color: rgba(255,255,255,0.5);
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        cursor: not-allowed;
        font-weight: 600;
        transition: all 0.2s ease;
        opacity: 0.5;
    `;
    
    // Style close button
    const closeBtn = dialog.querySelector('.close-dialog');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: rgba(255,255,255,0.6);
        font-size: 1.5rem;
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    `;
    
    // Add hover effects for cancel button
    cancelBtn.onmouseenter = () => {
        cancelBtn.style.background = 'rgba(255,255,255,0.2)';
        cancelBtn.style.transform = 'translateY(-1px)';
    };
    cancelBtn.onmouseleave = () => {
        cancelBtn.style.background = 'rgba(255,255,255,0.1)';
        cancelBtn.style.transform = 'translateY(0)';
    };
    
    closeBtn.onmouseenter = () => {
        closeBtn.style.background = 'rgba(255,255,255,0.1)';
        closeBtn.style.color = '#fff';
    };
    closeBtn.onmouseleave = () => {
        closeBtn.style.background = 'none';
        closeBtn.style.color = 'rgba(255,255,255,0.6)';
    };
    
    document.body.appendChild(dialog);
    
    const confirmInput = document.getElementById('confirmDeleteInput');
    const projectDeleteBtn = dialog.querySelector('.delete-btn');
    
    // Style input focus effects
    confirmInput.onfocus = () => {
        confirmInput.style.borderColor = '#ef4444';
        confirmInput.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
    };
    confirmInput.onblur = () => {
        confirmInput.style.borderColor = 'rgba(239,68,68,0.3)';
        confirmInput.style.boxShadow = 'none';
    };
    
    // Enable delete button only when "DELETE" is typed
    confirmInput.addEventListener('input', (e) => {
        const isValid = e.target.value.toUpperCase() === 'DELETE';
        projectDeleteBtn.disabled = !isValid;
        
        if (isValid) {
            projectDeleteBtn.style.cssText = `
                background: linear-gradient(45deg, #ef4444, #dc2626);
                border: none;
                color: #fff;
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
                box-shadow: 0 4px 12px rgba(239,68,68,0.3);
                opacity: 1;
            `;
            
            projectDeleteBtn.onmouseenter = () => {
                projectDeleteBtn.style.background = 'linear-gradient(45deg, #dc2626, #b91c1c)';
                projectDeleteBtn.style.transform = 'translateY(-1px)';
                projectDeleteBtn.style.boxShadow = '0 6px 16px rgba(239,68,68,0.4)';
            };
            projectDeleteBtn.onmouseleave = () => {
                projectDeleteBtn.style.background = 'linear-gradient(45deg, #ef4444, #dc2626)';
                projectDeleteBtn.style.transform = 'translateY(0)';
                projectDeleteBtn.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
            };
        } else {
            projectDeleteBtn.style.cssText = `
                background: linear-gradient(45deg, #6b7280, #4b5563);
                border: none;
                color: rgba(255,255,255,0.5);
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                cursor: not-allowed;
                font-weight: 600;
                transition: all 0.2s ease;
                opacity: 0.5;
            `;
            projectDeleteBtn.onmouseenter = null;
            projectDeleteBtn.onmouseleave = null;
        }
    });
    
    // Event listeners
    dialog.querySelector('.close-dialog').onclick = () => dialog.remove();
    dialog.querySelector('.cancel-btn').onclick = () => dialog.remove();
    
    projectDeleteBtn.onclick = async () => {
        if (confirmInput.value.toUpperCase() !== 'DELETE') {
            showErrorDialog('Please type "DELETE" to confirm');
            return;
        }
        
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL.replace('/api', '')}/api/teams/${currentProject.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Auth.getToken()}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                dialog.remove();
                showSuccessDialog('Project deleted successfully', 'Redirecting to dashboard...');
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                showErrorDialog(`Failed to delete project: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            showErrorDialog('Failed to delete project. Please try again.');
        }
    };
    
    // Close on outside click
    dialog.onclick = (e) => { if (e.target === dialog) dialog.remove(); };
    
    // Focus on input
    setTimeout(() => confirmInput.focus(), 100);
}