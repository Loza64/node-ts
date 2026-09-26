export type DeletedStatus = 'active' | 'deleted' | 'all';

export const DELETED_STATUSES: readonly DeletedStatus[] = ['active', 'deleted', 'all'];

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
  status: DeletedStatus;
}
