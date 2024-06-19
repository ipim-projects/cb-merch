import { Icon } from '@telegram-apps/telegram-ui/dist/types/Icon';

export const IconAddCircle = ({ ...restProps }: Icon) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...restProps}>
    <circle cx="12" cy="12" r="10" stroke="#1C274C" strokeWidth="1.5"/>
    <path d="M15 12L12 12M12 12L9 12M12 12L12 9M12 12L12 15" stroke="#1C274C" strokeWidth="1.5"
          strokeLinecap="round"/>
  </svg>
);
