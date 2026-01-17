declare global {
    interface Window {
        inventory: { [key: string]: number };
    }
}

export {};
