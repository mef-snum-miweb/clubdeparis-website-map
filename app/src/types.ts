export interface DebtorData {
  apd: number;
  napd: number;
  total: number;
  url: string | null;
}

export interface CreditorData {
  nbAccords: number;
  statut: string | null;
  premiereParticipation: number | null;
  url: string | null;
}

export interface CountryData {
  country: string;
  debtor?: DebtorData;
  creditor?: CreditorData;
}

export interface YearTotals {
  debtorApd: number;
  debtorNapd: number;
  debtorTotal: number;
  debtorCount: number;
  creditorCount: number;
}

export interface YearData {
  countries: Record<string, CountryData>;
  totals: YearTotals;
}

export interface AllData {
  [year: string]: YearData;
}

export type FilterMode = 'all' | 'débiteur' | 'créditeur';
