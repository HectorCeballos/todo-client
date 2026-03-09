# todo-client

A frontend client for the Todo API built with vanilla HTML, CSS, and JavaScript. Allows users to register, log in, and manage their tasks through a clean browser interface.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Features](#features)
- [How the Frontend Talks to the API](#how-the-frontend-talks-to-the-api)
- [Authentication Flow](#authentication-flow)
- [Getting Started](#getting-started)

---

## Overview

This is the frontend layer of the Todo full-stack application. It communicates with the `todo-api` backend over HTTP using the browser's built-in `fetch()` function. No frameworks, no build tools — just HTML, CSS, and JavaScript.

**Tech stack:**
- HTML — page structure
- CSS — styling and layout
- Vanilla JavaScript — logic and API communication

---

## Project Structure

```
todo-client/
├── index.html   # Page structure and layout
├── style.css    # All styling
└── app.js       # All logic — auth, API calls, rendering
```

### Why no framework?

This project intentionally uses vanilla JavaScript so the fundamentals are clear. Every API call, every DOM update, every event handler is written explicitly. This makes it easier to understand what React and other frameworks are doing under the hood when you use them later.

---

## How It Works

### Page Structure

The page has two sections that are toggled based on whether the user is logged in:

- **`#auth-section`** — shown when the user is not logged in. Contains login and register tabs.
- **`#app-section`** — shown when the user is logged in. Contains the task list and add task form.

On page load, `app.js` checks if a JWT token exists in `localStorage`. If it does, it skips the auth section and goes straight to the app. If not, it shows the login screen.

### File Responsibilities

**`index.html`**
Defines the structure of the page — the two sections, input fields, and buttons. Each button calls a JavaScript function directly via `onclick`. The file links to `style.css` for styling and `app.js` for logic.

**`style.css`**
Handles all visual styling — layout, colors, typography, spacing, and responsive behavior. Uses CSS custom properties and flexbox for layout. No external CSS frameworks are used.

**`app.js`**
Contains all the application logic, organized into three areas:

- **Auth functions** — `register()`, `login()`, `logout()`, `showTab()`
- **App functions** — `loadTasks()`, `renderTasks()`, `createTask()`, `toggleTask()`, `deleteTask()`
- **Init** — checks for an existing token on page load and decides which section to show

---

## Features

- Register a new account
- Log in with email and password
- Stay logged in after page refresh (token stored in localStorage)
- View all tasks
- Add a new task with a title and optional description
- Mark a task as complete or undo it
- Delete a task
- Log out

---

## How the Frontend Talks to the API

The browser's built-in `fetch()` function is used to make HTTP requests to the backend. Every API call follows the same basic pattern:

```javascript
const res = await fetch('http://localhost:3000/tasks', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await res.json();
```

### What `fetch()` does

`fetch()` sends an HTTP request to the URL you give it and returns a Promise that resolves when the server responds. The `await` keyword pauses execution until the response arrives, so the code reads top to bottom like synchronous code even though it's asynchronous.

### Sending data

When creating a task, the request body is serialized to JSON:

```javascript
const res = await fetch('http://localhost:3000/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ title, description })
});
```

- `Content-Type: application/json` tells the server the body is JSON
- `Authorization: Bearer <token>` proves the user is logged in
- `JSON.stringify()` converts the JavaScript object into a JSON string

### Rendering tasks

After loading tasks from the API, `renderTasks()` builds the HTML dynamically:

```javascript
list.innerHTML = tasks.map(task => `
  <div class="task-item ${task.completed ? 'completed' : ''}">
    <div class="task-title">${task.title}</div>
    <button onclick="toggleTask(${task.id}, ${task.completed})">Done</button>
    <button onclick="deleteTask(${task.id})">Delete</button>
  </div>
`).join('');
```

`Array.map()` transforms each task object into an HTML string. `.join('')` combines them into one string. Setting `innerHTML` inserts all of it into the page at once.

---

## Authentication Flow

### Register

1. User fills in username, email, and password
2. `register()` sends a `POST /auth/register` request to the API
3. On success, the API returns a JWT token
4. The token is saved to `localStorage`
5. `showApp()` is called — the auth section hides, the app section shows, tasks load

### Login

1. User fills in email and password
2. `login()` sends a `POST /auth/login` request to the API
3. On success, the API returns a JWT token
4. The token is saved to `localStorage`
5. Same as register from step 5

### Staying logged in

The token is stored in `localStorage`, which persists across page refreshes and browser restarts. On every page load, `app.js` checks:

```javascript
if (getToken()) {
  showApp();
} else {
  document.getElementById('auth-section').style.display = 'flex';
}
```

If a token exists, the user goes straight to their tasks without logging in again.

### Logout

`logout()` removes the token from `localStorage` and shows the auth section again:

```javascript
function logout() {
  localStorage.removeItem('token');
  document.getElementById('auth-section').style.display = 'flex';
  document.getElementById('app-section').style.display = 'none';
}
```

---

## Getting Started

### Prerequisites

- The `todo-api` backend must be running on `http://localhost:3000`
- A modern web browser

### Setup

```bash
# Clone the repository
git clone https://github.com/HectorCeballos/todo-client.git
cd todo-client
```

Open `index.html` directly in your browser. No build step, no server needed for the frontend itself.

### Connecting to the API

The API base URL is defined at the top of `app.js`:

```javascript
const API_URL = 'http://localhost:3000';
```

If your API is running on a different port or host, update this value.