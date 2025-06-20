import React, { useState, useEffect } from 'react';

// Maximum time in milliseconds (10 hours)
const MAX_TIME_MS = 10 * 60 * 60 * 1000; // 36000000 ms

// Parse input string to milliseconds with flexible format supporting up to 10 hours
function parseFlexibleTime(input) {
  if (!input) return 0;

  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');

  if (digits.length === 0) return 0;

  // If input contains colon or dot, parse as hh:mm:ss.cs or mm:ss.cs
  if (input.includes(':') || input.includes('.')) {
    return parseTimeWithFormat(input);
  }

  // Otherwise, interpret digits as hhmmsscc (hours, minutes, seconds, centiseconds)
  // Pad digits left with zeros to 8 length for uniform parsing
  const padded = digits.padStart(8, '0');

  const hours = parseInt(padded.slice(0, padded.length - 6), 10) || 0;
  const minutes = parseInt(padded.slice(-6, -4), 10) || 0;
  const seconds = parseInt(padded.slice(-4, -2), 10) || 0;
  const centiseconds = parseInt(padded.slice(-2), 10) || 0;

  // Validate ranges
  const validHours = Math.min(hours, 10);
  const validMinutes = Math.min(minutes, 59);
  const validSeconds = Math.min(seconds, 59);
  const validCentiseconds = Math.min(centiseconds, 99);

  // Calculate total milliseconds
  const totalMs =
    validHours * 3600000 +
    validMinutes * 60000 +
    validSeconds * 1000 +
    validCentiseconds * 10;

  return totalMs > MAX_TIME_MS ? MAX_TIME_MS : totalMs;
}

// Parse time with colon and dot (hh:mm:ss.cs or mm:ss.cs) to milliseconds
function parseTimeWithFormat(str) {
  if (!str) return 0;

  // Split by colon
  const parts = str.split(':');

  let hours = 0,
    minutes = 0,
    seconds = 0,
    centiseconds = 0;

  if (parts.length === 3) {
    // Format hh:mm:ss.cs
    hours = parseInt(parts[0], 10) || 0;
    minutes = parseInt(parts[1], 10) || 0;
    const secParts = parts[2].split('.');
    seconds = parseInt(secParts[0], 10) || 0;
    centiseconds = parseInt((secParts[1] || '0').padEnd(2, '0').slice(0, 2), 10) || 0;
  } else if (parts.length === 2) {
    // Format mm:ss.cs
    minutes = parseInt(parts[0], 10) || 0;
    const secParts = parts[1].split('.');
    seconds = parseInt(secParts[0], 10) || 0;
    centiseconds = parseInt((secParts[1] || '0').padEnd(2, '0').slice(0, 2), 10) || 0;
  } else {
    // No colons, try to parse as seconds.centiseconds
    const secParts = str.split('.');
    seconds = parseInt(secParts[0], 10) || 0;
    centiseconds = parseInt((secParts[1] || '0').padEnd(2, '0').slice(0, 2), 10) || 0;
  }

  // Validate ranges
  const validHours = Math.min(hours, 10);
  const validMinutes = Math.min(minutes, 59);
  const validSeconds = Math.min(seconds, 59);
  const validCentiseconds = Math.min(centiseconds, 99);

  const totalMs =
    validHours * 3600000 +
    validMinutes * 60000 +
    validSeconds * 1000 +
    validCentiseconds * 10;

  return totalMs > MAX_TIME_MS ? MAX_TIME_MS : totalMs;
}

