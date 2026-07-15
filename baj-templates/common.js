// Shared helpers for BAJ editable templates
(function (global) {
  function byId(id) { return document.getElementById(id); }

  function bindFields(fieldIds) {
    fieldIds.forEach(function (id) {
      var input = byId(id);
      if (!input) return;
      var targets = document.querySelectorAll('[data-bind="' + id + '"]');
      function sync() {
        var value = input.value || '';
        targets.forEach(function (node) {
          if (node.tagName === 'IMG') return;
          if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') node.value = value;
          else node.textContent = value;
        });
      }
      input.addEventListener('input', sync);
      input.addEventListener('change', sync);
      sync();
    });
  }

  function collectData(fieldIds) {
    var data = {};
    fieldIds.forEach(function (id) {
      var el = byId(id);
      if (el) data[id] = el.value;
    });
    return data;
  }

  function applyData(data) {
    if (!data || typeof data !== 'object') return;
    Object.keys(data).forEach(function (id) {
      var el = byId(id);
      if (!el) return;
      el.value = data[id];
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function exportJson(fieldIds, filename) {
    var blob = new Blob([JSON.stringify(collectData(fieldIds), null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'template-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(file, onDone) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        applyData(data);
        if (onDone) onDone(data);
      } catch (err) {
        alert('JSON parse error: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  async function downloadPdf(sheetSelector, filename) {
    var sheet = document.querySelector(sheetSelector || '#sheet');
    if (!sheet) { alert('Preview sheet not found'); return; }
    if (!window.html2canvas || !window.jspdf) { alert('PDF libraries not loaded'); return; }
    var canvas = await html2canvas(sheet, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false });
    var imgData = canvas.toDataURL('image/jpeg', 0.95);
    var pdf = new window.jspdf.jsPDF({
      orientation: canvas.width > canvas.height ? 'l' : 'p',
      unit: 'mm',
      format: 'a4'
    });
    var pageWidth = pdf.internal.pageSize.getWidth();
    var pageHeight = pdf.internal.pageSize.getHeight();
    var imgWidth = pageWidth;
    var imgHeight = (canvas.height * imgWidth) / canvas.width;
    if (imgHeight > pageHeight) {
      imgHeight = pageHeight;
      imgWidth = (canvas.width * imgHeight) / canvas.height;
    }
    var x = (pageWidth - imgWidth) / 2;
    pdf.addImage(imgData, 'JPEG', x, 0, imgWidth, imgHeight);
    pdf.save(filename || 'document.pdf');
  }

  function wireCommonActions(options) {
    var fieldIds = options.fieldIds || [];
    var jsonName = options.jsonName || 'data.json';
    var pdfName = options.pdfName || 'document.pdf';
    var sheetSelector = options.sheetSelector || '#sheet';
    var afterImport = options.afterImport || null;
    bindFields(fieldIds);
    var btnPrint = byId('btn-print');
    var btnPdf = byId('btn-pdf');
    var btnExport = byId('btn-export');
    var btnImport = byId('btn-import');
    var fileImport = byId('file-import');
    if (btnPrint) btnPrint.addEventListener('click', function () { window.print(); });
    if (btnPdf) btnPdf.addEventListener('click', function () { downloadPdf(sheetSelector, pdfName); });
    if (btnExport) btnExport.addEventListener('click', function () { exportJson(fieldIds, jsonName); });
    if (btnImport && fileImport) {
      btnImport.addEventListener('click', function () { fileImport.click(); });
      fileImport.addEventListener('change', function () {
        if (fileImport.files && fileImport.files[0]) {
          importJson(fileImport.files[0], afterImport);
          fileImport.value = '';
        }
      });
    }
  }

  global.BajTemplate = {
    byId: byId,
    bindFields: bindFields,
    collectData: collectData,
    applyData: applyData,
    exportJson: exportJson,
    importJson: importJson,
    downloadPdf: downloadPdf,
    wireCommonActions: wireCommonActions
  };
})(window);
