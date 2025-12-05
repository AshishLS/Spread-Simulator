import React, { useState } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const formatTime = (ms: number) => (ms / 1000).toFixed(2);
  const progress = Math.min(100, Math.round((totalInfected / totalBoxes) * 100)) || 0;

  // Inline SVG Icons to avoid external dependencies
  const IconChevronDown = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
  const IconChevronUp = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
  const IconSettings = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
  );

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-4 flex flex-col justify-between z-10">
      
      {/* Top Section: Controls & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start pointer-events-auto gap-2 sm:gap-4">
        
        {/* Collapsible Control Panel */}
        <div className={`bg-black/80 backdrop-blur-md rounded-xl border border-white/10 shadow-xl text-white transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'w-auto' : 'w-full max-w-[280px]'}`}>
          
          {/* Header / Toggle */}
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title="Toggle Settings"
          >
            <div className="flex items-center gap-2">
                 <IconSettings />
                 <h1 className="text-sm font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent uppercase tracking-wider">
                    Settings
                 </h1>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
                {isCollapsed ? <IconChevronDown /> : <IconChevronUp />}
            </button>
          </div>

          {/* Expandable Content */}
          <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}`}>
            <div className="p-3 pt-0 space-y-3 border-t border-white/5 mt-1">
                <p className="text-gray-400 text-[11px] leading-tight pt-2">
                    Start simulation to begin infection. One box starts infected.
                </p>
                
                <div className="space-y-3">
                    {/* Box Count */}
                    <div>
                        <label className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-1 text-gray-500">
                            Count (Max 500)
                        </label>
                        <input
                            type="number"
                            min="2"
                            max="500"
                            value={boxCountInput}
                            disabled={status !== 'IDLE'}
                            onChange={(e) => onBoxCountChange(parseInt(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-sm text-white focus:border-violet-500 focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    {/* Speed */}
                    <div>
                        <label className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-1 text-gray-500">
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
                            className="w-full accent-violet-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="pt-1">
                        {status === 'IDLE' ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onStart(); }}
                                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-1.5 px-4 rounded text-xs sm:text-sm transition-colors shadow-lg shadow-violet-900/20"
                            >
                                START SIMULATION
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRestart(); }}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-1.5 px-4 rounded text-xs sm:text-sm transition-colors border border-white/5"
                            >
                                RESTART
                            </button>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Compact Stats Panel */}
        <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-xl text-white text-right pointer-events-auto min-w-[110px] self-end sm:self-start">
            <div className="mb-2 border-b border-white/10 pb-2">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Time</div>
                <div className="text-lg font-mono font-bold text-white leading-none">{formatTime(elapsedTime)}s</div>
            </div>
            <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">Infected</div>
                <div className="text-lg font-mono font-bold text-violet-400 leading-none">
                    {totalInfected} <span className="text-xs text-gray-600 font-normal">/ {totalBoxes}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Progress Bar (Bottom) */}
      <div className="w-full max-w-2xl mx-auto pointer-events-none mb-4 sm:mb-8 px-2 sm:px-0">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/10 shadow-lg">
            <div 
                className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
      </div>

      {/* Result Modal */}
      {status === 'FINISHED' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 pointer-events-auto animate-fade-in p-4">
          <div className="bg-gray-900 border border-violet-500/50 p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full">
            <h2 className="text-2xl font-bold text-white mb-2">Simulation Ended</h2>
            <p className="text-gray-400 mb-6 text-sm">Full infection reached.</p>
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Time</div>
                <div className="text-3xl font-mono font-bold text-violet-400">{formatTime(elapsedTime)}s</div>
            </div>

            <button
              onClick={onRestart}
              className="w-full bg-white text-black hover:bg-gray-200 font-bold py-2.5 px-6 rounded-lg transition-transform hover:scale-105 text-sm"
            >
              RESET
            </button>
          </div>
        </div>
      )}
    </div>
  );
};