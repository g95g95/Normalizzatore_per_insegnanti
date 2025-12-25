import { useLanguage } from '../i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-700/50 rounded-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'en'
            ? 'bg-primary-500 text-white'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('it')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          language === 'it'
            ? 'bg-primary-500 text-white'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        IT
      </button>
    </div>
  );
}
