"use client"
import { useScroll, useTransform, motion, useSpring } from "framer-motion"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface TimelineEntry {
  title: string
  content: React.ReactNode
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      setHeight(rect.height)
    }
  }, [ref])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  })

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  const heightTransform = useTransform(smoothProgress, [0, 1], [0, height])
  const opacityTransform = useTransform(smoothProgress, [0, 0.1], [0, 1])

  return (
    <div className="w-full font-sans" ref={containerRef}>
      <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:gap-10 md:pt-40">
            <div className="sticky top-40 z-10 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              {/* </CHANGE> */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-100px" }}
                className="absolute left-[6px] flex h-[50px] w-[50px] items-center justify-center rounded-full bg-background p-2.5"
              >
                <Image src="/logo-arcs-coral.png" alt="" width={50} height={50} className="object-contain" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1 + 0.2,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-100px" }}
                className="hidden text-xl font-bold md:block md:pl-20 md:text-5xl"
                style={{ color: "#E75754" }}
              >
                {item.title}
              </motion.h3>
            </div>

            <div className="relative w-full pl-20 pr-4 md:pl-4">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1 + 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-100px" }}
                className="mb-4 block text-left text-2xl font-bold md:hidden"
                style={{ color: "#E75754" }}
              >
                {item.title}
              </motion.h3>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1 + 0.3,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {item.content}
              </motion.div>
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
            background: "linear-gradient(to bottom, transparent 0%, #E75754 10%, transparent 95%)",
          }}
          className="absolute left-[31px] top-0 w-[3px] overflow-hidden rounded-full [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
              background: "#E75754",
            }}
            className="absolute inset-x-0 top-0 w-[3px] rounded-full"
          />
        </div>
      </div>
    </div>
  )
}
