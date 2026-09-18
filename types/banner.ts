export interface BannerFile {
  id: string;
  filenameDownload?: string | null;
  url?: string | null;
}

export interface Banner {
  id: number;
  createdAt: string;
  updatedAt?: string;
  title: string;
  description: string;
  deeplink?: string | null;
  customOrderId?: number;
  cover?: BannerFile | null;
  image?: BannerFile | null;
  coverId?: string | null;
  imageId?: string | null;
  regionId?: number | null;
  region?: { id: number; name: string } | null;
  technicalName?: string | null;
  author?: string | null;
  inArchive: boolean;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  pageCount?: number;
  pageSize?: number;
}

export interface BannersResponse {
  timestamp?: string;
  data: Banner[];
  meta: PaginatedMeta;
}

export interface BannerFileUploadResponse {
  id: string;
  originalName?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
}
