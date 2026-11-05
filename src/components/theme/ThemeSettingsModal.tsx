import React from 'react';
import { useTheme, ThemeId, FontSize } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Palette,
  Eye,
  Sun,
  Moon,
  Check,
  X,
  Type,
  ShieldCheck,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, setTheme, fontSize, setFontSize, themesList } = useTheme();
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 flex flex-col space-y-5 max-h-[92vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
              <Palette className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                {language === 'fr'
                  ? 'Thèmes visuels, Confort des yeux & Contraste'
                  : language === 'en'
                  ? 'Design Themes, Eye-Care & Contrast'
                  : 'Design-Auswahl, Augenschutz & Kontrast'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'fr'
                  ? 'Personnalisez l’apparence selon vos préférences visuelles et votre confort de travail'
                  : language === 'en'
                  ? 'Tailor the application appearance for your visual comfort and aesthetic preference'
                  : 'Passen Sie das Erscheinungsbild an Ihre Augen und Arbeitsumgebung an'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Cards Grid */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            {language === 'fr'
              ? 'Sélectionnez un style visuel :'
              : language === 'en'
              ? 'Select Visual Theme Preset:'
              : 'Wählen Sie Ihr bevorzugtes Design-Thema:'}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {themesList.map((t) => {
              const isSelected = theme === t.id;
              const name = language === 'fr' ? t.nameFr : language === 'en' ? t.nameEn : t.name;
              const desc = language === 'fr' ? t.descriptionFr : language === 'en' ? t.descriptionEn : t.description;

              return (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Color Swatch & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-full border shadow-xs"
                          style={{ backgroundColor: t.primaryColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border shadow-xs"
                          style={{ backgroundColor: t.accentColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                          style={{ backgroundColor: t.bgColor }}
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        {t.eyeCareBadge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            {t.eyeCareBadge}
                          </span>
                        )}
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-900 text-xs">{name}</div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Micro Preview Bar */}
                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{t.isDark ? 'Dunkelmodus' : 'Heller Modus'}</span>
                    <span className="font-mono text-[9px] uppercase">{t.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Font Size & Accessibility Options */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {language === 'fr'
                  ? 'Taille du texte & Lisibilité'
                  : language === 'en'
                  ? 'Text Size & Readability'
                  : 'Schriftgröße & Lesekomfort'}
              </span>
            </div>

            <div className="inline-flex rounded-lg bg-slate-100 p-1 border text-xs">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  fontSize === 'normal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'fr' ? 'Standard (100%)' : language === 'en' ? 'Default (100%)' : 'Standard (100%)'}
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  fontSize === 'large'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {language === 'fr' ? 'Confort / Grand (+15%)' : language === 'en' ? 'Large / Comfort (+15%)' : 'Groß / Komfort (+15%)'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t pt-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTheme('emerald-classic');
              setFontSize('normal');
            }}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            {language === 'fr' ? 'Réinitialiser au standard' : language === 'en' ? 'Reset to Default' : 'Auf Standard zurücksetzen'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-colors"
          >
            {language === 'fr' ? 'Terminé' : language === 'en' ? 'Done' : 'Fertig & Anwenden'}
          </button>
        </div>
      </div>
    </div>
  );
};
