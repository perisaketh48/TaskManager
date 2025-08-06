import { Box, Typography, IconButton } from "@mui/material";
import { Bell as BellIcon } from "lucide-react"; // or use your preferred icon source
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    if (window.location.pathname !== path) {
      navigate(path);
    }
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

        <Box
          sx={{
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            aspectRatio: "1/1",
            width: 40,
            borderRadius: "50%",
            backgroundImage:
              "url(https://lh3.googleusercontent.com/aida-public/AB6AXuCtIqHZ1mZqLfgWZZdFC4AKlfXnHaP76AVbRYVTxhTYTJNY8neBs4jD1HYAB3sAto5hKpecpCtefEeIr_2rSYiwWCTnHyeVasJCdLcPrdjRJLxTDgUE0HjDS1UXvbNIkLFz_SGGkab3E1BbWZeIFAlCYF_y9t5FnoQm8G2iNJQjo37mWBUDKT4Alw41tFsMvKUSHBKepvL-AGCDW_5zv4jbcM2g2tK0oRGT0NFZhxoWQm-qBYRo32PuKHXNKz4TesLTsBmxGafvTf4)",
          }}
        />
      </Box>
    </Box>
  );
};

export default Header;
