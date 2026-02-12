import { useToastStore, type Toast } from '@/store/useToastStore';
import { XIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon } from './icons';

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();

  const config = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-500 dark:border-green-600',
      text: 'text-green-800 dark:text-green-200',
      icon: <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-500 dark:border-red-600',
      text: 'text-red-800 dark:text-red-200',
      icon: <AlertCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400" />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-500 dark:border-blue-600',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <InfoIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    },
  };

  const toastConfig = config[toast.type];

  return (
    <div
      className={`${toastConfig.bg} ${toastConfig.border} border-l-4 rounded-lg shadow-lg p-4 mb-3 flex items-start gap-3 animate-slide-in-right min-w-[300px]`}
      role="alert"
    >
      <div className="flex-shrink-0">{toastConfig.icon}</div>
      <div className={`flex-1 ${toastConfig.text} text-sm font-medium`}>
        {toast.message}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
        aria-label="Fechar notificação"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm w-full space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
