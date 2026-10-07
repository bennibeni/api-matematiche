import React from 'react';
import { frequencyNote } from './genealogyMusic.js';
import { staffPage } from './musicNotation.js';

// Diatonic positions in treble clef, with E4 on the bottom staff line.
export default function MusicStaff({ score, index = null, compact = false }) {
  const { first, notes } = staffPage(score, index);
  const positions = notes.map((event) => {
    const pitch = frequencyNote(event.frequency);
    const [, name, accidental, octave] = /^(Do|Re|Mi|Fa|Sol|La|Si)(♯|♭)?(-?\d+)$/.exec(pitch.label);
    const position = Number(octave) * 7 + ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'].indexOf(name);
    const octaveShift =
      position < 26
        ? Math.ceil((26 - position) / 7)
        : position > 40
          ? -Math.ceil((position - 40) / 7)
          : 0;
    return { pitch, accidental, y: 118 - (position + octaveShift * 7 - 30) * 6 };
  });
  return (
    <div className={`music-staff${compact ? ' compact' : ''}`}>
      <svg
        viewBox="0 -20 650 210"
        role="img"
        aria-label={`Pentagramma, passi ${first + 1}–${first + notes.length}${index === null ? '' : ', nota corrente ' + frequencyNote(score[index].frequency).label}`}
      >
        <text x="90" y="-5" fontSize="12" fontStyle="italic" fill="#475741">
          ♩ = 120 · con vibrato
        </text>
        {[70, 82, 94, 106, 118].map((y) => (
          <line key={y} x1="18" x2="635" y1={y} y2={y} stroke="#6d705f" />
        ))}
        <text x="22" y="118" fontSize="64" fontFamily="serif">
          𝄞
        </text>
        {notes.map((event, i) => {
          const { pitch, accidental, y } = positions[i];
          const groupStart = event.ornamentPart ? i - event.ornamentPart + 1 : null;
          const beamY =
            groupStart === null
              ? null
              : Math.min(...positions.slice(groupStart, groupStart + 3).map((item) => item.y)) - 29;
          const x = 90 + i * 73;
          const active = index === first + i;
          const color = active ? '#bb3d22' : '#292f25';
          const ledger = [];
          for (let line = 130; line <= y; line += 12) ledger.push(line);
          for (let line = 58; line >= y; line -= 12) ledger.push(line);
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
                <line key={line} x1={x - 14} x2={x + 14} y1={line} y2={line} stroke={color} />
              ))}
              {event.fibonacci !== undefined && (
                <text x={x} y="20" textAnchor="middle" fontSize="11" fill={color}>
                  {event.fibonacci}
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
                x1={x + (event.ornamentPart || y >= 94 ? 7 : -7)}
                x2={x + (event.ornamentPart || y >= 94 ? 7 : -7)}
                y1={y}
                y2={beamY ?? y + (y >= 94 ? -29 : 29)}
                stroke={color}
                strokeWidth="2"
              />
              {event.ornamentPart === 1 && (
                <g aria-label="Terzina di crome: tre note in un movimento">
                  <line
                    x1={x + 7}
                    x2={x + 153}
                    y1={beamY}
                    y2={beamY}
                    stroke="#292f25"
                    strokeWidth="4"
                  />
                  <text
                    x={x + 80}
                    y={beamY - 7}
                    textAnchor="middle"
                    fontSize="14"
                    fontStyle="italic"
                    fill="#292f25"
                  >
                    3
                  </text>
                </g>
              )}
              {event.final && <circle cx={x + 15} cy={y} r="2.5" fill={color} />}
              <text x={x} y="167" textAnchor="middle" fontSize="13" fill={color}>
                {pitch.label}
              </text>
              <text x={x} y="184" textAnchor="middle" fontSize="10" fill={color}>
                gen.{event.generation}
              </text>
            </g>
          );
        })}
      </svg>
      {!compact && (
        <p>
          Le note seguono il percorso, inclusi i ritorni. Sul pentagramma è indicata la nota più
          vicina. Le note indicate sono il centro del vibrato, nel temperamento equabile. Le
          semiminime durano un movimento (0,5 secondi); le tre crome unite dal numero 3 formano una
          terzina e occupano insieme lo stesso movimento. La nota finale puntata dura 0,75 secondi.
          “Con vibrato” indica l’oscillazione già presente nel suono, non note aggiuntive. Il numero
          sopra ogni nota è il termine di Fibonacci associato all’ape, prima del resto modulo 7. Il
          disegno riporta le note gravi in un registro leggibile: il nome sotto ogni nota indica
          l’altezza realmente suonata.
        </p>
      )}
    </div>
  );
}
