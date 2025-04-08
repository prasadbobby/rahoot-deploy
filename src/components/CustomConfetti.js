// src/components/CustomConfetti.js
import { useEffect, useState } from 'react';

export default function CustomConfetti({ active }) {
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    
    // Create confetti particles
    const newParticles = [];
    const colors = ['#f44336', '#2196f3', '#ffeb3b', '#4caf50', '#9c27b0'];
    
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10,
        size: 5 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 2 + Math.random() * 5,
        delay: Math.random() * 5,
      });
    }
    
    setParticles(newParticles);
    
    // Cleanup
    const timer = setTimeout(() => {
      setParticles([]);
    }, 7000);
    
    return () => {
      clearTimeout(timer);
      setParticles([]);
    };
  }, [active]);
  
  if (!active || particles.length === 0) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-sm animate-fall"
          style={{
            left: `${particle.x}vw`,
            top: `${particle.y}vh`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}