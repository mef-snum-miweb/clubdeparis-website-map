import type { YearTotals, FilterMode } from '../types';
import { useTranslation } from '../i18n/LangContext';

interface KPIBarProps {
  totals: YearTotals;
  year: number;
  filterMode: FilterMode;
}

const formatCurrency = (value: number) => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} Md€`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)} M€`;
  return `${value.toLocaleString('fr-FR')} €`;
};

const KPIBar = ({ totals, year, filterMode }: KPIBarProps) => {
  const { t } = useTranslation();
  const kpis = [];

  if (filterMode !== 'créditeur') {
    kpis.push(
      {
        label: t('kpi.apd'),
        value: formatCurrency(totals.debtorApd),
        color: '#f97316',
      },
      {
        label: t('kpi.napd'),
        value: formatCurrency(totals.debtorNapd),
        color: '#3b82f6',
      },
      {
        label: t('kpi.total'),
        value: formatCurrency(totals.debtorTotal),
        color: '#ef4444',
      },
      {
        label: t('kpi.debtors'),
        value: `${totals.debtorCount}`,
        color: '#f97316',
      },
    );
  }

  if (filterMode !== 'débiteur') {
    kpis.push({
      label: t('kpi.creditors'),
      value: `${totals.creditorCount}`,
      color: '#1e40af',
    });
  }

  kpis.push({
    label: t('kpi.year'),
    value: `${year}`,
    color: '#6b7280',
  });

  return (
    <div className="kpi-bar">
      <h3 className="kpi-title">{t('kpi.title')}</h3>
      <div className="kpi-grid" style={{ gridTemplateColumns: `repeat(${kpis.length}, 1fr)` }}>
        {kpis.map((kpi, index) => (
          <div key={index} className="kpi-item">
            <div className="kpi-content">
              <span className="kpi-value" style={{ color: kpi.color }}>
                {kpi.value}
              </span>
              <span className="kpi-label">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KPIBar;
