document.addEventListener('DOMContentLoaded', () => {
    startRecognition();
  });
  
  function toggleInstructions() {
    var instructions = document.getElementById('instructionsPanel');
    if (instructions.style.display === 'none') {
      instructions.style.display = 'block';
    } else {
      instructions.style.display = 'none';
    }
  }
  
  function recuperarEstadosDeDispositivos() {
    fetch('https://6669e8182e964a6dfed713ee.mockapi.io/casa')
        .then(response => response.json())
        .then(data => {
            const estadoFinal = procesarDatosParaEstadoFinal(data);
            actualizarUIConEstado(estadoFinal);
        })
        .catch(error => console.error('Error al recuperar estados:', error));
  }
  
  function procesarDatosParaEstadoFinal(data) {
    // Objeto para almacenar el último estado válido de cada dispositivo
    const estado = {
        luzRecamara: getUltimoEstado(data, "luz de la recámara"),
        ventiladorRecamara: getUltimoEstado(data, "ventilador"),
        luzSala: getUltimoEstado(data, "luz de la sala"),
        cortinasSala: getUltimoEstado(data, "cortinas"),
        luzJardin: getUltimoEstado(data, "luz del jardín"),
        camarasSeguridad: getUltimoEstado(data, "cámaras de seguridad"),
        alarmaSeguridad: getUltimoEstado(data, "alarma de la casa")
    };
  
    return estado;
  }
  
  function getUltimoEstado(data, tipoDispositivo) {
    // Invertimos el array para buscar desde el último al primero
    const reversedData = data.slice().reverse();
    const encontrado = reversedData.find(cmd => cmd.comando.includes(tipoDispositivo));
    console.log(`Último estado para ${tipoDispositivo}: ${encontrado ? encontrado.comando : 'No encontrado'}`);
    return encontrado ? encontrado.comando.includes("enciende") : false;
  }
  
  function procesarDatosParaEstadoFinal(data) {
    const estado = {
        luzRecamara: getUltimoEstado(data, "luz de la recámara"),
        ventiladorRecamara: getUltimoEstado(data, "ventilador"),
        luzSala: getUltimoEstado(data, "luz de la sala"),
        cortinasSala: getUltimoEstado(data, "cortinas"),
        luzJardin: getUltimoEstado(data, "luz del jardín"),
        camarasSeguridad: getUltimoEstado(data, "cámaras de seguridad"),
        alarmaSeguridad: getUltimoEstado(data, "alarma de la casa")
    };
    console.log('Estado final procesado:', estado);
    return estado;
  }
  
  
  function actualizarUIConEstado(estado) {
    document.getElementById('recamaraStatus').textContent = `Luz ${estado.luzRecamara ? 'prendida' : 'apagada'}, Ventilador ${estado.ventiladorRecamara ? 'encendido' : 'apagado'}`;
    document.getElementById('salaStatus').textContent = `Luz ${estado.luzSala ? 'prendida' : 'apagada'}, Cortinas ${estado.cortinasSala ? 'abiertas' : 'cerradas'}`;
    document.getElementById('jardinStatus').textContent = `Luz ${estado.luzJardin ? 'prendida' : 'apagada'}`;
    document.getElementById('seguridadStatus').textContent = `Cámaras ${estado.camarasSeguridad ? 'activadas' : 'desactivadas'}, Alarma ${estado.alarmaSeguridad ? 'activada' : 'desactivada'}`;
  }
  
  
  
  let esperandoToto = true; // Estado inicial, esperando que se diga "Alexa"
  let usuario = "Perla";
  
  const estados = {
    recamara: { luz: false, ventilador: false },
    sala: { luz: false, cortinas: false },
    jardin: { luz: false },
    seguridad: { camaras: false, alarma: false }
  };
  
  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.interimResults = false;
  recognition.continuous = true; // Continúa escuchando sin parar
  
  recognition.onresult = function(event) {
    const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
    console.log("Oído: " + transcript);
  
    if (esperandoToto && transcript.includes('toto')) {
        esperandoToto = false;
        document.getElementById('status').textContent = 'Di un comando.';
        console.log('Toto activada, esperando comando.');
    } else if (!esperandoToto) {
        procesarComando(transcript);
        esperandoToto = true; // Restablece para esperar "Alexa" de nuevo
    }
  };
  
  recognition.onerror = function(event) {
    console.error('Error en el reconocimiento de voz:', event.error);
    document.getElementById('status').textContent = 'Error de reconocimiento: ' + event.error;
    startRecognition(); // Reintentar iniciar el reconocimiento
  };
  
  function procesarComando(comando) {
    if (actualizarEstado(comando)) {
        enviarComandoAPI(comando);
        document.getElementById('status').textContent = 'Comando reconocido: ' + comando + '. Di "Toto" para seguir.';
    } else {
        document.getElementById('status').textContent = 'Comando no reconocido. Di "Toto" para intentar de nuevo.';
    }
  }
  
  function actualizarEstado(comando) {
    const accion = comando.includes("enciende");
    let actualizado = false;
  
    if (comando.includes("luz de la recámara")) {
        estados.recamara.luz = accion;
        actualizado = true;
    } else if (comando.includes("ventilador")) {
        estados.recamara.ventilador = accion;
        actualizado = true;
    } else if (comando.includes("luz de la sala")) {
        estados.sala.luz = accion;
        actualizado = true;
    } else if (comando.includes("cortinas")) {
        estados.sala.cortinas = accion;
        actualizado = true;
    } else if (comando.includes("luz del jardín")) {
        estados.jardin.luz = accion;
        actualizado = true;
    } else if (comando.includes("cámaras de seguridad")) {
        estados.seguridad.camaras = accion;
        actualizado = true;
    } else if (comando.includes("alarma de la casa")) {
        estados.seguridad.alarma = accion;
        actualizado = true;
    }
  
    if (actualizado) {
        actualizarUI(); // Actualizar la interfaz de usuario con los nuevos estados
        return true;
    }
    return false;
  }
  
  function actualizarUI() {
    document.getElementById('recamaraStatus').textContent = `Luz ${estados.recamara.luz ? 'prendida' : 'apagada'}, Ventilador ${estados.recamara.ventilador ? 'encendido' : 'apagado'}`;
    document.getElementById('salaStatus').textContent = `Luz ${estados.sala.luz ? 'prendida' : 'apagada'}, Cortinas ${estados.sala.cortinas ? 'abiertas' : 'cerradas'}`;
    document.getElementById('jardinStatus').textContent = `Luz ${estados.jardin.luz ? 'prendida' : 'apagada'}`;
    document.getElementById('seguridadStatus').textContent = `Cámaras ${estados.seguridad.camaras ? 'activadas' : 'desactivadas'}, Alarma ${estados.seguridad.alarma ? 'activada' : 'desactivada'}`;
  }
  
  
  function enviarComandoAPI(comando) {
    const ahora = new Date();
    const fechaHora = ahora.toLocaleDateString('es-MX', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    }) + ' ' + ahora.toLocaleTimeString('es-MX', {
      hour: '2-digit', 
      minute: '2-digit'
    });
  
    const datos = {
        usuario: usuario,
        comando: comando,
        fechaHora: fechaHora
    };
  
    console.log('Enviando datos:', datos);
  
    fetch('https://6669e8182e964a6dfed713ee.mockapi.io/casa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
    })
    .then(response => response.json())
    .then(data => console.log('Comando enviado:', data))
    .catch(error => console.error('Error al enviar comando:', error));
  }
  
  function startRecognition() {
    console.log('Iniciando reconocimiento de voz...');
    recognition.start();
  }
  