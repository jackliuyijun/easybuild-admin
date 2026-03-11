export const DEFAULT_HEIGHTS = {
    HEADER: 64,
    ROW: 64,
    FOOTER: 64
} as const

export const getHeightClass = (height: number) => `h-[${height}px]`

export const TABLE_STYLES = {
    CELL: {
        BASE: 'px-4 align-middle whitespace-nowrap',
        HEADER: 'font-medium text-muted-foreground',
        CHECKBOX: 'w-[40px] p-0 text-center align-middle'
    },
    FIXED: {
        LEFT: {
            BASE: "sticky left-0 bg-background",
            HEADER: "sticky left-0 bg-muted/50",
            SHADOW: "shadow-[2px_0_6px_-2px_rgba(0,0,0,0.2)]"
        },
        RIGHT: {
            BASE: "sticky right-0 bg-background",
            HEADER: "sticky right-0 bg-muted/50",
            SHADOW: "shadow-[-2px_0_6px_-2px_rgba(0,0,0,0.2)]"
        }
    },
    BORDERS: {
        TOP: 'border-t border-border/50',
        BOTTOM: 'border-b border-border/50',
        ALL: 'border border-border/50'
    },
    HOVER: {
        DEFAULT: 'hover:bg-muted/50',
        LIGHT: 'hover:bg-muted/30',
        DARK: 'hover:bg-muted/70'
    },
    STRIPE: 'even:bg-muted/30',
    CHECKBOX_WIDTH: 40
} as const

export type BorderType = 'top' | 'bottom' | 'none' | 'all'
export type HoverType = 'default' | 'light' | 'dark' | 'none'

export interface TableConfig {
    headerHeight?: number
    rowHeight?: number
    footerHeight?: number
}