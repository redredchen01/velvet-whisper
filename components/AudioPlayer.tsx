import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, SkipBack } from 'lucide-react';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | undefined;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (audioBuffer) {
      setDuration(audioBuffer.duration);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      pauseTimeRef.current = 0;
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
      }
    }
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [audioBuffer]);

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
  };

  const playAudio = async () => {
    if (!audioBuffer) return;
    initAudioContext();
    const ctx = audioContextRef.current!;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    sourceNodeRef.current = ctx.createBufferSource();
    sourceNodeRef.current.buffer = audioBuffer;
    sourceNodeRef.current.connect(ctx.destination);
    
    // Start from where we paused
    startTimeRef.current = ctx.currentTime - pauseTimeRef.current;
    sourceNodeRef.current.start(0, pauseTimeRef.current);
    
    setIsPlaying(true);

    sourceNodeRef.current.onended = () => {
      // Approximate check for natural end vs stop()
      if (ctx.currentTime - startTimeRef.current >= audioBuffer.duration - 0.2) {
        setIsPlaying(false);
        pauseTimeRef.current = 0;
        setProgress(0);
        setCurrentTime(0);
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const updateProgress = () => {
      if (!ctx) return;
      const current = ctx.currentTime - startTimeRef.current;
      setCurrentTime(Math.min(current, audioBuffer.duration));
      const percent = Math.min((current / audioBuffer.duration) * 100, 100);
      setProgress(percent);
      
      if (current < audioBuffer.duration && isPlaying) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    
    updateProgress();
  };

  const pauseAudio = () => {
    if (audioContextRef.current && sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleRestart = () => {
    pauseAudio();
    pauseTimeRef.current = 0;
    setProgress(0);
    setCurrentTime(0);
    playAudio();
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioBuffer) return null;

  return (
    <div className="w-full px-4 py-3 flex items-center gap-4">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all transform hover:scale-105 shadow-lg shadow-amber-900/20 active:scale-95"
      >
        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
      </button>

      {/* Track Info & Progress */}
      <div className="flex-grow flex flex-col gap-1.5 min-w-0">
        <div className="flex justify-between items-center text-xs font-medium tracking-wide">
          <span className="text-amber-500 uppercase flex items-center gap-1.5">
            {isPlaying && (
              <span className="flex gap-0.5 h-3 items-end">
                <span className="w-0.5 bg-amber-500 h-full animate-pulse"></span>
                <span className="w-0.5 bg-amber-500 h-2/3 animate-pulse delay-75"></span>
                <span className="w-0.5 bg-amber-500 h-full animate-pulse delay-150"></span>
              </span>
            )}
            Story Narration
          </span>
          <span className="text-slate-400 font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <div className="relative w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(245,158,11,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Volume / Restart */}
      <div className="flex items-center gap-2 text-slate-400">
        <button onClick={handleRestart} className="p-2 hover:text-slate-200 transition-colors" title="Restart">
          <SkipBack size={18} />
        </button>
        <Volume2 size={18} className="hidden sm:block" />
      </div>
    </div>
  );
};

export default AudioPlayer;