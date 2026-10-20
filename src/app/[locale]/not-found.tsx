import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

/** Locale-aware 404. Rendered inside the `[locale]` segment so copy translates. */
export default async function NotFound() {
  const t = await getTranslations('NotFound')
  const tCommon = await getTranslations('Common')

  return (
    <div className="grid min-h-dvh place-items-center bg-muted/40 px-5 py-24 text-center">
      <div className="flex flex-col items-center">
        <span className="gold-text font-sans text-[5rem] leading-none font-bold sm:text-[7rem]">
          404
        </span>
        <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">{t('title')}</h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {t('body')}
        </p>
        <Button asChild variant="gold" size="lg" className="mt-9">
          <Link href="/">{tCommon('backHome')}</Link>
        </Button>
      </div>
    </div>
  )
}
