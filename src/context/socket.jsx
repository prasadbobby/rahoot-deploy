import { createContext, useContext } from "react"
import { io } from "socket.io-client"
import { WEBSOCKET_PUBLIC_URL } from "../../config.mjs"

export const socket = io(WEBSOCKET_PUBLIC_URL, {
  transports: ["websocket", "polling"], // Added polling as fallback
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

export const SocketContext = createContext()

export const SocketContextProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
  )
}

export function useSocketContext() {
  const context = useContext(SocketContext)

  if (!context) {
    throw Error("useSocketContext must be used inside an SocketContextProvider")
  }

  return context
}
