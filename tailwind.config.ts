/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			custom: {
  				contentBg: 'var(--content-background)',
  				elementBg: 'var(--element-background)'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		animation: {
  			in: 'in 200ms ease-in-out',
  			out: 'out 200ms ease-in-out',
  			'slide-in-from-top': 'slide-in-from-top 200ms ease-in-out',
  			'slide-in-from-bottom': 'slide-in-from-bottom 200ms ease-in-out',
  			'slide-in-from-top-full': 'slide-in-from-top-full 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'collapsible-down': 'collapsible-down 150ms ease-out',
  			'collapsible-up': 'collapsible-up 150ms ease-out'
  		},
  		keyframes: {
  			in: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			out: {
  				'0%': {
  					opacity: '1'
  				},
  				'100%': {
  					opacity: '0'
  				}
  			},
  			'slide-in-from-top': {
  				'0%': {
  					transform: 'translateY(-100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-from-bottom': {
  				'0%': {
  					transform: 'translateY(100%)'
  				},
  				'100%': {
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-from-top-full': {
  				'0%': {
  					transform: 'translateY(-120%) translateX(-50%)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0) translateX(-50%)',
  					opacity: '1'
  				}
  			},
  			'collapsible-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-collapsible-content-height)' }
  			},
  			'collapsible-up': {
  				from: { height: 'var(--radix-collapsible-content-height)' },
  				to: { height: '0' }
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
