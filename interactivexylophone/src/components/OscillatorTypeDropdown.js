'use client';

import React from "react";

export default function OscillatorTypeDropdown({ value, onChange }) {
  return (
    <div className="">
      <label htmlFor="oscType" className="block text-gray-700 font-bold mb-2">
        Oscillator Type:
      </label>
      <select
        id="oscType"
        value={value}
        onChange={onChange}
        className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="sine">Sine</option>
        <option value="square">Square</option>
        <option value="sawtooth">Sawtooth</option>
        <option value="triangle">Triangle</option>
        <option value="custom">Custom</option>
      </select>
    </div>
  );
}