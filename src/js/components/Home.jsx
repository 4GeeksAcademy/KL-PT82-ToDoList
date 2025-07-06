import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const groupTasksByDate = (tasks) => {
  return tasks.reduce((groups, task) => {
    const date = task.createdAt.split("T")[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
    return groups;
  }, {});
};

const isDueSoon = (dueDate) => {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  return diffMs >= 0 && diffMs <= 24 * 60 * 60 * 1000;
};

const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const now = new Date();
  const due = new Date(dueDate);
  return due < now;
};

const Home = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState(null);

  useEffect(() => {
    const dueTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        (isOverdue(t.dueDate) || isDueSoon(t.dueDate)) &&
        !t.done
    );
    if (dueTasks.length > 0) {
      alert(
        `Reminder: You have ${dueTasks.length} task(s) due soon or overdue!`
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      const newTask = {
        text: input.trim(),
        done: false,
        createdAt: new Date().toISOString(),
        dueDate: dueDate ? dueDate.toISOString() : null,
      };
      setTasks([...tasks, newTask]);
      setInput("");
      setDueDate(null);
    }
  };

  const toggleDone = (index) => {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  };

  const deleteTask = (indexToDelete) => {
    setTasks(tasks.filter((_, index) => index !== indexToDelete));
  };

  const groupedTasks = groupTasksByDate(tasks);
  const sortedDates = Object.keys(groupedTasks).sort((a, b) =>
    a < b ? 1 : -1
  );

  return (
    <div className="container mt-5">
      <h1 className="text-center fw-bold mb-4">
        To-Do List with Due Dates & Reminders
      </h1>

      <div className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Add a new task and press Enter"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <DatePicker
          selected={dueDate}
          onChange={(date) => setDueDate(date)}
          placeholderText="Due date (optional)"
          className="form-control"
          isClearable
          minDate={new Date()}
          dateFormat="MMM d, yyyy"
        />
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-muted fst-italic">No tasks, add a task</p>
      ) : (
        sortedDates.map((date) => (
          <div key={date} className="card mb-4 shadow rounded-4">
            <div className="card-header">
              {new Date(date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <ul className="list-group list-group-flush">
              {groupedTasks[date].map((task, index) => {
                const taskIndex = tasks.findIndex((t) => t === task);
                const dueSoon = isDueSoon(task.dueDate);
                const overdue = isOverdue(task.dueDate);
                return (
                  <li
                    key={taskIndex}
                    className={`list-group-item d-flex justify-content-between align-items-center task-item
                      ${task.done ? "list-group-item-success" : ""}
                      ${dueSoon && !task.done ? "border border-warning" : ""}
                      ${overdue && !task.done ? "border border-danger" : ""}
                    `}
                    title={
                      task.dueDate
                        ? `Due: ${formatDate(task.dueDate)}`
                        : undefined
                    }
                  >
                    <div className="d-flex align-items-center" style={{ flex: 1 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={task.done}
                        onChange={() => toggleDone(taskIndex)}
                        id={`task-checkbox-${taskIndex}`}
                      />
                      <label
                        htmlFor={`task-checkbox-${taskIndex}`}
                        className={task.done ? "task-done-label" : ""}
                        style={{ marginBottom: 0, flex: 1, userSelect: "none" }}
                      >
                        {task.text}
                      </label>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      {task.dueDate && (
                        <span
                          className={`badge ${
                            overdue
                              ? "badge-bg-danger"
                              : dueSoon
                              ? "badge-bg-warning"
                              : "badge-bg-info"
                          }`}
                        >
                          Due {formatDate(task.dueDate)}
                        </span>
                      )}
                      <button
                        className="btn btn-sm btn-link text-danger"
                        onClick={() => deleteTask(taskIndex)}
                        aria-label="Delete task"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default Home;
