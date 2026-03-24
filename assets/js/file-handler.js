// file-handler.js - Xử lý upload và export file

// Đọc file TXT
function readTXTFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => callback(e.target.result);
    reader.onerror = () => callback('');
    reader.readAsText(file, 'UTF-8');
}

// Đọc file DOCX (cần JSZip)
function readDOCXFile(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        JSZip.loadAsync(arrayBuffer).then(zip => {
            const documentXml = zip.file("word/document.xml");
            if (documentXml) {
                documentXml.async("string").then(xml => {
                    const text = xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                    callback(text);
                });
            } else callback('');
        }).catch(() => callback(''));
    };
    reader.readAsArrayBuffer(file);
}

// Xuất JSON
function exportToJSON(data, filename) {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    saveAs(blob, filename);
}

// Xuất TXT
function exportToTXT(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, filename);
}

// Xuất DOCX (tạo file docx đơn giản)
function exportToDOCX(content, filename) {
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, filename);
}

// Xuất PNG (cần html2canvas)
function exportToPNG(element, filename) {
    html2canvas(element).then(canvas => {
        canvas.toBlob(blob => {
            saveAs(blob, filename);
        });
    });
}