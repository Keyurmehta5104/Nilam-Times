import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// iOS Chrome/Safari ignore @page { margin: 0 } and apply their own default margins,
// making the printable area too short for a 297 mm bill.
// Fix: (1) inject an explicit @page { margin: 10mm } so iOS honours a known value,
// giving a 190 mm × 277 mm printable area; (2) add class so CSS applies zoom: 0.90
// (267.3 mm height, 189 mm width) — fits within iOS 190×277 mm printable area.
const isIOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
if (isIOS) {
  document.documentElement.classList.add('ios-device')
  const s = document.createElement('style')
  s.id = 'ios-page-rule'
  s.textContent = '@media print { @page { size: A4 portrait; margin: 10mm; } }'
  document.head.appendChild(s)
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<App />)
}