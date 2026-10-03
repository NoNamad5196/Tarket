// Original vector artwork exported from the user's Figma Make design.
import { CATEGORY_CONFIG } from '../lib/tarot-data'

export function CrystalBall({ size = 180 }: { size?: number }) {
  const c = size / 2, r = size / 2 - 6
  return (
    <div style={{ animation: 'floatBall 4s ease-in-out infinite', display: 'inline-block' }}>
      <div style={{ animation: 'orbPulse 3s ease-in-out infinite' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} overflow="visible">
          <defs>
            <radialGradient id="g-glass" cx="36%" cy="30%" r="65%">
              <stop offset="0%"   stopColor="#EDE0FF" stopOpacity="0.96" />
              <stop offset="15%"  stopColor="#A882E0" stopOpacity="0.82" />
              <stop offset="50%"  stopColor="#5B2D9E" stopOpacity="0.92" />
              <stop offset="82%"  stopColor="#2A1050" stopOpacity="0.97" />
              <stop offset="100%" stopColor="#100828" stopOpacity="1"    />
            </radialGradient>
            <radialGradient id="g-fog1" cx="40%" cy="65%" r="55%">
              <stop offset="0%"   stopColor="#C4AFE8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7652B5" stopOpacity="0"   />
            </radialGradient>
            <radialGradient id="g-fog2" cx="65%" cy="38%" r="50%">
              <stop offset="0%"   stopColor="#B0D0F8" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#5B2D9E" stopOpacity="0"    />
            </radialGradient>
            <clipPath id="g-clip"><circle cx={c} cy={c} r={r} /></clipPath>
          </defs>
          <circle cx={c} cy={c} r={r + 10} fill="none" stroke="#7652B5" strokeWidth="0.8" opacity="0.2" />
          <circle cx={c} cy={c} r={r + 20} fill="none" stroke="#7652B5" strokeWidth="0.5" opacity="0.1" />
          <circle cx={c} cy={c} r={r} fill="url(#g-glass)" />
          <g clipPath="url(#g-clip)">
            <g style={{ animation: 'swirl 9s linear infinite', transformOrigin: `${c}px ${c}px` }}>
              <ellipse cx={c * 0.88} cy={c * 1.1} rx={r * 0.6} ry={r * 0.28} fill="url(#g-fog1)" opacity="0.75" />
              <ellipse cx={c * 1.15} cy={c * 0.85} rx={r * 0.4} ry={r * 0.2} fill="url(#g-fog1)" opacity="0.5" />
            </g>
            <g style={{ animation: 'swirlReverse 13s linear infinite', transformOrigin: `${c}px ${c}px` }}>
              <ellipse cx={c * 0.78} cy={c * 0.9}  rx={r * 0.5} ry={r * 0.22} fill="url(#g-fog2)" opacity="0.5" />
              <ellipse cx={c * 1.22} cy={c * 1.12} rx={r * 0.38} ry={r * 0.18} fill="url(#g-fog2)" opacity="0.35" />
            </g>
            {[[c*0.6,c*0.6,1.4,0],[c*1.28,c*0.72,1.1,.8],[c*0.78,c*1.22,1.3,1.3],
              [c*1.3,c*1.1,1.0,.4],[c*0.55,c*1.3,.9,1.9],[c*1.08,c*0.54,1.2,1.0]].map(([x,y,rr,dl],i)=>(
              <circle key={i} cx={x} cy={y} r={rr} fill="white"
                style={{ animation: `twinkle ${2+i*0.4}s ease-in-out infinite ${dl}s` }} />
            ))}
          </g>
          <ellipse cx={c*0.66} cy={c*0.6}  rx={r*0.18} ry={r*0.1}  fill="white" opacity="0.16" />
          <ellipse cx={c*0.60} cy={c*0.54} rx={r*0.09} ry={r*0.055} fill="white" opacity="0.24" />
          <ellipse cx={c} cy={c*1.9} rx={r*0.55} ry={r*0.07} fill="#5B2D9E" opacity="0.25" />
        </svg>
      </div>
    </div>
  )
}

// ── Dispenser Machine ─────────────────────────────────────────────────────
export function DispenserMachine({ glowing }: { glowing: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ userSelect: 'none' }}>
      {/* Crystal ball */}
      <CrystalBall size={160} />

      {/* Neck */}
      <div style={{
        width: '30px', height: '22px', marginTop: '-4px',
        background: 'linear-gradient(180deg, #2A1545, #1A0C30)',
        border: '1px solid #7652B530', borderBottom: 'none',
        borderRadius: '2px 2px 0 0',
      }} />

      {/* Machine body */}
      <div style={{
        width: 'min(340px, 88vw)',
        background: 'linear-gradient(180deg, #1C0E35 0%, #14092A 60%, #1A0C35 100%)',
        border: '1px solid #7652B540',
        borderBottom: 'none',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(196,175,232,0.1)',
      }}>
        {/* Side gold rails */}
        {[-1, 1].map(side => (
          <div key={side} style={{
            position: 'absolute', top: '12px', bottom: '12px',
            [side === -1 ? 'left' : 'right']: '-2px',
            width: '2px',
            background: 'linear-gradient(180deg, transparent, #D8BD8860, #D8BD8880, #D8BD8860, transparent)',
          }} />
        ))}

        {/* LED status panel */}
        <div style={{ margin: '14px 14px 0', padding: '9px 12px', background: '#090418', border: '1px solid #7652B540', borderRadius: '2px' }}>
          <p style={{ color: '#7652B5', fontSize: '12px', letterSpacing: '0.3em', textAlign: 'center', fontFamily: 'monospace' }}>TARKET SYSTEM</p>
          <div style={{ marginTop: '6px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: glowing ? '#7652B5' : '#1E0A35',
                boxShadow: glowing ? '0 0 8px #7652B5, 0 0 2px #C4AFE8' : 'none',
                animation: glowing ? `dotBlink 1s ease-in-out infinite ${i * 0.22}s` : 'none',
                transition: 'all 0.4s',
              }} />
            ))}
          </div>
        </div>

        {/* Art deco ornaments */}
        <div style={{ padding: '10px 20px 10px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
          {[1, 0.55, 0.25].map((op, i) => (
            <div key={i} style={{
              width: `${148 - i * 22}px`, height: '1px',
              background: `linear-gradient(90deg, transparent, rgba(196,175,232,${op * 0.35}), transparent)`,
            }} />
          ))}
          <div style={{ margin: '3px 0', width: '10px', height: '10px',
            border: '1px solid #D8BD8845', transform: 'rotate(45deg)' }} />
          {[0.25, 0.55, 1].map((op, i) => (
            <div key={i} style={{
              width: `${104 + i * 22}px`, height: '1px',
              background: `linear-gradient(90deg, transparent, rgba(196,175,232,${op * 0.35}), transparent)`,
            }} />
          ))}
        </div>

        {/* Status text */}
        <div style={{ padding: '0 14px 10px', textAlign: 'center' }}>
          <p style={{ color: glowing ? '#C4AFE8' : '#7652B570', fontSize: '12px', letterSpacing: '0.25em',
            animation: glowing ? 'dotBlink 2s ease-in-out infinite' : 'none', fontFamily: 'monospace' }}>
            {glowing ? 'PRINTING...' : 'READY'}
          </p>
        </div>
      </div>

      {/* ── SLOT HOUSING ── the physical output port */}
      <div style={{
        width: 'min(340px, 88vw)',
        background: 'linear-gradient(180deg, #0C0420 0%, #080214 100%)',
        border: '1px solid #7652B540',
        borderRadius: '0 0 5px 5px',
        position: 'relative',
        padding: '10px 0 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0',
        boxShadow: '0 6px 20px rgba(0,0,0,0.7)',
      }}>
        {/* Slot label */}
        <p style={{ fontSize: '7px', letterSpacing: '0.35em', color: '#7652B540',
          fontFamily: 'monospace', marginBottom: '7px' }}>OUTPUT</p>

        {/* The slot slit — the actual paper exit */}
        <div style={{
          width: 'min(280px, 74vw)',
          height: '10px',
          background: '#01000A',
          borderRadius: '2px',
          position: 'relative',
          /* Deep inset shadow = paper coming from inside machine */
          boxShadow: [
            'inset 0 4px 18px rgba(0,0,0,1)',
            'inset 0 2px 8px rgba(0,0,0,0.98)',
            'inset 0 1px 3px rgba(0,0,0,0.95)',
            '0 0 0 1px rgba(118,82,181,0.2)',
          ].join(', '),
        }}>
          {/* Slot rim highlight (top edge) */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            height: '1px',
            background: 'rgba(196,175,232,0.12)',
          }} />
          {/* LED glow inside slot — active during loading */}
          {glowing && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 5%, rgba(118,82,181,0.25) 40%, rgba(196,175,232,0.2) 50%, rgba(118,82,181,0.25) 60%, transparent 95%)',
              animation: 'slotGlow 1.2s ease-in-out infinite',
            }} />
          )}
          {/* Slot rim highlight (bottom edge) */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '1px',
            background: 'rgba(118,82,181,0.15)',
          }} />
        </div>

        {/* Slot exit shadow — casts onto the ticket emerging below */}
        <div style={{
          width: 'min(280px, 74vw)', height: '6px', marginTop: '0',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}

// ── Movie Poster Card ─────────────────────────────────────────────────────
export function PosterCard({ cat, selected, onClick }: {
  cat: typeof CATEGORY_CONFIG[0]; selected: boolean; onClick: () => void
}) {
  const { name, tag, accent, bg } = cat

  // Unique SVG art per category
  function PosterArt() {
    const commonProps = { fill: 'none', stroke: accent, strokeWidth: '0.8', opacity: '0.6' }

    if (name === '오늘의 운세') return (
      <g>
        <circle cx="80" cy="90" r="28" {...commonProps} opacity="0.35" />
        <circle cx="80" cy="90" r="18" {...commonProps} opacity="0.5" />
        <circle cx="80" cy="90" r="8"  fill={accent} fillOpacity="0.7" />
        {[[0,36],[45,26],[90,36],[135,26],[180,36],[225,26],[270,36],[315,26]].map(([a,len],i)=>(
          <line key={i}
            x1={80+Math.cos(a*Math.PI/180)*12} y1={90+Math.sin(a*Math.PI/180)*12}
            x2={80+Math.cos(a*Math.PI/180)*len} y2={90+Math.sin(a*Math.PI/180)*len}
            stroke={accent} strokeWidth="0.7" opacity="0.5" />
        ))}
        <ellipse cx="80" cy="90" rx="40" ry="12" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.25" />
        <ellipse cx="80" cy="90" rx="12" ry="40" stroke={accent} strokeWidth="0.5" fill="none" opacity="0.25" />
        {[[50,55],[112,62],[65,125],[100,118],[38,100]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.5" fill={accent} opacity={0.4+i*0.1} />
        ))}
      </g>
    )

    if (name === '연애운') return (
      <g>
        <path d="M60,75 Q60,55 80,65 Q100,55 100,75 Q100,100 80,115 Q60,100 60,75Z"
          fill={accent} fillOpacity="0.2" stroke={accent} strokeWidth="0.8" />
        <path d="M50,65 Q50,40 80,55 Q110,40 110,65 Q110,95 80,115 Q50,95 50,65Z"
          fill="none" stroke={accent} strokeWidth="0.5" opacity="0.35" />
        <circle cx="60" cy="62" r="2"  fill={accent} opacity="0.7" />
        <circle cx="100" cy="62" r="1.5" fill={accent} opacity="0.6" />
        <circle cx="80" cy="120" r="1.5" fill={accent} opacity="0.5" />
        <line x1="35" y1="90" x2="55" y2="90" stroke={accent} strokeWidth="0.5" opacity="0.3" />
        <line x1="105" y1="90" x2="125" y2="90" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      </g>
    )

    if (name === '금전운') return (
      <g>
        {[0,45,90,135].map(a=>(
          <line key={a}
            x1={80+Math.cos(a*Math.PI/180)*38} y1={90+Math.sin(a*Math.PI/180)*38}
            x2={80+Math.cos((a+45)*Math.PI/180)*38} y2={90+Math.sin((a+45)*Math.PI/180)*38}
            stroke={accent} strokeWidth="0.6" opacity="0.4" />
        ))}
        {[38,28,18].map((r,i)=>(
          <circle key={i} cx="80" cy="90" r={r} stroke={accent} strokeWidth={0.8-i*0.2} fill="none" opacity={0.6-i*0.15} />
        ))}
        <circle cx="80" cy="90" r="8" fill={accent} fillOpacity="0.5" />
        {[0,60,120,180,240,300].map((a,i)=>(
          <circle key={i} cx={80+Math.cos(a*Math.PI/180)*22} cy={90+Math.sin(a*Math.PI/180)*22}
            r="2" fill={accent} opacity="0.6" />
        ))}
      </g>
    )

    if (name === '공부운') return (
      <g>
        <rect x="52" y="68" width="56" height="44" rx="2" stroke={accent} strokeWidth="0.8" fill="none" opacity="0.5" />
        <rect x="56" y="72" width="24" height="36" rx="1" stroke={accent} strokeWidth="0.5" fill={accent} fillOpacity="0.08" opacity="0.6" />
        <rect x="80" y="72" width="24" height="36" rx="1" stroke={accent} strokeWidth="0.5" fill={accent} fillOpacity="0.08" opacity="0.6" />
        <line x1="80" y1="72" x2="80" y2="108" stroke={accent} strokeWidth="0.8" opacity="0.4" />
        {[0,1,2,3].map(i=>(
          <line key={i} x1="59" y1={80+i*8} x2="77" y2={80+i*8} stroke={accent} strokeWidth="0.5" opacity="0.35" />
        ))}
        {[0,1,2,3].map(i=>(
          <line key={i} x1="83" y1={80+i*8} x2="101" y2={80+i*8} stroke={accent} strokeWidth="0.5" opacity="0.35" />
        ))}
        {[[-20,-26],[-30,-18],[20,-26],[30,-18]].map(([dx,dy],i)=>(
          <line key={i} x1={80} y1={68} x2={80+dx} y2={68+dy} stroke={accent} strokeWidth="0.5" opacity="0.3" />
        ))}
      </g>
    )

    if (name === '인간관계운') return (
      <g>
        {[[80,72],[55,95],[105,95],[68,118],[93,118]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="5" fill={accent} fillOpacity={0.6-i*0.06} />
        ))}
        {[[80,72,55,95],[80,72,105,95],[55,95,68,118],[55,95,93,118],
          [105,95,68,118],[105,95,93,118],[68,118,93,118]].map(([x1,y1,x2,y2],i)=>(
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="0.6" opacity="0.35" />
        ))}
        <circle cx="80" cy="90" r="34" stroke={accent} strokeWidth="0.4" fill="none" opacity="0.2" />
        {[[42,70],[118,110],[50,115]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.5" fill={accent} opacity="0.4" />
        ))}
      </g>
    )

    // 개발운
    return (
      <g>
        <text x="48" y="100" fontFamily="monospace" fontSize="28" fill={accent} fillOpacity="0.7">{`{`}</text>
        <text x="102" y="100" fontFamily="monospace" fontSize="28" fill={accent} fillOpacity="0.7">{`}`}</text>
        {[[55,75],[65,75],[75,75],[85,75]].map(([x,y],i)=>(
          <rect key={i} x={x} y={y} width="6" height="4" rx="1" fill={accent} fillOpacity={0.5+i*0.1} />
        ))}
        {[[60,86],[70,86],[80,86],[90,86],[100,86]].map(([x,y],i)=>(
          <rect key={i} x={x} y={y} width="6" height="4" rx="1" fill={accent} fillOpacity="0.35" />
        ))}
        <circle cx="80" cy="112" r="4" stroke={accent} strokeWidth="0.6" fill="none" opacity="0.5" />
        <line x1="80" y1="108" x2="80" y2="104" stroke={accent} strokeWidth="0.6" opacity="0.4" />
        <line x1="68" y1="112" x2="76" y2="112" stroke={accent} strokeWidth="0.6" opacity="0.4" />
        <line x1="84" y1="112" x2="92" y2="112" stroke={accent} strokeWidth="0.6" opacity="0.4" />
      </g>
    )
  }

  return (
    <button
      onClick={onClick}
      type="button"
      aria-label={name}
      aria-pressed={selected}
      className="poster-card relative group transition-all duration-300 text-left"
      style={{
        background: `linear-gradient(170deg, ${bg[0]} 0%, ${bg[1]} 50%, ${bg[2]} 100%)`,
        border: selected ? `1.5px solid ${accent}` : '1.5px solid rgba(118,82,181,0.25)',
        borderRadius: '4px',
        overflow: 'hidden',
        cursor: 'pointer',
        transform: selected ? 'translateY(-4px)' : 'none',
        boxShadow: selected ? `0 12px 32px ${accent}30, 0 4px 12px rgba(0,0,0,0.5)` : '0 4px 12px rgba(0,0,0,0.4)',
        transition: 'all 0.25s ease',
        minHeight: '200px',
      }}
      onMouseEnter={e => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = `0 10px 28px ${accent}25, 0 4px 12px rgba(0,0,0,0.5)`
          ;(e.currentTarget as HTMLElement).style.borderColor = `${accent}70`
        }
      }}
      onMouseLeave={e => {
        if (!selected) {
          (e.currentTarget as HTMLElement).style.transform = 'none'
          ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(118,82,181,0.25)'
        }
      }}
    >
      {/* Subtle frame lines */}
      <div style={{ position: 'absolute', inset: '5px', border: `0.5px solid ${accent}18`, borderRadius: '2px', pointerEvents: 'none' }} />

      {/* Top tag */}
      <div style={{ padding: '10px 12px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', letterSpacing: '0.25em', color: accent, opacity: 0.8, fontFamily: 'monospace' }}>TARKET</span>
        {selected && <span style={{ fontSize: '12px', color: accent, background: `${accent}20`, padding: '1px 6px', borderRadius: '1px' }}>✓</span>}
      </div>

      {/* SVG illustration */}
      <div style={{ padding: '0 8px' }}>
        <svg width="100%" viewBox="0 0 160 150" style={{ display: 'block' }}>
          <PosterArt />
        </svg>
      </div>

      {/* Title area */}
      <div style={{
        padding: '8px 12px 12px',
        borderTop: `0.5px solid ${accent}20`,
        background: `linear-gradient(0deg, ${bg[2]}CC, transparent)`,
      }}>
        <p className="font-serif-kr" style={{ fontSize: '18px', fontWeight: 600, color: '#F5F0FA', lineHeight: 1.2 }}>{name}</p>
        <p style={{ fontSize: '12px', color: accent, letterSpacing: '0.2em', marginTop: '3px', opacity: 0.75, fontFamily: 'monospace' }}>{tag}</p>
      </div>
    </button>
  )
}

