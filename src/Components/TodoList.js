import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  Delete as DeleteIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { PlusCircle } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Header from "./Header";

const TodoList = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [folderId, setFolderId] = useState(null);
  const [newTodo, setNewTodo] = useState({
    text: "",
    description: "",
    dueDate: "",
    priority: "medium",
  });
  const [folderData, setFolderData] = useState({
    id: null,
    name: "My Todos",
    locked: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [passwordDialog, setPasswordDialog] = useState({
    open: false,
    password: "",
    error: "",
    todoId: null,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        let data = location.state;
        if (!data) {
          const saved = localStorage.getItem("currentFolder");
          if (saved) data = JSON.parse(saved);
        }

        if (!data && id) {
          data = {
            folderId: id,
            folderData: {},
            todos: [],
          };
        }

        if (!data?.folderId) {
          throw new Error("No folder data available");
        }

        setFolderId(data.folderId);
        setFolderData(data.folderData || {});
        setTodos(data.todos || []);

        await fetchTodosFromBackend(data.folderId);
        setIsReady(true);
        setLoading(false);
      } catch (error) {
        console.error("Initialization error:", error);
        navigate("/dashboard");
      }
    };

    initialize();
  }, [id, location.state, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const fetchTodosFromBackend = async (folderId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await axios.post(
        `https://taskmanager-backend-5vyz.onrender.com/auth/folders/${folderId}/todos/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      const todosData = response.data.todos || [];
      setTodos(todosData);

      // Update localStorage
      const currentData =
        JSON.parse(localStorage.getItem("currentFolder")) || {};
      localStorage.setItem(
        "currentFolder",
        JSON.stringify({
          ...currentData,
          todos: todosData,
          lastUpdated: Date.now(),
        })
      );

      return true;
    } catch (error) {
      console.error("Fetch error:", error);

      if (error.response?.status === 401) {
        // Handle token expiration
        if (error.response.data?.error?.includes("token")) {
          localStorage.removeItem("token");
          navigate("/");
          return false;
        }
        // Handle password protected folders
        if (error.response.data?.error?.includes("password")) {
          setPasswordDialog({ open: true });
          return false;
        }
      }

      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to fetch todos",
        severity: "error",
      });
      return false;
    }
  };

  const handlePasswordVerified = async () => {
    try {
      // Verify the password first
      const verifyResponse = await axios.post(
        `https://taskmanager-backend-5vyz.onrender.com/auth/folders/${folderId}/verify/`,
        { password: passwordDialog.password },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      // If verification succeeds, fetch todos with password
      const response = await axios.post(
        `https://taskmanager-backend-5vyz.onrender.com/auth/folders/${folderId}/todos/`,
        { password: passwordDialog.password },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      const todosData = Array.isArray(response.data.todos)
        ? response.data.todos
        : [];
      setTodos(todosData);

      // Update localStorage
      const currentFolder =
        JSON.parse(localStorage.getItem("currentFolder")) || {};
      localStorage.setItem(
        "currentFolder",
        JSON.stringify({
          ...currentFolder,
          todos: todosData,
        })
      );

      setPasswordDialog({
        open: false,
        password: "",
        error: "",
        todoId: null,
      });
    } catch (err) {
      setPasswordDialog({
        ...passwordDialog,
        error: err.response?.data?.message || "Invalid password",
      });
    }
  };
  const handleAccordionChange = (id) => (event, isExpanded) => {
    setExpanded(isExpanded ? id : null);
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleMouseDownPassword = (e) => e.preventDefault();

  const isEmptyState = !loading && todos.length === 0;

  const handleToggle = async (event, id) => {
    event.stopPropagation();
    try {
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      setTodos(updatedTodos);

      await axios.put(
        `https://taskmanager-backend-5vyz.onrender.com/auth/todos/${id}/`,
        { completed: !todos.find((t) => t.id === id).completed },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );
      setSnackbar({
        open: true,
        message: "Todo updated successfully",
        severity: "success",
      });
    } catch (err) {
      setTodos(todos);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update todo",
        severity: "error",
      });
    }
  };

  const handleDeleteClick = (event, id) => {
    event.stopPropagation();
    if (folderData.locked) {
      setPasswordDialog({
        open: true,
        password: "",
        error: "",
        todoId: id,
      });
    } else {
      handleDelete(id);
    }
  };

  const verifyFolderPassword = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
        data: {
          password: passwordDialog.password,
        },
      };

      await axios.delete(
        `https://taskmanager-backend-5vyz.onrender.com/auth/todos/${passwordDialog.todoId}/`,
        config
      );

      setTodos(todos.filter((todo) => todo.id !== passwordDialog.todoId));
      setPasswordDialog({
        open: false,
        password: "",
        error: "",
        todoId: null,
      });
      setSnackbar({
        open: true,
        message: "Todo deleted successfully",
        severity: "success",
      });
    } catch (err) {
      setPasswordDialog({
        ...passwordDialog,
        error: err.response?.data?.message || "Invalid password",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const config = {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      };

      // Only add password to request body if folder is locked
      if (folderData.locked) {
        config.data = { password: passwordDialog.password };
      }

      await axios.delete(
        `https://taskmanager-backend-5vyz.onrender.com/auth/todos/${id}/`,
        config
      );
      setTodos(todos.filter((todo) => todo.id !== id));
      setSnackbar({
        open: true,
        message: "Todo deleted successfully",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete todo",
        severity: "error",
      });
    }
  };

  const handleAddClick = () => {
    if (folderData.locked) {
      setPasswordDialog({
        open: true,
        password: "",
        error: "",
        todoId: null, // Using null to indicate this is for add operation
      });
    } else {
      setOpenModal(true);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.text.trim()) return;

    try {
      const requestData = {
        folder_id: folderId,
        title: newTodo.text,
        description: newTodo.description,
        due_date: newTodo.dueDate,
        priority: newTodo.priority,
      };

      // Add password if folder is locked
      if (folderData.locked) {
        requestData.password = passwordDialog.password;
      }

      const response = await axios.post(
        "https://taskmanager-backend-5vyz.onrender.com/auth/todos/",
        requestData,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      setTodos([...todos, response.data]);
      setNewTodo({
        text: "",
        description: "",
        dueDate: "",
        priority: "medium",
      });
      setOpenModal(false);
      setSnackbar({
        open: true,
        message: "Todo created successfully",
        severity: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to create todo",
        severity: "error",
      });
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!folderId) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Typography color="error">No folder selected</Typography>
        <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
      </Box>
    );
  }
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        flexDirection: "column",
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, Noto Sans, sans-serif",
        overflowX: "hidden",
      }}
    >
      <Header />
      <Box
        sx={{
          display: "flex",
          gap: 1,
          px: 6,
          flex: 1,
          justifyContent: "center",
          py: 5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 960,
            flex: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: 1.5,
              p: 2,
            }}
          >
            <Box
              sx={{
                minWidth: 288,
                display: "flex",
                flexDirection: "column",
                gap: 0.75,
              }}
            >
              <Typography
                sx={{
                  color: "#0d141c",
                  fontSize: "32px",
                  fontWeight: "bold",
                  lineHeight: "1.25",
                }}
              >
                {folderData.name || "My Todos"}
              </Typography>
              <Typography
                sx={{
                  color: "#49709c",
                  fontSize: "14px",
                  fontWeight: "normal",
                  lineHeight: "normal",
                }}
              >
                {todos.length} {todos.length === 1 ? "item" : "items"}
              </Typography>
            </Box>
          </Box>

          {isEmptyState ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "50vh",
                textAlign: "center",
                gap: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "#5c728a",
                }}
              >
                No todos found in this folder
              </Typography>
              <Button
                onClick={() => setOpenModal(true)}
                startIcon={<PlusCircle />}
                sx={{
                  borderRadius: "8px",
                  backgroundColor: "#0c77f2",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#0a66d4",
                  },
                }}
              >
                Create Your First Todo
              </Button>
            </Box>
          ) : (
            <>
              <List sx={{ p: 0 }}>
                {todos.map((todo) => (
                  <Accordion
                    key={todo.id}
                    expanded={expanded === todo.id}
                    onChange={handleAccordionChange(todo.id)}
                    sx={{
                      backgroundColor: "#f8fafc",
                      boxShadow: "none",
                      "&:before": {
                        display: "none",
                      },
                      "&.Mui-expanded": {
                        margin: 0,
                      },
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={todo.completed}
                          onChange={(e) => handleToggle(e, todo.id)}
                          onClick={(e) => e.stopPropagation()}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={todo.title}
                        secondary={
                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Chip
                              size="small"
                              icon={<CalendarIcon />}
                              label={new Date(
                                todo.due_date
                              ).toLocaleDateString()}
                              color={getPriorityColor(todo.priority)}
                            />
                          </Box>
                        }
                      />
                      <IconButton
                        edge="end"
                        sx={{ marginRight: "10px" }}
                        onClick={(e) => handleDeleteClick(e, todo.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>{todo.description}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </List>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  overflow: "hidden",
                  px: 5,
                  py: 2.5,
                }}
              >
                <Button
                  onClick={handleAddClick}
                  sx={{
                    maxWidth: 480,
                    cursor: "pointer",
                    overflow: "hidden",
                    borderRadius: "8px",
                    height: 56,
                    backgroundColor: "#0c77f2",
                    color: "#ffffff",
                    fontSize: "16px",
                    fontWeight: "bold",
                    letterSpacing: "0.015em",
                    minWidth: 0,
                    px: 1,
                    gap: 1,
                    pl: 2,
                    pr: 3,
                    "&:hover": {
                      backgroundColor: "#0a66d4",
                    },
                  }}
                  startIcon={<PlusCircle />}
                >
                  Add Task
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Box>

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            width: "100%",
            maxWidth: "500px",
            backgroundColor: "#ffffff",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#0d141c",
            fontSize: "24px",
            fontWeight: "bold",
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          Add New Todo
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ pt: 1 }}>
              <Typography
                sx={{
                  color: "#0d141c",
                  fontSize: "14px",
                  fontWeight: "medium",
                  mb: 1,
                }}
              >
                Todo Title*
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter todo title"
                value={newTodo.text}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, text: e.target.value })
                }
                required
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    "& fieldset": {
                      borderColor: "#d4dbe2",
                    },
                    "&:hover fieldset": {
                      borderColor: "#d4dbe2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0c77f2",
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#0d141c",
                    fontSize: "16px",
                    height: "48px",
                    padding: "0 16px",
                    "&::placeholder": {
                      color: "#5c728a",
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ pb: 1 }}>
              <Typography
                sx={{
                  color: "#0d141c",
                  fontSize: "14px",
                  fontWeight: "medium",
                  mb: 1,
                }}
              >
                Description (Optional)
              </Typography>
              <TextField
                fullWidth
                placeholder="Add a description"
                value={newTodo.description}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, description: e.target.value })
                }
                multiline
                rows={4}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    "& fieldset": {
                      borderColor: "#d4dbe2",
                    },
                    "&:hover fieldset": {
                      borderColor: "#d4dbe2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0c77f2",
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#0d141c",
                    fontSize: "16px",
                    padding: "16px",
                    "&::placeholder": {
                      color: "#5c728a",
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ pb: 1 }}>
              <Typography
                sx={{
                  color: "#0d141c",
                  fontSize: "14px",
                  fontWeight: "medium",
                  mb: 1,
                }}
              >
                Due Date
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={newTodo.dueDate}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, dueDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    "& fieldset": {
                      borderColor: "#d4dbe2",
                    },
                    "&:hover fieldset": {
                      borderColor: "#d4dbe2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0c77f2",
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#0d141c",
                    fontSize: "16px",
                    height: "48px",
                    padding: "0 16px",
                  },
                }}
              />
            </Box>

            <Box sx={{ pb: 1 }}>
              <Typography
                sx={{
                  color: "#0d141c",
                  fontSize: "14px",
                  fontWeight: "medium",
                  mb: 1,
                }}
              >
                Priority
              </Typography>
              <TextField
                fullWidth
                select
                value={newTodo.priority}
                onChange={(e) =>
                  setNewTodo({ ...newTodo, priority: e.target.value })
                }
                SelectProps={{ native: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: "#f8fafc",
                    "& fieldset": {
                      borderColor: "#d4dbe2",
                    },
                    "&:hover fieldset": {
                      borderColor: "#d4dbe2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0c77f2",
                      borderWidth: "1px",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#0d141c",
                    fontSize: "16px",
                    height: "48px",
                    padding: "0 16px",
                  },
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </TextField>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #e7edf4",
          }}
        >
          <Button
            onClick={() => setOpenModal(false)}
            sx={{
              borderRadius: "8px",
              height: "40px",
              px: 2,
              backgroundColor: "#e7edf4",
              color: "#0d141c",
              fontSize: "14px",
              fontWeight: "medium",
              "&:hover": {
                backgroundColor: "#dbe4f0",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddTodo}
            disabled={!newTodo.text.trim()}
            sx={{
              borderRadius: "8px",
              height: "40px",
              textTransform: "none",
              px: 2,
              backgroundColor: "#0c77f2",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#0a66d4",
              },
              "&:disabled": {
                backgroundColor: "#e7edf4",
                color: "#5c728a",
              },
            }}
          >
            Add Todo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={passwordDialog.open}
        onClose={() => setPasswordDialog({ ...passwordDialog, open: false })}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "#ffffff",
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#0d141c",
            fontSize: "20px",
            fontWeight: "bold",
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          {passwordDialog.todoId ? "Delete Todo" : "Add Todo"} - Enter Password
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <TextField
            fullWidth
            placeholder="Enter password"
            type={showPassword ? "text" : "password"}
            value={passwordDialog.password}
            onChange={(e) =>
              setPasswordDialog({
                ...passwordDialog,
                password: e.target.value,
                error: "",
              })
            }
            error={!!passwordDialog.error}
            helperText={passwordDialog.error}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                "& fieldset": {
                  borderColor: "#d4dbe2",
                },
                "&:hover fieldset": {
                  borderColor: "#d4dbe2",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0c77f2",
                  borderWidth: "1px",
                },
              },
              "& .MuiInputBase-input": {
                color: "#0d141c",
                fontSize: "16px",
                height: "48px",
                padding: "0 16px",
                "&::placeholder": {
                  color: "#5c728a",
                  opacity: 1,
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #e7edf4",
          }}
        >
          <Button
            onClick={() =>
              setPasswordDialog({ ...passwordDialog, open: false })
            }
            sx={{
              borderRadius: "8px",
              height: "40px",
              px: 2,
              backgroundColor: "#e7edf4",
              color: "#0d141c",
              fontSize: "14px",
              fontWeight: "medium",
              "&:hover": {
                backgroundColor: "#dbe4f0",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={verifyFolderPassword}
            disabled={!passwordDialog.password}
            sx={{
              borderRadius: "8px",
              height: "40px",
              textTransform: "none",
              px: 2,
              backgroundColor: "#0c77f2",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#0a66d4",
              },
              "&:disabled": {
                backgroundColor: "#e7edf4",
                color: "#5c728a",
              },
            }}
          >
            Unlock
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TodoList;
