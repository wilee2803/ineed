'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Trash2 } from 'lucide-react'

type SlotType = 'physical' | 'live_camera' | 'self_service'

interface Slot {
  id: string
  slot_type: SlotType
  start_time: string
  end_time: string
  is_booked: boolean
}

const SLOT_TYPES: { value: SlotType; label: string; icon: string }[] = [
  { value: 'physical',    label: 'Persönlich',   icon: '👤' },
  { value: 'live_camera', label: 'Live-Kamera',  icon: '📷' },
  { value: 'self_service',label: 'Self-Service', icon: '🔑' },
]

const DURATIONS = [15, 30, 45, 60, 90]

const inputClass =
  'bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'

export default function SlotManager({
  listingId,
  initialSlots,
}: {
  listingId: string
  initialSlots: Slot[]
}) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    date: '',
    time: '',
    duration: 30,
    slot_type: 'self_service' as SlotType,
  })

  async function handleAdd() {
    if (!form.date || !form.time) return
    setSaving(true)
    setError('')

    const start = new Date(`${form.date}T${form.time}:00`)
    const end   = new Date(start.getTime() + form.duration * 60_000)

    const { data, error: err } = await supabase
      .from('viewing_slots')
      .insert({
        listing_id: listingId,
        slot_type:  form.slot_type,
        start_time: start.toISOString(),
        end_time:   end.toISOString(),
      })
      .select()
      .single()

    if (err) { setError(err.message); setSaving(false); return }
    if (data) {
      setSlots(s =>
        [...s, data as Slot].sort((a, b) => a.start_time.localeCompare(b.start_time))
      )
    }
    setAdding(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('viewing_slots').delete().eq('id', id)
    setSlots(s => s.filter(sl => sl.id !== id))
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}

      {slots.length > 0 ? (
        <div className="space-y-2 mb-4">
          {slots.map(slot => {
            const st = SLOT_TYPES.find(t => t.value === slot.slot_type)
            const durationMin = Math.round(
              (new Date(slot.end_time).getTime() - new Date(slot.start_time).getTime()) / 60_000
            )
            return (
              <div key={slot.id}
                className={`flex items-center justify-between rounded-xl p-4 border ${
                  slot.is_booked
                    ? 'bg-white/[0.02] border-white/[0.04] opacity-50'
                    : 'bg-white/[0.04] border-white/[0.06]'
                }`}>
                <div>
                  <div className="text-white text-sm font-semibold">
                    {st?.icon}{' '}
                    {new Date(slot.start_time).toLocaleString('de-AT', {
                      weekday: 'short', day: '2-digit', month: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {st?.label} · {durationMin} min
                    {slot.is_booked && ' · 🔒 Gebucht'}
                  </div>
                </div>
                {!slot.is_booked && (
                  <button onClick={() => handleDelete(slot.id)}
                    className="p-2 text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-dashed border-white/[0.08] rounded-xl p-8 text-center text-sm text-gray-600 mb-4">
          Noch keine Zeitslots angelegt.
        </div>
      )}

      {adding ? (
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Datum</label>
              <input type="date" value={form.date} min={today}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Uhrzeit</label>
              <input type="time" value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Dauer</label>
              <select value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
                className={inputClass}>
                {DURATIONS.map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Art</label>
              <select value={form.slot_type}
                onChange={e => setForm(f => ({ ...f, slot_type: e.target.value as SlotType }))}
                className={inputClass}>
                {SLOT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !form.date || !form.time}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              {saving ? 'Speichert…' : 'Slot hinzufügen'}
            </button>
            <button onClick={() => { setAdding(false); setError('') }}
              className="px-4 bg-white/[0.06] hover:bg-white/[0.1] text-gray-400 text-sm font-semibold py-2.5 rounded-lg transition-colors">
              Abbrechen
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
          <Plus size={16} />
          Zeitslot hinzufügen
        </button>
      )}
    </div>
  )
}
