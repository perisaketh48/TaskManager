import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  KeyboardArrowDown as CaretDownIcon,
} from "@mui/icons-material";
import Header from "./Header";
import axios from "axios";

const TodoCreate = () => {
  const [task, setTask] = useState({
    name: "",
    description: "",
    folder: "",
    dueDate: "",
    priority: "",
  });

  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const priorities = ["Low", "Medium", "High"];

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://taskmanager-backend-5vyz.onrender.com/auth/folders/",
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );
        setFolders(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch folders");
        setLoading(false);
      }
    };

    fetchFolders();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://taskmanager-backend-5vyz.onrender.com/auth/todos/",
        {
          title: task.name,
          description: task.description,
          folder_id: task.folder,
          due_date: task.dueDate,
          priority: task.priority.toLowerCase(),
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("Task created:", response.data);
      // Reset form after successful submission
      setTask({
        name: "",
        description: "",
        folder: "",
        dueDate: "",
        priority: "",
      });
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <Typography color="error">{error}</Typography>
        <Button onClick={() => window.location.reload()}>Retry</Button>
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
          px: 5,
          py: 2.5,
          display: "flex",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 960,
            width: 512,
            flex: 1,
            py: 2.5,
          }}
        >
          {/* Form Header */}
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
              Add Task
            </Typography>
          </Box>

          {/* Task Name */}
          <Box sx={{ maxWidth: 480, flexWrap: "wrap", pb: 1.5, px: 2 }}>
            <Typography
              sx={{
                color: "#0d141c",
                fontSize: "16px",
                fontWeight: "medium",
                pb: 1,
              }}
            >
              Task Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter task name"
              name="name"
              value={task.name}
              onChange={handleChange}
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  height: 56,
                  borderColor: "#cedae8",
                  "& fieldset": {
                    borderColor: "#cedae8",
                  },
                  "&:hover fieldset": {
                    borderColor: "#cedae8",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#cedae8",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#0d141c",
                  fontSize: "16px",
                  fontWeight: "normal",
                  "&::placeholder": {
                    color: "#49709c",
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          {/* Description */}
          <Box sx={{ maxWidth: 480, flexWrap: "wrap", pb: 1.5, px: 2 }}>
            <Typography
              sx={{
                color: "#0d141c",
                fontSize: "16px",
                fontWeight: "medium",
                pb: 1,
              }}
            >
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Add a description"
              name="description"
              value={task.description}
              onChange={handleChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  minHeight: 144,
                  borderColor: "#cedae8",
                  "& fieldset": {
                    borderColor: "#cedae8",
                  },
                  "&:hover fieldset": {
                    borderColor: "#cedae8",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#cedae8",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#0d141c",
                  fontSize: "16px",
                  fontWeight: "normal",
                  "&::placeholder": {
                    color: "#49709c",
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          {/* Folder */}
          <Box sx={{ maxWidth: 480, flexWrap: "wrap", pb: 1.5, px: 2 }}>
            <Typography
              sx={{
                color: "#0d141c",
                fontSize: "16px",
                fontWeight: "medium",
                pb: 1,
              }}
            >
              Folder
            </Typography>
            <FormControl fullWidth>
              <Select
                name="folder"
                value={task.folder}
                onChange={handleChange}
                displayEmpty
                required
                IconComponent={CaretDownIcon}
                sx={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  height: 56,
                  borderColor: "#cedae8",
                  "& .MuiSelect-select": {
                    color: task.folder ? "#0d141c" : "#49709c",
                    fontSize: "16px",
                    fontWeight: "normal",
                    padding: "15px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cedae8",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cedae8",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cedae8",
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select folder
                </MenuItem>
                {folders.map((folder) => (
                  <MenuItem key={folder.id} value={folder.id}>
                    {folder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Due Date */}
          <Box sx={{ maxWidth: 480, flexWrap: "wrap", pb: 1.5, px: 2 }}>
            <Typography
              sx={{
                color: "#0d141c",
                fontSize: "16px",
                fontWeight: "medium",
                pb: 1,
              }}
            >
              Due Date
            </Typography>
            <TextField
              fullWidth
              type="date"
              name="dueDate"
              value={task.dueDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  height: 56,
                  borderColor: "#cedae8",
                  "& fieldset": {
                    borderColor: "#cedae8",
                  },
                  "&:hover fieldset": {
                    borderColor: "#cedae8",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#cedae8",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#0d141c",
                  fontSize: "16px",
                  fontWeight: "normal",
                },
              }}
            />
          </Box>

          {/* Priority */}
          <Box sx={{ maxWidth: 480, flexWrap: "wrap", pb: 1.5, px: 2 }}>
            <Typography
              sx={{
                color: "#0d141c",
                fontSize: "16px",
                fontWeight: "medium",
                pb: 1,
              }}
            >
              Priority
            </Typography>
            <FormControl fullWidth>
              <Select
                name="priority"
                value={task.priority}
                onChange={handleChange}
                displayEmpty
                required
                IconComponent={CaretDownIcon}
                sx={{
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  height: 56,
                  borderColor: "#cedae8",
                  "& .MuiSelect-select": {
                    color: task.priority ? "#0d141c" : "#49709c",
                    fontSize: "16px",
                    fontWeight: "normal",
                    padding: "15px",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cedae8",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cedae8",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#cedae8",
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select priority
                </MenuItem>
                {priorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Submit Button */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", px: 2, py: 1.5 }}
          >
            <Button
              type="submit"
              sx={{
                minWidth: 84,
                maxWidth: 480,
                cursor: "pointer",
                overflow: "hidden",
                borderRadius: "8px",
                height: 40,
                px: 2,
                backgroundColor: "#0c77f2",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.015em",
                "&:hover": {
                  backgroundColor: "#0a66d4",
                },
              }}
            >
              Add Task
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TodoCreate;
