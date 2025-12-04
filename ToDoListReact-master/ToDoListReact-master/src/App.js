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
      // ודאי שזה מערך
      setTodos(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      setTodos([]); // במקרה של שגיאה
    }
  }

  async function createTodo(e) {
    e.preventDefault();
    await service.addTask(newTodo);
    setNewTodo("");
    await getTodos();
  }

  async function updateCompleted(todo, isComplete) {
    await service.setCompleted(todo.id, isComplete);
    await getTodos();
  }

  async function deleteTodo(id) {
    await service.deleteTask(id);
    await getTodos();
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
              <li className={todo.isComplete ? "completed" : ""} key={todo.id}>
                <div className="view">
                  <input
                    className="toggle"
                    type="checkbox"
                    defaultChecked={todo.isComplete}
                    onChange={(e) => updateCompleted(todo, e.target.checked)}
                  />
                  <label>{todo.name}</label>
                  <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
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
