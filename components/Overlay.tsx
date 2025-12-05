import React from 'react';
import { GameStatus } from '../types';

interface OverlayProps {
  status: GameStatus;
  elapsedTime: number;
  totalInfected: number;
  totalBoxes: number;
  speed: number;
  boxCountInput: number;
  onStart: () => void;
  onRestart: () => void;
  onSpeedChange: (val: number) => void;
  onBoxCountChange: (val: number) => void;
}

export const Overlay: React.FC<OverlayProps> = ({
  status,
  elapsedTime,
  totalInfected,
  totalBoxes,
  speed,
  boxCountInput,
  onStart,
  onRestart,
  onSpeedChange,
  onBoxCountChange
}) => {
  const formatTime = (ms: number) => (ms / 1000).toFixed(2);
  const progress = Math.min(100, Math.round((totalInfected / totalBoxes) * 100)) || 0;

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between z-10">
      
      {/* Header Panel */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl text-white max-w-sm">
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Virus Simulation
          </h1>
          <p className="text-gray-400 text-sm mb-4">
            One violet box is infected. It spreads upon contact.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-xs uppercase font-bold tracking-wider mb-1 text-gray-500">
                Box Count (Max 500)
              </label>
              <input
                type="number"
                min="2"
                max="500"
                value={boxCountInput}
                disabled={status !== 'IDLE'}
                onChange={(e) => onBoxCountChange(parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:border-violet-500 focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="flex justify-between text-xs uppercase font-bold tracking-wider mb-1 text-gray-500">
                <span>Speed</span>
                <span className="text-violet-400">{speed.toFixed(1)}x</span>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="w-full accent-violet-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex gap-2 pt-2">
               {status === 'IDLE' ? (
                <button
                  onClick={onStart}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  START
                </button>
               ) : (
                <button
                  onClick={onRestart}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  RESTART
                </button>
               )}
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="bg-black/70 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl text-white text-right">
            <div className="mb-2">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Elapsed Time</div>
                <div className="text-3xl font-mono font-bold text-white">{formatTime(elapsedTime)}s</div>
            </div>
            <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Infected</div>
                <div className="text-3xl font-mono font-bold text-violet-400">
                    {totalInfected} <span className="text-lg text-gray-600">/ {totalBoxes}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-3xl mx-auto pointer-events-none mb-4">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-white/10">
            <div 
                className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
      </div>

      {/* Result Modal */}
      {status === 'FINISHED' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 pointer-events-auto animate-fade-in">
          <div className="bg-gray-900 border border-violet-500/50 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-3xl font-bold text-white mb-2">Outbreak Complete</h2>
            <p className="text-gray-400 mb-6">All populations have been infected.</p>
            
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
                <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Total Time</div>
                <div className="text-4xl font-mono font-bold text-violet-400">{formatTime(elapsedTime)}s</div>
            </div>

            <button
              onClick={onRestart}
              className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105"
            >
              SIMULATE AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
