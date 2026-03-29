import Link from "next/link"
import { BRAND_COLORS } from "@/lib/theme/colors"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1
        className="text-[8rem] font-bold leading-none tracking-tighter sm:text-[10rem]"
        style={{ color: BRAND_COLORS.coral }}
      >
        404
      </h1>
      <h2 className="mt-2 text-2xl font-semibold text-stone-800 sm:text-3xl">Page non trouvee</h2>
      <p className="mt-4 max-w-md text-stone-500">
        La page que vous recherchez n&apos;existe pas ou a ete deplacee.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND_COLORS.teal }}
        >
          Retour a l&apos;accueil
        </Link>
        <Link
          href="/infos-pratiques/contacts"
          className="rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
        >
          Nous contacter
        </Link>
      </div>
    </div>
  )
}
