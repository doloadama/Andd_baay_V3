import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { t, Language } from '../utils/i18n';

interface ImageEditorProps {
    t: (key: any, lang: Language) => string;
    lang: Language;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ t, lang }) => {
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('Make the mangoes look more vibrant and ripe');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
                setEditedImage(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditImage = async () => {
        if (!originalImage || !prompt) return;
        setLoading(true);
        setError(null);
        setEditedImage(null);

        try {
            const parts = originalImage.split(',');
            const mimeType = parts[0].match(/:(.*?);/)?.[1];
            const base64Data = parts[1];

            if (!mimeType || !base64Data) {
                throw new Error("Invalid image format");
            }

            const result = await editImage(base64Data, mimeType, prompt);
            if (result) {
                setEditedImage(`data:${mimeType};base64,${result}`);
            } else {
                setError("Failed to edit image. The model might not have returned an image.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while editing the image.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6">{t('navImageStudio', lang)}</h2>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mb-4 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {originalImage ? t('changeImage', lang) : t('uploadImage', lang)}
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="text-center">
                        <h3 className="font-semibold text-lg mb-2 dark:text-gray-200">{t('original', lang)}</h3>
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            {originalImage ? <img src={originalImage} alt="Original" className="max-h-full max-w-full rounded-md" /> : <p className="text-gray-500 dark:text-gray-400">{t('noImageUploaded', lang)}</p>}
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold text-lg mb-2 dark:text-gray-200">{t('edited', lang)}</h3>
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center">
                            {loading && <p className="text-gray-500 dark:text-gray-400">{t('generating', lang)}</p>}
                            {error && <p className="text-red-500">{error}</p>}
                            {editedImage && <img src={editedImage} alt="Edited" className="max-h-full max-w-full rounded-md" />}
                            {!loading && !error && !editedImage && <p className="text-gray-500 dark:text-gray-400">{t('editResultPlaceholder', lang)}</p>}
                        </div>
                    </div>
                </div>

                {originalImage && (
                    <div className="mt-6">
                        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('editInstruction', lang)}</label>
                        <textarea
                            id="prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={t('editInstructionPlaceholder', lang)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={2}
                        />
                        <button
                            onClick={handleEditImage}
                            disabled={loading || !prompt}
                            className="mt-2 w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400"
                        >
                            {loading ? t('processing', lang) : t('generateEdit', lang)}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEditor;