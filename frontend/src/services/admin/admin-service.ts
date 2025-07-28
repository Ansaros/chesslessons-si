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

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL ?? "";

const getHeaders = (token?: string, isFormData = false) => {
  const h: Record<string, string> = {};
  if (!isFormData) h["Content-Type"] = "application/json";
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
};

const handleAxiosResp = async <T>(promise: Promise<any>): Promise<T> => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail ?? JSON.stringify(error.response.data));
    }
    throw error;
  }
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
    return handleAxiosResp<AdminVideosResponse>(
      axios.get(`${API_URL}/admin/videos?${q}`, {
        headers: getHeaders(this.token),
      })
    );
  }

  async uploadVideo(form: FormData) {
    return handleAxiosResp<AdminVideo>(
      axios.post(`${API_URL}/admin/videos/`, form, {
        headers: getHeaders(this.token, true),
      })
    );
  }

  async updateVideo(id: string, form: FormData) {
    return handleAxiosResp<AdminVideo>(
      axios.put(`${API_URL}/admin/videos/${id}`, form, {
        headers: getHeaders(this.token, true),
      })
    );
  }

  async deleteVideo(id: string) {
    return handleAxiosResp<AdminVideo>(
      axios.delete(`${API_URL}/admin/videos/${id}`, {
        headers: getHeaders(this.token),
      })
    );
  }

  /* -------- Attributes -------- */
  async fetchAttributeTypes() {
    return handleAxiosResp<AttributeTypesResponse>(
      axios.get(`${API_URL}/admin/attribute/types`, {
        headers: getHeaders(this.token),
      })
    );
  }

  async createAttributeType(name: string) {
    return handleAxiosResp<AttributeType>(
      axios.post(`${API_URL}/admin/attribute/types`, { name }, {
        headers: getHeaders(this.token),
      })
    );
  }

  async createAttributeValue(value: string, typeId: string) {
    return handleAxiosResp<{ id: string; value: string }>(
      axios.post(`${API_URL}/admin/attribute/values`, { value, type_id: typeId }, {
        headers: getHeaders(this.token),
      })
    );
  }

  async deleteAttributeType(id: string) {
    return handleAxiosResp<{ status: boolean; message: string }>(
      axios.delete(`${API_URL}/admin/attribute/types/${id}`, {
        headers: getHeaders(this.token),
      })
    );
  }

  async deleteAttributeValue(id: string) {
    return handleAxiosResp<{ status: boolean; message: string }>(
      axios.delete(`${API_URL}/admin/attribute/values/${id}`, {
        headers: getHeaders(this.token),
      })
    );
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