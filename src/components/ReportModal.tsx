import React from 'react';
import { Language } from '../utils/i18n';
import { Download, X } from 'lucide-react';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    csvData: any[];
    csvFilename: string;
    t: (key: any, options?: any) => string;
    lang: Language;
}

const ReportModal: React.FC<ReportModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    csvData,
    csvFilename,
    t,
    lang,
}) => {
    if (!isOpen) return null;
    
    const convertToCSV = (data: any[]) => {
        if (!data || data.length === 0) return '';
        const headers = Object.keys(data[0]);
        const replacer = (key: any, value: any) => value === null ? '' : value;
        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(fieldName =>
                    JSON.stringify(row[fieldName], replacer)
                ).join(',')
            )
        ];
        return csvRows.join('\r\n');
    };

    const handleDownload = () => {
        const csvString = convertToCSV(csvData);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', csvFilename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-2">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto pr-2">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{t('reportPreview')}</h3>
                    {children}
                </div>
                <div className="flex justify-end space-x-4 pt-4 mt-4 border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">{t('close')}</button>
                    <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        <Download size={18} className="mr-2" />
                        {t('downloadCSV')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;