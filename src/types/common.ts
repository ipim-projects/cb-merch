export interface ListResponse<T> {
  items: T[],
  totalCount: number,
  pageSize: number,
  pageIndex: number,
}

export interface ListRequestQueryArg {
  pageIndex?: number,
  pageSize?: number,
  name?: string,
}
