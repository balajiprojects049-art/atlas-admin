import React from 'react';

export const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    required = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
                >
                    {label}
                    {required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={`input-field ${error ? 'border-danger focus:ring-danger' : ''}`}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-danger">{error}</p>
            )}
        </div>
    );
};

export const Select = ({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    required = false,
    disabled = false,
    placeholder = 'Select...',
    className = ''
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
                >
                    {label}
                    {required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`input-field ${error ? 'border-danger focus:ring-danger' : ''}`}
            >
                <option value="">{placeholder}</option>
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-danger">{error}</p>
            )}
        </div>
    );
};

export const TextArea = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    rows = 4,
    error,
    required = false,
    disabled = false,
    className = ''
}) => {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2"
                >
                    {label}
                    {required && <span className="text-danger ml-1">*</span>}
                </label>
            )}
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                className={`input-field resize-none ${error ? 'border-danger focus:ring-danger' : ''}`}
            />
            {error && (
                <p className="mt-1 text-sm text-danger">{error}</p>
            )}
        </div>
    );
};

export default Input;
