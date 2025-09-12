"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authHelpers } from "@/app/lib/supabase";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      // Clear pharmacy access
      localStorage.removeItem('pharmacyAccess');
      
      // Sign out from Supabase
      await authHelpers.signOut();
      
      // Redirect to login
      router.push('/authentication/login');
    };

    handleLogout();
  }, [router]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="h6">Signing out...</Typography>
    </Box>
  );
}
