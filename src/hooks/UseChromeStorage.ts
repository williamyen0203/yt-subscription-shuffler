import { useState, useEffect, useRef } from "react";

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

    // Hold a stable reference to the initial value. Callers often pass a fresh
    // object literal (e.g. []) on every render; using it directly as a
    // dependency would re-run this effect on every render and loop forever.
    const initialValueRef = useRef(initialValue);

    // Load stored value on mount
    useEffect(() => {
        storage.get([key], (result) => {
            setStoredValue(
                result[key] !== undefined
                    ? result[key]
                    : initialValueRef.current,
            );
        });
    }, [key, storage]);

    // Function to set the stored value
    const setValue = (value: T) => {
        setStoredValue(value);
        storage.set({ [key]: value });
    };

    return [storedValue, setValue];
};

export default useChromeStorage;
