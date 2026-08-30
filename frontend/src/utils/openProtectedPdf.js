import axios from 'axios';

const PDF_ENDPOINT = 'http://localhost:8000/pdfs';

export const getPdfFilename = (source = '') => source.split('/').pop().split('\\').pop();

export async function fetchProtectedPdfUrl(source) {
  const filename = getPdfFilename(source);
  if (!filename) throw new Error('No document filename was provided.');

  const response = await axios.get(`${PDF_ENDPOINT}/${encodeURIComponent(filename)}`, {
    responseType: 'blob',
  });
  return URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
}

export async function openProtectedPdf(source) {
  const pdfWindow = window.open('', '_blank');
  let url;
  try {
    url = await fetchProtectedPdfUrl(source);
  } catch (error) {
    pdfWindow?.close();
    throw error;
  }

  if (pdfWindow) {
    pdfWindow.location.href = url;
  } else {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.click();
  }

  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
