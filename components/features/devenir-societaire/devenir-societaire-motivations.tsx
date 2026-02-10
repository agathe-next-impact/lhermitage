"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface Motivation {
  number: number
  text: string
}

interface DevenirSocietaireMotivationsProps {
  motivations: Motivation[]
}

function NumberReveal({ number, triggerScramble }: { number: number; triggerScramble: number }) {
  const [displayedNumber, setDisplayedNumber] = useState(number.toString())
  const targetText = number.toString()

  useEffect(() => {
    let iterations = 0
    const maxIterations = 15 // Number of scramble iterations

    const interval = setInterval(() => {
      if (iterations < maxIterations) {
        // Generate random number
        const randomNum = Math.floor(Math.random() * 10)
        setDisplayedNumber(randomNum.toString())
        iterations++
      } else {
        clearInterval(interval)
        setDisplayedNumber(targetText)
      }
    }, 50) // 50ms between each number change

    return () => clearInterval(interval)
  }, [triggerScramble, targetText])

  return <span className="font-bold text-xl">{displayedNumber}</span>
}

export function DevenirSocietaireMotivations({ motivations }: DevenirSocietaireMotivationsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [scrambleTrigger, setScrambleTrigger] = useState(0)

  const cardColors = ["#78AD7D", "#C14C66", "#DC6F45", "#56939F"]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % motivations.length)
      setScrambleTrigger((prev) => prev + 1)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [motivations.length])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {motivations.map((motivation, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex flex-col md:flex-row items-center md:items-start gap-4 p-6 rounded-lg transition-all duration-300 bg-white ${
            activeIndex === index ? "shadow-lg" : "hover:shadow-md"
          }`}
        >
          <div
            className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: cardColors[index % cardColors.length] }}
          >
            <span className="text-white">
              <NumberReveal number={motivation.number} triggerScramble={scrambleTrigger} />
            </span>
          </div>

          <div className="flex-1 text-brand-gray text-lg leading-relaxed text-center md:text-left">
            {motivation.text}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
