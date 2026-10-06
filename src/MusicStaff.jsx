import React from 'react'
import { frequencyNote } from './genealogyMusic.js'

// Diatonic positions in treble clef, with E4 on the bottom staff line.
export default function MusicStaff({ score, index = null, compact = false }) {
  const first = index === null ? 0 : Math.floor(index / 8) * 8
  const notes = score.slice(first, first + 8)
  return (
    <div className={`music-staff${compact ? ' compact' : ''}`}>
      <svg
        viewBox="0 0 650 190"
        role="img"
        aria-label={`Pentagramma, passi ${first + 1}–${first + notes.length}${index === null ? '' : ', nota corrente ' + frequencyNote(score[index].frequency).label}`}
      >
        {[70, 82, 94, 106, 118].map((y) => (
          <line key={y} x1="18" x2="635" y1={y} y2={y} stroke="#6d705f" />
        ))}
        <text x="22" y="118" fontSize="64" fontFamily="serif">
          𝄞
        </text>
        {notes.map((event, i) => {
          const pitch = frequencyNote(event.frequency)
          const [, name, accidental, octave] =
            /^(Do|Re|Mi|Fa|Sol|La|Si)(♯|♭)?(-?\d+)$/.exec(pitch.label)
          const position =
            Number(octave) * 7 +
            ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'].indexOf(name)
          const ottava = position > 40
          const y = 118 - (position - (ottava ? 7 : 0) - 30) * 6
          const x = 90 + i * 73
          const active = index === first + i
          const color = active ? '#bb3d22' : '#292f25'
          const ledger = []
          for (let line = 130; line <= y; line += 12) ledger.push(line)
          for (let line = 58; line >= y; line -= 12) ledger.push(line)
          return (
            <g key={first + i}>
              {active && (
                <rect
                  x={x - 28}
                  y="4"
                  width="56"
                  height="180"
                  rx="9"
                  fill="#fff0d1"
                  fillOpacity="0.45"
                />
              )}
              {ledger.map((line) => (
                <line
                  key={line}
                  x1={x - 14}
                  x2={x + 14}
                  y1={line}
                  y2={line}
                  stroke={color}
                />
              ))}
              {ottava && (
                <text
                  x={x}
                  y="20"
                  textAnchor="middle"
                  fontSize="11"
                  fill={color}
                >
                  8va
                </text>
              )}
              {accidental && (
                <text x={x - 25} y={y + 5} fontSize="20" fill={color}>
                  {accidental}
                </text>
              )}
              <ellipse
                cx={x}
                cy={y}
                rx="8"
                ry="5"
                transform={`rotate(-18 ${x} ${y})`}
                fill={color}
              />
              <line
                x1={x + (y >= 94 ? 7 : -7)}
                x2={x + (y >= 94 ? 7 : -7)}
                y1={y}
                y2={y + (y >= 94 ? -29 : 29)}
                stroke={color}
                strokeWidth="2"
              />
              <text
                x={x}
                y="167"
                textAnchor="middle"
                fontSize="13"
                fill={color}
              >
                {pitch.label}
              </text>
              <text
                x={x}
                y="184"
                textAnchor="middle"
                fontSize="10"
                fill={color}
              >
                gen.{event.generation}
              </text>
            </g>
          )
        })}
      </svg>
      {!compact && (
        <p>
          Le note seguono il percorso, inclusi i ritorni. Sul pentagramma è
          indicata la nota più vicina: le frequenze conservano gli scarti dei
          rapporti di Fibonacci.
        </p>
      )}
    </div>
  )
}
