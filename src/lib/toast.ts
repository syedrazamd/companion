import { toast } from 'sonner';

export const appToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message, { style: { background: '#7C3AED', color: 'white' } }),
  warning: (message: string) => toast.warning(message),
};
