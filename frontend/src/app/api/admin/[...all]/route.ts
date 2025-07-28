import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const NEXT_PUBLIC_API_BACKEND_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL;

async function forwardToBackend(endpoint: string, options: RequestInit) {
  try {
    console.log(`Forwarding to backend: ${NEXT_PUBLIC_API_BACKEND_URL}/admin/${endpoint}`);

    const headers: Record<string, string> = {};
    if (options.headers) {
      const originalHeaders = options.headers as Record<string, string>;
      Object.keys(originalHeaders).forEach(key => {
        headers[key] = originalHeaders[key];
      });
    }

    let axiosConfig = {
      method: options.method as string,
      url: `${NEXT_PUBLIC_API_BACKEND_URL}/admin/${endpoint}`,
      headers: headers,
      data: options.body,
    };

    // Handle FormData
    if (options.body instanceof FormData) {
      axiosConfig.data = options.body;
    } else if (typeof options.body === 'string') {
      try {
        // Try to parse as JSON
        axiosConfig.data = JSON.parse(options.body);
      } catch {
        // If not JSON, keep as is
        axiosConfig.data = options.body;
      }
    }

    const response = await axios(axiosConfig);
    console.log(`Backend response status: ${response.status}`);

    return NextResponse.json(response.data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      }
    });
  } catch (error) {
    console.error("Backend request failed: ", error);
    
    if (axios.isAxiosError(error) && error.response) {
      // Return the error response from the backend
      return NextResponse.json(error.response.data, {
        status: error.response.status,
        headers: {
          "Content-Type": "application/json",
        }
      });
    }
    
    return NextResponse.json({
      detail: [{
        loc: ["server"],
        msg: "Backend server is unreachable",
        type: "connection_error"
      }]
    }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { all: string[] } }
) {
  console.log('GET request received');

  const resolvedParams = await params;
  const route = resolvedParams.all.join("/");
  const url = new URL(req.url);
  const queryString = url.search;

  console.log('Route:', route);
  console.log('Query:', queryString);

  return forwardToBackend(`${route}${queryString}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": req.headers.get("Authorization") || "",
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { all: string[] } }
) {
  console.log('POST request received');

  const resolvedParams = await params;
  const route = resolvedParams.all.join("/");
  console.log('Route:', route);

  const contentType = req.headers.get("Content-Type") || "";
  let body;

  if (contentType.includes("multipart/form-data")) {
    body = await req.formData();
  } else if (contentType.includes("application/json")) {
    body = JSON.stringify(await req.json());
  } else {
    body = await req.text();
  }

  return forwardToBackend(route, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      "Authorization": req.headers.get("Authorization") || "",
    },
    body,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { all: string[] } }
) {
  console.log('PUT request received');

  const resolvedParams = await params;
  const route = resolvedParams.all.join("/");
  console.log('Route:', route);

  const contentType = req.headers.get("Content-Type") || "";
  let body;

  if (contentType.includes("multipart/form-data")) {
    body = await req.formData();
  } else if (contentType.includes("application/json")) {
    body = JSON.stringify(await req.json());
  } else {
    body = await req.text();
  }

  return forwardToBackend(route, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Authorization": req.headers.get("Authorization") || "",
    },
    body,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { all: string[] } }
) {
  console.log('DELETE request received');

  const resolvedParams = await params;
  const route = resolvedParams.all.join("/");
  console.log('Route:', route);

  return forwardToBackend(route, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Authorization": req.headers.get("Authorization") || "",
    },
  });
}