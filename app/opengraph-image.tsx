import { ImageResponse } from 'next/og'

export const alt = 'Entrance Exam Guide: admission cycles, dates, fees and official sources'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', height: '100%', background: '#0f172a', color: '#f8fafc', padding: 80, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', color: '#93c5fd', fontSize: 26, marginBottom: 28 }}>PLAN YOUR NEXT APPLICATION</div>
      <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>Entrance Exam Guide</div>
      <div style={{ display: 'flex', fontSize: 30, color: '#cbd5e1', marginTop: 36 }}>Engineering · Medical · Law · Management · Design</div>
      <div style={{ display: 'flex', fontSize: 27, color: '#bfdbfe', marginTop: 50 }}>Admission cycles, dates, fees and official sources</div>
    </div>,
    size,
  )
}
