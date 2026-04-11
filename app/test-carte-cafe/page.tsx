"use client"

import { useState } from "react"

import { CarteCafeAnimated } from "@/components/carte-cafe-animated"
import { BRAND_COLORS } from "@/lib/theme/colors"

export default function TestCarteCafePage() {
  const [strokeColor, setStrokeColor] = useState<string>("#000000")
  const [strokeWidth, setStrokeWidth] = useState<number>(1)
  const [pathDuration, setPathDuration] = useState<number>(0.6)
  const [stagger, setStagger] = useState<number>(0.08)
  const [initialDelay, setInitialDelay] = useState<number>(0.2)
  const [loop, setLoop] = useState<boolean>(false)
  const [fillWhenDone, setFillWhenDone] = useState<boolean>(false)
  const [bgColor, setBgColor] = useState<string>("transparent")

  // Clé utilisée pour forcer le remontage du composant afin de rejouer l'anim
  const [replayKey, setReplayKey] = useState<number>(0)

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Test — Carte café animée
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Rendu du composant{" "}
            <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs">
              components/carte-cafe-animated.tsx
            </code>{" "}
            à partir de{" "}
            <code className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs">
              public/carte_café 2.svg
            </code>
            .
          </p>
        </header>

        {/* Zone de rendu — damier visible quand bgColor est "transparent" */}
        <div
          className="relative w-full overflow-hidden rounded-lg border border-neutral-300 shadow-sm"
          style={{
            aspectRatio: "851 / 584",
            backgroundColor: bgColor === "transparent" ? undefined : bgColor,
            backgroundImage:
              bgColor === "transparent"
                ? "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)"
                : undefined,
            backgroundSize: bgColor === "transparent" ? "20px 20px" : undefined,
            backgroundPosition:
              bgColor === "transparent" ? "0 0, 0 10px, 10px -10px, -10px 0" : undefined,
          }}
        >
          <CarteCafeAnimated
            key={replayKey}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            pathDuration={pathDuration}
            stagger={stagger}
            initialDelay={initialDelay}
            loop={loop}
            fillWhenDone={fillWhenDone}
          />
        </div>

        {/* Controls */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Couleurs
            </h2>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-neutral-700">
                Couleur du trait
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(BRAND_COLORS).map(([name, color]) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setStrokeColor(color)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      strokeColor === color
                        ? "border-neutral-900 scale-110"
                        : "border-neutral-300"
                    }`}
                    style={{ backgroundColor: color }}
                    title={`${name} — ${color}`}
                  />
                ))}
                <input
                  type="color"
                  value={strokeColor}
                  onChange={(e) => setStrokeColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-neutral-300"
                />
              </div>
              <p className="mt-1 font-mono text-xs text-neutral-500">{strokeColor}</p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-700">
                Fond du conteneur
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBgColor("transparent")}
                  className={`relative h-8 w-8 overflow-hidden rounded border-2 ${
                    bgColor === "transparent" ? "border-neutral-900" : "border-neutral-300"
                  }`}
                  title="Transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                    backgroundSize: "8px 8px",
                    backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
                  }}
                />
                {["#ffffff", "#f5f5f4", "#0f172a", "#fef3c7"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBgColor(c)}
                    className={`h-8 w-8 rounded border-2 ${
                      bgColor === c ? "border-neutral-900" : "border-neutral-300"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-neutral-300"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Animation
            </h2>

            <SliderRow
              label="Épaisseur du trait"
              value={strokeWidth}
              min={0.25}
              max={4}
              step={0.25}
              unit="px"
              onChange={setStrokeWidth}
            />
            <SliderRow
              label="Durée du tracé (par path)"
              value={pathDuration}
              min={0.1}
              max={2}
              step={0.05}
              unit="s"
              onChange={setPathDuration}
            />
            <SliderRow
              label="Décalage entre paths (stagger)"
              value={stagger}
              min={0}
              max={0.5}
              step={0.01}
              unit="s"
              onChange={setStagger}
            />
            <SliderRow
              label="Délai initial"
              value={initialDelay}
              min={0}
              max={2}
              step={0.1}
              unit="s"
              onChange={setInitialDelay}
            />

            <div className="mt-3 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                />
                Boucle
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={fillWhenDone}
                  onChange={(e) => setFillWhenDone(e.target.checked)}
                />
                Remplissage après tracé
              </label>
            </div>

            <button
              type="button"
              onClick={() => setReplayKey((k) => k + 1)}
              className="mt-4 w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              ▶ Rejouer l'animation
            </button>
          </div>
        </div>

        {/* Récap des props courantes */}
        <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-900 p-4 font-mono text-xs text-neutral-100">
          <pre className="whitespace-pre-wrap">{`<CarteCafeAnimated
  strokeColor="${strokeColor}"
  strokeWidth={${strokeWidth}}
  pathDuration={${pathDuration}}
  stagger={${stagger}}
  initialDelay={${initialDelay}}
  loop={${loop}}
  fillWhenDone={${fillWhenDone}}
/>`}</pre>
        </div>
      </div>
    </main>
  )
}

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  onChange: (v: number) => void
}

function SliderRow({ label, value, min, max, step, unit, onChange }: SliderRowProps) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-medium text-neutral-700">{label}</label>
        <span className="font-mono text-xs text-neutral-500">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}
