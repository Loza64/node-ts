export interface PageMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export interface SoftDeleteListParams extends ListParams {
  /** true -> solo eliminados (soft-deleted); false/undefined -> solo activos. */
  deleted: boolean;
}
