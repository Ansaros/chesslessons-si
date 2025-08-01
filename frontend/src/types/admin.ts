
export interface AdminVideoAttribute {
    type: string;
    value: string;
}

export interface AdminVideo {
    id: string;
    title: string;
    description: string;
    access_level: number;
    price: string;
    preview_url: string;
    hls_url: string;
    created_at: string;
    attributes: AdminVideoAttribute[];
    views_count: number;
}

export interface AdminVideosResponse {
    data: AdminVideo[];
    total: number;
}

export interface AdminAttributeType {
    name: string;
    id: string;
}

export interface AdminAttributeValue {
    value: string;
    id: string;
}

export interface StatusResponse {
    status: boolean;
    message: string;
}
