import React, { useState, useCallback } from 'react';

interface FileUploadProps {
    onFilesProcessed: (content: string, fileNames: string[]) => void;
    isDisabled: boolean;
    language: string;
    translations: Record<string, any>;
}

const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" />
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesProcessed, isDisabled, language, translations }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const t = translations[language];

    const processFiles = useCallback(async (filesToProcess: FileList) => {
        if (!filesToProcess || filesToProcess.length === 0) return;

        setStatus('processing');
        setError(null);
        setProgress(0);
        setFiles(Array.from(filesToProcess));

        let combinedContent = '';
        const processedFileNames: string[] = [];

        try {
            for (let i = 0; i < filesToProcess.length; i++) {
                const file = filesToProcess[i];
                await new Promise<void>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        combinedContent += `\n\n--- Document: ${file.name} ---\n\n${reader.result}`;
                        processedFileNames.push(file.name);
                        resolve();
                    };
                    reader.onerror = () => {
                        console.error(`Error reading file: ${file.name}`);
                        reject(new Error(`Error reading file: ${file.name}`));
                    };
                    reader.readAsText(file);
                });
                // Update progress after each file is processed
                setProgress(((i + 1) / filesToProcess.length) * 100);
            }
            onFilesProcessed(combinedContent, processedFileNames);
            setStatus('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setStatus('error');
        }
    }, [onFilesProcessed]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            processFiles(event.target.files);
        }
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (!isDisabled) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (!isDisabled && event.dataTransfer.files) {
            processFiles(event.dataTransfer.files);
        }
    };

    return (
        <div className="border border-slate-700 rounded-lg p-6 bg-slate-800/50 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">{t.buildContextTitle}</h2>
            <p className="text-slate-400 mb-6 text-sm">{t.buildContextDescription}</p>
            
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${isDisabled ? 'opacity-50' : 'hover:border-sky-500'} ${isDragging ? 'border-sky-500 bg-slate-700/50' : 'border-slate-600'}`}
            >
                <PaperClipIcon className="mx-auto h-12 w-12 text-slate-500"/>
                <label htmlFor="file-upload" className={`relative cursor-pointer font-semibold text-sky-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 hover:text-sky-300 ${isDisabled ? 'cursor-not-allowed' : ''}`}>
                    <span>{t.selectFiles}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} disabled={isDisabled || status === 'processing'}/>
                </label>
                <p className="text-xs text-slate-500 mt-1">{t.dragAndDrop}</p>
            </div>

            <div className="mt-4">
                {status === 'processing' && (
                    <div>
                        <p className="text-sm text-yellow-400 mb-2">{t.processingFiles} ({Math.round(progress)}%)</p>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div className="bg-sky-500 h-2 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}
                {status === 'error' && <p className="text-sm text-red-400">{t.errorPrefix} {error}</p>}
            </div>

            {files.length > 0 && (
                <div className="mt-6 flex-grow overflow-y-auto">
                    <h3 className="font-semibold text-slate-300 mb-2">{t.selectedFiles}</h3>
                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li key={index} className="text-sm text-slate-400 bg-slate-900/50 p-2 rounded truncate">{file.name}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
