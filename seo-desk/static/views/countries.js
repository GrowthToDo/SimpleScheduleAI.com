// Country names for the three-letter codes Search Console sends. Shared by Queries and Performance.

export const COUNTRY = {
  usa: 'United States',
  can: 'Canada',
  gbr: 'United Kingdom',
  ind: 'India',
  aus: 'Australia',
  phl: 'Philippines',
  deu: 'Germany',
  bra: 'Brazil',
  esp: 'Spain',
  fra: 'France',
  sau: 'Saudi Arabia',
  dnk: 'Denmark',
  nzl: 'New Zealand',
  irl: 'Ireland',
  zaf: 'South Africa',
  pak: 'Pakistan',
  nga: 'Nigeria',
  mex: 'Mexico',
  are: 'United Arab Emirates',
  sgp: 'Singapore',
  nld: 'Netherlands',
  ita: 'Italy',
  jpn: 'Japan',
};

export const countryName = (code) => COUNTRY[code] ?? String(code ?? '').toUpperCase();
