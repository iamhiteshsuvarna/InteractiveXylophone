'use client';

import { useEffect, useState } from 'react';
import React from "react";
import OscillatorTypeDropdown from "../components/OscillatorTypeDropdown";

const NOTES = {
  C: 261.63,
  D: 293.66,
  E: 329.63, 
  F: 349.23,
  G: 392.00,
  A: 440.00,
  B: 493.88,
  C2: 523.25,
};

const KEY_BINDINGS = {
  c: 'C',
  d: 'D',
  e: 'E',
  f: 'F',
  g: 'G',
  a: 'A',
  b: 'B',
  x: 'C2',
};

export default function NoteExplorer() {
  const [activeNote, setActiveNote] = useState(null);
  const [oscillatorType, setOscillatorType] = useState('triangle');

  useEffect(() => {
    const handleKeyDown = (e) => {
      const note = KEY_BINDINGS[e.key];
      console.log(`Key pressed: ${e.key}, Note: ${note}`);
      if (note && NOTES[note]) {
        playNote(NOTES[note], note);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get the dropdown element
  const oscTypeSelect = document.getElementById('oscType');

  // Function to play a note
  const playNote = (freq, note) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = oscillatorType; // Set type from dropdown
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
    setActiveNote(note);
    setTimeout(() => setActiveNote(null), 200);
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
        {Object.entries(NOTES).map(([note, freq]) => (
          <div
            key={note}
            onClick={() => playNote(freq, note)}
            className={`w-16 h-48 border border-solid ${activeNote === note ? 'bg-yellow-500' : 'bg-white'} text-center font-bold cursor-pointer m-2 rounded-lg flex items-center justify-center select-none`}
            >
            {note}
          </div>
        ))}
      </div>
    </div>
  );
}
