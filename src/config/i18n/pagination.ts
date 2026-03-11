export const PAGINATION_LOCALES = {
    'zh-CN': {
        prevPage: '上一页',
        nextPage: '下一页',
        total: '共 {total} 条数据',
        itemsPerPage: '{pageSize}条/页',
        pageSizeOptions: {
            '10': '10条/页',
            '20': '20条/页',
            '50': '50条/页',
            '100': '100条/页'
        }
    },
    'en-US': {
        prevPage: 'Previous',
        nextPage: 'Next',
        total: 'Total {total} items',
        itemsPerPage: '{pageSize} / page',
        pageSizeOptions: {
            '10': '10 / page',
            '20': '20 / page',
            '50': '50 / page',
            '100': '100 / page'
        }
    }
} as const

export type LocaleType = keyof typeof PAGINATION_LOCALES 