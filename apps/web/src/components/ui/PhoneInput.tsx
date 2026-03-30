import { useState } from 'react';

export const PHONE_PREFIXES = [
  { country: 'El Salvador', code: '+503', flag: '🇸🇻' },
  { country: 'México', code: '+52', flag: '🇲🇽' },
  { country: 'Colombia', code: '+57', flag: '🇨🇴' },
  { country: 'Argentina', code: '+54', flag: '🇦🇷' },
  { country: 'Perú', code: '+51', flag: '🇵🇪' },
  { country: 'Chile', code: '+56', flag: '🇨🇱' },
  { country: 'Brasil', code: '+55', flag: '🇧🇷' },
  { country: 'España', code: '+34', flag: '🇪🇸' },
  { country: 'USA / Canadá', code: '+1', flag: '🇺🇸' },
  { country: 'Guatemala', code: '+502', flag: '🇬🇹' },
  { country: 'Honduras', code: '+504', flag: '🇭🇳' },
  { country: 'Nicaragua', code: '+505', flag: '🇳🇮' },
  { country: 'Costa Rica', code: '+506', flag: '🇨🇷' },
  { country: 'Panamá', code: '+507', flag: '🇵🇦' },
  { country: 'Ecuador', code: '+593', flag: '🇪🇨' },
  { country: 'Bolivia', code: '+591', flag: '🇧🇴' },
  { country: 'Venezuela', code: '+58', flag: '🇻🇪' },
  { country: 'Paraguay', code: '+595', flag: '🇵🇾' },
  { country: 'Uruguay', code: '+598', flag: '🇺🇾' },
  { country: 'Rep. Dominicana', code: '+1809', flag: '🇩🇴' },
] as const;

type PhonePrefix = (typeof PHONE_PREFIXES)[number]['code'];

function splitPhone(value: string): { prefix: PhonePrefix; number: string } {
  for (const p of PHONE_PREFIXES) {
    if (value.startsWith(p.code + ' ') || value === p.code) {
      return { prefix: p.code, number: value.slice(p.code.length).trim() };
    }
  }
  return { prefix: '+503', number: value.replace(/^\+\d+\s?/, '') };
}

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  defaultPrefix?: PhonePrefix;
}

export function PhoneInput({
  value = '',
  onChange,
  placeholder = '0000 0000',
  inputClassName = '',
  autoFocus,
  defaultPrefix = '+503',
}: PhoneInputProps) {
  const parsed = splitPhone(value);
  const [prefix, setPrefix] = useState<PhonePrefix>(
    (parsed.number || value.startsWith('+')) ? parsed.prefix : defaultPrefix,
  );
  const [number, setNumber] = useState(parsed.number);

  const handlePrefixChange = (newPrefix: PhonePrefix) => {
    setPrefix(newPrefix);
    onChange(number ? `${newPrefix} ${number}` : '');
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = e.target.value;
    setNumber(n);
    onChange(n ? `${prefix} ${n}` : '');
  };

  const selectClass =
    'shrink-0 px-2 py-3 bg-gray-50 dark:bg-slate-800/60 border border-r-0 border-gray-200 dark:border-slate-700 rounded-l-xl text-sm font-medium text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio transition-all cursor-pointer appearance-none';

  return (
    <div className="flex">
      <select
        value={prefix}
        onChange={(e) => handlePrefixChange(e.target.value as PhonePrefix)}
        className={selectClass}
        title="Código de país"
      >
        {PHONE_PREFIXES.map((p) => (
          <option key={p.code} value={p.code}>
            {p.flag} {p.code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={number}
        onChange={handleNumberChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`flex-1 min-w-0 px-4 py-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-r-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio transition-all ${inputClassName}`}
      />
    </div>
  );
}
