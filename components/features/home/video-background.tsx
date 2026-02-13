"use client"

import { useEffect, useMemo, useRef } from "react"

interface VideoBackgroundProps {
  videoUrl: string
  startTime?: number
  onPlay?: () => void
}

export function VideoBackground({ videoUrl, startTime = 0, onPlay }: VideoBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)

  // Use a ref for onPlay to avoid re-initializing the player when the callback changes
  const onPlayRef = useRef(onPlay)

  // Update the ref when onPlay prop changes
  useEffect(() => {
    onPlayRef.current = onPlay
  }, [onPlay])

  const videoId = useMemo(() => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = videoUrl.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }, [videoUrl])

  useEffect(() => {
    if (!videoId) return

    // Load YouTube API
    if (!(window as any).YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    const initPlayer = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return

      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          loop: 1,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          showinfo: 0,
          playlist: videoId,
          start: Math.floor(startTime),
        },
        events: {
          onReady: (event: any) => {
            event.target.mute()
            event.target.playVideo()
            if (startTime > 0.5) {
              event.target.seekTo(startTime)
            }
          },
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              // Call the latest callback from the ref
              if (onPlayRef.current) {
                onPlayRef.current()
              }
            }
            if (event.data === (window as any).YT.PlayerState.ENDED) {
              event.target.playVideo()
            }
          },
        },
      })
    }

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer()
    } else {
      ;(window as any).onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
    // Removed onPlay from dependencies to prevent re-initialization
  }, [videoId, startTime])

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-black">
      <div
        ref={containerRef}
        className="absolute top-1/2 left-1/2 w-[200vw] h-[200vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  )
}
