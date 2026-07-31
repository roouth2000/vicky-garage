import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface Option {
  label: string;
  value: string;
  sublabel?: string;
  meta?: any;
}

interface AutocompleteSelectProps {
  value: string;
  onChange: (val: string, selectedOption?: Option) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  allowCustom?: boolean;
  disabled?: boolean;
}

export const AutocompleteSelect: React.FC<AutocompleteSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Search...',
  className = '',
  allowCustom = true,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Filter options based on input value
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes((inputValue || '').toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes((inputValue || '').toLowerCase()))
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setIsOpen(true);
    setHighlightedIndex(0);
    if (allowCustom) {
      onChange(val);
    }
  };

  const handleSelectOption = (option: Option) => {
    setInputValue(option.label);
    onChange(option.label, option);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      else setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (isOpen && filteredOptions.length > 0 && highlightedIndex < filteredOptions.length) {
        e.preventDefault();
        handleSelectOption(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-3 py-1.5 pr-8 bg-white border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed uppercase font-medium"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Dropdown Options */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto left-0">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <div
                key={`${opt.value}-${index}`}
                onClick={() => handleSelectOption(opt)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3 py-2 text-sm cursor-pointer border-b border-slate-100 last:border-none flex items-center justify-between transition-colors ${index === highlightedIndex ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                <div>
                  <div className="font-medium text-slate-900 uppercase">{opt.label}</div>
                  {opt.sublabel && <div className="text-xs text-slate-500">{opt.sublabel}</div>}
                </div>
                {opt.meta && (
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    {opt.meta}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-xs text-slate-500 text-center">
              {allowCustom ? (
                <div className="flex items-center justify-center space-x-1 text-indigo-600 font-medium">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Will create custom entry "{inputValue}"</span>
                </div>
              ) : (
                'No matching records found'
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
