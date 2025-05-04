/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': 'hsl(var(--primary) / 0.05)',
  				'100': 'hsl(var(--primary) / 0.1)',
  				'200': 'hsl(var(--primary) / 0.2)',
  				'300': 'hsl(var(--primary) / 0.3)',
  				'400': 'hsl(var(--primary) / 0.4)',
  				'500': 'hsl(var(--primary) / 0.5)',
  				'600': 'hsl(var(--primary) / 0.6)',
  				'700': 'hsl(var(--primary) / 0.7)',
  				'800': 'hsl(var(--primary) / 0.8)',
  				'900': 'hsl(var(--primary) / 0.9)',
  				'950': 'hsl(var(--primary) / 0.95)',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': 'hsl(var(--secondary) / 0.05)',
  				'100': 'hsl(var(--secondary) / 0.1)',
  				'200': 'hsl(var(--secondary) / 0.2)',
  				'300': 'hsl(var(--secondary) / 0.3)',
  				'400': 'hsl(var(--secondary) / 0.4)',
  				'500': 'hsl(var(--secondary) / 0.5)',
  				'600': 'hsl(var(--secondary) / 0.6)',
  				'700': 'hsl(var(--secondary) / 0.7)',
  				'800': 'hsl(var(--secondary) / 0.8)',
  				'900': 'hsl(var(--secondary) / 0.9)',
  				'950': 'hsl(var(--secondary) / 0.95)',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
