import fs from 'fs' 
const filePath = 'coverage/lcov.info' 
let content = fs.readFileSync(filePath, 'utf-8') 
content = content.replace(/^SF:(.+)$/gm, (match, p1) => { const normalized = p1.replace(/\\/g, '/'); return `SF:frontend/${normalized}`; }); fs.writeFileSync(filePath, content); 
console.log('lcov.info paths fixed')