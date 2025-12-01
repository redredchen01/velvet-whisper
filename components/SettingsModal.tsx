
import React, { useState, useEffect } from 'react';
import { Settings, X, Save, Server, Key, Cpu } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<'gemini' | 'local'>('gemini');

  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleChange = (field: keyof AppSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-slate-800/50 p-6 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="text-amber-500" />
            設定
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'gemini' 
                ? 'bg-slate-800 text-amber-500 border-b-2 border-amber-500' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Key size={16} /> Google Gemini
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'local' 
                ? 'bg-slate-800 text-amber-500 border-b-2 border-amber-500' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Server size={16} /> Local Model
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={formData.geminiApiKey}
                  onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                  placeholder="輸入您的 Google Gemini API Key"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  我們會優先使用您輸入的 API Key。若未輸入，則嘗試使用系統預設環境變數。
                  <br />您的 Key 僅儲存於瀏覽器 LocalStorage，不會上傳至其他伺服器。
                </p>
              </div>
              
              <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-4">
                <h4 className="text-amber-500 text-sm font-bold mb-1">提示</h4>
                <p className="text-slate-400 text-xs">
                  Gemini 模型負責所有的功能：文字改寫、封面生成 (Imagen) 與語音合成 (TTS)。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'local' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-slate-300">
                  啟用本地模型 (僅文字生成)
                </label>
                <button
                  onClick={() => handleChange('useLocalModel', !formData.useLocalModel)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    formData.useLocalModel ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    formData.useLocalModel ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className={`space-y-4 transition-opacity ${formData.useLocalModel ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={formData.localModelUrl}
                    onChange={(e) => handleChange('localModelUrl', e.target.value)}
                    placeholder="e.g., http://localhost:11434/v1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={formData.localModelName}
                    onChange={(e) => handleChange('localModelName', e.target.value)}
                    placeholder="e.g., llama3"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 flex gap-3">
                <Cpu className="text-blue-400 flex-shrink-0" size={20} />
                <div className="space-y-1">
                  <h4 className="text-blue-400 text-sm font-bold">混合模式運作中</h4>
                  <p className="text-slate-400 text-xs">
                    啟用後，<strong>文字改寫</strong>將由本地模型執行。但<strong>圖片生成</strong>與<strong>語音合成</strong>仍需使用 Gemini API (請確保在 Gemini 分頁已設定 Key)。
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg"
          >
            <Save size={18} />
            儲存設定
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
