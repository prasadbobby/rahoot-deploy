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
    const colors = [
      '#FF3366', '#00CCFF', '#FFD166', '#06D6A0', 
      '#EF476F', '#118AB2', '#FFD166', '#06D6A0'
    ];
    
    for (let i = 0; i < 150; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20, // Start slightly off-screen
        size: 5 + Math.random() * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 2 + Math.random() * 5,
        delay: Math.random() * 5,
        rotation: Math.random() * 360,
        rotationSpeed: -5 + Math.random() * 10,
      });
    }
    
    setParticles(newParticles);
    
    const timer = setTimeout(() => {
      setParticles([]);
    }, 8000);
    
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
            '--fall-duration': `${particle.speed}s`,
            '--fall-delay': `${particle.delay}s`,
            transform: `rotate(${particle.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}