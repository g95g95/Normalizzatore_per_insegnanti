import { useState } from 'react';
import { LanguageProvider, useLanguage } from './i18n';
import Calculator from './components/Calculator';
import TheoryTab from './components/TheoryTab';
import AboutTab from './components/AboutTab';
import LanguageSwitcher from './components/LanguageSwitcher';
import ChatBot from './components/ChatBot';

type Tab = 'calculator' | 'theory' | 'about';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
              {t('appName')}
            </h1>
            <div className="flex items-center gap-4">
              <nav className="flex">
                <button
                  className={`tab ${activeTab === 'calculator' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('calculator')}
                >
                  {t('calculator')}
                </button>
                <button
                  className={`tab ${activeTab === 'theory' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('theory')}
                >
                  {t('theory')}
                </button>
                <button
                  className={`tab ${activeTab === 'about' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  {t('about')}
                </button>
              </nav>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'theory' && <TheoryTab />}
        {activeTab === 'about' && <AboutTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          {t('footerText')}
        </div>
      </footer>

      {/* ChatBot */}
      <ChatBot />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
