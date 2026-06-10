export function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#F8FAFC] dark:bg-[#0e0e10]" />
      <div
        className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full opacity-30 dark:opacity-10"
        style={{
          background: 'radial-gradient(circle, #0061EF 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute top-1/2 -right-64 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-8"
        style={{
          background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
      />
      <div
        className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full opacity-15 dark:opacity-8"
        style={{
          background: 'radial-gradient(circle, #0061EF 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,97,239,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,97,239,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}

export function FloatingParticles() {
  const particles = Array.from({ length: 6 }, (_, i) => i);
  return (
    <>
      <style>{`
        @keyframes float {
          from { transform: translateY(0px) scale(1); opacity: 0.3; }
          to   { transform: translateY(-20px) scale(1.3); opacity: 0.6; }
        }
      `}</style>
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {particles.map((i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#0061EF]/30 dark:bg-[#0061EF]/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animation: `float ${3 + i * 0.7}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}