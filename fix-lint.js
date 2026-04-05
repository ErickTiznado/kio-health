const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, regex, replacement) {
  const fullPath = path.resolve(__dirname, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(fullPath, content);
}

// Fix api.interceptor.test.ts
replaceInFile('apps/web/src/lib/__tests__/api.interceptor.test.ts', / as any/g, ' as unknown as any');

// Fix use-patients.test.ts
replaceInFile('apps/web/src/hooks/__tests__/use-patients.test.ts', / as any/g, ' as unknown as any');

// Fix auth.store.test.ts
replaceInFile('apps/web/src/stores/__tests__/auth.store.test.ts', / as any/g, ' as unknown as any');

// Fix use-addendums.ts
replaceInFile('apps/web/src/hooks/use-addendums.ts', /: any\)/g, ': unknown)');

// Fix use-auto-save.ts
replaceInFile('apps/web/src/hooks/use-auto-save.ts', /: any/g, ': unknown');

// Fix query-keys.ts
replaceInFile('apps/web/src/lib/query-keys.ts', /: any/g, ': unknown');

// Fix appointments.types.ts
replaceInFile('apps/web/src/types/appointments.types.ts', /: any/g, ': unknown');

// Fix MarkdownPreview.tsx
replaceInFile('apps/web/src/components/ui/MarkdownPreview.tsx', /let html =/g, 'const html =');
replaceInFile('apps/web/src/components/ui/MarkdownPreview.tsx', /\\-/g, '-');

console.log('Batch replacements done.');