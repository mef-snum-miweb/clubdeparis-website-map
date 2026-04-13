import { useState, useEffect } from 'react';
import WorldMap from './components/WorldMap';
import CountryPanel from './components/CountryPanel';
import YearSlider from './components/YearSlider';
import KPIBar from './components/KPIBar';
import CountrySearch from './components/CountrySearch';
import FilterBar from './components/FilterBar';
import { LangProvider, useTranslation } from './i18n/LangContext';
import type { AllData, CountryData, FilterMode } from './types';
import './App.css';

const YEARS = Array.from({ length: 15 }, (_, i) => 2010 + i);

function AppInner() {
  const { t } = useTranslation();
  const [data, setData] = useState<AllData | null>(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCountryData, setSelectedCountryData] = useState<CountryData | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data.json')
      .then((res) => {
        if (!res.ok) throw new Error(t('error.load'));
        return res.json();
      })
      .then((json: AllData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (data && selectedCountry) {
      const yearData = data[selectedYear.toString()];
      const countryData = yearData?.countries[selectedCountry];
      if (countryData) {
        setSelectedCountryData(countryData);
      }
    }
  }, [selectedYear, data, selectedCountry]);

  const handleCountrySelect = (isoCode: string | null, countryData: CountryData | null) => {
    setSelectedCountry(isoCode);
    setSelectedCountryData(countryData);
  };

  const handleClosePanel = () => {
    setSelectedCountry(null);
    setSelectedCountryData(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="error">
        <p>Erreur: {error || t('error.unavailable')}</p>
      </div>
    );
  }

  const yearData = data[selectedYear.toString()];

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>{t('header.title')}</h1>
          <p className="subtitle">{t('header.subtitle')}</p>
        </div>
      </header>

      <main className="main">
        <KPIBar totals={yearData.totals} year={selectedYear} filterMode={filterMode} />

        <YearSlider
          years={YEARS}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
        <CountrySearch
          data={yearData}
          filterMode={filterMode}
          onSelect={handleCountrySelect}
        />
        <FilterBar
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
        />
        <WorldMap
          data={yearData}
          selectedCountry={selectedCountry}
          filterMode={filterMode}
          onCountrySelect={handleCountrySelect}
        />
        <CountryPanel
          countryCode={selectedCountry}
          countryData={selectedCountryData}
          year={selectedYear}
          onClose={handleClosePanel}
        />
      </main>

      <footer className="footer">
        <p>{t('footer')}</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}

export default App;
