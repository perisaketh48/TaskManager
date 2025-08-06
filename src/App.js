import logo from "./logo.svg";
import "./App.css";
import Dashboard from "./Components/Dashboard";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import TodoCreate from "./Components/TodoCreate";
import TodoList from "./Components/TodoList";
import AuthPage from "./Components/AuthPage";

function App() {
  function RequireAuth({ children }) {
    const location = useLocation();
    const token = localStorage.getItem("token");

    if (!token) {
      // Redirect to login, but save the location they came from
      return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
  }

  return (
    <>
      {" "}
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/todo-list/:id"
          element={
            <RequireAuth>
              <TodoList />
            </RequireAuth>
          }
        />
        <Route
          path="/todo-create"
          element={
            <RequireAuth>
              <TodoCreate />
            </RequireAuth>
          }
        />
      </Routes>
    </>
  );
}

export default App;
