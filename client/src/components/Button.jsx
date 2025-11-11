// client/src/components/Button.jsx - Button component

import React from 'react';
import PropTypes from 'prop-types';
import { capitalize } from '../utils/helpers';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ...props
}) => {
  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const disabledClass = disabled ? 'btn-disabled' : '';
  const combinedClassName = [
    baseClasses,
    variantClass,
    sizeClass,
    disabledClass,
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (event) => {
    if (disabled) return;
    if (onClick) onClick(event);
  };

  return (
    <button
      className={combinedClassName}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {typeof children === 'string' ? capitalize(children) : children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;