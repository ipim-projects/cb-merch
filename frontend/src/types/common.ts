export interface ListResponse<T> {
  items: T[],
  totalCount: number,
  pageSize: number,
  pageIndex: number,
}

export interface ListRequestQueryArg {
  pageIndex?: number,
  pageSize?: number,
}

export interface StoreInfo {
  code: string,
  name: string,
  deliveryTypes: string[],
  batchEnabled: boolean,
}
