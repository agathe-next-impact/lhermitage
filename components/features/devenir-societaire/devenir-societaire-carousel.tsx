"use client"

import { useCallback, useEffect, useState } from "react"
import { motion, AnimatePresence, useAnimation, type Variants } from "framer-motion"
import Autoplay from "embla-carousel-autoplay"

import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"

interface CarouselProps {
  items: string[]
}

const carouselVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
}

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } },
}

export function DevenirSocietaireCarousel({ items }: CarouselProps) {
  const [progress, setProgress] = useState(0)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)
  const controls = useAnimation()

  const autoplayInterval = 5000

  const autoplay = Autoplay({
    delay: autoplayInterval,
    stopOnInteraction: false,
  })

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())
    setDirection(api.scrollSnapList().indexOf(api.selectedScrollSnap()) - current)

    const onSelect = () => {
      const newIndex = api.selectedScrollSnap()
      setCurrent(newIndex)
      setDirection(api.scrollSnapList().indexOf(newIndex) - current)
    }

    api.on("select", onSelect)
    return () => {
      api.off("select", onSelect)
    }
  }, [api, current])

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 0
        }
        const diff = 2
        return Math.min(oldProgress + diff, 100)
      })
    }, autoplayInterval / 50)

    return () => clearInterval(timer)
  }, [autoplayInterval])

  useEffect(() => {
    if (progress === 100) {
      controls.start({ scaleX: 0 }).then(() => {
        setProgress(0)
        controls.set({ scaleX: 1 })
      })
    } else {
      controls.start({ scaleX: progress / 100 })
    }
  }, [progress, controls])

  const handleSelect = useCallback(
    (index: number) => {
      api?.scrollTo(index)
    },
    [api],
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full rounded-lg overflow-hidden"
    >
      <Carousel
        setApi={setApi}
        plugins={[autoplay]}
        className="w-full relative"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          <AnimatePresence initial={false} custom={direction}>
            {items.map((item, index) => (
              <CarouselItem key={index}>
                <motion.div
                  variants={carouselVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={direction}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-brand-coral/20 to-brand-gray/20"
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  {/* Content */}
                  <motion.div
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-brand-coral text-white flex items-center justify-center">
                        <span className="text-3xl font-bold">{current + 1}</span>
                      </div>
                    </div>
                    <p className="text-white text-lg md:text-xl lg:text-2xl font-medium leading-relaxed max-w-2xl">
                      {item}
                    </p>
                  </motion.div>
                </motion.div>
              </CarouselItem>
            ))}
          </AnimatePresence>
        </CarouselContent>
      </Carousel>

      {/* Indicator dots */}
      <div className="bg-muted p-4 rounded-b-lg">
        <div className="flex flex-col items-center justify-between gap-4">
          {/* Indicator dots */}
          <div className="flex space-x-2">
            {items.map((_, index) => (
              <motion.button
                key={index}
                className={`h-1 w-8 flex-shrink-0 rounded-full transition-all ${
                  index === current ? "bg-brand-coral" : "bg-white/30"
                }`}
                initial={false}
                animate={{
                  backgroundColor: index === current ? "#e75754" : "rgba(255,255,255,0.3)",
                }}
                transition={{ duration: 0.5 }}
                onClick={() => handleSelect(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Counter and progress */}
          <div className="flex items-center justify-center gap-4 text-sm text-brand-gray">
            <span className="font-medium">
              {current + 1} / {items.length}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={controls}
          transition={{ duration: 0.5, ease: "linear" }}
          className="h-1 bg-brand-coral origin-left mt-3 rounded-full"
        />
      </div>
    </motion.div>
  )
}
