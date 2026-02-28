import React, { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext();

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState(null);

    const alert = useCallback((title, message, type = 'info') => {
        return new Promise((resolve) => {
            setModalConfig({
                type: 'alert',
                alertType: type,
                title,
                message,
                onClose: () => {
                    setModalConfig(null);
                    resolve();
                }
            });
        });
    }, []);

    const confirm = useCallback((title, message, confirmText = 'Confirm', variant = 'danger') => {
        return new Promise((resolve) => {
            setModalConfig({
                type: 'confirm',
                title,
                message,
                confirmText,
                variant,
                onConfirm: () => {
                    setModalConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setModalConfig(null);
                    resolve(false);
                }
            });
        });
    }, []);

    const prompt = useCallback((title, message, inputType = 'text', confirmText = 'Submit', variant = 'primary') => {
        return new Promise((resolve) => {
            setModalConfig({
                type: 'prompt',
                inputType,
                title,
                message,
                confirmText,
                variant,
                onConfirm: (val) => {
                    setModalConfig(null);
                    resolve(val);
                },
                onCancel: () => {
                    setModalConfig(null);
                    resolve(null);
                }
            });
        });
    }, []);

    return (
        <UIContext.Provider value={{ alert, confirm, prompt, modalConfig }}>
            {children}
        </UIContext.Provider>
    );
};
