'use client';

import { useState, useEffect, useRef } from "react";

const notes = [
  { key: "a", label: "C4", freq: 261.63 },
  { key: "w", label: "C#4", freq: 277.18 },
  { key: "s", label: "D4", freq: 293.66 },
  { key: "e", label: "D#4", freq: 311.13 },
  { key: "d", label: "E4", freq: 329.63 },
  { key: "f", label: "F4", freq: 349.23 },
  { key: "t", label: "F#4", freq: 369.99 },
  { key: "g", label: "G4", freq: 392.0 },
  { key: "y", label: "G#4", freq: 415.30 },
  { key: "h", label: "A4", freq: 440.0 },
  { key: "u", label: "A#4", freq: 466.16 },
  { key: "j", label: "B4", freq: 493.88 },
  { key: "k", label: "C5", freq: 523.25 },
  { key: "o", label: "C#5", freq: 554.37 },
];

export default function Home() {
  const [oscType, setOscType] = useState("sine");
  const oscTypeRef = useRef(oscType);
  const [pressedKey, setPressedKey] = useState(null);
  const lastTouch = useRef(0);
  const [slideDuration, setSlideDuration] = useState(1);

  // Single AudioContext for the app
  const audioCtxRef = useRef(null);
  const currentOsc = useRef(null);

  useEffect(() => {
    oscTypeRef.current = oscType;
  }, [oscType]);

  // Create AudioContext once
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Start note (and stop previous if any)
  const startNote = async (frequency) => {
    stopNote();
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") {
      await audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    oscillator.type = oscTypeRef.current;
    oscillator.frequency.value = frequency;
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    currentOsc.current = oscillator;
  };

  // Stop note
  const stopNote = () => {
    if (currentOsc.current) {
      try { currentOsc.current.stop(); } catch {}
      currentOsc.current.disconnect();
      currentOsc.current = null;
    }
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const note = notes.find((n) => n.key === e.key);
      if (note && pressedKey !== note.key) {
        setPressedKey(note.key);
        startNote(note.freq);
      }
      if (e.key === "ArrowUp") slideFrequency("up");
      if (e.key === "ArrowDown") slideFrequency("down");
    };
    const handleKeyUp = (e) => {
      const note = notes.find((n) => n.key === e.key);
      if (note) {
        setPressedKey(null);
        stopNote();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line
  }, [pressedKey]);

  // Mouse/touch handlers
  const handlePress = (key, freq, isTouch = false) => {
    if (isTouch) {
      lastTouch.current = Date.now();
      setPressedKey(key);
      startNote(freq);
    } else {
      if (Date.now() - lastTouch.current < 500) return;
      setPressedKey(key);
      startNote(freq);
    }
  };

  const handleRelease = (isTouch = false) => {
    if (isTouch) {
      lastTouch.current = Date.now();
    }
    setPressedKey(null);
    stopNote();
  };

  // Frequency slide (for up/down arrows or buttons)
  const slideFrequency = (direction) => {
    if (currentOsc.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const currentFreq = currentOsc.current.frequency.value;
      const slideAmount = 100;
      const duration = Math.max(0, Math.min(10, slideDuration));
      const targetFreq = direction === "up"
        ? currentFreq + slideAmount
        : Math.max(1, currentFreq - slideAmount);
      currentOsc.current.frequency.cancelScheduledValues(now);
      currentOsc.current.frequency.setValueAtTime(currentFreq, now);
      currentOsc.current.frequency.linearRampToValueAtTime(targetFreq, now + duration);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">

      <label htmlFor="oscType" className="mb-2 font-bold">Oscillator Type:</label>
      <select
        id="oscType"
        value={oscType}
        onChange={(e) => setOscType(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="sine">Sine</option>
        <option value="square">Square</option>
        <option value="sawtooth">Sawtooth</option>
        <option value="triangle">Triangle</option>
        <option value="custom">Custom</option>
      </select>
      <div className="flex gap-2 flex-wrap max-w-2xl mb-4">
        {notes.map(({ key, label, freq }) => (
          <button
            key={key}
            className={`px-4 py-6 rounded shadow-lg font-bold text-lg
              bg-blue-400 text-white
              transition-all duration-150
              ${pressedKey === key ? "bg-blue-700 translate-y-1 shadow-inner" : "hover:bg-blue-500"}
            `}
            style={{ minWidth: 56 }}
            onMouseDown={() => handlePress(key, freq)}
            onMouseUp={() => handleRelease()}
            onMouseLeave={() => handleRelease()}
            onTouchStart={() => handlePress(key, freq, true)}
            onTouchEnd={() => handleRelease(true)}
          >
            {key.toUpperCase()}
            <br />
            <span className="text-xs font-normal">{label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-4 mb-4">
        <button
          className="px-4 py-2 bg-green-500 text-white rounded shadow hover:bg-green-600"
          onClick={() => slideFrequency("up")}
          disabled={!currentOsc.current}
        >
          ▲ Slide Up
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
          onClick={() => slideFrequency("down")}
          disabled={!currentOsc.current}
        >
          ▼ Slide Down
        </button>
      </div>
      <div className="flex flex-col items-center mb-4 w-64">
        <label htmlFor="slideDuration" className="mb-1 font-medium">
          Slide Duration: {slideDuration}s
        </label>
        <input
          id="slideDuration"
          type="range"
          min={0}
          max={10}
          step={0.1}
          value={slideDuration}
          onChange={e => setSlideDuration(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <p className="mt-4 text-gray-600">
        Use keys {notes.map(n => n.key.toUpperCase()).join(" ")} to play notes.<br />
        Use <span className="font-mono">↑</span> and <span className="font-mono">↓</span> arrows to slide frequency.
      </p>
    </div>
  );
}
