import { useState, useEffect } from "react";

// Type for the hook's return value
type UseChromeStorage<T> = [T | undefined, (value: T) => void];

// Custom hook
const useChromeStorage = <T>(
    key: string,
    initialValue: T,
): UseChromeStorage<T> => {
    // Use chrome.storage.local for storage
    const storage = chrome.storage.local;

    // State to hold the stored value
    const [storedValue, setStoredValue] = useState<T | undefined>(initialValue);

    // Load stored value on mount
    useEffect(() => {
        storage.get([key], (result) => {
            if (result[key] !== undefined) {
                setStoredValue(result[key]);
            } else {
                setStoredValue(initialValue);
            }
        });
    }, [key, initialValue, storage]);

    // Function to set the stored value
    const setValue = (value: T) => {
        setStoredValue(value);
        storage.set({ [key]: value });
    };

    return [storedValue, setValue];
};

export default useChromeStorage;
