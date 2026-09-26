'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="ru" className="dark">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#000',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
        }}
      >
        <div>
          <h1 style={{ color: '#FFDF2C' }}>Что-то пошло не так</h1>
          <p>Не удалось загрузить страницу. Попробуйте ещё раз.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: 16,
              padding: '10px 24px',
              background: '#FFDF2C',
              color: '#000',
              border: 0,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  )
}
