import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "./context/SocketContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import AppToaster from "./components/Toast/AppToaster.jsx";
import "./styles/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      refetchOnWindowFocus: false,
      retry: 1
    },
    mutations: {
      retry: 0
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <BrowserRouter>
          <AppRoutes />
          <AppToaster />
        </BrowserRouter>
      </SocketProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
