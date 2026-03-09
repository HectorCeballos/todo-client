const API_URL = 'http://localhost:3000';

// ─── Auth ───────────────────────────────────────────

function showTab(tab) {
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('auth-error').textContent = '';
}

async function register() {
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById('auth-error').textContent = 'Registration failed. Check your inputs.';
    return;
  }

  localStorage.setItem('token', data.data.token);
  showApp();
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById('auth-error').textContent = 'Invalid email or password.';
    return;
  }

  localStorage.setItem('token', data.data.token);
  showApp();
}

function logout() {
  localStorage.removeItem('token');
  document.getElementById('auth-section').style.display = 'flex';
  document.getElementById('app-section').style.display = 'none';
}

// ─── App ────────────────────────────────────────────

function showApp() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('app-section').style.display = 'flex';
  loadTasks();
}

function getToken() {
  return localStorage.getItem('token');
}

async function loadTasks() {
  const res = await fetch(`${API_URL}/tasks`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });

  const data = await res.json();
  renderTasks(data.data);
}

function renderTasks(tasks) {
  const list = document.getElementById('tasks-list');

  if (tasks.length === 0) {
    list.innerHTML = '<p style="color:#888;text-align:center;">No tasks yet. Add one above!</p>';
    return;
  }

  list.innerHTML = tasks.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <div class="task-content">
        <div class="task-title">${task.title}</div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
      </div>
      <div class="task-actions">
        <button class="btn-success" onclick="toggleTask(${task.id}, ${task.completed})">
          ${task.completed ? 'Undo' : 'Done'}
        </button>
        <button class="btn-danger" onclick="deleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

async function createTask() {
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;

  if (!title) {
    document.getElementById('task-error').textContent = 'Title is required.';
    return;
  }

  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ title, description })
  });

  if (!res.ok) {
    document.getElementById('task-error').textContent = 'Failed to create task.';
    return;
  }

  document.getElementById('task-title').value = '';
  document.getElementById('task-description').value = '';
  document.getElementById('task-error').textContent = '';
  loadTasks();
}

async function toggleTask(id, completed) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ completed: completed ? false : true })
  });

  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });

  loadTasks();
}

// ─── Init ────────────────────────────────────────────

if (getToken()) {
  showApp();
} else {
  document.getElementById('auth-section').style.display = 'flex';
}