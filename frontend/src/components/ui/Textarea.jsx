import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  placeholder,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  ...props
}, ref) => {
  const baseClasses = 'w-full px-3 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed resize-vertical';
  
  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
  
  const currentLength = props.value?.length || 0;
  
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {showCharCount && maxLength && (
            <span className={`text-xs ${currentLength > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          className={`${baseClasses} ${stateClasses} ${className}`}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          maxLength={maxLength}
          {...props}
        />
        
        {error && (
          <div className="absolute top-2 right-2 pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
