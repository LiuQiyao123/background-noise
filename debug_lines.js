const fs = require('fs');
const path = 'H:\\DevTools\\WNMP\\www\\background-noise\\frontend\\src\\pages\\CreateMemoryPage.tsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

// Show lines around errors
[379, 380, 383, 454, 455, 456, 547, 548, 574, 575].forEach(i => {
  if (i < lines.length) {
    const line = lines[i];
    // Check for invisible/weird chars
    let weird = '';
    for (let j = 0; j < line.length; j++) {
      const code = line.charCodeAt(j);
      if (code < 32 && code !== 10 && code !== 13) weird += `[U+${code.toString(16)}]`;
      if (code >= 0xFE00 && code <= 0xFE0F) weird += `[VS${code - 0xFE00}]`;
      if (code === 0xFFFD) weird += '[BAD]';
    }
    console.log(`Line ${i+1}: ${line.substring(0, 100)}`);
    if (weird) console.log(`  WEIRD: ${weird}`);
  }
});
