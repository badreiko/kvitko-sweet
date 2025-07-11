// src/types.d.ts
declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.jpeg' {
    const content: string;
    export default content;
}

declare module '*.svg' {
    const content: string;
    export default content;
}

// Добавляем поддержку формата WebP
declare module '*.webp' {
    const content: string;
    export default content;
}