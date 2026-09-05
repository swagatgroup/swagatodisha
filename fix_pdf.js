const fs = require('fs');
const file = '/home/chanchal/Desktop/Swagat Odisha/frontend/src/components/forms/ApplicationPDFGenerator.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. In createPDFContent, it should prioritize application.documents
const oldCreate = `documents: formData?.documents || {},`;
const newCreate = `documents: application?.documents || formData?.documents || {},`;
content = content.replace(oldCreate, newCreate);

// 2. In generateHTMLContent, we need to handle array OR object for documents
const oldMap = `\\$\\{Object.entries\\(content.documents \\|\\| \\{\\}\\).map\\(\\[key, doc\\] =>`;
// We will replace the entire mapping block for documents
const replaceRegex = /<div class="documents-grid">([\s\S]*?)<\/div>/;

const newDocumentsBlock = `<div class="documents-grid">
                \${(() => {
                    const docs = content.documents || {};
                    // If it's an array from the backend
                    if (Array.isArray(docs)) {
                        return docs.map(doc => {
                            const url = doc.filePath || doc.url || doc.downloadUrl;
                            const name = doc.documentType || doc.fileName || 'Document';
                            const title = (doc.documentType || 'Document').replace(/_/g, ' ').toUpperCase();
                            return \`<div class="document-item">
                                <div class="document-name">
                                    \${url ? \`<a href="\${url}" target="_blank" style="color: #4f46e5; text-decoration: underline;">\` : ''}
                                    \${title}
                                    \${url ? \`</a>\` : ''}
                                </div>
                                <div class="document-size">\${doc.fileName || doc.name || 'Uploaded'}</div>
                            </div>\`;
                        }).join('');
                    } 
                    // If it's an object from form data
                    else {
                        return Object.entries(docs).map(([key, doc]) => {
                            const url = doc.url || doc.downloadUrl || doc.filePath;
                            const title = key.replace(/_/g, ' ').toUpperCase();
                            return \`<div class="document-item">
                                <div class="document-name">
                                    \${url ? \`<a href="\${url}" target="_blank" style="color: #4f46e5; text-decoration: underline;">\` : ''}
                                    \${title}
                                    \${url ? \`</a>\` : ''}
                                </div>
                                <div class="document-size">\${doc.name || doc.fileName || 'Uploaded'} \${doc.size ? '(' + (doc.size / 1024).toFixed(1) + ' KB)' : ''}</div>
                            </div>\`;
                        }).join('');
                    }
                })()}
            </div>`;

content = content.replace(replaceRegex, newDocumentsBlock);

fs.writeFileSync(file, content);
console.log("Fixed ApplicationPDFGenerator documents mapping.");
