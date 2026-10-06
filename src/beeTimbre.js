// Short, gated flight texture. Cached per context, shared by all scheduled notes.
const flightBuffers = new WeakMap()
function flightBuffer(context) {
  if (flightBuffers.has(context)) return flightBuffers.get(context)
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const data = buffer.getChannelData(0)
  let phase = 0
  let air = 0
  let seed = 173
  let peak = 0
  for (let i = 0; i < data.length; i++) {
    const t = i / context.sampleRate
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const noise = seed / 2147483648 - 1
    air = air * 0.88 + noise * 0.12
    // A low, uneven pulse train, independent of the melody's register.
    const rate = 205 + 11 * Math.sin(2 * Math.PI * 2.3 * t)
      + 5 * Math.sin(2 * Math.PI * 7.1 * t) + air * 9
    phase += 2 * Math.PI * rate / context.sampleRate
    let pulse = 0
    for (let h = 1; h <= 8; h++) {
      pulse += Math.sin(h * phase) * Math.exp(-h / 2.7) / Math.sqrt(h)
    }
    data[i] = pulse * (0.8 + 0.12 * Math.sin(2 * Math.PI * 3.7 * t)) + air * 0.14
    peak = Math.max(peak, Math.abs(data[i]))
  }
  for (let i = 0; i < data.length; i++) data[i] *= 0.8 / peak
  flightBuffers.set(context, buffer)
  return buffer
}

export function scheduleBeeNote(context, destination, frequency, at, timbre) {
  const envelope = context.createGain()
  envelope.connect(destination)
  if (timbre === 'pure') {
    // Preserve the pure tone that already works well.
    envelope.gain.setValueAtTime(0, at)
    envelope.gain.linearRampToValueAtTime(0.7, at + 0.012)
    envelope.gain.exponentialRampToValueAtTime(0.32, at + 0.17)
    envelope.gain.exponentialRampToValueAtTime(0.001, at + 0.28)
    envelope.gain.linearRampToValueAtTime(0, at + 0.3)
    const oscillator = context.createOscillator()
    oscillator.frequency.value = frequency
    oscillator.connect(envelope)
    oscillator.start(at)
    oscillator.stop(at + 0.3)
    return
  }
  // Hold the sound long enough to hear a buzz, then leave a clear 140 ms gap.
  envelope.gain.setValueAtTime(0, at)
  envelope.gain.linearRampToValueAtTime(0.65, at + 0.035)
  envelope.gain.linearRampToValueAtTime(0.58, at + 0.29)
  envelope.gain.linearRampToValueAtTime(0, at + 0.36)

  const melody = context.createOscillator()
  melody.frequency.value = frequency
  const melodyGain = context.createGain()
  melodyGain.gain.value = 0.25
  melody.connect(melodyGain).connect(envelope)
  melody.start(at)
  melody.stop(at + 0.36)

  const flight = context.createBufferSource()
  flight.buffer = flightBuffer(context)
  const flightGain = context.createGain()
  flightGain.gain.value = 0.92
  flight.connect(flightGain).connect(envelope)
  flight.start(at, (at * 0.137) % 1.5)
  flight.stop(at + 0.36)
}
