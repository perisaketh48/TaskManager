import {
  Box,
  Typography,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@mui/material/styles";

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userEmail = localStorage.getItem("email") || "user@example.com";

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const getInitials = (email) => {
    const [name] = email.split("@");
    return name.charAt(0).toUpperCase();
  };

  const handleNavigation = (path) => {
    if (window.location.pathname !== path) {
      navigate(path);
    }
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    localStorage.clear();
    handleNavigation("/");
    handleMenuClose();
  };

  const drawerLinks = (
    <List sx={{ width: 250 }}>
      <ListItem
        button
        onClick={() => {
          handleNavigation("/dashboard");
          setDrawerOpen(false);
        }}
      >
        <ListItemText primary="Home" />
      </ListItem>
      <ListItem
        button
        onClick={() => {
          handleNavigation("/todo-create");
          setDrawerOpen(false);
        }}
      >
        <ListItemText primary="Create Task" />
      </ListItem>
      <ListItem button onClick={handleLogout}>
        <ListItemText primary="Logout" />
      </ListItem>
    </List>
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e7edf4",
        px: { xs: 3, md: 5 },
        py: { xs: 2, md: 1.5 },
        width: "90%",
      }}
    >
      {/* Logo + Title */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 16, height: 16 }}>
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
          </svg>
        </Box>
        <Typography
          onClick={() => (localStorage.clear(), handleNavigation("/"))}
          variant="h6"
          sx={{
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
            lineHeight: "1.25",
            letterSpacing: "-0.015em",
          }}
        >
          TaskMaster
        </Typography>
      </Box>

      {/* Responsive Nav */}
      {isMobile ? (
        <>
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ ml: 1 }}>
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{ "& .MuiDrawer-paper": { height: "21%" } }}
          >
            {drawerLinks}
          </Drawer>
        </>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Typography
            onClick={() => handleNavigation("/dashboard")}
            sx={{
              cursor: "pointer",
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
              fontSize: "14px",
              fontWeight: "medium",
            }}
          >
            Create Task
          </Typography>

          {/* User Chip */}
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
                  fontSize: "14px",
                  fontWeight: "medium",
                },
              }}
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              MenuListProps={{
                onMouseLeave: handleMenuClose,
                sx: { py: 0 },
              }}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
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
      )}
    </Box>
  );
};

export default Header;
