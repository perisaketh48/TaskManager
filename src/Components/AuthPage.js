import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Link,
  CircularProgress,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircleOutline,
  ErrorOutline,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success', 'error', 'warning', 'info'
  });

  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setErrors({});
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return validations;
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidations = validatePassword(password);
      if (!passwordValidations.length) {
        newErrors.password = "Password must be at least 8 characters";
      }
    }

    // Registration specific validations
    if (activeTab === 1) {
      if (!firstName || !lastName) {
        newErrors.name = "First Name and Last Name are required";
      }

      // Show detailed password requirements if password exists but doesn't meet criteria
      if (password) {
        const passwordValidations = validatePassword(password);
        if (!Object.values(passwordValidations).every((v) => v)) {
          newErrors.passwordRequirements = passwordValidations;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://taskmanager-backend-5vyz.onrender.com/auth/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);

        setSnackbar({
          open: true,
          message: "Login successful!",
          severity: "success",
        });
        setInterval(() => {
          sessionStorage.setItem("hasNavigatedAfterLogin", "true");
          navigate("/dashboard");
        }, 2000);
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Login failed",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://taskmanager-backend-5vyz.onrender.com/auth/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            phone,
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", email);

        setSnackbar({
          open: true,
          message: "Registration successful!",
          severity: "success",
        });
        navigate("/dashboard");
      } else {
        setSnackbar({
          open: true,
          message: data.message || "Registration failed",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Network error. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordRequirements = () => {
    if (!errors.passwordRequirements || activeTab === 0) return null;

    const requirements = [
      { key: "length", label: "At least 8 characters" },
      { key: "uppercase", label: "At least one uppercase letter" },
      { key: "lowercase", label: "At least one lowercase letter" },
      { key: "number", label: "At least one number" },
      { key: "specialChar", label: "At least one special character" },
    ];

    return (
      <Box sx={{ mt: 1, px: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Password Requirements:
        </Typography>
        <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0 }}>
          {requirements.map((req) => (
            <Box
              component="li"
              key={req.key}
              sx={{
                display: "flex",
                alignItems: "center",
                color: errors.passwordRequirements[req.key]
                  ? "#4caf50"
                  : "#f44336",
                fontSize: "0.8rem",
                mb: 0.5,
              }}
            >
              {errors.passwordRequirements[req.key] ? (
                <CheckCircleOutline sx={{ fontSize: "1rem", mr: 0.5 }} />
              ) : (
                <ErrorOutline sx={{ fontSize: "1rem", mr: 0.5 }} />
              )}
              {req.label}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, Noto Sans, sans-serif",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          px: 5,
          flex: 1,
          justifyContent: "center",
          py: 5,
          display: "flex",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: 512,
            maxWidth: "100%",
            py: 2.5,
          }}
        >
          {/* Header */}
          <Typography
            sx={{
              color: "#101418",
              fontSize: "28px",
              fontWeight: "bold",
              lineHeight: "1.25",
              px: 2,
              textAlign: "center",
              pb: 1.5,
              pt: 2.5,
            }}
          >
            Welcome to TaskMaster
          </Typography>

          {/* Tabs */}
          <Box
            sx={{
              borderBottom: "1px solid #d4dbe2",
              px: 2,
              pb: 0,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTabs-indicator": {
                  height: "3px",
                  backgroundColor: "#dce7f3",
                },
              }}
            >
              <Tab
                label="Login"
                sx={{
                  textTransform: "none",
                  color: activeTab === 0 ? "#101418" : "#5c728a",
                  fontWeight: "bold",
                  fontSize: "14px",
                  letterSpacing: "0.015em",
                  minHeight: "56px",
                  "&.Mui-selected": {
                    color: "#101418",
                  },
                }}
              />
              <Tab
                label="Register"
                sx={{
                  textTransform: "none",
                  color: activeTab === 1 ? "#101418" : "#5c728a",
                  fontWeight: "bold",
                  fontSize: "14px",
                  letterSpacing: "0.015em",
                  minHeight: "56px",
                  "&.Mui-selected": {
                    color: "#101418",
                  },
                }}
              />
            </Tabs>
          </Box>

          {/* Form Fields */}
          {activeTab === 1 && (
            <Box sx={{ px: 2, py: 1.5 }}>
              <TextField
                fullWidth
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={{
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    height: "56px",
                    backgroundColor: "#f8fafc",
                    "& fieldset": {
                      borderColor: errors.email ? "#f44336" : "#d4dbe2",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.email ? "#f44336" : "#d4dbe2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.email ? "#f44336" : "#d4dbe2",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#101418",
                    "&::placeholder": {
                      color: "#5c728a",
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ px: 2, py: 1.5 }}>
              <TextField
                fullWidth
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={{
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    height: "56px",
                    backgroundColor: "#f8fafc",
                    "& fieldset": {
                      borderColor: errors.email ? "#f44336" : "#d4dbe2",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.email ? "#f44336" : "#d4dbe2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.email ? "#f44336" : "#d4dbe2",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#101418",
                    "&::placeholder": {
                      color: "#5c728a",
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          )}

          <Box sx={{ px: 2, py: 1.5 }}>
            <TextField
              fullWidth
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  height: "56px",
                  backgroundColor: "#f8fafc",
                  "& fieldset": {
                    borderColor: errors.email ? "#f44336" : "#d4dbe2",
                  },
                  "&:hover fieldset": {
                    borderColor: errors.email ? "#f44336" : "#d4dbe2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: errors.email ? "#f44336" : "#d4dbe2",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#101418",
                  "&::placeholder": {
                    color: "#5c728a",
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          {activeTab === 1 && (
            <Box sx={{ px: 2, py: 1.5 }}>
              <TextField
                fullWidth
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                sx={{
                  mb: 1.5,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    height: "56px",
                    backgroundColor: "#f8fafc",
                    "& fieldset": {
                      borderColor: errors.email ? "#f44336" : "#d4dbe2",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.email ? "#f44336" : "#d4dbe2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.email ? "#f44336" : "#d4dbe2",
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: "#101418",
                    "&::placeholder": {
                      color: "#5c728a",
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          )}

          <Box sx={{ px: 2, py: 1.5 }}>
            <TextField
              fullWidth
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{ color: "#5c728a" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  height: "56px",
                  backgroundColor: "#f8fafc",
                  "& fieldset": {
                    borderColor: errors.password ? "#f44336" : "#d4dbe2",
                  },
                  "&:hover fieldset": {
                    borderColor: errors.password ? "#f44336" : "#d4dbe2",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: errors.password ? "#f44336" : "#d4dbe2",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#101418",
                  "&::placeholder": {
                    color: "#5c728a",
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>

          {renderPasswordRequirements()}

          {/* Submit Button */}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Button
              fullWidth
              onClick={activeTab === 0 ? handleLogin : handleRegister}
              disabled={loading}
              sx={{
                borderRadius: "16px",
                height: "40px",
                backgroundColor: "#dce7f3",
                color: "#101418",
                fontSize: "14px",
                fontWeight: "bold",
                letterSpacing: "0.015em",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#cbd6e2",
                },
                "&:disabled": {
                  backgroundColor: "#e7edf4",
                  color: "#5c728a",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : activeTab === 0 ? (
                "Login"
              ) : (
                "Register"
              )}
            </Button>
          </Box>

          {/* Switch Link */}
          <Typography
            sx={{
              color: "#5c728a",
              fontSize: "14px",
              fontWeight: "normal",
              textAlign: "center",
              py: 0.5,
              px: 2,
              textDecoration: "underline",
              cursor: "pointer",
            }}
            onClick={() => {
              setActiveTab(activeTab === 0 ? 1 : 0);
              setErrors({});
            }}
          >
            {activeTab === 0
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Typography>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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

export default AuthPage;
