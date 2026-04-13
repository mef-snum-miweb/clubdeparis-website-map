import type { FilterMode } from '../types';
import { useTranslation } from '../i18n/LangContext';

interface FilterBarProps {
  filterMode: FilterMode;
  onFilterModeChange: (mode: FilterMode) => void;
}

const FilterBar = ({ filterMode, onFilterModeChange }: FilterBarProps) => {
  const { t } = useTranslation();

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">{t('filter.show')}</span>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => onFilterModeChange('all')}
          >
            {t('filter.all')}
          </button>
          <button
            className={`filter-btn filter-btn-creditor ${filterMode === 'créditeur' ? 'active' : ''}`}
            onClick={() => onFilterModeChange('créditeur')}
          >
            {t('filter.creditors')}
          </button>
          <button
            className={`filter-btn filter-btn-debtor ${filterMode === 'débiteur' ? 'active' : ''}`}
            onClick={() => onFilterModeChange('débiteur')}
          >
            {t('filter.debtors')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