// ── Tarot card art (ivory, dark purple etching style) ─────────────────────
export function IvoryCardArt({ card, accent, size = 100 }: { card: string; accent: string; size?: number }) {
  const w = size, h = Math.round(size * 1.4)
  const cx = w/2, cy = h * 0.46
  const inkColor = '#2A1545'

  function Art() {
    if (card.includes('Star') || card === '별') return (
      <g>
        <circle cx={cx} cy={cy} r={w*0.35} fill="none" stroke={inkColor} strokeWidth="0.7" opacity="0.2" />
        <polygon points={`${cx},${cy-w*0.28} ${cx+w*0.07},${cy-w*0.07} ${cx+w*0.28},${cy} ${cx+w*0.07},${cy+w*0.07} ${cx},${cy+w*0.28} ${cx-w*0.07},${cy+w*0.07} ${cx-w*0.28},${cy} ${cx-w*0.07},${cy-w*0.07}`}
          fill="none" stroke={inkColor} strokeWidth="0.9" />
        <circle cx={cx} cy={cy} r={w*0.08} fill={inkColor} opacity="0.7" />
        <ellipse cx={cx} cy={cy} rx={w*0.2} ry={w*0.07} fill="none" stroke={inkColor} strokeWidth="0.5" opacity="0.35" />
        <ellipse cx={cx} cy={cy} rx={w*0.07} ry={w*0.2} fill="none" stroke={inkColor} strokeWidth="0.5" opacity="0.35" />
        {[[cx-w*0.3,cy-w*0.32],[cx+w*0.28,cy-w*0.26],[cx-w*0.26,cy+w*0.3],[cx+w*0.3,cy+w*0.28]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1.2" fill={inkColor} opacity="0.5" />
        ))}
      </g>
    )

    if (card.includes('Moon') || card.includes('달')) return (
      <g>
        <path d={`M ${cx+w*0.1} ${cy-w*0.28} A ${w*0.28} ${w*0.28} 0 1 0 ${cx+w*0.1} ${cy+w*0.28} A ${w*0.18} ${w*0.18} 0 1 1 ${cx+w*0.1} ${cy-w*0.28}`}
          fill="none" stroke={inkColor} strokeWidth="0.9" />
        {[[cx-w*0.1,cy-w*0.3],[cx-w*0.2,cy],[cx-w*0.1,cy+w*0.3]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r="1" fill={inkColor} opacity="0.5" />
        ))}
      </g>
    )

    if (card.includes('Sun') || card.includes('태양')) return (
      <g>
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((a,i)=>(
          <line key={i}
            x1={cx+Math.cos(a*Math.PI/180)*w*0.14} y1={cy+Math.sin(a*Math.PI/180)*w*0.14}
            x2={cx+Math.cos(a*Math.PI/180)*w*0.28} y2={cy+Math.sin(a*Math.PI/180)*w*0.28}
            stroke={inkColor} strokeWidth="0.6" opacity="0.45" />
        ))}
        <circle cx={cx} cy={cy} r={w*0.12} fill={inkColor} fillOpacity="0.6" />
        <circle cx={cx} cy={cy} r={w*0.2}  fill="none" stroke={inkColor} strokeWidth="0.5" opacity="0.3" />
      </g>
    )

    if (card.includes('Lovers') || card.includes('연인')) return (
      <g>
        <path d={`M ${cx-w*0.08} ${cy-w*0.1} Q ${cx-w*0.08} ${cy-w*0.3} ${cx} ${cy-w*0.22} Q ${cx+w*0.08} ${cy-w*0.3} ${cx+w*0.08} ${cy-w*0.1} Q ${cx+w*0.08} ${cy+w*0.05} ${cx} ${cy+w*0.15} Q ${cx-w*0.08} ${cy+w*0.05} ${cx-w*0.08} ${cy-w*0.1}Z`}
          fill="none" stroke={inkColor} strokeWidth="0.9" />
        <circle cx={cx-w*0.2} cy={cy-w*0.1} r={w*0.09} fill="none" stroke={inkColor} strokeWidth="0.7" opacity="0.4" />
        <circle cx={cx+w*0.2} cy={cy-w*0.1} r={w*0.09} fill="none" stroke={inkColor} strokeWidth="0.7" opacity="0.4" />
      </g>
    )

    if (card.includes('Empress') || card.includes('여황제')) return (
      <g>
        <ellipse cx={cx} cy={cy-w*0.05} rx={w*0.22} ry={w*0.3} fill="none" stroke={inkColor} strokeWidth="0.7" opacity="0.5" />
        <ellipse cx={cx} cy={cy-w*0.28} rx={w*0.12} ry={w*0.06} fill="none" stroke={inkColor} strokeWidth="0.7" opacity="0.6" />
        {[-1,1].map(s=>(
          <line key={s} x1={cx+s*w*0.12} y1={cy-w*0.22} x2={cx+s*w*0.22} y2={cy-w*0.15} stroke={inkColor} strokeWidth="0.5" opacity="0.4" />
        ))}
      </g>
    )

    if (card.includes('Wheel') || card.includes('운명')) return (
      <g>
        <circle cx={cx} cy={cy} r={w*0.28} fill="none" stroke={inkColor} strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={w*0.18} fill="none" stroke={inkColor} strokeWidth="0.5" opacity="0.5" />
        <circle cx={cx} cy={cy} r={w*0.08} fill={inkColor} fillOpacity="0.5" />
        {[0,45,90,135].map((a,i)=>(
          <line key={i} x1={cx+Math.cos(a*Math.PI/180)*w*0.09} y1={cy+Math.sin(a*Math.PI/180)*w*0.09}
            x2={cx+Math.cos(a*Math.PI/180)*w*0.27} y2={cy+Math.sin(a*Math.PI/180)*w*0.27}
            stroke={inkColor} strokeWidth="0.6" opacity="0.5" />
        ))}
      </g>
    )

    if (card.includes('Pentacles') || card.includes('금화')) return (
      <g>
        {[0,72,144,216,288].map((a,i)=>(
          <polygon key={i} points={
            [0,72,144,216,288].map(b=>`${cx+Math.cos((a+b)*Math.PI/180)*w*0.24},${cy+Math.sin((a+b)*Math.PI/180)*w*0.24}`).join(' ')
          } fill="none" stroke={inkColor} strokeWidth={i===0?0.8:0.4} opacity={i===0?0.6:0.3} />
        ))}
        <circle cx={cx} cy={cy} r={w*0.28} fill="none" stroke={inkColor} strokeWidth="0.5" opacity="0.25" />
      </g>
    )

    if (card.includes('Hermit') || card.includes('은둔자')) return (
      <g>
        <circle cx={cx+w*0.05} cy={cy-w*0.15} r={w*0.08} fill="none" stroke={inkColor} strokeWidth="0.8" opacity="0.6" />
        <line x1={cx} y1={cy-w*0.07} x2={cx} y2={cy+w*0.25} stroke={inkColor} strokeWidth="0.8" opacity="0.6" />
        <line x1={cx} y1={cy+w*0.25} x2={cx+w*0.1} y2={cy+w*0.3} stroke={inkColor} strokeWidth="0.7" opacity="0.5" />
        <circle cx={cx+w*0.18} cy={cy+w*0.04} r={w*0.055} fill="none" stroke={inkColor} strokeWidth="0.6" opacity="0.5" />
        {[0,45,90,135,180,225,270,315].map((a,i)=>(
          <line key={i} x1={cx+w*0.18+Math.cos(a*Math.PI/180)*w*0.055} y1={cy+w*0.04+Math.sin(a*Math.PI/180)*w*0.055}
            x2={cx+w*0.18+Math.cos(a*Math.PI/180)*w*0.09} y2={cy+w*0.04+Math.sin(a*Math.PI/180)*w*0.09}
            stroke={inkColor} strokeWidth="0.4" opacity="0.4" />
        ))}
      </g>
    )

    if (card.includes('Priestess') || card.includes('여사제')) return (
      <g>
        <rect x={cx-w*0.22} y={cy-w*0.28} width={w*0.44} height={w*0.56} rx="2" fill="none" stroke={inkColor} strokeWidth="0.7" opacity="0.45" />
        <line x1={cx-w*0.22} y1={cy-w*0.1} x2={cx+w*0.22} y2={cy-w*0.1} stroke={inkColor} strokeWidth="0.5" opacity="0.35" />
        {[0,1,2,3].map(i=>(
          <line key={i} x1={cx-w*0.17} y1={cy-w*0.04+i*w*0.08} x2={cx+w*0.17} y2={cy-w*0.04+i*w*0.08}
            stroke={inkColor} strokeWidth="0.4" opacity="0.25" />
        ))}
        <ellipse cx={cx} cy={cy-w*0.28} rx={w*0.08} ry={w*0.04} fill={inkColor} fillOpacity="0.4" />
      </g>
    )

    if (card.includes('World') || card.includes('세계')) return (
      <g>
        <ellipse cx={cx} cy={cy} rx={w*0.26} ry={w*0.3} fill="none" stroke={inkColor} strokeWidth="0.7" opacity="0.5" />
        <ellipse cx={cx} cy={cy} rx={w*0.08} ry={w*0.3} fill="none" stroke={inkColor} strokeWidth="0.5" opacity="0.3" />
        <ellipse cx={cx} cy={cy} rx={w*0.26} ry={w*0.08} fill="none" stroke={inkColor} strokeWidth="0.4" opacity="0.3" />
        <circle cx={cx} cy={cy} r={w*0.04} fill={inkColor} opacity="0.5" />
      </g>
    )

    if (card.includes('Chariot') || card.includes('전차')) return (
      <g>
        <circle cx={cx-w*0.14} cy={cy+w*0.18} r={w*0.1} fill="none" stroke={inkColor} strokeWidth="0.8" opacity="0.6" />
        <circle cx={cx+w*0.14} cy={cy+w*0.18} r={w*0.1} fill="none" stroke={inkColor} strokeWidth="0.8" opacity="0.6" />
        <rect x={cx-w*0.2} y={cy-w*0.16} width={w*0.4} height={w*0.28} rx="1" fill="none" stroke={inkColor} strokeWidth="0.7" opacity="0.5" />
        <line x1={cx-w*0.2} y1={cy+w*0.12} x2={cx-w*0.14} y2={cy+w*0.18} stroke={inkColor} strokeWidth="0.6" opacity="0.4" />
        <line x1={cx+w*0.2} y1={cy+w*0.12} x2={cx+w*0.14} y2={cy+w*0.18} stroke={inkColor} strokeWidth="0.6" opacity="0.4" />
      </g>
    )

    // Magician / Fool / default
    if (card.includes('Magician') || card.includes('마법사')) return (
      <g>
        <circle cx={cx} cy={cy-w*0.12} r={w*0.06} fill="none" stroke={inkColor} strokeWidth="0.8" opacity="0.6" />
        <line x1={cx} y1={cy-w*0.06} x2={cx} y2={cy+w*0.28} stroke={inkColor} strokeWidth="0.8" opacity="0.5" />
        <rect x={cx-w*0.24} y={cy+w*0.1} width={w*0.48} height={w*0.18} rx="1" fill="none" stroke={inkColor} strokeWidth="0.6" opacity="0.4" />
        {[0,1,2,3].map(i=>(
          <circle key={i} cx={cx-w*0.18+i*w*0.12} cy={cy+w*0.19} r={w*0.03} fill={inkColor} fillOpacity="0.5" />
        ))}
        {[0,60,120,180,240,300].map((a,i)=>(
          <circle key={i} cx={cx+Math.cos(a*Math.PI/180)*w*0.22} cy={cy-w*0.12+Math.sin(a*Math.PI/180)*w*0.22}
            r="1" fill={inkColor} opacity="0.4" />
        ))}
      </g>
    )

    // The Fool / default
    return (
      <g>
        <circle cx={cx} cy={cy-w*0.08} r={w*0.24} fill="none" stroke={inkColor} strokeWidth="0.7" opacity="0.35" />
        <line x1={cx-w*0.15} y1={cy-w*0.28} x2={cx+w*0.15} y2={cy-w*0.28} stroke={inkColor} strokeWidth="0.6" opacity="0.5" />
        <line x1={cx} y1={cy-w*0.28} x2={cx} y2={cy+w*0.2} stroke={inkColor} strokeWidth="0.6" opacity="0.45" />
        <circle cx={cx+w*0.18} cy={cy-w*0.22} r={w*0.06} fill="none" stroke={inkColor} strokeWidth="0.5" opacity="0.4" />
      </g>
    )
  }

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="visible">
      <defs>
        <radialGradient id="ia-bg" cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#FFF8EC" />
          <stop offset="100%" stopColor="#F2EAD4" />
        </radialGradient>
      </defs>
      <rect width={w} height={h} rx="3" fill="url(#ia-bg)" />
      <rect width={w} height={h} rx="3" fill="none" stroke={inkColor} strokeWidth="0.8" opacity="0.15" />
      <rect x="3" y="3" width={w-6} height={h-6} rx="2" fill="none" stroke={inkColor} strokeWidth="0.4" opacity="0.1" />
      <Art />
      {/* Card name at bottom */}
      <text x={cx} y={h-w*0.1} textAnchor="middle" fontFamily="'IM Fell English', serif"
        fontSize={w*0.095} fill={inkColor} fillOpacity="0.6">{card}</text>
    </svg>
  )
}

