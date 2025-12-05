import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Theme configuration based on UI schema color scheme
export const theme = {
  colors: {
    // Primary colors
    background: {
      main: "#EEEEF4",
      surface: "#FFFFFF",
      light: {
        level1: "#F0F0F0",
        level2: "#FAFAFA",
      },
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#646E78",
      disabled: "#9696A0",
    },
    accent: {
      success: "#5AC800",
      info: "#0A1428",
      highlight: "#04DCB4",
      warning: "#F59E0B",
      error: "#DC2626",
    },
    border: {
      light: "#DCDCE6",
      medium: "#B4B4BE",
      dark: "#828C96",
    },
    neutral: {
      50: "#FAFAFA",
      100: "#F0F0F0",
      200: "#E6E6E6",
      300: "#DCDCE6",
      400: "#C8C8C8",
      500: "#B4B4BE",
      600: "#9696A0",
      700: "#828C96",
      800: "#646E78",
      900: "#283246",
    },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
    "3xl": "64px",
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  shadows: {
    sm: {
      color: "rgba(10, 20, 40, 0.08)",
      offset: "0px 1px",
      blur: "3px",
    },
    md: {
      color: "rgba(10, 20, 40, 0.12)",
      offset: "0px 4px",
      blur: "12px",
    },
    lg: {
      color: "rgba(10, 20, 40, 0.16)",
      offset: "0px 8px",
      blur: "24px",
    },
  },
  typography: {
    fontFamily: {
      primary: "Inter, system-ui, -apple-system, sans-serif",
      mono: "JetBrains Mono, Consolas, monospace",
    },
    scale: {
      xs: {
        fontSize: "12px",
        lineHeight: "16px",
        fontWeight: "400",
      },
      sm: {
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: "400",
      },
      base: {
        fontSize: "16px",
        lineHeight: "24px",
        fontWeight: "400",
      },
      lg: {
        fontSize: "18px",
        lineHeight: "28px",
        fontWeight: "400",
      },
      xl: {
        fontSize: "20px",
        lineHeight: "30px",
        fontWeight: "400",
      },
      "2xl": {
        fontSize: "24px",
        lineHeight: "34px",
        fontWeight: "600",
      },
      "3xl": {
        fontSize: "30px",
        lineHeight: "40px",
        fontWeight: "600",
      },
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

// CSS custom properties for theme
export const cssVars = {
  "--color-background-main": theme.colors.background.main,
  "--color-background-surface": theme.colors.background.surface,
  "--color-background-light-1": theme.colors.background.light.level1,
  "--color-background-light-2": theme.colors.background.light.level2,

  "--color-text-primary": theme.colors.text.primary,
  "--color-text-secondary": theme.colors.text.secondary,
  "--color-text-disabled": theme.colors.text.disabled,

  "--color-accent-success": theme.colors.accent.success,
  "--color-accent-info": theme.colors.accent.info,
  "--color-accent-highlight": theme.colors.accent.highlight,
  "--color-accent-warning": theme.colors.accent.warning,
  "--color-accent-error": theme.colors.accent.error,

  "--color-border-light": theme.colors.border.light,
  "--color-border-medium": theme.colors.border.medium,
  "--color-border-dark": theme.colors.border.dark,

  "--spacing-xs": theme.spacing.xs,
  "--spacing-sm": theme.spacing.sm,
  "--spacing-md": theme.spacing.md,
  "--spacing-lg": theme.spacing.lg,
  "--spacing-xl": theme.spacing.xl,
  "--spacing-2xl": theme.spacing["2xl"],
  "--spacing-3xl": theme.spacing["3xl"],

  "--border-radius-sm": theme.borderRadius.sm,
  "--border-radius-md": theme.borderRadius.md,
  "--border-radius-lg": theme.borderRadius.lg,
  "--border-radius-xl": theme.borderRadius.xl,
  "--border-radius-full": theme.borderRadius.full,

  "--shadow-sm": `0px 1px 3px ${theme.shadows.sm.color}`,
  "--shadow-md": `0px 4px 12px ${theme.shadows.md.color}`,
  "--shadow-lg": `0px 8px 24px ${theme.shadows.lg.color}`,

  "--font-primary": theme.typography.fontFamily.primary,
  "--font-mono": theme.typography.fontFamily.mono,
};

// Type definitions
export interface ThemeColors {
  background: {
    main: string;
    surface: string;
    light: {
      level1: string;
      level2: string;
    };
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  accent: {
    success: string;
    info: string;
    highlight: string;
    warning: string;
    error: string;
  };
  border: {
    light: string;
    medium: string;
    dark: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}