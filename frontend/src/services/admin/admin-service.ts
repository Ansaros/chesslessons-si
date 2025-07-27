export interface AdminVideo {
  id: string;
  title: string;
  description: string;
  access_level: 0 | 1 | 2;
  price: string;
  preview_url: string;
  hls_url: string;
  created_at: string;
  attributes: Array<{ type: string; value: string }>;
  hls_segments: Record<string, unknown>;
  views_count: number;
}

export interface AdminVideosResponse {
  data: AdminVideo[];
  total: number;
}

export interface AttributeType {
  id: string;
  name: string;
  values: Array<{ id: string; value: string }>;
}

export interface AttributeTypesResponse {
  data: AttributeType[];
  total: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL ?? "";

const getHeaders = (token?: string, isFormData = false) => {
  const h: HeadersInit = {};
  if (!isFormData) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

const handleResp = async <T>(r: Response): Promise<T> => {
  if (!r.ok) {
    const msg = await r.text();
    throw new Error(JSON.parse(msg).detail ?? msg);
  }
  return r.json();
};

export class AdminService {
  private token?: string;
  constructor(token?: string) {
    this.token = token;
  }
  setToken(t: string) {
    this.token = t;
  }

  async fetchVideos(params?: { skip?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.limit !== undefined) q.set("limit", String(params.limit));
    const res = await fetch(`${API_URL}/admin/videos?${q}`, {
      headers: getHeaders(this.token),
    });
    return handleResp<AdminVideosResponse>(res);
  }

  async uploadVideo(form: FormData) {
    const res = await fetch(`${API_URL}/admin/videos/`, {
      method: "POST",
      headers: getHeaders(this.token, true),
      body: form,
    });
    return handleResp<AdminVideo>(res);
  }

  async updateVideo(id: string, form: FormData) {
    const res = await fetch(`${API_URL}/admin/videos/${id}`, {
      method: "PUT",
      headers: getHeaders(this.token, true),
      body: form,
    });
    return handleResp<AdminVideo>(res);
  }

  async deleteVideo(id: string) {
    const res = await fetch(`${API_URL}/admin/videos/${id}`, {
      method: "DELETE",
      headers: getHeaders(this.token),
    });
    return handleResp<AdminVideo>(res);
  }

  /* -------- Attributes -------- */
  async fetchAttributeTypes() {
    const res = await fetch(`${API_URL}/admin/attribute/types`, {
      headers: getHeaders(this.token),
    });
    return handleResp<AttributeTypesResponse>(res);
  }

  async createAttributeType(name: string) {
    const res = await fetch(`${API_URL}/admin/attribute/types`, {
      method: "POST",
      headers: getHeaders(this.token),
      body: JSON.stringify({ name }),
    });
    return handleResp<AttributeType>(res);
  }

  async createAttributeValue(value: string, typeId: string) {
    const res = await fetch(`${API_URL}/admin/attribute/values`, {
      method: "POST",
      headers: getHeaders(this.token),
      body: JSON.stringify({ value, type_id: typeId }),
    });
    return handleResp<{ id: string; value: string }>(res);
  }

  async deleteAttributeType(id: string) {
    const res = await fetch(`${API_URL}/admin/attribute/types/${id}`, {
      method: "DELETE",
      headers: getHeaders(this.token),
    });
    return handleResp<{ status: boolean; message: string }>(res);
  }

  async deleteAttributeValue(id: string) {
    const res = await fetch(`${API_URL}/admin/attribute/values/${id}`, {
      method: "DELETE",
      headers: getHeaders(this.token),
    });
    return handleResp<{ status: boolean; message: string }>(res);
  }

  static buildVideoForm(opts: {
    video_file: File;
    preview_file: File;
    title: string;
    description?: string;
    price?: string | number;
    access_level?: number;
    attribute_value_ids?: string[];
  }) {
    const f = new FormData();
    f.append("video_file", opts.video_file);
    f.append("preview_file", opts.preview_file);
    f.append("title", opts.title);
    if (opts.description) f.append("description", opts.description);
    if (opts.price !== undefined) f.append("price", String(opts.price));
    if (opts.access_level !== undefined) f.append("access_level", String(opts.access_level));
    if (opts.attribute_value_ids?.length)
      f.append("attribute_value_ids", opts.attribute_value_ids.join(","));
    return f;
  }

  static buildVideoUpdateForm(opts: {
    preview_file?: File;
    title?: string;
    description?: string;
    price?: string | number;
    access_level?: number;
    attribute_value_ids?: string[];
  }) {
    const f = new FormData();
    if (opts.preview_file) f.append("preview_file", opts.preview_file);
    if (opts.title) f.append("title", opts.title);
    if (opts.description !== undefined) f.append("description", opts.description);
    if (opts.price !== undefined) f.append("price", String(opts.price));
    if (opts.access_level !== undefined) f.append("access_level", String(opts.access_level));
    if (opts.attribute_value_ids?.length)
      f.append("attribute_value_ids", opts.attribute_value_ids.join(","));
    return f;
  }
}

export const adminService = new AdminService();