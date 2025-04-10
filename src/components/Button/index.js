import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Button.module.scss';
import { Children } from 'react';

const cx = classNames.bind(styles);

function Button({
  to,
  href,
  text = false,
  primary = false,
  outline = false,
  rounded = false,
  disabled = false,
  small = false,
  large = false,
  onClick,
  leftIcon,
  children,
  rightIcon,
  className,
  ...passProps
}) {
  let Comp = 'button';
  const props = {
    onClick,
    ...passProps,
  };

  // Remove event listener when button is disabled
  if (disabled) {
    Object.keys(props).forEach((key) => {
      if (key.startsWith('on') && typeof props[key] === 'function') {
        delete props[key];
      }
    });
  }

  if (to) {
    props.to = to;
    Comp = Link;
  } else if (href) {
    props.href = href;
    Comp = 'a';
  }

  // Khi có className thì lấy giá trị của className để làm key
  const classes = cx('wrapper', { [className]: className, primary, outline, text, rounded, disabled, small, large });

  return (
    <Comp className={classes} {...props}>
      {leftIcon && <span className={cx('icon')}>{leftIcon}</span>}
      <span className={cx('title')}>{children}</span>
      {rightIcon && <span className={cx('icon')}>{rightIcon}</span>}
    </Comp>
  );
}

Button.protoTypes = {
  // Bắt buộc truyền
  Children: PropTypes.node.isRequired,
};

export default Button;
