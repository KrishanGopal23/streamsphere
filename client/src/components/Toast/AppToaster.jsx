import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "rgba(24,24,27,0.92)",
          color: "#FAFAFA",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(16px)",
          borderRadius: "8px"
        },
        success: {
          iconTheme: {
            primary: "#22C55E",
            secondary: "#09090B"
          }
        },
        error: {
          iconTheme: {
            primary: "#F43F5E",
            secondary: "#09090B"
          }
        }
      }}
    />
  );
}
