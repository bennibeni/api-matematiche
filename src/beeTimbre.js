// Short, gated flight texture. Cached per context, shared by all scheduled notes.
const flightBuffers = new WeakMap();
function flightBuffer(context) {
  if (flightBuffers.has(context)) return flightBuffers.get(context);
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  let phase = 0;
  let air = 0;
  let seed = 173;
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const t = i / context.sampleRate;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed / 2147483648 - 1;
    air = air * 0.88 + noise * 0.12;
    // A low, uneven pulse train, independent of the melody's register.
    const rate =
      205 + 11 * Math.sin(2 * Math.PI * 2.3 * t) + 5 * Math.sin(2 * Math.PI * 7.1 * t) + air * 9;
    phase += (2 * Math.PI * rate) / context.sampleRate;
    let pulse = 0;
    for (let h = 1; h <= 8; h++) {
      pulse += (Math.sin(h * phase) * Math.exp(-h / 2.7)) / Math.sqrt(h);
    }
    data[i] = pulse * (0.8 + 0.12 * Math.sin(2 * Math.PI * 3.7 * t)) + air * 0.14;
    peak = Math.max(peak, Math.abs(data[i]));
  }
  for (let i = 0; i < data.length; i++) data[i] *= 0.8 / peak;
  flightBuffers.set(context, buffer);
  return buffer;
}

export function scheduleBeeNote(context, destination, frequency, at, timbre, articulation = {}) {
  const envelope = context.createGain();
  const expression = context.createGain();
  expression.gain.value = articulation.velocity ?? 1;
  envelope.connect(expression).connect(destination);
  const length = articulation.soundDuration ?? 0.52;
  function addVibrato(oscillator) {
    const vibrato = context.createOscillator();
    vibrato.frequency.value = 6;
    const depth = context.createGain();
    depth.gain.value = 22;
    vibrato.connect(depth).connect(oscillator.detune);
    vibrato.start(at);
    vibrato.stop(at + length);
  }
  if (timbre === 'pure') {
    // Gentle overlap plus amplitude and pitch modulation.
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(0.95, at + 0.015);
    envelope.gain.linearRampToValueAtTime(0.85, at + length - 0.04);
    envelope.gain.linearRampToValueAtTime(0, at + length);
    const tremolo = context.createGain();
    tremolo.gain.value = 0.85;
    const lfo = context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 6;
    const depth = context.createGain();
    depth.gain.value = 0.15;
    lfo.connect(depth).connect(tremolo.gain);
    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = frequency;
    oscillator.connect(tremolo).connect(envelope);
    lfo.start(at);
    addVibrato(oscillator);
    oscillator.start(at);
    lfo.stop(at + length);
    oscillator.stop(at + length);
    return;
  }
  // Short attack and release blend adjacent notes and their flight texture.
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(0.65, at + 0.02);
  envelope.gain.linearRampToValueAtTime(0.58, at + length - 0.04);
  envelope.gain.linearRampToValueAtTime(0, at + length);

  const melody = context.createOscillator();
  melody.type = 'triangle';
  melody.frequency.value = frequency;
  const melodyGain = context.createGain();
  melodyGain.gain.value = 0.8;
  melody.connect(melodyGain).connect(envelope);
  addVibrato(melody);
  melody.start(at);
  melody.stop(at + length);

  const flight = context.createBufferSource();
  flight.buffer = flightBuffer(context);
  const flightGain = context.createGain();
  flightGain.gain.value = 0.6;
  flight.connect(flightGain).connect(envelope);
  flight.loop = true;
  flight.start(at, (at * 0.137) % 1.5);
  flight.stop(at + length);
}
