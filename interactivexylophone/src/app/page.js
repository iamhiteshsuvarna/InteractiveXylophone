'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import OscillatorTypeDropdown from "../components/OscillatorTypeDropdown";

const NOTES = [
  { key: "a", label: "C4", freq: 261.63 },
  { key: "w", label: "C#4", freq: 277.18 },
  { key: "s", label: "D4", freq: 293.66 },
  { key: "e", label: "D#4", freq: 311.13 },
  { key: "d", label: "E4", freq: 329.63 },
  { key: "f", label: "F4", freq: 349.23 },
  { key: "t", label: "F#4", freq: 369.99 },
  { key: "g", label: "G4", freq: 392.0 },
  { key: "y", label: "G#4", freq: 415.3 },
  { key: "h", label: "A4", freq: 440.0 },
  { key: "u", label: "A#4", freq: 466.16 },
  { key: "j", label: "B4", freq: 493.88 },
  { key: "k", label: "C5", freq: 523.25 },
  { key: "o", label: "C#5", freq: 554.37 },
];

export default function NoteExplorer() {
  const [activeNote, setActiveNote] = useState(null);
  const [oscillatorType, setOscillatorType] = useState('triangle');
  const oscTypeRef = useRef(oscillatorType);
  const [pressedKey, setPressedKey] = useState(null);

  useEffect(() => {
    oscTypeRef.current = oscillatorType;
  }, [oscillatorType]);

  const playNote = useCallback((frequency) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = oscTypeRef.current;
    oscillator.frequency.value = frequency;
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
    }, 500);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const note = NOTES.find((n) => n.key === e.key);
      console.log(`Key pressed: ${e.key}, Note: ${note.key}`);
      console.log(`Pressed key: ${pressedKey}`);
      console.log(note);
      if (note.key && pressedKey !== e.key) {
        console.log(`Playing note: ${note.label} (${note.freq} Hz)`);
        setPressedKey(note.key);
        playNote(note.freq);
      }
    };
    const handleKeyUp = (e) => {
      const note = NOTES.find((n) => n.key === e.key);
      if (note) {
        setPressedKey(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pressedKey, playNote]);

  const handleMouseDown = (key, freq) => {
    setPressedKey(key);
    playNote(freq);
  };

  const handleMouseUp = () => {
    setPressedKey(null);
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-96 bg-gray-200 text-center p-5'>
      <h2>🎶 Interactive Note Explorer</h2>
      <p>Try pressing <code>a</code> through <code>j</code> or <code>x</code> on your keyboard!</p>
      
      <OscillatorTypeDropdown
        value={oscillatorType}
        onChange={(e) => {
          setOscillatorType(e.target.value)
        }}
      />
      
      <div className='flex p-2'>
        {NOTES.map(({ key, label, freq }) => (
          <div
            key={key}
            onMouseDown={() => handleMouseDown(key, freq) }
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={() => handlePress(key, freq)}
            onTouchEnd={handleMouseUp}
            // onClick={() => playNote(freq, key)}
            className={`w-16 h-48 border border-solid transform duration-200 shadow-lg shadow-black ease-in ${pressedKey == key? `translate-y-3 shadow-none`: null} ${pressedKey === key ? 'bg-yellow-500' : 'bg-white'} text-center font-bold cursor-pointer m-2 rounded-lg flex items-center justify-center select-none`}
            >
            {key.toUpperCase()}
            <br />
            <span className="text-xs font-normal">{label}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-gray-600">
        Use keys {NOTES.map(n => n.key.toUpperCase()).join(" ")} to play notes
      </p>
    </div>
  );
}
