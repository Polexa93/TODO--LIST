import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [newTask, setNewTask] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");

  // Save tasks to localStorage every time tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // For drag and drop
  const draggingIndex = useRef(null);
  const taskRefs = useRef([]);

  const addTask = () => {
    if (newTask.trim() === "") return;
    setTasks([...tasks, newTask.trim()]);
    setNewTask("");
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditText(tasks[index]);
  };

  const saveEdit = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = editText.trim() || tasks[index];
    setTasks(updatedTasks);
    setEditIndex(null);
    setEditText("");
  };

  // Drag handlers
  const onDragStart = (index) => (e) => {
    draggingIndex.current = index;
    e.dataTransfer.effectAllowed = "move";

    const node = taskRefs.current[index];
    if (node) {
      const clone = node.cloneNode(true);

      clone.style.position = "absolute";
      clone.style.top = "-1000px";
      clone.style.left = "-1000px";
      clone.style.width = `${node.offsetWidth}px`;

      const style = window.getComputedStyle(node);
      clone.style.padding = style.padding;
      clone.style.backgroundColor = style.backgroundColor;
      clone.style.borderRadius = style.borderRadius;
      clone.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
      clone.style.fontSize = style.fontSize;
      clone.style.color = style.color;
      clone.style.display = "flex";
      clone.style.alignItems = "center";
      clone.style.justifyContent = "space-between";
      clone.style.cursor = "grabbing";
      clone.style.userSelect = "none";

      document.body.appendChild(clone);

      e.dataTransfer.setDragImage(clone, clone.offsetWidth / 2, clone.offsetHeight / 2);

      setTimeout(() => {
        document.body.removeChild(clone);
      }, 0);
    }

    e.dataTransfer.setData("text/plain", index);
  };

  const onDragOver = (index) => (e) => {
    e.preventDefault();
    if (draggingIndex.current === null || draggingIndex.current === index) return;

    const updatedTasks = [...tasks];
    const draggedTask = updatedTasks[draggingIndex.current];
    updatedTasks.splice(draggingIndex.current, 1);
    updatedTasks.splice(index, 0, draggedTask);

    draggingIndex.current = index;
    setTasks(updatedTasks);
  };

  const onDragEnd = () => {
    draggingIndex.current = null;
  };

  return (
    <div className="app-background-image">
      <div className="app">
        <h1>Todo List</h1>
        <div className="input-container">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a task"
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <button className="add-task-button" onClick={addTask}>
            Add
          </button>
        </div>

        {tasks.length > 0 && (
          <ul className="task-list">
            {tasks.map((task, index) => (
              <li
                key={index}
                className="task-card"
                draggable
                onDragStart={onDragStart(index)}
                onDragOver={onDragOver(index)}
                onDragEnd={onDragEnd}
                ref={(el) => (taskRefs.current[index] = el)}
              >
                {editIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(index);
                        if (e.key === "Escape") setEditIndex(null);
                      }}
                      autoFocus
                    />
                    <button onClick={() => saveEdit(index)}>Save</button>
                    <button onClick={() => setEditIndex(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span onClick={() => startEdit(index)}>{task}</span>
                    <button
                      className="edit-task-button"
                      onClick={() => startEdit(index)}
                      aria-label="Edit Task"
                      title="Edit"
                    >
                      <i className="fas fa-pen"></i>
                    </button>
                    <button
                      className="delete-task-button"
                      onClick={() => deleteTask(index)}
                      aria-label="Delete Task"
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
