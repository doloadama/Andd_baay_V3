import React, { useState, useCallback } from 'react';
import { UploadCloud, Wand2, Download, Trash2, Loader } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { editImage } from '../services/geminiService';

const ImageStudio: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setOriginalImage(file);
            setOriginalImagePreview(URL.createObjectURL(file));
            setEditedImage(null);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
        multiple: false,
    });

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleEditImage = async () => {
        if (!originalImage || !prompt) {
            setError('Please upload an image and enter a prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setEditedImage(null);
        
        try {
            const base64Data = await fileToBase64(originalImage);
            const result = await editImage(base64Data, originalImage.type, prompt);

            if (result) {
                setEditedImage(`data:${originalImage.type};base64,${result}`);
            } else {
                setError('Failed to edit image. The AI could not process the request.');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while processing the image.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearImages = () => {
      setOriginalImage(null);
      setOriginalImagePreview(null);
      setEditedImage(null);
      setError(null);
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">AI Image Studio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Upload Area */}
                    <div {...getRootProps()} className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-gray-400'}`}>
                        <input {...getInputProps()} />
                        {originalImagePreview ? (
                            <div className="relative">
                                <img src={originalImagePreview} alt="Original" className="max-h-64 rounded-md object-contain" />
                                <button type="button" onClick={(e) => { e.stopPropagation(); clearImages(); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500">
                                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm font-semibold text-gray-700">
                                    {isDragActive ? 'Drop the image here...' : "Drag & drop an image, or click to select"}
                                </p>
                                <p className="text-xs">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Editing Prompt</label>
                            <textarea
                                id="prompt"
                                rows={4}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., 'Make the mangoes look ripe and ready to eat' or 'Add a sunny background'"
                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                disabled={!originalImage}
                            />
                        </div>
                        <button
                            onClick={handleEditImage}
                            disabled={!originalImage || !prompt || isLoading}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                            {isLoading ? <Loader className="animate-spin" size={20} /> : <Wand2 size={20} />}
                            <span>{isLoading ? 'Generating...' : 'Enhance with AI'}</span>
                        </button>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                </div>
            </div>

            {(isLoading || editedImage) && <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Result</h3>
                <div className="flex items-center justify-center min-h-[20rem] bg-stone-50 rounded-lg relative">
                    {isLoading && <Loader className="animate-spin text-emerald-500" size={48} />}
                    {editedImage && (
                         <div className="relative">
                            <img src={editedImage} alt="Edited" className="max-h-80 rounded-md object-contain" />
                            <a href={editedImage} download="edited-image.png" className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition-colors">
                                <Download size={18} />
                            </a>
                        </div>
                    )}
                </div>
            </div>}
        </div>
    );
};

export default ImageStudio;