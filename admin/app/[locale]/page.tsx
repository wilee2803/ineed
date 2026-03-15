import Link from 'next/link'
import { getLocale } from 'next-intl/server'
import { Search, MapPin, Key, Zap, Camera, Shield, ChevronRight, Building2 } from 'lucide-react'
import LocaleSwitcher from '@/components/ui/LocaleSwitcher'

export default async function LandingPage() {
  const locale = await getLocale()

  return (
    <div className="min-h-screen bg-[#0e0e1a] text-white">

      {/* Nav */}
      <nav className="border-b border-white/[0.06] px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="text-2xl font-black tracking-tight">
          i<span className="text-violet-400">need</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <LocaleSwitcher />
          <Link href={`/${locale}/login`}
            className="hidden sm:inline text-sm text-gray-400 hover:text-white transition-colors font-medium">
            Einloggen
          </Link>
          <Link href={`/${locale}/seeker/register`}
            className="hidden sm:flex items-center bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Kostenlos starten
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <Zap size={12} />
          Kein Makler. Keine Provision. Direkt.
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
          Deine Wohnung.<br />
          <span className="text-violet-400">Ohne Umwege.</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Finde Miet- und Kaufimmobilien direkt vom Eigentümer — mit Kartensuche, Self-Service Besichtigungen und smartem Lock-Zugang. Ganz ohne Makler.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/${locale}/seeker/register`}
            className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-base shadow-xl shadow-violet-900/30">
            <Search size={18} />
            Jetzt Wohnung suchen
          </Link>
          <Link href={`/${locale}/login`}
            className="flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-semibold px-8 py-4 rounded-2xl transition-colors text-base">
            Bereits registriert
            <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Features Seeker */}
      <section className="max-w-4xl mx-auto px-6 sm:px-10 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: MapPin,
              title: 'Kartensuche',
              desc: 'Standort freigeben, Radius wählen — alle Angebote in deiner Nähe auf einen Blick.',
              color: 'text-violet-400',
              bg: 'bg-violet-500/10',
            },
            {
              icon: Key,
              title: 'Self-Service Tour',
              desc: 'Besichtige alleine — zu jeder Zeit. Smart Lock öffnet sich automatisch mit deinem Buchungscode.',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10',
            },
            {
              icon: Camera,
              title: 'Live-Cam & 360°',
              desc: 'Schau dir die Wohnung live per Video an oder erkunde sie virtuell — ohne hinzufahren.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <div className={`inline-flex p-3 rounded-xl ${bg} mb-4`}>
                <Icon size={22} className={color} strokeWidth={1.6} />
              </div>
              <h3 className="text-white font-bold mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/[0.06] py-20 px-6 sm:px-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-12">
            So einfach funktioniert's
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Registrieren', desc: 'Kostenloses Konto erstellen — in unter einer Minute.' },
              { step: '02', title: 'Suchen', desc: 'Karte öffnen, Standort freigeben, Umkreis wählen.' },
              { step: '03', title: 'Buchen', desc: 'Wunschtermin wählen, Kaution vormerken, fertig.' },
              { step: '04', title: 'Besichtigen', desc: 'Smart Lock öffnet — du gehst rein, schaust dich um.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="text-4xl font-black text-violet-500/30 mb-3">{step}</div>
                <div className="text-white font-bold mb-1">{title}</div>
                <div className="text-gray-500 text-sm">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lister Section */}
      <section className="border-t border-white/[0.06] py-20 px-6 sm:px-10 bg-white/[0.015]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
              <Building2 size={12} />
              Für Vermieter & Verkäufer
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mb-4">
              Inserat erstellen.<br />
              <span className="text-indigo-400">Direkt vermieten.</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Erstelle dein Inserat in wenigen Minuten, lege Besichtigungstermine fest und finde deinen Mieter oder Käufer — ohne Makler, ohne Fixkosten.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/${locale}/lister/register`}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                Als Lister registrieren
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 w-full max-w-sm">
            {[
              { icon: Shield, label: 'Kaution gesichert', sub: 'Via Stripe vorgemerkt' },
              { icon: Key, label: 'Smart Lock', sub: 'Zugang per App' },
              { icon: Zap, label: 'Provision erst', sub: 'bei Abschluss' },
              { icon: Search, label: 'Tausende Suchende', sub: 'direkt erreichbar' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-4">
                <Icon size={18} className="text-indigo-400 mb-2" strokeWidth={1.6} />
                <div className="text-white text-xs font-bold">{label}</div>
                <div className="text-gray-600 text-xs mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xl font-black text-white">
          i<span className="text-violet-400">need</span>
          <span className="text-xs text-gray-600 font-normal ml-3">© 2025</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-gray-600">
          <Link href={`/${locale}/seeker/register`} className="hover:text-gray-400 transition-colors">Seeker</Link>
          <Link href={`/${locale}/lister/register`} className="hover:text-gray-400 transition-colors">Lister</Link>
          <Link href={`/${locale}/login`} className="hover:text-gray-400 transition-colors">Login</Link>
          <Link href={`/${locale}/dashboard`} className="hover:text-gray-400 transition-colors">Admin</Link>
        </div>
      </footer>

    </div>
  )
}
