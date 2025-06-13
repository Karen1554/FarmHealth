class Bovino {
  constructor() {
    this.temperatura = 0;
    this.frecuenciaCardiaca = 0;
    this.humedad = 0;
    this.presion = 0;
  }

  actualizarDesdeAPI(data) {
    this.temperatura = parseFloat(data.field1) || 0;
    this.frecuenciaCardiaca = parseInt(data.field4) || 0;
    this.humedad = parseFloat(data.field2) || 0;
    this.presion = parseFloat(data.field3) || 0;
  }

  obtenerNivelEstres() {
    return this.frecuenciaCardiaca > 100 ? "alto" : "normal";
  }

  mostrarDatos() {
    document.getElementById("tempValue").textContent = this.temperatura.toFixed(1);
    document.getElementById("hrValue").textContent = this.frecuenciaCardiaca;
    document.getElementById("humValue").textContent = this.humedad.toFixed(1);
    document.getElementById("presValue").textContent = this.presion.toFixed(1);
    document.getElementById("stressValue").textContent = this.obtenerNivelEstres();
  }
}

class FarmHealthController {
  constructor() {
    this.apiKey = "GXTR6UMVPQDGYOPB";
    this.channelId = "2974929";
    this.bovino = new Bovino();
    this.intervalo = null;
    this.inicializar();
  }

  async obtenerDatosDesdeThingSpeak() {
    const url = `https://api.thingspeak.com/channels/${this.channelId}/feeds.json?api_key=${this.apiKey}&results=1`;
    try {
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
      const ultimo = datos.feeds[0];
      this.bovino.actualizarDesdeAPI(ultimo);
      this.bovino.mostrarDatos();
    } catch (error) {
      console.error("Error al obtener datos:", error);
    }
  }

  inicializar() {
    this.obtenerDatosDesdeThingSpeak();
    this.intervalo = setInterval(() => this.obtenerDatosDesdeThingSpeak(), 15000);
  }
}

function mostrarFormulario() {
  document.getElementById("startBtn").disabled = true;
  setTimeout(() => {
    document.getElementById("formModal").classList.remove("oculto");
    document.getElementById("startBtn").disabled = false;
  }, 1000);
}

function cerrarModal() {
  document.getElementById("formModal").classList.add("oculto");
}

function evaluarDiagnostico(event) {
  event.preventDefault();

  const respuestas = Array.from(event.target.querySelectorAll("select")).map(sel => sel.value);
  const sintomasSí = respuestas.filter(r => r === "sí").length;

  const temp = farmHealth.bovino.temperatura;
  const hr = farmHealth.bovino.frecuenciaCardiaca;
  const nivelEstres = farmHealth.bovino.obtenerNivelEstres();

  let diagnostico = "";
  let recomendaciones = "";

  if (sintomasSí >= 3) {
    if (respuestas[0] === "sí" && respuestas[1] === "sí" && respuestas[2] === "sí") {
      diagnostico = "El animal podría estar sufriendo una infección respiratoria o fiebre.";
      recomendaciones = "Aislar al animal y contactar al veterinario para pruebas clínicas.";
    } else if (respuestas[3] === "sí") {
      diagnostico = "Posible mastitis detectada por inflamación en la ubre.";
      recomendaciones = "Revisar higiene de ordeño y consultar tratamiento veterinario.";
    } else if (respuestas[4] === "sí") {
      diagnostico = "Golpe de calor o fatiga observada.";
      recomendaciones = "Proporcionar sombra, agua fresca y monitorear temperatura y frecuencia cardíaca.";
    } else {
      diagnostico = "Múltiples síntomas de alerta.";
      recomendaciones = "Vigilancia constante y revisión médica.";
    }
  } else if (sintomasSí === 2) {
    diagnostico = "Algunos síntomas leves presentes.";
    recomendaciones = "Observar evolución del estado de salud.";
  } else {
    diagnostico = "El bovino parece saludable según las respuestas.";
    recomendaciones = "Mantener controles regulares y buena alimentación.";
  }

  if (temp > 39 || hr > 100 || nivelEstres === "alto") {
    recomendaciones += "\nAdemás, los sensores indican signos fisiológicos alterados. Atención médica recomendada.";
  }

  document.getElementById("diagnosticoResultado").textContent = `${diagnostico}\n\nRecomendaciones:\n${recomendaciones}`;
  cerrarModal();
}

const farmHealth = new FarmHealthController();
