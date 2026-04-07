import { useTranslation } from '../i18n/LangContext';

interface YearSliderProps {
  years: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const YearSlider = ({ years, selectedYear, onYearChange }: YearSliderProps) => {
  const { t } = useTranslation();

  return (
    <div className="year-slider">
      <div className="slider-label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{t('slider.year')}</span>
      </div>

      <div className="slider-container">
        <input
          type="range"
          min={0}
          max={years.length - 1}
          value={years.indexOf(selectedYear)}
          onChange={(e) => onYearChange(years[parseInt(e.target.value)])}
          className="slider"
        />
        <div className="year-markers">
          {years.map((year) => (
            <button
              key={year}
              className={`year-marker ${year === selectedYear ? 'active' : ''}`}
              onClick={() => onYearChange(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="current-year">
        <span className="year-value">{selectedYear}</span>
      </div>
    </div>
  );
};

export default YearSlider;
