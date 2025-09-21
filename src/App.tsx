import React, { useEffect, useMemo, useState } from 'react'
import { fetchUsers, User } from './api'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'


const dinPehle = (ank: number) => {
  const dinank = new Date()
  dinank.setDate(dinank.getDate() - ank)
  dinank.setHours(0, 0, 0, 0)
  return dinank
}


function dinVibhajan(upyogakarta: User[]) {
  const naksha = new Map<string, number>()
  for (let ganana = 0; ganana < 30; ganana++) {
    const dinank = dinPehle(ganana).toISOString().slice(0, 10)
    naksha.set(dinank, 0)
  }
  upyogakarta.forEach(vyakti => {
    const dinank = new Date(vyakti.createdAt)
    const kunji = new Date(dinank.getFullYear(), dinank.getMonth(), dinank.getDate())
      .toISOString()
      .slice(0, 10)
    if (naksha.has(kunji)) naksha.set(kunji, (naksha.get(kunji) || 0) + 1)
  })
  return Array.from(naksha.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))
}


function ghantaVibhajan(upyogakarta: User[]) {
  const ghantaArr = Array.from({ length: 24 }, (_, ghanta) => ({ ghanta, ganana: 0 }))
  upyogakarta.forEach(vyakti => {
    const dinank = new Date(vyakti.createdAt)
    ghantaArr[dinank.getHours()].ganana++
  })
  return ghantaArr
}


function avatarVibhajan(upyogakarta: User[]) {
  let avatarHai = 0, avatarNahi = 0
  upyogakarta.forEach(vyakti => (vyakti.avatar ? avatarHai++ : avatarNahi++))
  return [
    { name: 'Has Avatar', value: avatarHai },
    { name: 'No Avatar', value: avatarNahi }
  ]
}


function haalHiMeJude(upyogakarta: User[]) {
  return [...upyogakarta]
    .sort((pehla, dusra) => +new Date(dusra.createdAt) - +new Date(pehla.createdAt))
    .slice(0, 8)
}

export default function UsersDashboard() {
  const [upyogakarta, setUpyogakarta] = useState<User[] | null>(null)
  const [truti, setTruti] = useState<string | null>(null)
  const [pratiksha, setPratiksha] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const aankda = await fetchUsers()
        setUpyogakarta(aankda)
      } catch (e: any) {
        setTruti(e.message || 'Failed to load')
      } finally {
        setPratiksha(false)
      }
    })()
  }, [])

  const pratiDin = useMemo(() => upyogakarta ? dinVibhajan(upyogakarta) : [], [upyogakarta])
  const ghante = useMemo(() => upyogakarta ? ghantaVibhajan(upyogakarta) : [], [upyogakarta])
  const avatarVitran = useMemo(() => upyogakarta ? avatarVibhajan(upyogakarta) : [], [upyogakarta])
  const haalMeJude = useMemo(() => upyogakarta ? haalHiMeJude(upyogakarta) : [], [upyogakarta])

  const pieRang = ["#4f9cf9", "#ff6b6b"]

  const tooltipShaili = {
    backgroundColor: "#1a2444",
    border: "1px solid #2a3a66",
    color: "#fff"
  }

  return (
    <div className="container">
      <h1 className="title">Users Dashboard</h1>
      <p className="sub">Live metrics from MockAPI</p>

      {pratiksha && <div className="card">Loading…</div>}
      {truti && <div className="card">Error: {truti}</div>}
      {upyogakarta && (
        <div className="grid">

          
          <div className="card" style={{ gridColumn: 'span 4' }}>
            <div className="kpi">Total Users</div>
            <div className="tile">{upyogakarta.length}</div>
            <div className="muted">fetched from API</div>
          </div>

          
          <div className="card" style={{ gridColumn: 'span 8', minHeight: 260 }}>
            <div className="row padded"><strong>Users Created Per Day (Last 30 Days)</strong></div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={pratiDin}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243055" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={tooltipShaili} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#fff" }} />
                <Line type="monotone" dataKey="count" stroke="#4f9cf9" strokeWidth={3} dot={{ r: 3, fill: "#4f9cf9" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          
          <div className="card" style={{ gridColumn: 'span 6', minHeight: 280 }}>
            <div className="row padded"><strong>Avatar Distribution</strong></div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={avatarVitran} dataKey="value" nameKey="name" outerRadius={90} label>
                  {avatarVitran.map((_, i) => (
                    <Cell key={i} fill={pieRang[i % pieRang.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={tooltipShaili} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          
          <div className="card" style={{ gridColumn: 'span 6', minHeight: 280 }}>
            <div className="row padded"><strong>Signup Time of Day</strong></div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ghante}>
                <defs>
                  <linearGradient id="colorSignup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243055" />
                <XAxis dataKey="ghanta" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={tooltipShaili} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#fff" }} />
                <Bar dataKey="ganana" fill="url(#colorSignup)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          
          <div className="card" style={{ gridColumn: 'span 12' }}>
            <div className="row padded"><strong>Recently Joined Users</strong></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {haalMeJude.map(vyakti => (
                <div
                  key={vyakti.id}
                  style={{ background: '#101a32', border: '1px solid #243055', borderRadius: 12, padding: 12 }}
                >
                  <img
                    className="avatar"
                    src={
                      vyakti.avatar && vyakti.avatar.trim() !== ""
                        ? vyakti.avatar
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(vyakti.name)}&background=0D8ABC&color=fff`
                    }
                    alt={vyakti.name}
                    style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: 8 }}
                  />
                  <div style={{ fontWeight: 700 }}>{vyakti.name}</div>
                  <div className="muted">{new Date(vyakti.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
