import type { DiffResult, JSONPatchOperation } from '@/types/studio';

/**
 * Export diff as JSON Patch (RFC 6902)
 */
export function exportJSONPatch(patch: JSONPatchOperation[]): void {
  const content = JSON.stringify(patch, null, 2);
  downloadFile('diff-patch.json', content, 'application/json');
}

/**
 * Export diff as HTML report
 */
export function exportDiffHTML(result: DiffResult, jsonA: string, jsonB: string): void {
  const html = generateDiffHTML(result, jsonA, jsonB);
  downloadFile('diff-report.html', html, 'text/html');
}

/**
 * Export diff as Markdown
 */
export function exportDiffMarkdown(result: DiffResult): void {
  const markdown = generateDiffMarkdown(result);
  downloadFile('diff-report.md', markdown, 'text/markdown');
}

/**
 * Download file to user's computer
 */
function downloadFile(filename: string, content: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate HTML diff report
 */
function generateDiffHTML(result: DiffResult, jsonA: string, jsonB: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON Diff Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: #0a0a0a;
      color: #c9c9d8;
      padding: 2rem;
      line-height: 1.6;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2rem; margin-bottom: 1rem; color: #e8e8f0; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    .stat-card {
      background: #1a1a1e;
      border: 1px solid #2d2d35;
      padding: 1.5rem;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    .stat-label {
      color: #88889a;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }
    .add { color: #00ff88; }
    .remove { color: #ff0066; }
    .modify { color: #ffaa00; }
    .move { color: #00ccff; }
    .changes {
      background: #1a1a1e;
      border: 1px solid #2d2d35;
      padding: 2rem;
      margin: 2rem 0;
    }
    .change {
      padding: 1rem;
      margin-bottom: 1rem;
      background: #242429;
      border-left: 3px solid;
    }
    .change.add { border-color: #00ff88; }
    .change.remove { border-color: #ff0066; }
    .change.modify { border-color: #ffaa00; }
    .change.move { border-color: #00ccff; }
    .change-type {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }
    .change-path {
      font-family: 'Courier New', monospace;
      color: #00ccff;
      margin-bottom: 0.5rem;
    }
    .change-value {
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      background: #121214;
      padding: 0.5rem;
      border-radius: 2px;
      overflow-x: auto;
    }
    pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; }
  </style>
</head>
<body>
  <div class="container">
    <h1>JSON Diff Report</h1>
    <p style="color: #88889a; margin-bottom: 2rem;">Generated on ${new Date().toLocaleString()}</p>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value add">${result.additions}</div>
        <div class="stat-label">Additions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value remove">${result.deletions}</div>
        <div class="stat-label">Deletions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value modify">${result.modifications}</div>
        <div class="stat-label">Modifications</div>
      </div>
      <div class="stat-card">
        <div class="stat-value move">${result.moves}</div>
        <div class="stat-label">Moves</div>
      </div>
    </div>

    <div class="changes">
      <h2 style="margin-bottom: 1.5rem;">Changes</h2>
      ${result.changes.map((change) => `
        <div class="change ${change.type}">
          <div class="change-type ${change.type}">${change.type}</div>
          <div class="change-path">${escapeHtml(change.path)}</div>
          ${change.oldValue !== undefined ? `
            <div class="change-value">
              <strong>Old:</strong> <pre>${escapeHtml(JSON.stringify(change.oldValue, null, 2))}</pre>
            </div>
          ` : ''}
          ${change.newValue !== undefined ? `
            <div class="change-value">
              <strong>New:</strong> <pre>${escapeHtml(JSON.stringify(change.newValue, null, 2))}</pre>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate Markdown diff report
 */
function generateDiffMarkdown(result: DiffResult): string {
  let markdown = '# JSON Diff Report\n\n';
  markdown += `Generated on ${new Date().toLocaleString()}\n\n`;
  markdown += '## Summary\n\n';
  markdown += `| Type | Count |\n`;
  markdown += `|------|-------|\n`;
  markdown += `| Additions | ${result.additions} |\n`;
  markdown += `| Deletions | ${result.deletions} |\n`;
  markdown += `| Modifications | ${result.modifications} |\n`;
  markdown += `| Moves | ${result.moves} |\n\n`;

  markdown += '## Changes\n\n';
  result.changes.forEach((change, index) => {
    markdown += `### ${index + 1}. ${change.type.toUpperCase()}\n\n`;
    markdown += `**Path:** \`${change.path}\`\n\n`;

    if (change.oldValue !== undefined) {
      markdown += '**Old Value:**\n```json\n';
      markdown += JSON.stringify(change.oldValue, null, 2);
      markdown += '\n```\n\n';
    }

    if (change.newValue !== undefined) {
      markdown += '**New Value:**\n```json\n';
      markdown += JSON.stringify(change.newValue, null, 2);
      markdown += '\n```\n\n';
    }
  });

  return markdown;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
