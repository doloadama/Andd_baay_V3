import { Language } from './i18n';

export const formatCurrency = (amount: number, currency = 'USD'): string => {
    // Note: CFA Franc (XOF) is not a standard Intl currency, so we use USD as a placeholder.
    // For a real app, you might need a custom formatting solution for XOF.
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (e) {
        return `$${amount.toFixed(2)}`;
    }
};

export const formatDate = (dateString: string, lang: Language = 'en'): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch (e) {
        return dateString;
    }
};