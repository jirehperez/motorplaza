import {
  Directive,
  ElementRef,
  HostListener,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Directive({
  selector: '[appNumberFormat]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberFormatDirective),
      multi: true,
    },
  ],
})
export class NumberFormatDirective implements ControlValueAccessor {
  private el: HTMLInputElement;
  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {
    this.el = this.elementRef.nativeElement;
  }

  // --------- Helpers ----------
  private format(value: string | number | null): string {
    if (value === null || value === undefined || value === '') return '';
    const num = parseFloat(value.toString().replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private unformat(value: string): number | null {
    if (!value) return null;
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? null : num;
  }

  // --------- ControlValueAccessor ----------
  writeValue(value: number | null): void {
    if (value !== null && value !== undefined) {
      this.el.value = this.format(value);
    } else {
      this.el.value = '';
    }
  }

  registerOnChange(fn: (value: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.disabled = isDisabled;
  }

  // --------- Listeners ----------
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const numValue = this.unformat(input.value);
    this.onChange(numValue); // propagate clean number
  }

  @HostListener('blur')
  onBlur() {
    this.onTouched();
    const numValue = this.unformat(this.el.value);
    this.el.value = this.format(numValue); // format visually
  }

  @HostListener('focus')
  onFocus() {
    const numValue = this.unformat(this.el.value);
    this.el.value = numValue !== null ? numValue.toString() : '';
  }
}
