const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// OFFOUT Logo SVG - Adult orange dog with golden crown on orange gradient background
const logoSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stopColor="#FFB74D"/>
      <stop offset="100%" stopColor="#F57C00"/>
    </radialGradient>
    <radialGradient id="head" cx="38%" cy="32%" r="65%">
      <stop offset="0%" stopColor="#FFB347"/>
      <stop offset="100%" stopColor="#FF8C00"/>
    </radialGradient>
    <radialGradient id="body" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stopColor="#FFB347"/>
      <stop offset="100%" stopColor="#FF8C00"/>
    </radialGradient>
    <filter id="shadow"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background circle -->
  <circle cx="256" cy="256" r="250" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="250" fill="rgba(255,255,255,0.08)"/>
  
  <!-- Subtle ring -->
  <circle cx="256" cy="256" r="245" fill="none" stroke="rgba(255,215,0,0.3)" stroke-width="3"/>

  <!-- Golden aura -->
  <ellipse cx="256" cy="270" rx="170" ry="150" fill="none" stroke="rgba(255,215,0,0.15)" stroke-width="4" filter="url(#glow)"/>

  <!-- Shadow -->
  <ellipse cx="256" cy="430" rx="80" ry="12" fill="rgba(0,0,0,0.1)" filter="url(#shadow)"/>

  <!-- Tail -->
  <g>
    <path d="M330,320 Q380,280 370,240" stroke="#E67600" stroke-width="18" fill="none" stroke-linecap="round"/>
    <path d="M330,320 Q380,280 370,240" stroke="#FFB347" stroke-width="10" fill="none" stroke-linecap="round"/>
  </g>

  <!-- Body -->
  <ellipse cx="256" cy="340" rx="85" ry="100" fill="url(#body)"/>
  <ellipse cx="256" cy="355" rx="65" ry="75" fill="#FFF8F0"/>

  <!-- Back paws -->
  <ellipse cx="210" cy="428" rx="22" ry="14" fill="#FF8C00"/>
  <ellipse cx="302" cy="428" rx="22" ry="14" fill="#FF8C00"/>
  
  <!-- Front paws -->
  <ellipse cx="220" cy="415" rx="20" ry="14" fill="#FF8C00"/>
  <ellipse cx="292" cy="415" rx="20" ry="14" fill="#FF8C00"/>

  <!-- Head -->
  <circle cx="256" cy="210" r="80" fill="url(#head)"/>
  <circle cx="248" cy="195" r="25" fill="white" opacity="0.1"/>

  <!-- Ears -->
  <ellipse cx="185" cy="195" rx="22" ry="40" fill="#FF8C00" transform="rotate(18,185,195)"/>
  <ellipse cx="327" cy="195" rx="22" ry="40" fill="#FF8C00" transform="rotate(-18,327,195)"/>
  <ellipse cx="187" cy="198" rx="13" ry="28" fill="#FFB6C1" transform="rotate(18,187,198)"/>
  <ellipse cx="325" cy="198" rx="13" ry="28" fill="#FFB6C1" transform="rotate(-18,325,198)"/>

  <!-- Eyes - big kawaii -->
  <!-- Left eye -->
  <ellipse cx="232" cy="205" rx="16" ry="17" fill="white" stroke="#777" stroke-width="1"/>
  <circle cx="232" cy="207" r="11" fill="#FF6D00"/>
  <circle cx="232" cy="207" r="10.5" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="0.8"/>
  <circle cx="232" cy="209" r="5.5" fill="#111"/>
  <ellipse cx="228" cy="201" rx="4" ry="5" fill="white" opacity="0.95"/>
  <circle cx="237" cy="212" r="2" fill="white" opacity="0.7"/>
  <ellipse cx="232" cy="196" rx="17" ry="6" fill="rgba(0,0,0,0.06)"/>

  <!-- Right eye -->
  <ellipse cx="280" cy="205" rx="16" ry="17" fill="white" stroke="#777" stroke-width="1"/>
  <circle cx="280" cy="207" r="11" fill="#FF6D00"/>
  <circle cx="280" cy="207" r="10.5" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="0.8"/>
  <circle cx="280" cy="209" r="5.5" fill="#111"/>
  <ellipse cx="276" cy="201" rx="4" ry="5" fill="white" opacity="0.95"/>
  <circle cx="285" cy="212" r="2" fill="white" opacity="0.7"/>
  <ellipse cx="280" cy="196" rx="17" ry="6" fill="rgba(0,0,0,0.06)"/>

  <!-- Nose -->
  <ellipse cx="256" cy="228" rx="7" ry="5" fill="#FF6B8A"/>

  <!-- Happy mouth -->
  <path d="M244,235 Q250,243 256,238 Q262,243 268,235" stroke="#555" stroke-width="2" fill="none"/>

  <!-- Tongue -->
  <ellipse cx="256" cy="244" rx="6" ry="8" fill="#F48FB1"/>

  <!-- Blush -->
  <ellipse cx="210" cy="225" rx="14" ry="8" fill="#FFB6C1" opacity="0.5"/>
  <ellipse cx="302" cy="225" rx="14" ry="8" fill="#FFB6C1" opacity="0.5"/>

  <!-- Crown -->
  <g transform="translate(230, 110) scale(1.8)">
    <path d="M3,18 L3,7 L9,13 L15,2 L21,13 L27,7 L27,18 Z" fill="#FFD700" stroke="#DAA520" stroke-width="1.2"/>
    <rect x="3" y="15" width="24" height="5" rx="1.5" fill="#FFC107"/>
    <circle cx="9" cy="11" r="2.5" fill="#E91E63"/><circle cx="9" cy="11" r="1" fill="#FCE4EC"/>
    <circle cx="15" cy="6" r="3" fill="#2196F3"/><circle cx="15" cy="6" r="1.2" fill="#E3F2FD"/>
    <circle cx="21" cy="11" r="2.5" fill="#4CAF50"/><circle cx="21" cy="11" r="1" fill="#E8F5E9"/>
    <circle cx="15" cy="17.5" r="2" fill="#FF9800"/>
  </g>

  <!-- Sparkles -->
  <text x="130" y="155" font-size="20" opacity="0.6">✨</text>
  <text x="365" y="175" font-size="16" opacity="0.5">✨</text>
  <text x="150" y="310" font-size="14" opacity="0.4">✨</text>
