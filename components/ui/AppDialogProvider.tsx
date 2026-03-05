import React, { createContext, useContext, useMemo, useState } from 'react';

type DialogTone = 'info' | 'warning' | 'danger' | 'success';

type DialogConfig = {
  title: string;
  message: string;
  tone?: DialogTone;
};

type DialogState = {
  mode: 'alert' | 'confirm';
  title: string;
  message: string;
  tone: DialogTone;
  resolver?: (value: boolean) => void;
};

type Toast = {
  id: number;
  title: string;
  message: string;
  tone: DialogTone;
};

type DialogContextType = {
  showMessage: (config: DialogConfig) => void;
  showConfirm: (config: DialogConfig) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const toneClass = (tone: DialogTone) => {
  if (tone === 'danger') return 'border-red-500/50 bg-red-500/10 text-red-200';
  if (tone === 'warning') return 'border-amber-500/50 bg-amber-500/10 text-amber-200';
  if (tone === 'success') return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200';
  return 'border-blue-500/50 bg-blue-500/10 text-blue-200';
};

export const AppDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showMessage = ({ title, message, tone = 'info' }: DialogConfig) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, title, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const showConfirm = ({ title, message, tone = 'warning' }: DialogConfig) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        mode: 'confirm',
        title,
        message,
        tone,
        resolver: resolve
      });
    });
  };

  const contextValue = useMemo(
    () => ({ showMessage, showConfirm }),
    []
  );

  const closeConfirm = (accepted: boolean) => {
    if (dialog?.resolver) {
      dialog.resolver(accepted);
    }
    setDialog(null);
  };

  return (
    <DialogContext.Provider value={contextValue}>
      {children}

      {!!dialog && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className={`w-full max-w-md rounded-3xl border p-6 shadow-2xl ${toneClass(dialog.tone)}`}>
            <h3 className="text-lg font-black uppercase tracking-widest">{dialog.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-100">{dialog.message}</p>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => closeConfirm(false)}
                className="px-4 py-2 rounded-xl border border-white/20 bg-zinc-950/60 text-zinc-200 text-xs font-black uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={() => closeConfirm(true)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${dialog.tone === 'danger' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {!!toasts.length && (
        <div className="fixed right-4 bottom-4 z-[998] space-y-3 w-[320px] max-w-[calc(100vw-2rem)]">
          {toasts.map((toast) => (
            <div key={toast.id} className={`rounded-2xl border p-4 shadow-2xl ${toneClass(toast.tone)}`}>
              <div className="text-[10px] font-black uppercase tracking-widest">{toast.title}</div>
              <p className="mt-1 text-xs text-zinc-100 leading-relaxed">{toast.message}</p>
            </div>
          ))}
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useAppDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error('useAppDialog must be used inside AppDialogProvider');
  }
  return ctx;
};
