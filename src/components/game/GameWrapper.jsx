import Image from "next/image"
import Button from "@/components/Button"
import background from "@/assets/background.webp"
import { usePlayerContext } from "@/context/player"
import { useSocketContext } from "@/context/socket"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { motion } from "framer-motion"
import { FaHome, FaArrowRight } from "react-icons/fa"

export default function GameWrapper({ children, textNext, onNext, manager }) {
  const { socket } = useSocketContext()
  const { player, dispatch } = usePlayerContext()
  const router = useRouter()

  const [questionState, setQuestionState] = useState()

  useEffect(() => {
    socket.on("game:kick", () => {
      dispatch({
        type: "LOGOUT",
      })

      router.replace("/")
    })

    socket.on("game:updateQuestion", ({ current, total }) => {
      setQuestionState({
        current,
        total,
      })
    })

    return () => {
      socket.off("game:kick")
      socket.off("game:updateQuestion")
    }
  }, [])

  return (
    <section className="relative flex min-h-screen w-full flex-col justify-between">
      <div className="fixed left-0 top-0 -z-10 h-full w-full bg-gradient-to-br from-brand-dark to-gray-900 opacity-95">
        <Image
          className="pointer-events-none h-full w-full object-cover opacity-10 blend-overlay"
          src={background}
          alt="background"
        />
      </div>

      <div className="flex w-full justify-between p-4">
        {questionState && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shadow-inset flex items-center rounded-md bg-gradient-to-r from-brand-red to-brand-blue p-2 px-4 text-lg font-bold text-white"
          >
            {`${questionState.current} / ${questionState.total}`}
          </motion.div>
        )}

        {manager && (
          <Button
            className="self-end bg-white px-4 !text-brand-red hover:bg-white/90 transition-colors"
            onClick={() => onNext()}
          >
            {textNext} <FaArrowRight className="ml-2" />
          </Button>
        )}
      </div>

      {children}

      {!manager && (
        <div className="z-50 flex items-center justify-between bg-white dark:bg-gray-800 px-4 py-2 text-lg font-bold shadow-lg">
          <p className="text-gray-800 dark:text-white">{!!player && player.username}</p>
          <div className="rounded-md bg-gradient-to-r from-brand-red to-brand-blue px-3 py-1 text-lg text-white">
            {!!player && player.points}
          </div>
        </div>
      )}
    </section>
  )
}