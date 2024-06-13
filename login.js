document.addEventListener('DOMContentLoaded', () => {
    startRecognition();
  });
  
  const PIN_CORRECTO = "0604";
  
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.continuous = true;
  
  recognition.onresult = function(event) {
    const transcript = event.results[event.resultIndex][0].transcript.trim().replace(/\D/g, '');
  
    if (transcript.length === 4) {
      document.getElementById('pinDisplay').textContent = transcript;
  
      if (transcript === PIN_CORRECTO) {
        document.getElementById('pinDisplay').className = 'pin-correct';
        document.getElementById('pinStatus').textContent = 'PIN correcto. Preparando acceso...';
        setTimeout(() => {
          recognition.stop();
          window.location.href = 'index.html'; // Redirecciona al usuario a la página principal
        }, 2000);
      } else {
        document.getElementById('pinDisplay').className = 'pin-incorrect';
        document.getElementById('pinStatus').textContent = 'PIN incorrecto. Intente de nuevo.';
        setTimeout(() => {
          document.getElementById('pinDisplay').textContent = '----';
          document.getElementById('pinDisplay').className = '';
          document.getElementById('pinStatus').textContent = 'Por favor, diga su PIN de 4 dígitos.';
        }, 2000);
      }
    }
  };
  
  recognition.onerror = function(event) {
    console.error('Error en el reconocimiento de voz:', event.error);
  };
  
  recognition.start();
  