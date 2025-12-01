
import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Feather, RefreshCw, Mic2, Palette, Users, Heart, Settings as SettingsIcon, Flame, Wine } from 'lucide-react';
import { generateStoryText, generateStoryImage, generateStoryAudio } from './services/geminiService';
import AudioPlayer from './components/AudioPlayer';
import SettingsModal from './components/SettingsModal';
import { StoryState, NARRATORS, NarratorProfile, IDENTITIES, IdentityProfile, EMOTIONS, EmotionalTone, AppSettings } from './types';

const App = () => {
  const [inputText, setInputText] = useState('');
  const [storyState, setStoryState] = useState<StoryState>({
    status: 'idle',
    originalInput: '',
    generatedTitle: '',
    generatedStory: '',
  });
  
  // Selections
  const [selectedNarrator, setSelectedNarrator] = useState<NarratorProfile>(NARRATORS[0]);
  const [selectedIdentity, setSelectedIdentity] = useState<IdentityProfile>(IDENTITIES[0]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionalTone>(EMOTIONS[1]); 

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    geminiApiKey: '',
    useLocalModel: false,
    localModelUrl: 'http://localhost:11434/v1',
    localModelName: 'llama3'
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('nightTalesSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('nightTalesSettings', JSON.stringify(newSettings));
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setStoryState(prev => ({
      ...prev,
      status: 'generating_text',
      originalInput: inputText,
      error: undefined,
    }));

    try {
      // Step 1: Generate Text with Narrator Persona AND Identity AND Emotion
      const textData = await generateStoryText(inputText, selectedNarrator, selectedIdentity, selectedEmotion, settings);
      
      setStoryState(prev => ({
        ...prev,
        status: 'generating_media',
        generatedTitle: textData.title,
        generatedStory: textData.story,
      }));

      // Step 2: Generate Media in Parallel (Image & Audio)
      const [imageUrl, audioBuffer] = await Promise.all([
        generateStoryImage(textData.story, selectedNarrator, settings),
        generateStoryAudio(textData.story, selectedNarrator, selectedIdentity, settings)
      ]);

      setStoryState(prev => ({
        ...prev,
        status: 'complete',
        imageUrl,
        audioBuffer,
      }));

    } catch (error) {
      console.error("Generation failed:", error);
      setStoryState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      }));
    }
  };

  const handleReset = () => {
    setStoryState({
      status: 'idle',
      originalInput: '',
      generatedTitle: '',
      generatedStory: '',
    });
  };

  const isProcessing = storyState.status === 'generating_text' || storyState.status === 'generating_media';

  return (
    <div className="min-h-screen bg-[#0f172a] text-rose-50 selection:bg-rose-900 selection:text-white flex flex-col items-center py-6 px-4 sm:px-6 font-serif">
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Header */}
      <header className={`w-full max-w-4xl flex justify-between items-center mb-8 mt-4 ${storyState.status === 'complete' ? 'hidden sm:flex' : ''}`}>
        <div className="flex items-center gap-3 text-rose-500">
          <Wine className="w-8 h-8 sm:w-10 sm:h-10" />
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-rose-100 font-serif">Velvet Whispers <span className="text-base sm:text-lg font-normal opacity-70 ml-2">深夜私語</span></h1>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="設定"
        >
          <SettingsIcon size={24} />
        </button>
      </header>
      
      {storyState.status === 'idle' && (
         <p className="text-rose-200/60 text-lg italic mb-8 text-center max-w-2xl font-light">
            "專為成人文學打造的沉浸式體驗。從純愛到禁忌，將文字轉化為私密的感官盛宴。"
         </p>
      )}

      {/* Main Content Area */}
      <main className="w-full max-w-4xl relative">
        
        {/* Input Form & Configuration */}
        {storyState.status === 'idle' && (
          <div className="space-y-6">
            
            {/* Input Section */}
            <div className="bg-slate-900/60 border border-rose-900/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
              <label htmlFor="story-input" className="block text-sm font-semibold text-rose-400 mb-3 uppercase tracking-widest flex items-center gap-2">
                <Feather size={16} /> 第一步：輸入原稿素材
              </label>
              <textarea
                id="story-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在此貼上您的小說片段、腦洞或對話..."
                className="w-full h-40 bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-lg text-rose-50 placeholder-slate-600 focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none resize-none transition-all leading-relaxed"
              />
            </div>

            {/* Configuration Container */}
            <div className="grid grid-cols-1 gap-6">
              
              {/* Identity & Style Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Narrator Identity Selection */}
                <div className="bg-slate-900/60 border border-rose-900/30 backdrop-blur-md rounded-2xl p-6 shadow-2xl h-full">
                   <label className="block text-sm font-semibold text-rose-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Users size={16} /> 第二步：視角設定 (POV)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {IDENTITIES.map((identity) => {
                      const isSelected = selectedIdentity.id === identity.id;
                      return (
                        <button
                          key={identity.id}
                          onClick={() => setSelectedIdentity(identity)}
                          className={`p-3 rounded-lg border text-left transition-all flex flex-col gap-2 ${
                            isSelected
                              ? 'border-rose-500 bg-rose-900/30 text-rose-100'
                              : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 text-slate-400'
                          }`}
                        >
                          <span className="text-2xl">{identity.icon}</span>
                          <div>
                            <div className="font-bold text-sm">{identity.name}</div>
                            <div className="text-[10px] opacity-70 leading-tight mt-1 hidden sm:block">{identity.description}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Narrator Style Selection */}
                <div className="bg-slate-900/60 border border-rose-900/30 backdrop-blur-md rounded-2xl p-6 shadow-2xl h-full">
                  <label className="block text-sm font-semibold text-rose-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                    <Mic2 size={16} /> 第三步：敘事風格 (Tone)
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {NARRATORS.map((narrator) => {
                      const isSelected = selectedNarrator.id === narrator.id;
                      return (
                        <button
                          key={narrator.id}
                          onClick={() => setSelectedNarrator(narrator)}
                          className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                            isSelected 
                              ? 'border-rose-500 bg-rose-900/30 text-rose-100' 
                              : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                             <span className={`text-lg ${narrator.iconColor}`}>●</span>
                             <span className="font-bold text-sm">{narrator.name}</span>
                          </div>
                          <p className="text-[10px] opacity-70 leading-tight">
                            {narrator.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Emotional Tone Selection (New) */}
              <div className="bg-slate-900/60 border border-rose-900/30 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl">
                <label className="block text-sm font-semibold text-rose-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <Flame size={16} /> 第四步：慾望光譜 (Spectrum)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {EMOTIONS.map((emotion) => {
                    const isSelected = selectedEmotion.id === emotion.id;
                    return (
                      <button
                        key={emotion.id}
                        onClick={() => setSelectedEmotion(emotion)}
                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center gap-2 h-full justify-start ${
                          isSelected
                            ? `${emotion.colorBorder} ${emotion.colorBg} text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] transform scale-105`
                            : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 text-slate-400 hover:text-rose-100'
                        }`}
                      >
                        <span className="text-3xl filter drop-shadow-md">{emotion.icon}</span>
                        <div>
                          <div className="font-bold text-sm leading-tight mb-1">{emotion.name}</div>
                          {isSelected && (
                             <div className="text-[10px] opacity-80 leading-tight animate-fade-in">{emotion.description}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Generate Action */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleGenerate}
                disabled={!inputText.trim()}
                className="w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-3 bg-gradient-to-r from-rose-800 to-pink-700 hover:from-rose-700 hover:to-pink-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold py-4 px-10 rounded-full transition-all shadow-lg hover:shadow-rose-900/50 transform active:scale-95 text-lg border border-rose-500/30"
              >
                <Sparkles className="w-5 h-5" />
                <span>開始演繹</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-slate-800 border-t-rose-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-4xl animate-pulse`}>
                   {selectedEmotion.icon}
                </span>
              </div>
            </div>
            <h3 className="text-2xl text-rose-200 font-bold mb-2 font-serif">
              正在點燃 {selectedEmotion.name} 的火花...
            </h3>
            <p className="text-rose-400/70 text-sm tracking-wide">
              {selectedIdentity.name} × {selectedNarrator.name}
            </p>
          </div>
        )}

        {/* Error State */}
        {storyState.status === 'error' && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-8 text-center animate-fade-in my-10">
            <p className="text-red-400 mb-6 text-lg">{storyState.error}</p>
            <button
              onClick={() => setStoryState(prev => ({ ...prev, status: 'idle', error: undefined }))}
              className="px-6 py-2 bg-red-900/50 hover:bg-red-900/70 text-red-200 rounded-lg transition-colors"
            >
              重試
            </button>
             <button
              onClick={() => setIsSettingsOpen(true)}
              className="ml-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
            >
              檢查設定
            </button>
          </div>
        )}

        {/* Result Display */}
        {storyState.status === 'complete' && (
          <div className="animate-fade-in-up pb-20">
            
            {/* Navigation */}
            <div className="flex justify-between items-center mb-6">
               <div className="flex flex-wrap items-center gap-2 text-slate-400">
                 <span className="text-xs uppercase tracking-widest border border-slate-700 px-2 py-1 rounded flex items-center gap-1">
                   {selectedIdentity.icon} {selectedIdentity.name}
                 </span>
                 <span className="text-xs uppercase tracking-widest border border-slate-700 px-2 py-1 rounded">
                   {selectedNarrator.name}
                 </span>
                 <span className={`text-xs uppercase tracking-widest border ${selectedEmotion.colorBorder} text-rose-100 px-2 py-1 rounded flex items-center gap-1`}>
                   {selectedEmotion.icon} {selectedEmotion.name}
                 </span>
               </div>
               <div className="flex gap-3">
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-sm shadow-lg"
                  >
                    <SettingsIcon size={16} />
                  </button>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-sm shadow-lg"
                  >
                    <RefreshCw size={16} />
                    <span>新的章節</span>
                  </button>
               </div>
            </div>

            {/* Sticky Audio Player */}
            <div className="sticky top-6 z-30 mb-8 shadow-2xl shadow-black/50 rounded-xl overflow-hidden transition-all duration-500">
               <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border border-rose-500/20 rounded-xl"></div>
               <div className="relative p-1">
                 <AudioPlayer audioBuffer={storyState.audioBuffer} />
               </div>
            </div>

            <div className={`bg-slate-900/40 border ${selectedEmotion.colorBorder} border-opacity-30 rounded-2xl overflow-hidden shadow-2xl transition-all`}>
              
              {/* Visual Header */}
              {storyState.imageUrl && (
                <div className="relative w-full aspect-video sm:aspect-[21/9] overflow-hidden group">
                   <div className="absolute inset-0 bg-slate-900 z-0"></div>
                   <img 
                    src={storyState.imageUrl} 
                    alt="Story Art" 
                    className="w-full h-full object-cover opacity-80 transition-transform duration-[40s] ease-in-out transform scale-100 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-center">
                    <h2 className="text-3xl sm:text-5xl font-bold font-serif text-rose-50 mb-4 leading-tight drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                      {storyState.generatedTitle}
                    </h2>
                  </div>
                </div>
              )}

              {/* Text Content */}
              <div className="p-8 sm:p-12 relative max-w-2xl mx-auto">
                <div className={`prose prose-invert prose-lg sm:prose-xl max-w-none font-serif leading-loose text-rose-100/90 selection:bg-rose-900 selection:text-white`}>
                  {storyState.generatedStory.split('\n').map((paragraph, idx) => (
                    paragraph.trim() ? (
                      <p key={idx} className="mb-8 text-justify opacity-90 hover:opacity-100 transition-opacity">
                        {paragraph}
                      </p>
                    ) : null
                  ))}
                </div>

                {/* Footer divider */}
                <div className="flex items-center justify-center mt-16 mb-8 opacity-30">
                  <div className="h-px w-full bg-rose-500"></div>
                  <div className="mx-4 text-rose-500/70 text-sm whitespace-nowrap">Velvet Whispers</div>
                  <div className="h-px w-full bg-rose-500"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
