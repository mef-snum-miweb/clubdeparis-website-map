import type { CountryData } from '../types';
import { useTranslation } from '../i18n/LangContext';
import type { TranslationKey } from '../i18n/translations';

interface CountryPanelProps {
  countryCode: string | null;
  countryData: CountryData | null;
  year: number;
  onClose: () => void;
}

const formatCurrency = (value: number) => {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} Md€`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)} M€`;
  if (value === 0) return '0 €';
  return `${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
};

const CountryPanel = ({
  countryCode,
  countryData,
  year,
  onClose,
}: CountryPanelProps) => {
  const { t, lang } = useTranslation();

  const localizedUrl = (url: string) =>
    lang === 'en' ? url.replace('clubdeparis.org/', 'clubdeparis.org/en/') : url;

  const creditorStatusKey = (statut: string | null): TranslationKey => {
    if (statut === 'Ad hoc') return 'panel.status.ad_hoc';
    if (statut === 'Prospectif') return 'panel.status.prospective';
    return 'panel.status.permanent';
  };

  if (!countryCode || !countryData) {
    return (
      <div className="country-panel empty">
        <div className="panel-content">
          <h3>{t('panel.select')}</h3>
          <p>{t('panel.click')}</p>
        </div>
      </div>
    );
  }

  const { debtor, creditor } = countryData;
  const isDebtor = debtor && debtor.total > 0;
  const isCreditor = !!creditor;

  return (
    <div className="country-panel">
      <button className="close-button" onClick={onClose}>
        ×
      </button>

      <div className="panel-header">
        <h2>{countryData.country}</h2>
        <p className="subtitle">
          {isDebtor && isCreditor
            ? t('panel.debtor_creditor')
            : isCreditor
            ? t('panel.creditor')
            : t('panel.debtor')}
        </p>
      </div>

      <div className="panel-content">
        {/* Debtor section */}
        {isDebtor && (
          <div className="panel-section">
            <h4 className="section-title section-title-debtor">{t('panel.section_debtor')}</h4>
            <div className="stat-item apd">
              <div className="stat-info">
                <span className="stat-label">{t('panel.apd')}</span>
                <span className="stat-value">{formatCurrency(debtor.apd)}</span>
                {debtor.total > 0 && (
                  <span className="stat-percent">
                    {((debtor.apd / debtor.total) * 100).toFixed(1)}% {t('panel.pct_total')}
                  </span>
                )}
              </div>
            </div>

            <div className="stat-item napd">
              <div className="stat-info">
                <span className="stat-label">{t('panel.napd')}</span>
                <span className="stat-value">{formatCurrency(debtor.napd)}</span>
                {debtor.total > 0 && (
                  <span className="stat-percent">
                    {((debtor.napd / debtor.total) * 100).toFixed(1)}% {t('panel.pct_total')}
                  </span>
                )}
              </div>
            </div>

            <div className="stat-item total">
              <div className="stat-info">
                <span className="stat-label">{t('panel.total')}</span>
                <span className="stat-value highlight">{formatCurrency(debtor.total)}</span>
              </div>
            </div>

            <div className="panel-bar">
              <div
                className="bar-apd"
                style={{ width: `${debtor.total > 0 ? (debtor.apd / debtor.total) * 100 : 0}%` }}
              />
              <div
                className="bar-napd"
                style={{ width: `${debtor.total > 0 ? (debtor.napd / debtor.total) * 100 : 0}%` }}
              />
            </div>
            <div className="bar-legend">
              <span><span className="dot apd" /> {t('panel.apd_short')}</span>
              <span><span className="dot napd" /> {t('panel.napd_short')}</span>
            </div>

            {debtor.url && (
              <a href={localizedUrl(debtor.url)} target="_blank" rel="noopener noreferrer" className="panel-link panel-link-debtor">
                {t('panel.debtor_link')}
              </a>
            )}
          </div>
        )}

        {/* Creditor section */}
        {isCreditor && (
          <div className="panel-section">
            <h4 className="section-title section-title-creditor">
              {t('panel.creditor_with_status').replace('{0}', t(creditorStatusKey(creditor.statut)))}
            </h4>

            <div className="stat-item creditor-stat">
              <div className="stat-info">
                <span className="stat-label">{t('panel.agreements')}</span>
                <span className="stat-value">{creditor.nbAccords}</span>
              </div>
            </div>

            {creditor.premiereParticipation && (
              <div className="stat-item creditor-stat">
                <div className="stat-info">
                  <span className="stat-label">{t('panel.member_since')}</span>
                  <span className="stat-value">{creditor.premiereParticipation}</span>
                </div>
              </div>
            )}

            {creditor.url && (
              <a href={localizedUrl(creditor.url)} target="_blank" rel="noopener noreferrer" className="panel-link panel-link-creditor">
                {t('panel.creditor_link')}
              </a>
            )}
          </div>
        )}

        <div className="update-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <div>
            <span className="update-label">{t('panel.data_at')}</span>
            <span className="update-date">{t('panel.date')} {year}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryPanel;
