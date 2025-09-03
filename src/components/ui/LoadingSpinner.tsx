"use client"

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center space-tunnel">
      {/* 3D Star tunnel effect */}
      <div className="absolute inset-0 perspective-container">
        {/* Multiple layers of stars coming towards user */}
        {[...Array(150)].map((_, i) => (
          <div
            key={i}
            className="star-3d"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              '--start-z': `${-1000 - Math.random() * 2000}px`,
              '--end-z': '1000px',
              '--star-size': `${1 + Math.random() * 2}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Status text */}
      <div className="relative z-10">
        <div className="status-text">
          <div className="main-text">HYPERSPACE JUMP</div>
          <div className="sub-text">
            <span className="loading-word">Loading</span>
            <div className="progress-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .space-tunnel {
          background: radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%, #000000 100%);
          perspective: 1000px;
          overflow: hidden;
        }

        .perspective-container {
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        /* 3D Stars coming towards user */
        .star-3d {
          position: absolute;
          width: var(--star-size);
          height: var(--star-size);
          background: radial-gradient(circle, #ffffff 0%, rgba(255,255,255,0.8) 50%, transparent 100%);
          border-radius: 50%;
          transform: translateZ(var(--start-z));
          animation: warp-speed linear infinite;
          box-shadow: 0 0 6px #ffffff, 0 0 12px #ffffff;
        }

        @keyframes warp-speed {
          0% {
            transform: translateZ(var(--start-z)) scale(0.1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          80% {
            opacity: 1;
            transform: translateZ(0px) scale(1);
          }
          100% {
            transform: translateZ(var(--end-z)) scale(3);
            opacity: 0;
          }
        }

        /* Status Text */
        .status-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .main-text {
          color: #00ffff;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 3px;
          text-shadow: 
            0 0 10px #00ffff,
            0 0 20px #00ffff,
            0 0 30px #00ffff;
          font-family: 'Courier New', monospace;
          animation: text-flicker 3s ease-in-out infinite;
        }

        .sub-text {
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .loading-word {
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 2px;
          text-shadow: 0 0 10px rgba(255,255,255,0.5);
        }

        .progress-dots {
          display: flex;
          gap: 3px;
        }

        .progress-dots span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #00ffff;
          animation: dot-pulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 8px #00ffff;
        }

        .progress-dots span:nth-child(1) { animation-delay: 0s; }
        .progress-dots span:nth-child(2) { animation-delay: 0.3s; }
        .progress-dots span:nth-child(3) { animation-delay: 0.6s; }

        @keyframes dot-pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        @keyframes text-flicker {
          0%, 100% { opacity: 1; }
          98% { opacity: 1; }
          99% { opacity: 0.8; }
          99.5% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}