</svg>
`;

// Maskable version - dog centered with safe padding
const maskableSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bg2" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stopColor="#FFB74D"/>
      <stop offset="100%" stopColor="#F57C00"/>
    </radialGradient>
    <radialGradient id="head2" cx="38%" cy="32%" r="65%">
      <stop offset="0%" stopColor="#FFB347"/>
      <stop offset="100%" stopColor="#FF8C00"/>
    </radialGradient>
    <radialGradient id="body2" cx="40%" cy="35%" r="60%">
      <stop offset="0%" stopColor="#FFB347"/>
      <stop offset="100%" stopColor="#FF8C00"/>
    </radialGradient>
  </defs>

  <!-- Full background for maskable -->
  <rect width="512" height="512" fill="url(#bg2)"/>

  <!-- Dog centered with safe zone padding -->
  <!-- Shadow -->
  <ellipse cx="256" cy="420" rx="70" ry="10" fill="rgba(0,0,0,0.08)"/>

  <!-- Tail -->
  <path d="M330,310 Q375,275 365,240" stroke="#E67600" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M330,310 Q375,275 365,240" stroke="#FFB347" stroke-width="9" fill="none" stroke-linecap="round"/>

  <!-- Body -->
  <ellipse cx="256" cy="330" rx="78" ry="90" fill="url(#body2)"/>
  <ellipse cx="256" cy="343" rx="58" ry="68" fill="#FFF8F0"/>

  <!-- Paws -->
  <ellipse cx="215" cy="405" rx="18" ry="12" fill="#FF8C00"/>
  <ellipse cx="297" cy="405" rx="18" ry="12" fill="#FF8C00"/>
  <ellipse cx="208" cy="415" rx="20" ry="12" fill="#FF8C00"/>
  <ellipse cx="304" cy="415" rx="20" ry="12" fill="#FF8C00"/>

  <!-- Head -->
  <circle cx="256" cy="205" r="72" fill="url(#head2)"/>
  <circle cx="249" cy="192" r="22" fill="white" opacity="0.1"/>

  <!-- Ears -->
  <ellipse cx="192" cy="192" rx="20" ry="36" fill="#FF8C00" transform="rotate(18,192,192)"/>
  <ellipse cx="320" cy="192" rx="20" ry="36" fill="#FF8C00" transform="rotate(-18,320,192)"/>
  <ellipse cx="194" cy="195" rx="12" ry="25" fill="#FFB6C1" transform="rotate(18,194,195)"/>
  <ellipse cx="318" cy="195" rx="12" ry="25" fill="#FFB6C1" transform="rotate(-18,318,195)"/>

  <!-- Left eye -->
  <ellipse cx="234" cy="202" rx="14" ry="15" fill="white" stroke="#777" stroke-width="1"/>
  <circle cx="234" cy="204" r="10" fill="#FF6D00"/>
  <circle cx="234" cy="206" r="5" fill="#111"/>
  <ellipse cx="230" cy="199" rx="3.5" ry="4.5" fill="white" opacity="0.95"/>
  <circle cx="239" cy="208" r="1.8" fill="white" opacity="0.7"/>

  <!-- Right eye -->
  <ellipse cx="278" cy="202" rx="14" ry="15" fill="white" stroke="#777" stroke-width="1"/>
  <circle cx="278" cy="204" r="10" fill="#FF6D00"/>
  <circle cx="278" cy="206" r="5" fill="#111"/>
  <ellipse cx="274" cy="199" rx="3.5" ry="4.5" fill="white" opacity="0.95"/>
  <circle cx="283" cy="208" r="1.8" fill="white" opacity="0.7"/>

  <!-- Nose -->
  <ellipse cx="256" cy="224" rx="6" ry="4.5" fill="#FF6B8A"/>

  <!-- Mouth -->
  <path d="M246,230 Q251,237 256,233 Q261,237 266,230" stroke="#555" stroke-width="1.8" fill="none"/>

  <!-- Tongue -->
  <ellipse cx="256" cy="238" rx="5" ry="7" fill="#F48FB1"/>

  <!-- Blush -->
  <ellipse cx="214" cy="220" rx="12" ry="7" fill="#FFB6C1" opacity="0.5"/>
  <ellipse cx="298" cy="220" rx="12" ry="7" fill="#FFB6C1" opacity="0.5"/>

  <!-- Crown -->
  <g transform="translate(234, 108) scale(1.6)">
    <path d="M3,18 L3,7 L9,13 L15,2 L21,13 L27,7 L27,18 Z" fill="#FFD700" stroke="#DAA520" stroke-width="1.2"/>
    <rect x="3" y="15" width="24" height="5" rx="1.5" fill="#FFC107"/>
    <circle cx="9" cy="11" r="2.5" fill="#E91E63"/><circle cx="9" cy="11" r="1" fill="#FCE4EC"/>
    <circle cx="15" cy="6" r="3" fill="#2196F3"/><circle cx="15" cy="6" r="1.2" fill="#E3F2FD"/>
    <circle cx="21" cy="11" r="2.5" fill="#4CAF50"/><circle cx="21" cy="11" r="1" fill="#E8F5E9"/>
    <circle cx="15" cy="17.5" r="2" fill="#FF9800"/>
  </g>
</svg>
`;

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'client', 'public', 'icons');

async function generateIcons() {
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const size of SIZES) {
    // Generate regular icon
    await sharp(Buffer.from(logoSVG))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`✅ Generated icon-${size}x${size}.png`);

    // Generate maskable icon
    await sharp(Buffer.from(maskableSVG))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}-maskable.png`));
    console.log(`✅ Generated icon-${size}x${size}-maskable.png`);
  }

  // Generate favicon
  await sharp(Buffer.from(logoSVG))
    .resize(48, 48)
    .png()
    .toFile(path.join(__dirname, 'client', 'public', 'favicon.png'));
  console.log('✅ Generated favicon.png');

  // Generate logo192 and logo512 (for legacy CRA support)
  await sharp(Buffer.from(logoSVG))
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'client', 'public', 'logo192.png'));
  await sharp(Buffer.from(logoSVG))
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'client', 'public', 'logo512.png'));
  console.log('✅ Generated logo192.png and logo512.png');

  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);
