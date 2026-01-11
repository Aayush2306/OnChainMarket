import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SOCKET_URL = import.meta.env.VITE_API_URL || "https://price-production-c1cb.up.railway.app";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  joinUserRoom: () => void;
  leaveUserRoom: () => void;
  joinCustomBetRoom: (roundId: number) => void;
  leaveCustomBetRoom: (roundId: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.log("Socket connection error, falling back to polling:", err.message);
      setIsConnected(false);
    });

    newSocket.on("round_update", (data: { crypto: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rounds", data.crypto] });
    });

    newSocket.on("round_resolved", (data: { crypto: string; round_id: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rounds", data.crypto] });
      queryClient.invalidateQueries({ queryKey: ["/api/live-bets", data.round_id, data.crypto] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-stats"] });
    });

    newSocket.on("bet_result", (data: { status: string; crypto: string; profit: number; amount: number }) => {
      const isWin = data.status === "won";
      toast({
        title: isWin ? `You Won on ${data.crypto}!` : `You Lost on ${data.crypto}`,
        description: isWin 
          ? `+${data.profit} credits earned` 
          : `-${data.amount} credits lost`,
        variant: isWin ? "default" : "destructive",
      });
      refreshUser();
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    });

    newSocket.on("new_bet", (data: { round_id: number; crypto: string }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/live-bets", data.round_id, data.crypto] });
    });

    newSocket.on("credits_update", () => {
      refreshUser();
    });

    // Custom bet socket events
    newSocket.on("custom_bet_update", (data: { 
      round_id: number; 
      total_pool: number;
      higher_pool: number;
      lower_pool: number;
      bet_count: number;
    }) => {
      // Invalidate both the individual bet detail and the active list
      queryClient.invalidateQueries({ queryKey: ["/api/custom-bet", data.round_id] });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-bet/active"] });
    });

    newSocket.on("custom_bet_resolved", (data: { 
      round_id: number;
      token_symbol: string;
      result: string;
      total_pool: number;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-bet", data.round_id] });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-bet/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-stats"] });
      
      toast({
        title: `${data.token_symbol} Round Ended`,
        description: `Result: ${data.result.toUpperCase()} - Pool: ${data.total_pool} credits`,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [refreshUser, toast]);

  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit("join_user", { user_id: user.id });
      return () => {
        socket.emit("leave_user", { user_id: user.id });
      };
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

  const joinCustomBetRoom = useCallback((roundId: number) => {
    if (socket && isConnected) {
      socket.emit("join_custom_bet", { round_id: roundId });
    }
  }, [socket, isConnected]);

  const leaveCustomBetRoom = useCallback((roundId: number) => {
    if (socket && isConnected) {
      socket.emit("leave_custom_bet", { round_id: roundId });
    }
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
        joinUserRoom,
        leaveUserRoom,
        joinCustomBetRoom,
        leaveCustomBetRoom,
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
