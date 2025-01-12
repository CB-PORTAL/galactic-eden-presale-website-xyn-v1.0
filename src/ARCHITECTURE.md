# XYN Presale - Complete Project Architecture

## Root Directory
```
xyn-presale/
├── .next/                               # Build directory (auto-generated)
├── .env.local                           # Environment variables
├── .eslintrc.json                       # ESLint configuration
├── .gitignore                           # Git ignore rules
├── devnet-test.json                     # Devnet testing config
├── next-env.d.ts                        # Next.js TypeScript definitions
├── next.config.js                       # Next.js configuration
├── package.json                         # Project dependencies
├── postcss.config.mjs                   # PostCSS configuration
├── README.md                            # Project documentation
├── settings.json                        # Project settings
├── solana-install-init.exe              # Solana installer
├── tailwind.config.ts                   # Tailwind CSS configuration
└── tsconfig.json                        # TypeScript configuration
```

## Public Assets
```
public/
├── images/
│   └── xyn-logo.png                     # Project logo
├── file.svg                             # UI icon
├── globe.svg                            # UI icon
├── next.svg                             # Next.js logo
├── phantom.svg                          # Phantom wallet icon
├── solflare.svg                         # Solflare wallet icon
├── vercel.svg                           # Vercel logo
├── window.svg                           # UI icon
└── xyn-logo.svg                         # Vector logo
```

## Source Code
```
src/
├── app/                                # Next.js App Directory
│   ├── api/
│   │   └── distribute/
│   │       └── route.ts               # Token distribution API (DO NOT MODIFY)
│   ├── fonts/                         # Custom fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── favicon.ico                    # Site favicon
│   ├── globals.css                    # Global styles
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Main page
│   └── providers.tsx                  # Context providers
```

## Components (With Status)
```
src/components/
├── animations/                         # Animation Components
│   ├── EnhancedPortal.tsx             # Not in use
│   ├── HologramEffect.tsx             # Not in use
│   ├── ParticleField.tsx              # Not in use
│   └── PortalAnimation.tsx            # Not in use
├── divine/
│   └── HeavenlyPortal.tsx             # Not in use
├── layout/
│   └── BaseLayout.tsx                 # Not in use
├── monitoring/
│   ├── FeeVisualizer.tsx              # Not in use
│   └── WalletMonitor.tsx              # Not in use
├── portal/
│   ├── ExchangeInterface.tsx          # Not in use
│   ├── ImmersivePortal.tsx            # Not in use
│   ├── PortalStatus.tsx               # Not in use
│   └── TokenMetrics.tsx               # Not in use
├── presale/
│   ├── PresaleInfo.tsx                # Not in use
│   └── PurchaseInterface.tsx          # DO NOT MODIFY - Working backend
├── ui/
│   ├── CyberButton.tsx                # Not in use
│   ├── CyberInput.tsx                 # Not in use
│   ├── MetricCard.tsx                 # Not in use
│   └── ProgressBar.tsx                # Not in use
├── wallet/
│   └── ConnectButton.tsx              # Active - needs styling
└── GalacticPortal.tsx                 # Main component - needs fixing
```

## Core Backend (DO NOT MODIFY)
```
src/
├── config/
│   └── presale.ts                     # Presale configuration
├── hooks/
│   ├── useFeeCalculator.ts            # Fee calculations
│   ├── usePortalState.ts              # Portal state
│   ├── usePresale.ts                  # Core presale logic
│   ├── usePresalePurchase.ts          # Purchase handling
│   └── useTokenExchange.ts            # Token exchange logic
└── types/
    └── global.d.ts                    # TypeScript definitions
```

## Critical Files - DO NOT MODIFY
- `src/components/presale/PurchaseInterface.tsx` - Working transaction logic
- `src/config/presale.ts` - Working configurations
- `src/hooks/usePresale.ts` - Working presale logic
- `src/hooks/useTokenExchange.ts` - Working exchange logic
- `src/app/api/distribute/route.ts` - Working distribution endpoint

## Safe to Modify
- All UI components except those marked "DO NOT MODIFY"
- Animation components
- Layout components
- Styling files

## Next Steps
1. Fix file import paths in `page.tsx`
2. Clean up unused component files
3. Create unified portal interface
4. Style existing components