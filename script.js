
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");

const totalCount = document.querySelector("#total-count");
const pendingCount = document.querySelector("#pending-count");
const completedCount = document.querySelector("#completed-count");
const taskSummary = document.querySelector("#task-summary");
const clearCompletedBtn = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            Number.isSafeInteger(task.id) &&
            typeof task.task === "string" &&
            typeof task.checked === "boolean"
        );
    }
} catch {
    tasks = [];
}

let taskId = tasks.reduce(
    (maxId, task) => Math.max(maxId, task.id),
    0
);

let currentFilter = "all";

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add a new task
taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        taskInput.focus();
        return;
    }

    const newTask = {
        id: ++taskId,
        task: text,
        checked: false
    };

    tasks.unshift(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

// Render tasks on the page
function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter(task => {
        if (currentFilter === "pending") {
            return !task.checked;
        }

        if (currentFilter === "completed") {
            return task.checked;
        }

        return true;
    });

    if (visibleTasks.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.classList.add("empty-state");

        const icon = document.createElement("span");
        icon.classList.add("empty-icon");
        icon.textContent = currentFilter === "completed" ? "✓" : "📝";

        const message = document.createElement("p");
        message.textContent =
            currentFilter === "pending"
                ? "No pending tasks. Great job!"
                : currentFilter === "completed"
                ? "No completed tasks yet."
                : "Your task list is empty. Add your first task!";

        emptyState.append(icon, message);
        taskList.appendChild(emptyState);
    }

    visibleTasks.forEach(task => {
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task-item");
        taskDiv.dataset.id = task.id;

        if (task.checked) {
            taskDiv.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("task-checkbox");
        checkbox.checked = task.checked;
        checkbox.setAttribute("aria-label", "Mark task as completed");

        const taskText = document.createElement("span");
        taskText.classList.add("task-text");
        taskText.textContent = task.task;

        const actions = document.createElement("div");
        actions.classList.add("task-actions");

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.classList.add("action-btn", "edit-btn");
        editBtn.textContent = "EDIT";
        editBtn.setAttribute("aria-label", "Edit task");

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.classList.add("action-btn", "del-btn");
        deleteBtn.textContent = "DELETE";
        deleteBtn.setAttribute("aria-label", "Delete task");

        actions.append(editBtn, deleteBtn);
        taskDiv.append(checkbox, taskText, actions);
        taskList.appendChild(taskDiv);
    });

    updateStats();
}

// Update task counts
function updateStats() {
    const completed = tasks.filter(task => task.checked).length;
    const pending = tasks.length - completed;

    totalCount.textContent = tasks.length;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    taskSummary.textContent =
        `${pending} pending · ${completed} completed`;
}

// Handle checkbox, edit, and delete actions
taskList.addEventListener("click", function (e) {
    const taskDiv = e.target.closest(".task-item");

    if (!taskDiv) return;

    const id = Number(taskDiv.dataset.id);
    const task = tasks.find(item => item.id === id);

    if (!task) return;

    if (e.target.matches(".edit-btn")) {
        if (task.checked) return;

        const updatedText = prompt("Edit your task:", task.task);

        if (updatedText === null) return;

        const cleanText = updatedText.trim();

        if (cleanText === "") {
            alert("Task cannot be empty.");
            return;
        }

        task.task = cleanText;
        saveTasks();
        renderTasks();
    }

    if (e.target.matches(".del-btn")) {
        const shouldDelete = confirm("Delete this task?");

        if (!shouldDelete) return;

        tasks = tasks.filter(item => item.id !== id);

        saveTasks();
        renderTasks();
    }
});

// Handle task completion
taskList.addEventListener("change", function (e) {
    if (!e.target.matches(".task-checkbox")) return;

    const taskDiv = e.target.closest(".task-item");
    const id = Number(taskDiv.dataset.id);

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    task.checked = e.target.checked;

    saveTasks();
    renderTasks();
});

// Filter tasks
filterButtons.forEach(button => {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });

        renderTasks();
    });
});

// Remove all completed tasks
clearCompletedBtn.addEventListener("click", function () {
    tasks = tasks.filter(task => !task.checked);

    saveTasks();
    renderTasks();
});

// Load saved tasks when the page opens
renderTasks();