// Format milliseconds to h:mm:ss.cs or mm:ss.cs if less than 1 hour
function formatTime(ms) {
  if (isNaN(ms) || ms < 0) ms = 0;
  if (ms > MAX_TIME_MS) ms = MAX_TIME_MS;

  const hours = Math.floor(ms / 3600000);
  const remainder = ms % 3600000;
  const minutes = Math.floor(remainder / 60000);
  const seconds = Math.floor((remainder % 60000) / 1000);
  const centiseconds = Math.floor((remainder % 1000) / 10);

  if (hours > 0) {
    // Format h:mm:ss.cs
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  } else {
    // Format mm:ss.cs
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds
      .toString()
      .padStart(2, '0')}`;
  }
}

export default function TimeBoxes() {
  const [total, setTotal] = useState('10:00:00.00');
  const [numAttempts, setNumAttempts] = useState(3);
  const [attempts, setAttempts] = useState(['', '', '']);

  // Sync attempts array length with numAttempts (add empty strings or truncate)
  useEffect(() => {
    setAttempts((prev) => {
      if (prev.length === numAttempts) return prev;
      if (prev.length > numAttempts) return prev.slice(0, numAttempts);
      // Add empty strings if less
      return [...prev, ...Array(numAttempts - prev.length).fill('')];
    });
  }, [numAttempts]);

  // Calculate milliseconds
  const totalMs = parseFlexibleTime(total);
  const usedMs = attempts.reduce((sum, val) => sum + parseFlexibleTime(val), 0);
  const remainingMs = totalMs - usedMs < 0 ? 0 : totalMs - usedMs;

  // Input change handler with max time validation for total and attempts
  function handleInputChange(setter) {
    return (e) => {
      const val = e.target.value;

      // Parse to ms to check max limit
      const ms = parseFlexibleTime(val);

      if (ms <= MAX_TIME_MS) {
        setter(val);
      } else {
        // Ignore input beyond max time
      }
    };
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Enter the times below</h2>

      <p
        style={{
          ...styles.title,
          fontWeight: 'normal',
          fontSize: 16,
          marginTop: -10,
          marginBottom: 20,
          color: '#555',
        }}
      >
        Enter the times just like you do on WCA live.
        <br />
        <br />
        You can also take reference from the example below:
        <br />
        <br />
        1 second = 100
        <br />
        10 seconds = 1000
        <br />
        1 minute = 10000
        <br />
        10 minutes = 100000
        <br />
        1 hour = 1000000
        <br />
        10 hours = 10000000
        <br />
        <br />
        If you try to enter 1 minute as 6000 , then it will not work properly.
        <br />
        <br />
        Using spaces between digits won't cause any issues, but it is recommended to enter the time without spaces.

      </p>

      <div style={{ marginBottom: 24 }}>
        <label
          style={{ ...styles.label, display: 'block', marginBottom: 6 }}
          htmlFor="numAttempts"
        >
          Select number of attempts:
        </label>
        <select
          id="numAttempts"
          value={numAttempts}
          onChange={(e) => setNumAttempts(Number(e.target.value))}
          style={{
            padding: '8px 12px',
            fontSize: 16,
            borderRadius: 4,
            border: '1.5px solid #ccc',
            width: '100%',
            maxWidth: 120,
            cursor: 'pointer',
          }}
        >
          {[...Array(15)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label} htmlFor="totalTime">
          Enter total time here:
        </label>
        <input
          id="totalTime"
          type="text"
          value={total}
          onChange={handleInputChange(setTotal)}
          placeholder="hh:mm:ss.cs or mm:ss.cs or digits"
          style={styles.input}
          maxLength={12}
          title="Enter time as hh:mm:ss.cs, mm:ss.cs or just digits (e.g. 10000000 = 10:00:00.00)"
        />
      </div>

      {[...Array(numAttempts)].map((_, i) => (
        <div key={i} style={styles.inputGroup}>
          <label style={styles.label} htmlFor={`attempt-${i}`}>
            {`Attempt ${i + 1}:`}
          </label>
          <input
            id={`attempt-${i}`}
            type="text"
            value={attempts[i] || ''}
            onChange={(e) => {
              const val = e.target.value;
              const ms = parseFlexibleTime(val);
              if (ms <= MAX_TIME_MS) {
                const newAttempts = [...attempts];
                newAttempts[i] = val;
                setAttempts(newAttempts);
              }
            }}
            placeholder="hh:mm:ss.cs or mm:ss.cs or digits"
            style={styles.input}
            maxLength={12}
            title="Enter time as hh:mm:ss.cs, mm:ss.cs or just digits (e.g. 2343 = 23.43 seconds)"
          />
        </div>
      ))}

      <div style={styles.result}>
        Remaining time: <span style={styles.time}>{formatTime(remainingMs)}</span>
      </div>

      <div style={styles.note}>
        <small>Maximum time that you can enter in each box is 10 hours</small>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '2rem auto',
    padding: 20,
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f9f9f9',
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    color: '#555',
  },
  input: {
    padding: '8px 12px',
    fontSize: 16,
    borderRadius: 4,
    border: '1.5px solid #ccc',
    transition: 'border-color 0.3s',
    outline: 'none',
  },
  result: {
    marginTop: 30,
    fontWeight: '700',
    fontSize: 20,
    textAlign: 'center',
    color: '#222',
  },
  time: {
    color: '#007acc',
  },
  note: {
    marginTop: 10,
    textAlign: 'center',
    color: '#888',
  },
};
