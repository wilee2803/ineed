'use client'
import { useState } from 'react'
import { Save } from 'lucide-react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [autoKyc, setAutoKyc] = useState(true)
  const [manualReview, setManualReview] = useState(true)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Plattform-Einstellungen</h1>
        <p className="text-gray-500 text-sm mt-1">Provisions-Sätze, KYC, Kaution</p>
      </div>

      <div className="max-w-2xl space-y-6">

        {/* Provisionen */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">💶 Provisions-Konfiguration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Kauf-Provision (% des Kaufpreises)
              </label>
              <div className="flex items-center gap-2">
                <input defaultValue="1.0" type="number" step="0.1" min="0" max="5"
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <span className="text-sm text-gray-500">% — Beispiel: € 350.000 → <strong className="text-indigo-600">€ 3.500</strong></span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Miete-Provision (× Monatsmiete)
              </label>
              <div className="flex items-center gap-2">
                <input defaultValue="3" type="number" step="0.5" min="0" max="6"
                  className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <span className="text-sm text-gray-500">× — Beispiel: € 1.200/Mo → <strong className="text-indigo-600">€ 3.600</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Kaution */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">🔒 Kaution (Self-Service Besichtigungen)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Standard-Kautionsbetrag (€)
              </label>
              <input defaultValue="300" type="number" min="0"
                className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Auto-Release nach (Stunden)
              </label>
              <input defaultValue="48" type="number" min="1"
                className="w-28 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>

        {/* KYC */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">🪪 KYC & Verifizierung</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-700">Auto-KYC (KI-Score ≥ 90%)</div>
                <div className="text-xs text-gray-400">Automatische Freigabe bei hohem Score</div>
              </div>
              <button onClick={() => setAutoKyc(!autoKyc)}
                className={`relative w-11 h-6 rounded-full transition-colors ${autoKyc ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autoKyc ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-700">Manueller Review bei Score &lt; 90%</div>
                <div className="text-xs text-gray-400">Admin muss Dokumente prüfen</div>
              </div>
              <button onClick={() => setManualReview(!manualReview)}
                className={`relative w-11 h-6 rounded-full transition-colors ${manualReview ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${manualReview ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        <button onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
          <Save size={16} />
          {saved ? '✓ Gespeichert!' : 'Änderungen speichern'}
        </button>

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="font-bold text-red-700 mb-2">⚠️ Wartungsmodus</h2>
          <p className="text-sm text-red-600 mb-4">Setzt die Plattform für alle User in den Read-Only-Modus.</p>
          <button className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors">
            Wartungsmodus aktivieren
          </button>
        </div>
      </div>
    </div>
  )
}