export function CinemaSign() {
  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      {/* Art deco frame */}
      <div style={{
        display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 36px 16px',
        border: '1px solid #D8BD8840',
        position: 'relative',
      }}>
        {/* Corner ornaments */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h])=>(
          <div key={`${v}${h}`} style={{
            position: 'absolute', [v]: '-3px', [h]: '-3px',
            width: '12px', height: '12px',
            border: `1px solid #D8BD8870`,
            borderRadius: '1px',
          }} />
        ))}

        {/* Marquee dots top */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
          {[...Array(9)].map((_,i) => (
            <div key={i} className="marquee-dot" style={{ animation: `marquee 2.4s ease-in-out infinite ${i*0.15}s`, opacity: 0.7 }} />
          ))}
        </div>

        <p style={{ fontSize: '12px', letterSpacing: '0.5em', color: '#D8BD88', marginBottom: '6px', opacity: 0.8, fontFamily: 'monospace' }}>
          PRESENTS
        </p>
        <p className="font-en-serif" style={{
          fontSize: '38px', color: '#F5F0FA',
          letterSpacing: '0.12em', lineHeight: 1,
          animation: 'signGlow 3s ease-in-out infinite',
        }}>
          TARKET
        </p>
        <p style={{ fontSize: '12px', letterSpacing: '0.45em', color: '#D8BD88', marginTop: '4px', opacity: 0.75 }}>
          CINEMA
        </p>

        {/* Marquee dots bottom */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
          {[...Array(9)].map((_,i) => (
            <div key={i} className="marquee-dot" style={{ animation: `marquee 2.4s ease-in-out infinite ${(9-i)*0.15}s`, opacity: 0.7 }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Background stars ──────────────────────────────────────────────────────
export function Stars() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_,i) => (
        <div key={i} style={{
          position: 'absolute',
          width: `${1+(i%3)*0.5}px`, height: `${1+(i%3)*0.5}px`,
          borderRadius: '50%', background: '#C4AFE8',
          left: `${(i*37+11)%100}%`, top: `${(i*53+7)%100}%`,
          animation: `twinkle ${2.5+(i%5)*0.7}s ease-in-out infinite ${(i*0.3)%3}s`,
          opacity: 0.15,
        }} />
      ))}
    </div>
  )
}

// ── Side curtain frames ───────────────────────────────────────────────────
export function SideCurtains() {
  return (
    <>
      {[{ side: 'left', grad: '90deg' }, { side: 'right', grad: '270deg' }].map(({ side, grad }) => (
        <div key={side} className="fixed top-0 h-full z-10 pointer-events-none hidden lg:block" style={{
          [side]: 0, width: '8%',
          background: `linear-gradient(${grad}, #100A1C 0%, #1E0A35 50%, transparent 100%)`,
        }}>
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            [side === 'left' ? 'right' : 'left']: 0,
            width: '2px',
            background: 'linear-gradient(180deg, transparent, #D8BD8840, #D8BD8860, #D8BD8840, transparent)',
          }} />
          {/* Velvet folds */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `repeating-linear-gradient(${grad}, rgba(255,255,255,0) 0px, rgba(255,255,255,0.01) 3px, rgba(0,0,0,0.08) 7px, rgba(255,255,255,0) 12px)`,
          }} />
        </div>
      ))}
    </>
  )
}

