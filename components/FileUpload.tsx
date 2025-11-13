import React, { useState, useCallback } from 'react';

interface FileUploadProps {
    onFilesProcessed: (content: string, fileNames: string[]) => void;
    isDisabled: boolean;
}

const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" />
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesProcessed, isDisabled }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        setStatus('processing');
        setError(null);
        setFiles(Array.from(selectedFiles));

        const supportedTypes = ['text/plain', 'text/markdown', 'application/json', 'text/html', 'text/xml', 'application/pdf', 'application/msword'];
        
        let combinedContent = '';
        const processedFileNames: string[] = [];
        // FIX: Explicitly type the 'file' parameter as 'File' to ensure correct type inference.
        const filePromises = Array.from(selectedFiles).map((file: File) => {
             // A simple check, not exhaustive. For production, more robust checks are needed.
            // if (!supportedTypes.some(type => file.type.startsWith(type))) {
            //     console.warn(`Unsupported file type: ${file.name} (${file.type}). Skipping.`);
            //     return Promise.resolve();
            // }

            return new Promise<void>((resolve, reject) => {
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
        });

        try {
            await Promise.all(filePromises);
            onFilesProcessed(combinedContent, processedFileNames);
            setStatus('success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
            setStatus('error');
        }
    };

    return (
        <div className="border border-slate-700 rounded-lg p-6 bg-slate-800/50 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Build Context</h2>
            <p className="text-slate-400 mb-6 text-sm">Upload legal documents (.txt, .md, etc.) to provide context for the AI agent.</p>
            
            <div className="relative border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-sky-500 transition-colors duration-300">
                <PaperClipIcon className="mx-auto h-12 w-12 text-slate-500"/>
                <label htmlFor="file-upload" className={`relative cursor-pointer font-semibold text-sky-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 hover:text-sky-300 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <span>Select files to upload</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} disabled={isDisabled || status === 'processing'}/>
                </label>
                <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
            </div>
            {status === 'processing' && <p className="text-sm text-yellow-400 mt-4">Processing files...</p>}
            {status === 'error' && <p className="text-sm text-red-400 mt-4">Error: {error}</p>}

            {files.length > 0 && (
                <div className="mt-6 flex-grow overflow-y-auto">
                    <h3 className="font-semibold text-slate-300 mb-2">Selected Files:</h3>
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