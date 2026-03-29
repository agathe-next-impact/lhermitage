"use client"

import { motion } from "framer-motion"
import { FileText, Download } from "lucide-react"
import { BRAND_COLORS } from "@/lib/theme/colors"

interface TransformedFile {
  nom?: string
  fichier?: {
    url: string
    title: string
    mimeType: string
    fileSize: number | null
  }
}

interface DevenirSocietaireDocumentsProps {
  sectionColor: string
  titre?: string
  fichiers?: TransformedFile[]
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} Ko`
  return `${(bytes / 1048576).toFixed(1)} Mo`
}

function getFileExtension(mimeType?: string): string {
  if (!mimeType) return ""
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.oasis.opendocument.text": "ODT",
  }
  return map[mimeType] || mimeType.split("/").pop()?.toUpperCase() || ""
}

const DOC_COLORS = [BRAND_COLORS.teal, BRAND_COLORS.rose, BRAND_COLORS.green, BRAND_COLORS.orange]

export function DevenirSocietaireDocuments({
  sectionColor,
  titre,
  fichiers,
}: DevenirSocietaireDocumentsProps) {
  if (!fichiers || fichiers.length === 0) return null

  return (
    <section className="space-y-6">
      {titre && (
        <h3 className="text-2xl md:text-3xl" style={{ color: sectionColor }}>
          {titre}
        </h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fichiers.map((doc, idx) => {
          const color = DOC_COLORS[idx % DOC_COLORS.length]
          const ext = getFileExtension(doc.fichier?.mimeType)
          const size = formatFileSize(doc.fichier?.fileSize ?? null)

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" as const }}
              className="group relative rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-stone-800 mb-1">
                    {doc.nom || "Document"}
                  </h4>
                  {(ext || size) && (
                    <p className="text-stone-400 text-xs">
                      {[ext, size].filter(Boolean).join(" — ")}
                    </p>
                  )}
                </div>
              </div>
              {doc.fichier?.url && (
                <a
                  href={doc.fichier.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color }}
                >
                  <Download className="h-4 w-4" />
                  Telecharger
                </a>
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
