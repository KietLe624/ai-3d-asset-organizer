export interface AssetMetadata {
  total_assets: number;
  project_type: string;
  estimated_scale: string;
  primary_zones: string[];
  generated_at?: string;
  source_input?: string;
}

export interface OrganizeResult {
  classifications: Record<string, string[]>;  // { "Phòng ngủ": ["slug1", "slug2"] }
  slugs: Record<string, string>;              // { "Tên gốc": "slug-goi-y" }
  metadata: AssetMetadata;
  improvements: string[];
}

export interface ApiResponse {
  success: boolean;
  data: OrganizeResult;
  processedAt: string;
}

export interface ApiError {
  success: false;
  error: string;
  detail?: string;
}
export interface HistoryEntry {
  id: string;              // unique id = timestamp
  label: string;           // tóm tắt input (50 ký tự đầu)
  input: string;           // input gốc user nhập
  result: OrganizeResult;  // kết quả AI trả về
  createdAt: string;       // ISO timestamp
}
