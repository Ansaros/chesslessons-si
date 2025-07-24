import { NextRequest, NextResponse } from "next/server"

// import bcrypt from 'bcryptjs'

// import { Jwt } from "jsonwebtoken"

import { z } from "zod"

// const JWT_SECRET = process.env.JWT_SECRET;
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const NEXT_PUBLIC_API_BACKEND_URL = process.env.NEXT_PUBLIC_API_BACKEND_URL;


const registerSchema = z.object({
    email: z.email("Неверный формат почты"),
    password: z.string().min(1, "Укажите пароль"),
    chess_level: z.string().min(1, "Укажите ваш уровень игры"),
});

const loginSchema = z.object({
    grant_type: z.string().regex(/^password$/, "Grant type must be password").optional(),
    username: z.string().min(1, "Укажите имя"),
    password: z.string().min(1, "Укажите пароль"),
    scope: z.string().optional(),
    client_id: z.string().optional().nullable(),
    client_secret: z.string().optional().nullable(),
});

const passwordRecoverySchema = z.object({
    email: z.email("Неверный формат почты")
});

const passwordResetSchema = z.object({
    token: z.string().min(1, "Требуется токен сброса"),
    password: z.string().min(1, "Укажите пароль"),
});

// interface TokenResponse {
//     access_token: string,
//     refresh_token: string,
//     token_type: string,
// }

// interface StatusResponse {
//     status: boolean,
//     message: string,
// }

interface ValidationError {
    detail: Array<{
        loc: (string | number)[],
        msg: string,
        type: string,
    }>
}

const createValidationError = (field: string, message: string): ValidationError => ({
    detail: [{
        loc: [field],
        msg: message,
        type: "value_error",
    }]
});

async function forwardToBackend(endpoint: string, options: RequestInit) {
    try {
        const response = await fetch(`${NEXT_PUBLIC_API_BACKEND_URL}/auth/${endpoint}`, {
            ...options,
            headers: {
                ...options.headers
            }
        })

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
            }
        })
    } catch (error) {
        console.error("Backend request failed: ", error);
        return NextResponse.json({
            detail: [{
                loc: ["server"],
                msg: "Internal server error",
                type: "server_error"
            }]
        },
            { status: 500 }
        )
    }
}

async function handleRegister(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.parse(body);

        return forwardToBackend("register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(validatedData),
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            const detail = error.issues.map(err => ({
                loc: err.path,
                msg: err.message,
                type: err.code,
            }))
            return NextResponse.json({ detail }, { status: 422 })
        }
        return NextResponse.json(
            createValidationError("server", "Internal server error"),
            { status: 500 }
        )
    }
}

async function handleLogin(req: NextRequest) {
    try {
        const formData = await req.formData();
        const loginData = {
            grant_type: formData.get("grant_type"),
            username: formData.get("username"),
            password: formData.get("password"),
            scope: formData.get("scope"),
            client_id: formData.get("client_id"),
            client_secret: formData.get("client_secret"),
        }

        const cleanedData: Record<string, string> = {};
        Object.entries(loginData).forEach(([key, value]) => {
            if (value !== null && value !== "") {
                cleanedData[key] = typeof value === "string" ? value : value.name;
            }
        })

        if (!cleanedData.username) {
            return NextResponse.json(
                {
                    detail: [{
                        loc: ["username"],
                        msg: "Username is required",
                        type: "value_error.missing"
                    }]
                }, { status: 422 }
            )
        }

        if (!cleanedData.password) {
            return NextResponse.json(
                {
                    detail: [{
                        loc: ["password"],
                        msg: "Password is required",
                        type: "value_error.missing"
                    }]
                }, { status: 422 }
            )
        }

        const validatedData = loginSchema.parse(cleanedData);

        const backendFormData = new FormData();
        Object.entries(validatedData).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                backendFormData.append(key, value.toString())
            }
        })


        return forwardToBackend("login", {
            method: "POST",
            body: backendFormData,
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            const detail = error.issues.map(err => ({
                loc: err.path,
                msg: err.message,
                type: err.code,
            }))
            return NextResponse.json({ detail }, { status: 422 })
        }
        return NextResponse.json(
            createValidationError("server", "Internal server error"),
            { status: 500 }
        )
    }
}

async function handleTokenRefresh(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer")) {
            return NextResponse.json(
                createValidationError("authorization", "Missing or invalid auth header"),
                { status: 401 }
            )
        }

        const refreshToken = authHeader.substring(7);

        return forwardToBackend("token/refresh", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${refreshToken}`,
            }
        })
    } catch {
        return NextResponse.json(
            createValidationError("server", "Internal server error"),
            { status: 500 }
        )
    }
}


async function handlePasswordRecovery(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = passwordRecoverySchema.parse(body);

        return forwardToBackend("password/recovery", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(validatedData),
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            const detail = error.issues.map(err => ({
                loc: err.path,
                msg: err.message,
                type: err.code,
            }))
            return NextResponse.json({ detail }, { status: 422 })
        }
        return NextResponse.json(
            createValidationError("server", "Internal server error"),
            { status: 500 }
        )
    }
}
async function handlePasswordReset(req: NextRequest) {
    try {
        const body = await req.json();
        const validatedData = passwordResetSchema.parse(body);

        return forwardToBackend("password/recovery", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(validatedData),
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            const detail = error.issues.map(err => ({
                loc: err.path,
                msg: err.message,
                type: err.code,
            }))
            return NextResponse.json({ detail }, { status: 422 })
        }
        return NextResponse.json(
            createValidationError("server", "Internal server error"),
            { status: 500 }
        )
    }
}

async function handleLogout(req: NextRequest) {
    try {
        const authHeader = req.headers.get("Authorization");
        const headers: Record<string, string> = {};

        if (authHeader && authHeader.startsWith("Bearer")) {
            headers["Authorization"] = authHeader;
        }

        return forwardToBackend("logout", {
            method: "POST",
            headers,
        })
    } catch {
        return NextResponse.json(
            createValidationError("server", "Internal server error"),
            { status: 500 }
        )
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { all: string[] } }
) {
    const route = params.all.join("/")

    switch (route) {
        case "login":
            return handleLogin(req)
        case "register":
            return handleRegister(req)
        case "token/refresh":
            return handleTokenRefresh(req)
        case "password/recovery":
            return handlePasswordRecovery(req)
        case "password/reset":
            return handlePasswordReset(req)
        case "logout":
            return handleLogout(req)
        default:
            return NextResponse.json(
                createValidationError("route", "Route not found"),
                { status: 404 }
            )
    }
}