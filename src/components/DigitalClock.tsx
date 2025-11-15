import { useState, useEffect } from 'react';

export default function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="neuro-inset rounded-2xl px-4 py-2 flex flex-col items-center justify-center min-w-[140px]">
      <div className="text-[#333] dark:text-[#e0e0e0] font-bold text-lg tabular-nums">
        {formatTime(time)}
      </div>
      <div className="text-[#666] dark:text-[#999] text-xs">
        {formatDate(time)}
      </div>
    </div>
  );
}
