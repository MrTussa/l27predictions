export default function BgStage() {
  const streaks = [
    { left: '12%', d: '6.5s', delay: '0s', c: 'rgba(225,6,0,0.6)' },
    { left: '34%', d: '8s', delay: '1.6s', c: 'rgba(0,210,255,0.55)' },
    { left: '58%', d: '7s', delay: '3s', c: 'rgba(255,211,32,0.6)' },
    { left: '76%', d: '9s', delay: '0.8s', c: 'rgba(255,135,0,0.5)' },
    { left: '90%', d: '6s', delay: '2.3s', c: 'rgba(47,209,95,0.5)' },
  ]
  return (
    <div className="bg-stage" aria-hidden="true">
      <div className="bg-checker"></div>
      <div className="bg-iri"></div>
      <div className="bg-grid"></div>
      <div className="bg-streaks">
        {streaks.map((s, i) => (
          <i
            key={i}
            style={{
              left: s.left,
              //@ts-ignore
              '--d': s.d,
              '--delay': s.delay,
              '--streak': s.c,
            }}
          ></i>
        ))}
      </div>
      <div className="bg-vignette"></div>
    </div>
  )
}

// Object.assign(window, { BgStage })
