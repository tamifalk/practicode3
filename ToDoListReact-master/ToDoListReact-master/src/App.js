// src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import service from './service.js';
import Login from './login.js';
import Register from './register.js';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={() => setToken(localStorage.getItem("token"))} />} />
      <Route path="/register" element={<Register onLogin={() => setToken(localStorage.getItem("token"))} />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <TodoPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function TodoPage() {
  const [newTodo, setNewTodo] = useState("");
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  async function getTodos() {
    try {
      const result = await service.getTasks();
      setTodos(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      setTodos([]);
    }
  }

  async function createTodo(e) {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const newItem = { Name: newTodo, IsComplete: false };
    try {
      const addedItem = await service.addTask(newItem);
      setTodos(prev => [...prev, addedItem]);
      setNewTodo("");
    } catch (err) {
      console.error("Failed to add todo:", err);
    }
  }

  async function updateCompleted(todo, isComplete) {
    try {
      await service.setCompleted(todo.Id, isComplete);
      setTodos(prev =>
        prev.map(t => (t.Id === todo.Id ? { ...t, IsComplete: isComplete } : t))
      );
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  }

  async function deleteTodo(id) {
    try {
      await service.deleteTask(id);
      setTodos(prev => prev.filter(t => t.Id !== id));
    } catch (err) {
      console.error("Failed to delete todo:", err);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  useEffect(() => {
    getTodos();
  }, []);

  return (
    <section className="todoapp">
      <button
        onClick={logout}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '0.5rem 1rem',
          backgroundColor: '#ff4d4d',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          zIndex: 1000
        }}
      >
        Logout
      </button>

      <header className="header">
        <h1>todos</h1>
        <form onSubmit={createTodo} style={{ marginTop: '2rem' }}>
          <input
            className="new-todo"
            placeholder="Well, let's take on the day"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
        </form>
      </header>

      <section className="main" style={{ display: 'block' }}>
        <ul className="todo-list">
          {Array.isArray(todos) && todos.length > 0 ? (
            todos.map(todo => (
              <li className={todo.IsComplete ? "completed" : ""} key={todo.Id}>
                <div className="view">
                  <input
                    className="toggle"
                    type="checkbox"
                    checked={todo.IsComplete}
                    onChange={(e) => updateCompleted(todo, e.target.checked)}
                  />
                  <label>{todo.Name}</label>
                  <button className="destroy" onClick={() => deleteTodo(todo.Id)}></button>
                </div>
              </li>
            ))
          ) : (
            <li>No tasks found</li>
          )}
        </ul>
      </section>
    </section>
  );
}

export default App;
