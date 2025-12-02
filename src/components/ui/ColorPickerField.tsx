import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Input } from "./input";
import { isValidHexColor, normalizeHexColor } from "@/lib/color";

type ColorPickerFieldProps = {
  value: string | null;
  onChange: (hex: string | null) => void;
  label?: string;
  helperText?: string;
  isOptional?: boolean;
  disabled?: boolean;
  onDisabledClick?: () => void;
};

const ColorChip: React.FC<{ color: string | null; disabled?: boolean }> = ({ color, disabled }) => {
  const showSlash = !color;
  return (
    <span
      className={clsx(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-white shadow-sm",
        disabled && "opacity-60",
      )}
      style={color ? { backgroundColor: color } : undefined}
    >
      {showSlash && <span className="absolute h-[1px] w-6 rotate-45 bg-[var(--color-border)]" />}
    </span>
  );
};

export const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  value,
  onChange,
  label,
  helperText,
  isOptional,
  disabled,
  onDisabledClick,
}) => {
  const [inputValue, setInputValue] = useState<string>(value ?? "");
  const [touched, setTouched] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  const normalizedColor = useMemo(() => {
    if (!inputValue.trim() || !isValidHexColor(inputValue)) return null;
    return normalizeHexColor(inputValue);
  }, [inputValue]);

  const error = useMemo(() => {
    if (!inputValue.trim()) return null;
    return isValidHexColor(inputValue) ? null : "Use a hex value like #AABBCC";
  }, [inputValue]);

  const handleInputChange = (val: string) => {
    setTouched(true);
    setInputValue(val);
    onChange(val.trim() ? val : null);
  };

  const handleBlur = () => {
    setTouched(true);
    if (!inputValue.trim()) return;
    if (isValidHexColor(inputValue)) {
      const normalized = normalizeHexColor(inputValue);
      if (normalized && normalized !== inputValue) {
        setInputValue(normalized);
        onChange(normalized);
      }
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="flex items-center justify-between text-xs font-semibold text-[var(--color-text-muted)]">
          <span>{label}</span>
          {isOptional && <span className="text-[11px] font-normal text-[var(--color-text-muted)]">Optional</span>}
        </label>
      )}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1 text-xs text-[var(--color-text-main)] shadow-sm hover:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => {
            if (disabled) {
              onDisabledClick?.();
            }
            colorInputRef.current?.click();
          }}
          disabled={disabled && !onDisabledClick}
          aria-disabled={disabled}
        >
          <ColorChip color={normalizedColor} disabled={disabled} />
          <span className="whitespace-nowrap">Pick color</span>
        </button>
        <div className="flex-1">
          <Input
            value={inputValue}
            placeholder="#AABBCC"
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            className={clsx("text-sm", error && touched && "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]")}
          />
        </div>
        <input
          ref={colorInputRef}
          type="color"
          className="sr-only"
          value={normalizedColor ?? "#ffffff"}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled && !onDisabledClick}
        />
      </div>
      <div className="flex items-start justify-between gap-2">
        {!error && helperText && <p className="text-[11px] text-[var(--color-text-muted)]">{helperText}</p>}
        {error && touched && <p className="text-[11px] text-[var(--color-error)]">{error}</p>}
      </div>
    </div>
  );
};
