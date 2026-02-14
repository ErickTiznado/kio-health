import { useState, useRef, useEffect } from 'react';
import { Check, Loader2, Hourglass, Edit2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentPopoverProps {
    status: 'PENDING' | 'PAID';
    amount: number;
    onStatusChange: (newStatus: 'PENDING' | 'PAID') => void;
    onAmountChange: (newAmount: number) => void;
}

export function PaymentPopover({ status, amount, onStatusChange, onAmountChange }: PaymentPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tempAmount, setTempAmount] = useState(amount.toString());
    const popoverRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Autofocus input when opening in PENDING state
            if (status === 'PENDING' && inputRef.current) {
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, status]);

    // Close on Escape
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') setIsOpen(false);
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleConfirm = async () => {
        setIsLoading(true);

        // Simulate network request
        setTimeout(() => {
            setIsLoading(false);
            const parsedAmount = parseFloat(tempAmount);
            if (!isNaN(parsedAmount)) {
                onAmountChange(parsedAmount);
            }
            onStatusChange('PAID');
            setIsOpen(false);
            toast.success('Pago registrado correctamente');
        }, 800);
    };

    const handleRevert = () => {
        setIsLoading(true);

        // Simulate network request
        setTimeout(() => {
            setIsLoading(false);
            onStatusChange('PENDING');
            setIsOpen(false);
            toast.success('Pago revertido a pendiente');
        }, 600);
    };

    const triggerConfig = {
        PENDING: {
            label: 'Pendiente',
            className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300',
            icon: <Hourglass size={12} className="shrink-0" />,
            dotColor: 'bg-amber-500'
        },
        PAID: {
            label: 'Pagado',
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300',
            icon: <Check size={12} className="shrink-0" />,
            dotColor: 'bg-emerald-500'
        }
    };

    const currentConfig = triggerConfig[status];

    return (
        <div className="relative inline-block" ref={popoverRef}>
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer select-none
          ${currentConfig.className}
          ${isOpen ? 'ring-2 ring-offset-1 ring-black/5 scale-[0.98] brightness-95' : 'hover:shadow-sm'}
        `}
            >
                <span className={`w-1.5 h-1.5 rounded-full ${currentConfig.dotColor}`} />
                <span>{currentConfig.label}</span>
                {status === 'PAID' && <span className="opacity-75 font-normal ml-0.5">${amount}</span>}
            </button>

            {/* Popover */}
            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200 origin-bottom-right">
                    {status === 'PENDING' ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-700">Registrar Pago</h4>
                                <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <span className="text-xs">$</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Monto (USD)</label>
                                <input
                                    ref={inputRef}
                                    type="number"
                                    value={tempAmount}
                                    onChange={(e) => setTempAmount(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-kanji/20 focus:border-kanji transition-all"
                                    placeholder="0.00"
                                />
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={isLoading}
                                className="w-full bg-[var(--color-kanji)] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={12} className="animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        Confirmar Pago
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <Check size={16} strokeWidth={3} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800">Pagado</h4>
                                    <p className="text-xs text-gray-500 font-medium">${amount} • USD</p>
                                </div>
                            </div>

                            <div className="pt-1 space-y-2">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        // Open edit flow (future implementation)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                    <Edit2 size={12} className="text-gray-400" />
                                    Editar monto
                                </button>

                                <button
                                    onClick={handleRevert}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                                >
                                    <RotateCcw size={12} className="text-red-400" />
                                    Revertir a Pendiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
