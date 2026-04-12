import { LogoIcon } from '@/components/icons/logo'
import { IconBrandTelegram, IconWorld } from '@tabler/icons-react'
import Image from 'next/image'
import Link from 'next/link'

const NAV_ITEMS = [
  { label: 'Прогнозы', href: '/predictions' },
  { label: 'События', href: '/events' },
  { label: 'Таблица лидеров', href: '/leaderboard' },
  { label: 'Трансляция', href: '/broadcast' },
]

function Footer() {
  return (
    <footer className="relative z-10 bg-linear-to-t from-neutral-900 via-neutral-900/80 to-neutral-950/0 backdrop-blur-[2px] border-t border-white/10">
      <div className="container mx-auto px-4 py-10 lg:py-14">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <LogoIcon />
          <span className="text-md md:text-2xl font-bold uppercase tracking-widest text-accent ">
            L27 Predictions
          </span>
        </div>

        {/* Columns */}
        <div className="border-t border-white/5 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Navigation */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-accent font-bold mb-4">
                Навигация
              </h4>
              <ul className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Developer credits */}
            <div>
              <h4 className="text-xs uppercase tracking-widest text-accent font-bold mb-4">
                Разработано
              </h4>
              <div className="flex flex-col gap-2">
                <a
                  href="https://mrtusa.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors w-fit"
                >
                  <IconWorld className="w-4 h-4" />
                  mrtusa.uz
                </a>
                <a
                  href="https://t.me/mrtusa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors w-fit"
                >
                  <IconBrandTelegram className="w-4 h-4" />
                  @mrtusa
                </a>
                <div className="relative w-24 h-12 rounded-xl overflow-hidden">
                  <Image unoptimized src="/bongocat.gif" alt="" fill className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer bar */}
        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <p className="text-xs text-neutral-600 max-w-2xl">
            This website is not associated in any way with the Formula 1 companies. F1, FORMULA ONE,
            FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are trade
            marks of Formula One Licensing B.V.
          </p>
          <span className="text-xs text-neutral-600 shrink-0">
            &copy; {new Date().getFullYear()} L27 Predictions
          </span>
          <a className="text-xs text-neutral-600 max-w-2xl" href="/privacy_policy_limonov27.pdf">Политика конфиденциальности</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
