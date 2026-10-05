// Each pitch carries its own buzzing harmonics and ends before the next note.
export function scheduleBeeNote(context, destination, frequency, at, timbre) {
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0, at)
  envelope.gain.linearRampToValueAtTime(0.7, at + 0.012)
  envelope.gain.exponentialRampToValueAtTime(0.32, at + 0.17)
  envelope.gain.exponentialRampToValueAtTime(0.001, at + 0.28)
  envelope.gain.linearRampToValueAtTime(0, at + 0.3)
  envelope.connect(destination)
  if (timbre === 'pure') {
    const oscillator = context.createOscillator()
    oscillator.frequency.value = frequency
    oscillator.connect(envelope)
    oscillator.start(at)
    oscillator.stop(at + 0.3)
    return
  }
  const real = new Float32Array(17)
  const imag = new Float32Array(17)
  for (let h = 1; h < imag.length; h++) imag[h] = Math.exp(-h / 6) / Math.sqrt(h)
  const wave = context.createPeriodicWave(real, imag)
  for (const [i, cents] of [-7, 0, 7].entries()) {
    const voice = context.createOscillator()
    voice.setPeriodicWave(wave)
    voice.frequency.value = frequency
    voice.detune.setValueAtTime(cents, at)
    voice.detune.linearRampToValueAtTime(cents + (i - 1) * 4, at + 0.09)
    voice.detune.linearRampToValueAtTime(cents, at + 0.26)
    const gain = context.createGain()
    gain.gain.value = i === 1 ? 0.48 : 0.22
    const flutter = context.createOscillator()
    flutter.frequency.value = 31 + i * 6
    const depth = context.createGain()
    depth.gain.value = 0.045
    flutter.connect(depth).connect(gain.gain)
    voice.connect(gain).connect(envelope)
    voice.start(at)
    flutter.start(at)
    voice.stop(at + 0.3)
    flutter.stop(at + 0.3)
  }
}
