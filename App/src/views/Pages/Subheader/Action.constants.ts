export type ScreenSize = {
    id: number;
    name: string;
    width: number;
    height: number;
    size: 'Small' | 'Medium' | 'Large' | 'Portrait' | 'Landscape';
}

export const SCREEN_SIZES: ScreenSize[] = [
    {
        id: 1,
        name: 'Mobile',
        height: 568,
        width: 320,
        size: 'Small'
    },
    {
        id: 2,
        name: 'Mobile',
        height: 667,
        width: 375,
        size: 'Medium'
    },
    {
        id: 3,
        name: 'Mobile',
        height: 736,
        width: 414,
        size: 'Large'
    },
    {
        id: 4,
        name: 'Tablet',
        height: 1024,
        width: 768,
        size: 'Portrait'
    },
    {
        id: 5,
        name: 'Tablet',
        height: 768,
        width: 1024,
        size: 'Landscape'
    },
    {
        id: 6,
        name: 'Dekstop',
        height: 800,
        width: 1280,
        size: 'Small'
    },
    {
        id: 7,
        name: 'Dekstop',
        height: 900,
        width: 1440,
        size: 'Medium'
    },
    {
        id: 8,
        name: 'Dekstop',
        height: 1080,
        width: 1920,
        size: 'Large'
    }
]