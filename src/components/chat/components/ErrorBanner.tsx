import { memo } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { GeminiErrorCode } from '@/lib/gemini';
import { useTranslations } from 'next-intl';

interface ErrorBannerProps {
    message: string;
    errorCode?: GeminiErrorCode;
    onRetry?: () => void;
    onDismiss?: () => void;
}

const ErrorBanner = memo<ErrorBannerProps>(({ message, errorCode, onRetry, onDismiss }) => {
    const t = useTranslations('ide');
    const isRetryable = errorCode && ![
        GeminiErrorCode.API_KEY_INVALID,
        GeminiErrorCode.API_KEY_MISSING,
        GeminiErrorCode.CONTENT_FILTERED,
    ].includes(errorCode);

    return (
        <div 
            className="mx-3 mb-4 p-4 bg-[#FAF9F6] border-l-4 border-[#D97757] shadow-sm rounded-r-lg border-y border-r border-[#E8E5DE]"
            role="alert"
            aria-live="assertive"
        >
            <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-[#D97757] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-[#37352F] font-serif font-medium tracking-tight mb-1">
                        {t('chat.errorBanner.title')}
                    </p>
                    <p className="text-[13px] text-[#6B6B6B] leading-relaxed">{message}</p>
                    {errorCode && (
                        <p className="text-[11px] text-[#9A9A9A] mt-2 font-mono bg-[#F5F3EE] px-1.5 py-0.5 rounded w-fit">
                            {t('chat.errorBanner.code', { code: errorCode })}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-1 -mt-1 -mr-1">
                    {isRetryable && onRetry && (
                        <button 
                            onClick={onRetry} 
                            className="p-2 hover:bg-[#D97757]/10 rounded-full text-[#D97757] transition-colors" 
                            title={t('chat.errorBanner.retry')}
                            aria-label={t('chat.errorBanner.retry')}
                        >
                            <RefreshCw size={15} aria-hidden="true" />
                        </button>
                    )}
                    {onDismiss && (
                        <button 
                            onClick={onDismiss} 
                            className="p-2 hover:bg-[#E8E5DE] rounded-full text-[#9A9A9A] hover:text-[#37352F] transition-colors" 
                            title={t('chat.errorBanner.close')}
                            aria-label={t('chat.errorBanner.close')}
                        >
                            <X size={15} aria-hidden="true" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

ErrorBanner.displayName = 'ErrorBanner';
export default ErrorBanner;
