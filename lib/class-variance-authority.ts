import { clsx, type ClassValue } from "clsx"

export interface VariantProps<T> {
  [key: string]: any
}

export function cva(
  base: ClassValue,
  config?: {
    variants?: Record<string, Record<string, ClassValue>>
    defaultVariants?: Record<string, string>
  },
) {
  return (props?: Record<string, any>) => {
    if (!config?.variants) return clsx(base)

    const variants = Object.entries(config.variants).map(([key, variants]) => {
      const variant = props?.[key] || config.defaultVariants?.[key]
      return variants[variant]
    })

    return clsx(base, ...variants)
  }
}
