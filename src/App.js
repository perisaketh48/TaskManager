import logo from "./logo.svg";
import "./App.css";
import Dashboard from "./Components/Dashboard";
import { Routes, Route } from "react-router-dom";
import TodoCreate from "./Components/TodoCreate";
import TodoList from "./Components/TodoList";
import AuthPage from "./Components/AuthPage";

function App() {
  return (
    <>
      {" "}
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/todo-list" element={<TodoList />} />
        <Route path="/todo-create" element={<TodoCreate />} />
      </Routes>
    </>
  );
}

export default App;
