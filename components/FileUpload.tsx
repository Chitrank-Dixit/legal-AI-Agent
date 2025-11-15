import React, { useState, useCallback } from 'react';

interface FileUploadProps {
    onFilesProcessed: (content: string, fileNames: string[]) => void;
    isDisabled: boolean;
    language: string;
    translations: Record<string, any>;
}

const UploadCloudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
);

const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
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
        <div className="border border-slate-800 rounded-xl p-6 bg-slate-900/70 h-full flex flex-col shadow-lg">
            <h2 className="text-xl font-bold text-slate-100 mb-2">{t.buildContextTitle}</h2>
            <p className="text-slate-400 mb-6 text-sm">{t.buildContextDescription}</p>
            
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 group ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${isDragging ? 'border-cyan-500 bg-slate-800/80 scale-105' : 'border-slate-700 hover:border-cyan-600'}`}
            >
                <UploadCloudIcon className={`mx-auto h-12 w-12 text-slate-500 transition-colors group-hover:text-cyan-500 ${isDragging ? 'text-cyan-500' : ''}`}/>
                 <label htmlFor="file-upload" className={`relative mt-4 block font-semibold text-cyan-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-cyan-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 hover:text-cyan-300 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <span>{t.selectFiles}</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} disabled={isDisabled || status === 'processing'}/>
                </label>
                <p className="text-xs text-slate-500 mt-1">{t.dragAndDrop}</p>
            </div>

            <div className="mt-4 min-h-[50px]">
                {status === 'processing' && (
                    <div>
                        <p className="text-sm text-cyan-400 mb-2">{t.processingFiles} ({Math.round(progress)}%)</p>
                        <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-2.5 rounded-full transition-all duration-300 ease-in-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}
                {status === 'error' && <p className="text-sm text-red-400">{t.errorPrefix} {error}</p>}
            </div>

            {files.length > 0 && (
                <div className="mt-4 flex-grow overflow-y-auto pr-2 -mr-2">
                    <h3 className="font-semibold text-slate-300 mb-2">{t.selectedFiles}</h3>
                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center text-sm text-slate-400 bg-slate-800/60 p-2.5 rounded-md border border-slate-800">
                                <DocumentIcon className="w-5 h-5 mr-3 text-slate-500 flex-shrink-0"/>
                                <span className="truncate flex-grow">{file.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};