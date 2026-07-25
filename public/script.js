// ---- State ----
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// ---- DOM references ----
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const dueInput = document.getElementById('due-input');
const taskList = document.getElementById('task-list');
const taskCount = document.getElementById('task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');

// ---- Persistence ----
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ---- Rendering ----
function render() {
  taskList.innerHTML = '';

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  if (visibleTasks.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks here yet.';
    taskList.appendChild(empty);
  } else {
    visibleTasks.forEach(task => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.completed ? ' completed' : '');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => toggleTask(task.id));

      const textWrap = document.createElement('div');
      textWrap.className = 'task-text';
      textWrap.textContent = task.text;

      if (task.due) {
        const meta = document.createElement('span');
        meta.className = 'task-meta';
        meta.textContent = 'Due: ' + task.due;
        textWrap.appendChild(meta);
      }

      const priorityTag = document.createElement('span');
      priorityTag.className = 'priority-tag priority-' + task.priority;
      priorityTag.textContent = task.priority;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(textWrap);
      li.appendChild(priorityTag);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });
  }

  const remaining = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${remaining} task${remaining !== 1 ? 's' : ''} remaining`;
}

// ---- Actions ----
function addTask(text, priority, due) {
  tasks.push({
    id: Date.now(),
    text,
    priority,
    due,
    completed: false
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
}

// ---- Event listeners ----
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text, prioritySelect.value, dueInput.value);
  input.value = '';
  dueInput.value = '';
  input.focus();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// ---- Init ----
render();