import { forwardRef } from 'react';
import { IconButtonProps, Tappable } from '@telegram-apps/telegram-ui';
import { classNames } from '@telegram-apps/telegram-ui/dist/helpers/classNames';

import styles from './IconButtonRef.module.css';

const modeStyles = {
  bezeled: styles['wrapper--bezeled'],
  plain: styles['wrapper--plain'],
  gray: styles['wrapper--gray'],
  outline: styles['wrapper--outline'],
};

const sizeStyles = {
  s: styles['wrapper--s'],
  m: styles['wrapper--m'],
  l: styles['wrapper--l'],
};

const IconButtonRef = forwardRef(({
                                    size = 'm',
                                    mode = 'bezeled',
                                    className,
                                    children,
                                    ...restProps
                                  }: IconButtonProps, ref) =>
  (
    <Tappable
      ref={ref}
      Component="button"
      className={classNames(
        styles.wrapper,
        modeStyles[mode],
        sizeStyles[size],
        className,
      )}
      {...restProps}
    >
      {children}
    </Tappable>
  ));

export default IconButtonRef;
