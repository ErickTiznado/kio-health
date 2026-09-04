import { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import {
  format,
  subMonths,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  setYear,
  getYear,
  startOfWeek,
  endOfWeek,
  parse,
  isValid
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';

interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "Seleccionar fecha",
  error,
  className = "",
  disabled = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [mode, setMode] = useState<'day' | 'year'>('day');
  const [position, setPosition] = useState({ top: 0, left: 0, width: 320 });
  const [inputText, setInputText] = useState(() =>
    value ? format(new Date(value), 'dd/MM/yyyy') : ''
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const d = new Date(value);
      setInputText(format(d, 'dd/MM/yyyy'));
      setViewDate(d);
    } else {
      setInputText('');
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);

    let formatted = digits;
    if (digits.length > 4) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    } else if (digits.length > 2) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    }

    setInputText(formatted);

    if (digits.length === 8) {
      const parsed = parse(formatted, 'dd/MM/yyyy', new Date());
      if (isValid(parsed)) {
        onChange(parsed);
        setViewDate(parsed);
      }
    } else if (digits.length === 0) {
      onChange(undefined);
    }
  };

  const handleTextBlur = () => {
    const digits = inputText.replace(/\D/g, '');
    if (digits.length > 0 && digits.length < 8) {
      // Partial input — restore last valid value or clear
      if (value) {
        setInputText(format(new Date(value), 'dd/MM/yyyy'));
      } else {
        setInputText('');
      }
    }
  };

  // Handle positioning
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const updatePosition = () => {
        const rect = containerRef.current!.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY - 28, // -28px offset (20px higher)
          left: rect.left + window.scrollX + 280,
          width: 320 // Fixed width for calendar
        });
      };
      
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen]);

  // Handle outside click
  useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(event: MouseEvent) {
      // Check if click is on the trigger input
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }
      
      // Check if click is inside the portal (we'll attach a ref to the portal content or check class)
      const target = event.target as Element;
      if (target.closest('.datepicker-portal-content')) {
        return;
      }

      setIsOpen(false);
      setMode('day');
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const selectedDate = value ? new Date(value) : undefined;

  const handlePrevMonth = () => setViewDate(subMonths(viewDate, 1));
  const handleNextMonth = () => setViewDate(addMonths(viewDate, 1));
  
  const toggleMode = () => setMode(mode === 'day' ? 'year' : 'day');

  const handleYearSelect = (year: number) => {
    setViewDate(setYear(viewDate, year));
    setMode('day');
  };

  const handleDaySelect = (day: Date) => {
    setInputText(format(day, 'dd/MM/yyyy'));
    onChange(day);
    setIsOpen(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputText('');
    onChange(undefined);
  };

  // Calendar Grid Generation
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); 
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const currentYear = getYear(new Date());
  const years = Array.from({ length: 110 }, (_, i) => currentYear - 100 + i).reverse();

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1"
        >
          {label}
        </label>
      )}
      
      {/* Input Trigger */}
      <div
        className={`
          relative w-full flex items-center
          border-b-2 transition-colors duration-300
          ${disabled ? 'opacity-50' : ''}
          ${isOpen || selectedDate ? 'border-kanji-deep dark:border-kio' : 'border-gray-200 dark:border-slate-700'}
          ${error ? 'border-rose-500 dark:border-rose-500' : ''}
        `}
      >
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-label={isOpen ? 'Cerrar calendario' : 'Abrir calendario'}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          // 44px de área táctil: el icono deja de ser un blanco de 20px.
          className="absolute left-0 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center"
          tabIndex={-1}
        >
          <CalendarIcon
            size={20}
            className={`transition-colors ${isOpen || selectedDate ? 'text-kanji-deep dark:text-kio' : 'text-gray-400 dark:text-slate-600'}`}
          />
        </button>

        <input
          id={inputId}
          type="text"
          value={inputText}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          disabled={disabled}
          placeholder={placeholder || 'dd/mm/aaaa'}
          maxLength={10}
          // El `<label>` de arriba nombra el campo cuando existe; sin él, el
          // placeholder no basta como nombre accesible (desaparece al escribir).
          aria-label={label ? undefined : 'Fecha'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          // Sin `focus:outline-none`: el anillo de foco global de index.css es
          // el único indicador de teclado que tiene este campo.
          className="pl-11 pr-11 w-full bg-transparent py-3 text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
        />

        {selectedDate && !disabled && (
          <button
            type="button"
            onClick={clearDate}
            aria-label="Limpiar fecha"
            className="absolute right-0 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-xs text-rose-500 dark:text-rose-400 font-bold">
          {error}
        </p>
      )}

      {/* Portal Dropdown */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              style={{ 
                position: 'absolute', 
                top: position.top, 
                left: position.left,
                zIndex: 9999 
              }}
              className="datepicker-portal-content w-[320px] bg-surface dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
            >
              {/* Header */}
              <div className="px-2 py-2 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  disabled={mode === 'year'}
                  aria-label="Mes anterior"
                  className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={toggleMode}
                  className="min-h-11 text-sm font-bold text-gray-800 dark:text-white capitalize hover:text-kanji-deep dark:hover:text-kio transition-colors px-3 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                >
                  {format(viewDate, 'MMMM yyyy', { locale: es })}
                </button>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  disabled={mode === 'year'}
                  aria-label="Mes siguiente"
                  className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="p-4">
                {mode === 'day' ? (
                  <>
                    <div className="grid grid-cols-7 mb-2">
                      {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(day => (
                        <div key={day} className="text-center text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day) => {
                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                        const isCurrentMonth = isSameMonth(day, viewDate);
                        const isTodayDate = isToday(day);

                        return (
                          <button
                            key={day.toISOString()}
                            type="button"
                            onClick={() => handleDaySelect(day)}
                            // El punto y el anillo de "hoy" son señales de color y forma;
                            // el nombre accesible lo dice con palabras.
                            aria-label={`${format(day, "d 'de' MMMM 'de' yyyy", { locale: es })}${isTodayDate ? ' (hoy)' : ''}`}
                            aria-current={isTodayDate ? 'date' : undefined}
                            aria-pressed={isSelected}
                            className={`
                              h-9 w-9 rounded-xl flex items-center justify-center text-xs font-medium transition-all duration-200 relative
                              ${!isCurrentMonth ? 'text-gray-500 dark:text-slate-500' : 'text-gray-700 dark:text-slate-300'}
                              ${isSelected
                                ? 'bg-kanji-deep text-white scale-110 font-bold z-10'
                                : 'hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-kanji-deep dark:hover:text-kio'
                              }
                              ${isTodayDate && !isSelected ? 'ring-1 ring-kanji-deep/40 dark:ring-kio/40 text-kanji-deep dark:text-kio font-bold' : ''}
                            `}
                          >
                            {format(day, 'd')}
                            {isTodayDate && !isSelected && (
                              <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-kanji-deep dark:bg-kio" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="h-[280px] overflow-y-auto grid grid-cols-4 gap-2 pr-2 custom-scrollbar">
                    {years.map(year => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        aria-pressed={getYear(viewDate) === year}
                        className={`
                          min-h-11 px-1 rounded-lg text-sm font-medium transition-colors
                          ${getYear(viewDate) === year
                            ? 'bg-kanji-deep text-white font-bold'
                            : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                          }
                        `}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
