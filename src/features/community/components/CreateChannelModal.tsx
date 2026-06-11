import { useState } from 'react';
import { Hash, Volume2, X } from 'lucide-react';

interface CreateChannelModalProps {
    onClose: () => void;
    onCreate: (name: string, type: 0 | 1) => Promise<void>;
}

export default function CreateChannelModal({ onClose, onCreate }: CreateChannelModalProps) {
    const [name, setName] = useState('');
    const [type, setType] = useState<0 | 1>(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    console.log(error )
    const handleSubmit = async () => {
        if (!name.trim()) return;
        setSubmitting(true);
        setError(null);
        try {
            await onCreate(name.trim(), type);
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.title ?? e?.response?.data?.detail ?? 'Failed to create channel');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[#2a2a2e] rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Channel</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-6 pt-2 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                            Channel Type
                        </label>
                        <div className="space-y-2">
                            <button
                                onClick={() => setType(0)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                    type === 0
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                        : 'border-slate-200 dark:border-[#3a3a3e] hover:bg-slate-50 dark:hover:bg-[#1c1c1f]'
                                }`}
                            >
                                <Hash size={20} className="text-slate-500" />
                                <div className="text-left">
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">Text</p>
                                    <p className="text-xs text-slate-400">Send messages, images, and files</p>
                                </div>
                            </button>
                            <button
                                onClick={() => setType(1)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                    type === 1
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10'
                                        : 'border-slate-200 dark:border-[#3a3a3e] hover:bg-slate-50 dark:hover:bg-[#1c1c1f]'
                                }`}
                            >
                                <Volume2 size={20} className="text-slate-500" />
                                <div className="text-left">
                                    <p className="font-medium text-slate-900 dark:text-white text-sm">Voice</p>
                                    <p className="text-xs text-slate-400">Hang out together with voice</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                            Channel Name
                        </label>
                        <div className="flex items-center bg-slate-100 dark:bg-[#1c1c1f] rounded-md px-3">
                            <Hash size={16} className="text-slate-400" />
                            <input
                                autoFocus
                                value={name}
                                onChange={e => setName(e.target.value.replace(/\s+/g, '-').toLowerCase())}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                placeholder="new-channel"
                                className="flex-1 bg-transparent outline-none px-2 py-2.5 text-sm text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 bg-slate-50 dark:bg-[#1c1c1f] px-6 py-4">
                    {/* {error && (
                            <p className="text-sm text-red-500 px-6">{error}</p>
                        )} */}
                    <button onClick={onClose} className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:underline">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim() || submitting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
                    >
                        {submitting ? 'Creating…' : 'Create Channel'}
                    </button>
                </div>
            </div>
        </div>
    );
}