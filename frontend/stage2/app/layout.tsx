import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";
import NavBar from "@/components/NavBar";
import Sidebar from "@/components/Sidebar";
import Box from "@mui/material/Box";

export const metadata: Metadata = {
  title: "AffordMed Campus Notifications",
  description: "Campus notification inbox — Placements, Events, Results",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <ThemeRegistry>
          <Box sx={{ display: "flex", minHeight: "100vh" }}>
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Content column */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              {/* Mobile top bar */}
              <NavBar />

              {/* Page content */}
              <Box
                component="main"
                sx={{
                  flex: 1,
                  bgcolor: "background.default",
                  px: { xs: 2, sm: 3, md: 4, lg: 5 },
                  py: { xs: 2.5, sm: 3.5 },
                  maxWidth: { lg: 960 },
                }}
              >
                {children}
              </Box>
            </Box>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
