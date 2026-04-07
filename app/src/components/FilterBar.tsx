import type { FilterMode, DebtFilter } from '../types';
import { useTranslation } from '../i18n/LangContext';

interface FilterBarProps {
  filterMode: FilterMode;
  debtFilter: DebtFilter;
  onFilterModeChange: (mode: FilterMode) => void;
  onDebtFilterChange: (filter: DebtFilter) => void;
}

const FilterBar = ({
  filterMode,
  debtFilter,
  onFilterModeChange,
  onDebtFilterChange,
}: FilterBarProps) => {
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
            className={`filter-btn filter-btn-debtor ${filterMode === 'débiteur' ? 'active' : ''}`}
            onClick={() => onFilterModeChange('débiteur')}
          >
            {t('filter.debtors')}
          </button>
          <button
            className={`filter-btn filter-btn-creditor ${filterMode === 'créditeur' ? 'active' : ''}`}
            onClick={() => onFilterModeChange('créditeur')}
          >
            {t('filter.creditors')}
          </button>
        </div>
      </div>

      {filterMode === 'débiteur' && (
        <div className="filter-group">
          <span className="filter-label">{t('filter.type')}</span>
          <div className="filter-buttons">
            <button
              className={`filter-btn filter-btn-small ${debtFilter === 'apd' ? 'active' : ''}`}
              onClick={() => onDebtFilterChange('apd')}
            >
              {t('filter.apd')}
            </button>
            <button
              className={`filter-btn filter-btn-small ${debtFilter === 'napd' ? 'active' : ''}`}
              onClick={() => onDebtFilterChange('napd')}
            >
              {t('filter.napd')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
