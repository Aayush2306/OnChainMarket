import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { queryClient } from "@/lib/queryClient";

const SOCKET_URL = "https://price-production-c1cb.up.railway.app";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  joinUserRoom: () => void;
  leaveUserRoom: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("round_update", (data: { crypto: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rounds", data.crypto] });
    });

    newSocket.on("round_resolved", (data: { crypto: string; round_id: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rounds", data.crypto] });
      queryClient.invalidateQueries({ queryKey: ["/api/live-bets", data.round_id, data.crypto] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-stats"] });
    });

    newSocket.on("new_bet", (data: { round_id: number; crypto: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-bets", data.round_id, data.crypto] });
    });

    newSocket.on("credits_update", () => {
      refreshUser();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [refreshUser]);

  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit("join_user", { user_id: user.id });
    }
  }, [socket, isConnected, user]);

  const joinRoom = useCallback((room: string) => {
    if (socket && isConnected) {
      socket.emit("join", { room: `${room}-room` });
    }
  }, [socket, isConnected]);

  const leaveRoom = useCallback((room: string) => {
    if (socket && isConnected) {
      socket.emit("leave", { room: `${room}-room` });
    }
  }, [socket, isConnected]);

  const joinUserRoom = useCallback(() => {
    if (socket && isConnected && user) {
      socket.emit("join_user", { user_id: user.id });
    }
  }, [socket, isConnected, user]);

  const leaveUserRoom = useCallback(() => {
    if (socket && isConnected && user) {
      socket.emit("leave_user", { user_id: user.id });
    }
  }, [socket, isConnected, user]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
        joinUserRoom,
        leaveUserRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
