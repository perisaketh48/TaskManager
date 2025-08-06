import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  Snackbar,
  Alert,
  InputAdornment,
} from "@mui/material";
import {
  ChevronLeft as CaretLeftIcon,
  ChevronRight as CaretRightIcon,
  Add as AddIcon,
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import axios from "axios";

const Dashboard = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: "",
    description: "",
    locked: false,
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [passwordDialog, setPasswordDialog] = useState({
    open: false,
    folderId: null,
    password: "",
    error: "",
  });
  const navigate = useNavigate();

  // Default image for all folders
  const defaultImage =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuASkom_M7v66Zu8wFcHMar05yd9bSqa-rVwPO5QgBlDcExcuvrAQeRlXCAK_TIR0jGGi_NrPKAES8Yj3VlQP8wd_i0prabMCUk3HeEKcXXerXQFXxnp45Jl4OUf_ea9mJsj_TZnYgW3tSXFBrEhOYDb4TLEsExMqPX0FPTAszWNlMf7klBya1fNJMssnrVnNg36NVJ_xZeAP478SJwqoRlx892NHBHFDfdrheCX490V-NvsJVBz5agVtq5rJl3Lpzq-1AnJpdwZfmk";

  // Generate random border colors
  const getRandomBorderColor = () => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#FFA07A",
      "#98D8C8",
      "#F06292",
      "#7986CB",
      "#9575CD",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    const hasNavigated = sessionStorage.getItem("hasNavigatedAfterLogin");

    if (hasNavigated) {
      // Remove the flag to prevent a future reload
      sessionStorage.removeItem("hasNavigatedAfterLogin");

      // Trigger the reload
      window.location.reload();
    }
  }, [navigate]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch folders from API
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await axios.get(
          "https://taskmanager-backend-5vyz.onrender.com/auth/folders/", // Updated endpoint
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );
        const foldersWithTasks = response.data.map((folder) => ({
          ...folder,
          tasks: `${folder.todo_count || 0} tasks`,
          borderColor: getRandomBorderColor(),
        }));
        setFolders(foldersWithTasks);

        if (response.data.length === 0) {
          setOpenModal(true);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch folders");
        setSnackbar({
          open: true,
          message: "Failed to fetch folders",
          severity: "error",
        });
      } finally {
        localStorage.removeItem("currentFolder");
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    setCreatingFolder(true);
    try {
      const response = await axios.post(
        "https://taskmanager-backend-5vyz.onrender.com/auth/folders/", // Updated endpoint
        {
          name: newFolder.name,
          locked: newFolder.locked,
          password: newFolder.locked ? newFolder.password : "",
          description: newFolder.description,
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      setFolders((prev) => [
        ...prev,
        {
          ...response.data,
          tasks: "0 tasks",
          borderColor: getRandomBorderColor(),
        },
      ]);
      setOpenModal(false);
      setNewFolder({ name: "", description: "", locked: false, password: "" });
      setSnackbar({
        open: true,
        message: "Folder created successfully!",
        severity: "success",
      });
    } catch (err) {
      setError("Failed to create folder");
      setSnackbar({
        open: true,
        message: "Failed to create folder",
        severity: "error",
      });
    } finally {
      setCreatingFolder(false);
    }
  };

  const fetchFolderTodos = async (folderId, password = null) => {
    try {
      const config = {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      };

      const requestData = password ? { password } : null;

      const response = await axios.post(
        `https://taskmanager-backend-5vyz.onrender.com/auth/folders/${folderId}/todos/`,
        requestData,
        config
      );

      const currentFolder = folders.find((f) => f.id === folderId) || {};

      navigate("/todo-list", {
        state: {
          folderId: folderId,
          todos: Array.isArray(response.data.todos) ? response.data.todos : [],
          folderData: {
            ...currentFolder,
            id: folderId,
            name: currentFolder.name || "Untitled Folder",
          },
        },
      });
    } catch (err) {
      console.error("Error fetching todos:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to fetch folder contents",
        severity: "error",
      });
    }
  };

  const verifyFolderPassword = async () => {
    try {
      await axios.post(
        `https://taskmanager-backend-5vyz.onrender.com/auth/folders/${passwordDialog.folderId}/verify/`,
        { password: passwordDialog.password },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      // If verification succeeds, fetch the todos
      fetchFolderTodos(passwordDialog.folderId, passwordDialog.password);

      // Close the dialog
      setPasswordDialog({
        ...passwordDialog,
        open: false,
      });
    } catch (err) {
      setPasswordDialog({
        ...passwordDialog,
        error: err.response?.data?.message || "Invalid password",
      });
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFolder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle folder click
  const handleFolderClick = async (folder) => {
    if (folder.locked) {
      setPasswordDialog({
        open: true,
        folderId: folder.id,
        password: "",
        error: "",
      });
      return;
    }

    // 1. Create a complete data package
    const folderData = {
      folderId: folder.id,
      folderData: folder,
      todos: [],
      timestamp: Date.now(),
    };

    // 2. Persist to localStorage first
    localStorage.setItem("currentFolder", JSON.stringify(folderData));

    // 3. Add a small delay to ensure state persistence
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 4. Navigate with both state and URL param
    navigate(`/todo-list/${folder.id}`, {
      state: folderData,
    });
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Typography color="error">{error}</Typography>
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
      <Box
        sx={{
          display: "flex",
          height: "100%",
          flexGrow: 1,
          flexDirection: "column",
        }}
      >
        <Header />

        {/* Main Content */}
        <Box
          sx={{
            px: 5,
            py: 2.5,
            display: "flex",
            flex: 1,
            justifyContent: "center",
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
            {/* Folders Header */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 1.5,
                p: 2,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: "#0d141c",
                  fontSize: "32px",
                  fontWeight: "bold",
                  lineHeight: "1.25",
                  minWidth: 288,
                }}
              >
                My Folders
              </Typography>

              <Button
                onClick={() => setOpenModal(true)}
                startIcon={<AddIcon />}
                sx={{
                  minWidth: 84,
                  maxWidth: 480,
                  cursor: "pointer",
                  overflow: "hidden",
                  borderRadius: "8px",
                  height: 32,
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
                New Folder
              </Button>
            </Box>

            {/* Empty State or Folders Grid */}
            {folders.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "50vh",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#5c728a",
                    mb: 2,
                  }}
                >
                  You don't have any folders yet
                </Typography>
                <Button
                  onClick={() => setOpenModal(true)}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: "8px",
                    backgroundColor: "#0c77f2",
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: "#0a66d4",
                    },
                  }}
                >
                  Create Your First Folder
                </Button>
              </Box>
            ) : (
              <>
                <Grid container spacing={2} sx={{ p: 2 }}>
                  {folders.map((folder) => (
                    <Grid
                      item
                      xs={6}
                      sm={4}
                      md={3}
                      lg={2}
                      key={folder.id}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                      }}
                      onClick={() => handleFolderClick(folder)}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.5,
                          height: "100%",
                        }}
                      >
                        <Box
                          sx={{
                            width: "100%",
                            height: 100,
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: `3px solid ${folder.borderColor}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#ffffff",
                            position: "relative",
                          }}
                        >
                          <img
                            src={defaultImage}
                            alt={folder.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          {folder.locked && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                borderRadius: "50%",
                                p: 0.5,
                              }}
                            >
                              <LockIcon
                                sx={{ color: "white", fontSize: "16px" }}
                              />
                            </Box>
                          )}
                        </Box>

                        <Box
                          sx={{
                            minHeight: 52,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            flexGrow: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              color: "#0d141c",
                              fontSize: "16px",
                              fontWeight: "medium",
                              lineHeight: "1.25",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {folder.name}
                          </Typography>
                          <Typography
                            sx={{
                              color: "#49709c",
                              fontSize: "14px",
                              fontWeight: "normal",
                              lineHeight: "1.25",
                            }}
                          >
                            {folder.tasks}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#5c728a",
                              fontStyle: "italic",
                            }}
                          >
                            Created:{" "}
                            {new Date(folder.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 2,
                  }}
                >
                  <IconButton sx={{ width: 40, height: 40 }}>
                    <CaretLeftIcon sx={{ fontSize: 18 }} />
                  </IconButton>

                  <Button
                    sx={{
                      fontSize: "14px",
                      fontWeight: "bold",
                      width: 40,
                      height: 40,
                      minWidth: 0,
                      color: "#0d141c",
                      backgroundColor: "#e7edf4",
                      borderRadius: "50%",
                      "&:hover": {
                        backgroundColor: "#dbe4f0",
                      },
                    }}
                  >
                    1
                  </Button>

                  <IconButton sx={{ width: 40, height: 40 }}>
                    <CaretRightIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Folder Creation Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        aria-labelledby="modal-title"
        aria-modal="true"
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
          Create New Folder
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
                Folder Name*
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter folder name"
                name="name"
                value={newFolder.name}
                onChange={handleInputChange}
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
                name="description"
                value={newFolder.description}
                onChange={handleInputChange}
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

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={newFolder.locked}
                onChange={(e) =>
                  setNewFolder({ ...newFolder, locked: e.target.checked })
                }
                sx={{
                  color: "#0c77f2",
                  "&.Mui-checked": {
                    color: "#0c77f2",
                  },
                }}
              />
              <Typography
                sx={{
                  color: "#0d141c",
                  fontSize: "14px",
                  fontWeight: "medium",
                }}
              >
                Lock this folder
              </Typography>
            </Box>

            {newFolder.locked && (
              <Box sx={{ pb: 1 }}>
                <Typography
                  sx={{
                    color: "#0d141c",
                    fontSize: "14px",
                    fontWeight: "medium",
                    mb: 1,
                  }}
                >
                  Password*
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={newFolder.password}
                  onChange={handleInputChange}
                  required={newFolder.locked}
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
              </Box>
            )}
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
            onClick={handleCreateFolder}
            disabled={
              !newFolder.name ||
              (newFolder.locked && !newFolder.password) ||
              creatingFolder
            }
          >
            {creatingFolder ? <CircularProgress size={24} /> : "Create Folder"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Verification Dialog */}
      <Dialog
        aria-labelledby="modal-title"
        aria-modal="true"
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
          Enter Folder Password
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

      {/* Snackbar for notifications */}
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

export default Dashboard;
