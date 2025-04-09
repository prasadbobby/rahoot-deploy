import Image from "next/image"
import { usePlayerContext } from "@/context/player"
import Form from "@/components/Form"
import Button from "@/components/Button"
import Input from "@/components/Input"
import { useEffect, useState } from "react"
import { socket } from "@/context/socket"
import logo from "@/assets/logo.svg"
import toast from "react-hot-toast"
import { FaLock, FaArrowRight } from "react-icons/fa"

export default function ManagerPassword() {
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState("")

  const handleCreate = () => {
    if (!password) {
      toast.error("Please enter the manager password");
      return;
    }
    
    setLoading(true);
    socket.emit("manager:createRoom", password);
    
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleCreate()
    }
  }

  useEffect(() => {
    socket.on("game:errorMessage", (message) => {
      toast.error(message)
      setLoading(false);
    })

    return () => {
      socket.off("game:errorMessage")
    }
  }, [])

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center">
      <div className="absolute h-full w-full overflow-hidden">
        <div className="absolute -left-[15vmin] -top-[15vmin] min-h-[75vmin] min-w-[75vmin] rounded-full bg-gradient-to-r from-brand-red/15 to-brand-blue/15"></div>
        <div className="absolute -bottom-[15vmin] -right-[15vmin] min-h-[75vmin] min-w-[75vmin] rotate-45 bg-gradient-to-r from-brand-blue/15 to-brand-yellow/15"></div>
      </div>

      <Image src={logo} className="mb-6 h-32 animate-float" alt="logo" />

      <Form className="backdrop-blur-sm bg-white/70 dark:bg-brand-dark-card/70 border-white/20 dark:border-gray-700/30">
        <h1 className="text-2xl font-bold text-center mb-2">Manager Access</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-4">Enter your password to create a game room</p>
        
        <Input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Manager password"
          icon={FaLock}
        />
        <Button 
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          ) : (
            <>
              Access Game Room <FaArrowRight className="ml-2" />
            </>
          )}
        </Button>
      </Form>
    </section>
  )
}