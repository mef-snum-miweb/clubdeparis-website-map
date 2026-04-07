import { useState, useRef, useEffect } from 'react';
import type { YearData, CountryData, FilterMode } from '../types';
import { useTranslation } from '../i18n/LangContext';

interface CountrySearchProps {
  data: YearData;
  filterMode: FilterMode;
  onSelect: (iso: string, countryData: CountryData) => void;
}

const CountrySearch = ({ data, filterMode, onSelect }: CountrySearchProps) => {
  const { t, getCountryList, getCountryName } = useTranslation();
  const countryList = getCountryList();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof countryList>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchesFilter = (iso: string): boolean => {
    const country = data.countries[iso];
    if (!country) return false;
    if (filterMode === 'débiteur') return !!(country.debtor && country.debtor.total > 0);
    if (filterMode === 'créditeur') return !!country.creditor;
    return true;
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      const filtered = countryList
        .filter((c) =>
          c.name.toLowerCase().includes(value.toLowerCase()) &&
          data.countries[c.iso] &&
          matchesFilter(c.iso)
        )
        .slice(0, 6);
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (country: typeof countryList[0]) => {
    const countryData = data.countries[country.iso];
    if (countryData) {
      onSelect(country.iso, { ...countryData, country: getCountryName(country.iso, country.name) });
      setQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div className="country-search" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder={t('search.placeholder')}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query.length > 0 && setIsOpen(true)}
        />
      </div>
      {isOpen && suggestions.length > 0 && (
        <ul className="search-suggestions">
          {suggestions.map((country) => (
            <li
              key={country.iso}
              className="search-suggestion"
              onClick={() => handleSelect(country)}
            >
              {country.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CountrySearch;
