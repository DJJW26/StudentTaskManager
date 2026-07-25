// ---- State ----
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingId = null;
let draggedId = null;

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
      li.dataset.id = task.id;
      li.draggable = true;

      // Drag handle
      const handle = document.createElement('span');
      handle.className = 'drag-handle';
      handle.innerHTML = '&#8942;&#8942;';
      handle.title = 'Drag to reorder';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => toggleTask(task.id));

      const textWrap = document.createElement('div');
      textWrap.className = 'task-text';

      if (editingId === task.id) {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = task.text;

        const saveEdit = () => {
          const newText = editInput.value.trim();
          if (newText) updateTaskText(task.id, newText);
          editingId = null;
          render();
        };

        editInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') saveEdit();
          if (e.key === 'Escape') { editingId = null; render(); }
        });
        editInput.addEventListener('blur', saveEdit);

        textWrap.appendChild(editInput);
        // Focus after insertion
        setTimeout(() => { editInput.focus(); editInput.select(); }, 0);
      } else {
        const label = document.createElement('span');
        label.textContent = task.text;
        label.addEventListener('click', () => {
          editingId = task.id;
          render();
        });
        textWrap.appendChild(label);

        if (task.due) {
          const meta = document.createElement('span');
          meta.className = 'task-meta';
          meta.textContent = 'Due: ' + task.due;
          textWrap.appendChild(meta);
        }
      }

      const priorityTag = document.createElement('span');
      priorityTag.className = 'priority-tag priority-' + task.priority;
      priorityTag.textContent = task.priority;

      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.innerHTML = '&#9998;';
      editBtn.title = 'Edit task';
      editBtn.addEventListener('click', () => {
        editingId = task.id;
        render();
      });

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(handle);
      li.appendChild(checkbox);
      li.appendChild(textWrap);
      li.appendChild(priorityTag);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);

      // Drag events
      li.addEventListener('dragstart', () => {
        draggedId = task.id;
        li.classList.add('dragging');
      });

      li.addEventListener('dragend', () => {
        draggedId = null;
        li.classList.remove('dragging');
      });

      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        li.classList.add('drag-over');
      });

      li.addEventListener('dragleave', () => {
        li.classList.remove('drag-over');
      });

      li.addEventListener('drop', (e) => {
        e.preventDefault();
        li.classList.remove('drag-over');
        if (draggedId === null || draggedId === task.id) return;
        reorderTasks(draggedId, task.id);
      });

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

function updateTaskText(id, newText) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, text: newText } : task
  );
  saveTasks();
}

function reorderTasks(draggedId, targetId) {
  const fromIndex = tasks.findIndex(t => t.id === draggedId);
  const toIndex = tasks.findIndex(t => t.id === targetId);
  if (fromIndex === -1 || toIndex === -1) return;

  const [movedTask] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, movedTask);
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
