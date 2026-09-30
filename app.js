'use strict';

const STORE_KEY = 'daftar.todos';

const addForm = document.getElementById('add-form');
const newTodoInput = document.getElementById('new-todo');
const todoList = document.getElementById('todo-list');
const counter = document.getElementById('counter');

let todos = restore();

function restore() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved.filter(function(todo) {
      if (!todo) {
        return false;
      }

      if (typeof todo.text !== 'string') {
        return false;
      }

      if (todo.text.trim() === '') {
        return false;
      }

      return true;
    });
  } catch (error) {
    console.warn('Saved to-dos could not be read.', error);
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(todos));
  } catch (error) {
    console.warn('To-dos could not be saved.', error);
  }
}

function drawList() {
  const rows = todos.map(function(todo) {
    return makeRow(todo);
  });

  todoList.replaceChildren(...rows);
  updateCounter();
}

function makeRow(todo) {
  const row = document.createElement('li');
  row.className = 'row';
  row.classList.toggle('is-done', todo.done);

  const tick = document.createElement('input');
  tick.type = 'checkbox';
  tick.checked = todo.done;

  tick.addEventListener('change', function() {
    markTodo(todo, row, tick.checked);
  });

  const text = document.createElement('span');
  text.textContent = todo.text;

  const label = document.createElement('label');
  label.append(tick, text);

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'remove';
  removeButton.textContent = 'remove';
  removeButton.setAttribute('aria-label', 'Remove "' + todo.text + '"');

  removeButton.addEventListener('click', function(event) {
    if (event.detail > 1) {
      return;
    }

    removeTodo(todo);
  });

  row.append(label, removeButton);

  return row;
}

function updateCounter() {
  const unfinished = todos.filter(function(todo) {
    return !todo.done;
  });

  const left = unfinished.length;

  if (todos.length === 0) {
    counter.textContent = '';
  } else if (left === 0) {
    counter.textContent = "Everything's crossed out.";
  } else {
    counter.textContent = left + ' of ' + todos.length + ' left';
  }
}

function createTodo(text) {
  const todo = {
    text: text,
    done: false
  };

  todos.push(todo);
  persist();
  drawList();
}

function markTodo(todo, row, done) {
  todo.done = done;
  row.classList.toggle('is-done', done);

  persist();
  updateCounter();
}

function removeTodo(todo) {
  todos = todos.filter(function(item) {
    return item !== todo;
  });

  persist();
  drawList();
}

function onSubmit(event) {
  event.preventDefault();

  const text = newTodoInput.value.trim();

  if (text === '') {
    newTodoInput.setCustomValidity("Write something first. Spaces alone don't count.");
    newTodoInput.reportValidity();
    return;
  }

  createTodo(text);
  newTodoInput.value = '';
  newTodoInput.focus();
}

addForm.addEventListener('submit', onSubmit);

newTodoInput.addEventListener('input', function() {
  newTodoInput.setCustomValidity('');
});

drawList();