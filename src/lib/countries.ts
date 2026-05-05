export type Country = {
  code: string;
  name: string;
  dialCode: string;
  flag?: string;
};

export const countries: Country[] = [
  { code: "ZM", name: "Zambia", dialCode: "+260", flag: "🇿🇲" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "NG", name: "Nigeria", dialCode: "+234", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", dialCode: "+233", flag: "🇬🇭" },
  { code: "TZ", name: "Tanzania", dialCode: "+255", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", dialCode: "+256", flag: "🇺🇬" },
  { code: "RW", name: "Rwanda", dialCode: "+250", flag: "🇷🇼" },
];

export function formatCountryOption(c: Country): string {
  return `${c.flag ?? ""} ${c.name} (${c.dialCode})`.trim();
}

export function formatCountrySelectDisplay(c: Country): string {
  return `${c.flag ?? ""} ${c.dialCode}`.trim();
}

export function findCountryByDialCode(dial: string): Country | undefined {
  return countries.find((c) => c.dialCode === dial);
}
