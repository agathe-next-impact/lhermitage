"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContactSuccessProps {
  message: string
  onReset: () => void
}

export function ContactSuccess({ message, onReset }: ContactSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-6 rounded-xl border border-brand-green/30 bg-brand-green/5 p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
      >
        <CheckCircle2 className="size-16 text-brand-green" />
      </motion.div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-brand-dark">Message envoyé</h3>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>

      <Button variant="outline" onClick={onReset}>
        Envoyer un autre message
      </Button>
    </motion.div>
  )
}
