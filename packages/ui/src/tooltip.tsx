import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    contentClassName?: string;
    triggerClassName?: string;
}

export function Tooltip({ children, content, contentClassName = '', triggerClassName = '' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top - 10, // 10px above trigger (viewport relative)
                left: rect.left + rect.width / 2, // Center horizontally
            });
        }
    };

    const show = () => {
        updatePosition();
        setIsVisible(true);
    };

    const hide = () => setIsVisible(false);

    useEffect(() => {
        if (isVisible) {
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isVisible]);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={show}
                onMouseLeave={hide}
                className={`relative ${triggerClassName}`}
            >
                {children}
            </div>
            {isVisible && createPortal(
                <div
                    className={`fixed z-[9999] pointer-events-none transform -translate-x-1/2 -translate-y-full ${contentClassName}`}
                    style={{ top: coords.top, left: coords.left }}
                >
                    {content}
                </div>,
                document.body
            )}
        </>
    );
}
