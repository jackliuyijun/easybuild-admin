export interface Container {
    containerId: string
    containerCode: string
    containerName: string
    addressInfo?: string
    forbiddenFlag: number
    insertTime: string
    lastUpdateTime: string
}

export interface ContainerQueryParams {
    page: number
    limit: number
    containerName?: string
    addressInfo?: string
    forbiddenFlag?: number
}

export interface ContainerSaveParams {
    containerId?: string
    containerCode?: string
    containerName: string
    addressInfo?: string
}
