"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { authService, TokenStorage  } from "@/services/auth/auth-service";

interface LogoutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    showIcon?: boolean;
    showText?: boolean;
}

export const LogoutButton = ({ 
    variant = "ghost", 
    size = "default", 
    className = "",
    showIcon = true,
    showText = true 
}: LogoutButtonProps) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        
        try {
            console.log('Starting logout process...');
            
            await authService.logout();
            
            console.log('Logout successful, redirecting to login...');
            
            window.location.href = "/login";
            
        } catch (error) {
            console.error('Logout error:', error);
            
            console.log('Logout API failed, but clearing tokens anyway');
            TokenStorage.clearTokens();
            window.location.href = "/login";
            
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleLogout}
            disabled={isLoggingOut}
        >
            {isLoggingOut ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {showText && <span className="ml-2">Выход...</span>}
                </>
            ) : (
                <>
                    {showIcon && <LogOut className="h-4 w-4" />}
                    {showText && <span className={showIcon ? "ml-2" : ""}>Выйти</span>}
                </>
            )}
        </Button>
    );
};

export const LogoutMenuItem = ({ className = "" }: { className?: string }) => {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        
        try {
            await authService.logout();
            window.location.href = "/login";
        } catch (error) {
            console.error('Logout error:', error);
            TokenStorage.clearTokens();
            window.location.href = "/login";
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <div 
            className={`flex items-center px-2 py-2 text-sm cursor-pointer hover:bg-gray-100 ${className}`}
            onClick={handleLogout}
        >
            {isLoggingOut ? (
                <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Выход...
                </>
            ) : (
                <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Выйти
                </>
            )}
        </div>
    );
};