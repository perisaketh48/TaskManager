import { Box, Typography, Chip, Avatar, Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const userEmail = localStorage.getItem("email") || "user@example.com";

  const getInitials = (email) => {
    const [name] = email.split("@");
    return name.charAt(0).toUpperCase();
  };

  const handleNavigation = (path) => {
    if (window.location.pathname !== path) {
      navigate(path);
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    handleNavigation("/");
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        whiteSpace: "nowrap",
        borderBottom: "1px solid #e7edf4",
        px: 5,
        py: 1.5,
      }}
    >
      {/* Logo + Title */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "#0d141c",
        }}
      >
        <Box sx={{ width: 16, height: 16 }}>
          <svg
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
          </svg>
        </Box>
        <Typography
          onClick={() => (localStorage.clear(), handleNavigation("/"))}
          variant="h6"
          sx={{
            cursor: "pointer",
            color: "#0d141c",
            fontSize: "18px",
            fontWeight: "bold",
            lineHeight: "1.25",
            letterSpacing: "-0.015em",
          }}
        >
          TaskMaster
        </Typography>
      </Box>

      {/* Menu + Icons */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          justifyContent: "flex-end",
          gap: 4,
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Typography
            onClick={() => handleNavigation("/dashboard")}
            sx={{
              cursor: "pointer",
              color: "#0d141c",
              fontSize: "14px",
              fontWeight: "medium",
            }}
          >
            Home
          </Typography>
          <Typography
            onClick={() => handleNavigation("/todo-create")}
            sx={{
              cursor: "pointer",
              color: "#0d141c",
              fontSize: "14px",
              fontWeight: "medium",
            }}
          >
            Create Task
          </Typography>
        </Box>

        {/* User Chip with Avatar and Menu */}
        <Box
          onMouseEnter={handleMenuOpen}
          onMouseLeave={handleMenuClose}
          sx={{ position: "relative" }}
        >
          <Chip
            avatar={
              <Avatar
                sx={{
                  bgcolor: "#7aa2cfff",
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "16px",
                }}
              >
                {getInitials(userEmail)}
              </Avatar>
            }
            label={userEmail}
            variant="outlined"
            sx={{
              cursor: "pointer",
              borderColor: "#e7edf4",
              backgroundColor: "#f8fafc",
              "& .MuiChip-label": {
                color: "#0d141c",
                fontSize: "14px",
                fontWeight: "medium",
              },
            }}
          />

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              onMouseLeave: handleMenuClose,
              sx: { py: 0 },
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            sx={{
              mt: 1,
              "& .MuiPaper-root": {
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: "#0d141c",
                fontSize: "14px",
                fontWeight: "medium",
                py: 1.5,
                px: 2,
                "&:hover": {
                  backgroundColor: "#f3f6f9",
                },
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
