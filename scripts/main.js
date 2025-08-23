// Main JavaScript file


function goToPage() {
  const select = document.getElementById('page-select');
  const page = select.value;
  window.location.href = page;
}