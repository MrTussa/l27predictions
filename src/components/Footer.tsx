const socialLinks = [
  {
    link: 'https://youtube.com/@3dgun',
    logo: '/youtube.svg',
    alt: 'YouTube',
  },
  {
    link: 'https://discord.gg/3dgun',
    logo: '/discord.svg',
    alt: 'Discord',
  },
  {
    link: 'https://t.me/3dgun',
    logo: '/telegram.svg',
    alt: 'Telegram',
  },
  {
    link: 'https://artstation.com/3dgun',
    logo: '/artstation.svg',
    alt: 'ArtStation',
  },
]

const quickLinks = [
  { title: 'Курсы', href: '/courses' },
  { title: 'Менторство', href: '/mentoring' },
  { title: 'FAQ', href: '/faq' },
]

function Footer() {
  return (
    <footer className="relative z-10 bg-linear-to-t from-neutral-900 via-neutral-900/80 to-neutral-950/0 backdrop-blur-[2px] border-t border-white/10">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <span className="text-7xl md:text-8xl lg:text-9xl scale-x-[1.2] font-normal bg-linear-to-b from-primary to-accent/50 bg-clip-text text-transparent">
          L27 Predictions
        </span>

        <div className="pt-8 border-t border-neutral-600/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-neutral-500">
                This website is not associated in any way with the Formula 1 companies. F1, FORMULA
                ONE, FORMULA 1, FIA FORMULA ONE WORLD CHAMPIONSHIP, GRAND PRIX and related marks are
                trade marks of Formula One Licensing B.V.
              </p>
            </div>
            <a
              href="https://mrtusa.uz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
            >
              Разработанно <span className="text-muted-foreground ">mrtusa.uz</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
