const reservasLocal = "reservas-departamentos";
const ultimaReservaLocal = "ultima-reserva";

let DEPARTAMENTOS = [];
let METODOS_PAGO = [];

let reservas = JSON.parse(localStorage.getItem(reservasLocal) || "[]");

function toast(mensaje, tipo) {
  let color = "#6b7280";
  if (tipo === "ok") color = "#16a34a";
  if (tipo === "warn") color = "#f59e0b";
  if (tipo === "error") color = "#dc2626";

  Toastify({
    text: mensaje,
    duration: 3000,
    gravity: "bottom",
    position: "right",
    close: true,
    stopOnFocus: true,
    style: { background: color }
  }).showToast();
}

function mostrarMensaje(texto, tipo) {
  let mensajeEstado = document.getElementById("estado");
  mensajeEstado.innerText = texto;
  mensajeEstado.className = tipo || "";
}

function soloNombre(nombre) {
  if (!nombre) return false;
  nombre = nombre.trim();
  if (nombre === "") return false;

  for (let i = 0; i < nombre.length; i++) {
    let caracter = nombre[i];
    if (!isNaN(caracter) && caracter !== " ") {
      return false;
    }
  }
  return true;
}

function desdeHoyEnAdelante(fecha) {
  if (!fecha) return false;

  let hoy = new Date();
  let year = hoy.getFullYear();
  let month = String(hoy.getMonth() + 1).padStart(2, "0");
  let day = String(hoy.getDate()).padStart(2, "0");
  let hoyString = `${year}-${month}-${day}`;

  return fecha >= hoyString;
}

function calcularNoches(inicio, fin) {
  if (!inicio || !fin) return 0;
  let fechaInicio = new Date(inicio);
  let fechaFin = new Date(fin);
  if (fechaFin <= fechaInicio) return 0;

  let noches = 0;
  while (fechaInicio < fechaFin) {
    fechaInicio.setDate(fechaInicio.getDate() + 1);
    noches++;
  }
  return noches;
}

function calcularTotal(numeroDepartamento, inicio, fin) {
  let departamento = DEPARTAMENTOS.find(
    departamento => departamento.numero === numeroDepartamento
  );
  if (!departamento) return 0;

  let noches = calcularNoches(inicio, fin);
  if (noches <= 0) return 0;

  return noches * departamento.precio;
}

function guardarReservas() {
  localStorage.setItem(reservasLocal, JSON.stringify(reservas));
}

function cargarOpcionesDepartamento() {
  let selectDepartamento = document.getElementById("departamento");
  selectDepartamento.innerHTML =
    '<option value="" selected disabled>Elegi un departamento</option>';

  DEPARTAMENTOS.forEach(departamento => {
    let opcion = document.createElement("option");
    opcion.value = departamento.numero;
    opcion.innerText = `Dpto ${departamento.numero} — ${departamento.tipo} ($${departamento.precio}/noche)`;
    selectDepartamento.appendChild(opcion);
  });
}

function renderReservas() {
  let lista = document.getElementById("lista");
  lista.innerHTML = "";

  reservas.forEach(reserva => {
    let departamento = DEPARTAMENTOS.find(
      d => d.numero === reserva.departamento
    );
    let tipo = departamento ? departamento.tipo : "—";
    let adultos = reserva.adultos ?? 0;
    let menores = reserva.menores ?? 0;

    let item = document.createElement("li");
    item.className = "item";
    item.innerHTML = `
      <span>
        <strong>${reserva.nombre}</strong> — Dpto ${reserva.departamento} (${tipo}) ·
        ${reserva.inicio} a ${reserva.fin} ·
        Huespedes: ${adultos} adultos, ${menores} menores ·
        Total: $${reserva.total}
      </span>
      <span>
        <button data-accion="editar" data-id="${reserva.id}">Editar</button>
        <button data-accion="borrar" data-id="${reserva.id}" class="danger">Borrar</button>
      </span>`;
    lista.appendChild(item);
  });
}

function hayLugar() {
  return reservas.length < 6;
}

function fechasSolapadas(inicio, fin, numeroDepartamento, excluirId) {
  return reservas.some(reservaExistente => {
    if (
      reservaExistente.departamento !== numeroDepartamento ||
      reservaExistente.id === excluirId
    )
      return false;

    let noSolapan =
      fin < reservaExistente.inicio || inicio > reservaExistente.fin;
    return !noSolapan;
  });
}

function guardarReservaDefinitiva(reservaNueva, esEdicion) {
  if (esEdicion) {
    reservas = reservas.map(reserva =>
      reserva.id === reservaNueva.id ? reservaNueva : reserva
    );
  } else {
    reservas.push(reservaNueva);
  }

  guardarReservas();
  renderReservas();

  const departamento = DEPARTAMENTOS.find(
    d => d.numero === reservaNueva.departamento
  );
  const tipoDepto = departamento ? departamento.tipo : "";
  const metodoPagoObj = METODOS_PAGO.find(
    m => m.id === reservaNueva.metodoPago
  );
  const metodoPagoTexto = metodoPagoObj ? metodoPagoObj.label : "";

  const resumen = {
    ...reservaNueva,
    tipoDepartamento: tipoDepto,
    metodoPagoTexto
  };

  localStorage.setItem(ultimaReservaLocal, JSON.stringify(resumen));

  const formulario = document.getElementById("form");
  const botonCancelar = document.getElementById("cancelar");
  const totalElemento = document.getElementById("total");
  formulario.reset();
  botonCancelar.hidden = true;
  totalElemento.innerText = "Total: —";

  mostrarMensaje(
    esEdicion ? "Reserva actualizada" : "Reserva creada",
    "ok"
  );
  toast("Reserva confirmada", "ok");

  setTimeout(() => {
    window.location.href = "./resumen.html";
  }, 1000);
}

function iniciarCircuitoReserva(reservaNueva, esEdicion) {
  Swal.fire({
    title: "¿Revisaste los datos?",
    text: "Verifica que toda la información sea correcta antes de confirmar.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, continuar",
    cancelButtonText: "Volver"
  }).then(result => {
    if (!result.isConfirmed) {
      mostrarMensaje("Modifica los datos si lo consideras necesario.", "warn");
      toast("Revisá los datos antes de reservar.", "warn");
      return;
    }

    const opciones = {};
    METODOS_PAGO.forEach(metodo => {
      opciones[metodo.id] = metodo.label;
    });

    Swal.fire({
      title: "Elegí un método de pago",
      input: "radio",
      inputOptions: opciones,
      inputValidator: value => {
        if (!value) return "Debes elegir un método de pago";
      },
      confirmButtonText: "Confirmar reserva"
    }).then(data => {
      if (!data.isConfirmed) {
        toast("Reserva cancelada antes de confirmar.", "warn");
        return;
      }
      reservaNueva.metodoPago = data.value;
      guardarReservaDefinitiva(reservaNueva, esEdicion);
    });
  });
}

function actualizarTotal() {
  let selectDepartamento = document.getElementById("departamento");
  let inputInicio = document.getElementById("fechaInicio");
  let inputFin = document.getElementById("fechaFin");
  let totalElemento = document.getElementById("total");

  let total = calcularTotal(
    Number(selectDepartamento.value),
    inputInicio.value,
    inputFin.value
  );

  totalElemento.innerText = total > 0 ? `Total: $${total}` : "Total: —";
}

function inicializarFechasMinimas() {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");
  const valorHoy = `${year}-${month}-${day}`;
  document.getElementById("fechaInicio").setAttribute("min", valorHoy);
  document.getElementById("fechaFin").setAttribute("min", valorHoy);
}

async function cargarDatosIniciales() {
  try {
    mostrarMensaje("Cargando datos...", "warn");
    const respuesta = await fetch("./db/data.json");

    if (!respuesta.ok) {
      throw new Error("Error al cargar los datos desde data.json");
    }
    const data = await respuesta.json();

    DEPARTAMENTOS = data.departamentos;
    METODOS_PAGO = data.metodosDePago;

    cargarOpcionesDepartamento();
    renderReservas();

    mostrarMensaje("Datos cargados correctamente.", "ok");
  } catch (err) {
    mostrarMensaje("No se pudieron cargar los datos iniciales.", "error");
    toast("Error al cargar datos (revisa rutas de JSON)", "error");
  } finally {
  }
}

const formulario = document.getElementById("form");

formulario.addEventListener("submit", evento => {
  evento.preventDefault();

  let inputId = document.getElementById("id");
  let inputNombre = document.getElementById("nombre");
  let selectDepartamento = document.getElementById("departamento");
  let inputInicio = document.getElementById("fechaInicio");
  let inputFin = document.getElementById("fechaFin");
  let inputDni = document.getElementById("dni");
  let inputTelefono = document.getElementById("telefono");
  let inputEmail = document.getElementById("email");
  let inputAdultos = document.getElementById("adultos");
  let inputMenores = document.getElementById("menores");

  let reservaNueva = {
    id: inputId.value || String(Date.now()),
    nombre: inputNombre.value.trim(),
    departamento: Number(selectDepartamento.value),
    inicio: inputInicio.value,
    fin: inputFin.value,
    dni: inputDni.value.trim(),
    telefono: inputTelefono.value.trim(),
    email: inputEmail.value.trim(),
    adultos: Number(inputAdultos.value),
    menores: Number(inputMenores.value),
    total: 0,
    metodoPago: ""
  };

  if (
    !reservaNueva.nombre ||
    !reservaNueva.departamento ||
    !reservaNueva.inicio ||
    !reservaNueva.fin ||
    !reservaNueva.dni ||
    !reservaNueva.telefono ||
    !reservaNueva.email ||
    reservaNueva.adultos < 1 ||
    reservaNueva.menores < 0
  ) {
    mostrarMensaje("Completa todos los datos.", "error");
    toast("Faltan datos obligatorios.", "error");
    return;
  }

  if (!soloNombre(reservaNueva.nombre)) {
    mostrarMensaje("El nombre no puede tener numeros.", "error");
    toast("Nombre inválido.", "error");
    return;
  }

  if (isNaN(reservaNueva.dni)) {
    mostrarMensaje("El DNI debe contener solo números.", "error");
    toast("DNI inválido.", "error");
    return;
  }

  if (isNaN(reservaNueva.telefono) || reservaNueva.telefono.length < 8) {
    mostrarMensaje("El teléfono debe tener solo números y al menos 8 dígitos.", "error");
    toast("Teléfono inválido.", "error");
    return;
  }

  if (
    !desdeHoyEnAdelante(reservaNueva.inicio) ||
    !desdeHoyEnAdelante(reservaNueva.fin)
  ) {
    mostrarMensaje("Las fechas deben ser desde hoy en adelante.", "warn");
    toast("Revisa las fechas ingresadas.", "warn");
    return;
  }

  if (!reservaNueva.email.includes("@")) {
    mostrarMensaje("Ingresa un email valido.", "error");
    toast("Email inválido.", "error");
    return;
  }

  let noches = calcularNoches(reservaNueva.inicio, reservaNueva.fin);
  if (noches <= 0) {
    mostrarMensaje("La fecha de fin debe ser posterior.", "warn");
    toast("Rango de fechas incorrecto.", "warn");
    return;
  }

  if (
    fechasSolapadas(
      reservaNueva.inicio,
      reservaNueva.fin,
      reservaNueva.departamento,
      inputId.value || null
    )
  ) {
    mostrarMensaje("Fechas ocupadas.", "warn");
    toast("Departamento ya reservado.", "warn");
    return;
  }

  if (!inputId.value && !hayLugar()) {
    mostrarMensaje("Maximo 6 reservas.", "warn");
    toast("No hay más cupo de reservas.", "warn");
    return;
  }

  reservaNueva.total = calcularTotal(
    reservaNueva.departamento,
    reservaNueva.inicio,
    reservaNueva.fin
  );

  const esEdicion = Boolean(inputId.value);
  iniciarCircuitoReserva(reservaNueva, esEdicion);
});

const botonCancelar = document.getElementById("cancelar");
botonCancelar.addEventListener("click", () => {
  formulario.reset();
  document.getElementById("id").value = "";
  botonCancelar.hidden = true;
  document.getElementById("total").innerText = "Total: —";
  mostrarMensaje("Edicion cancelada", "warn");
  toast("Edición cancelada.", "warn");
});


const lista = document.getElementById("lista");
lista.addEventListener("click", evento => {
  let boton = evento.target.closest("button");
  if (!boton) return;

  let idReserva = boton.dataset.id;
  let accion = boton.dataset.accion;

  if (accion === "editar") {
    let reserva = reservas.find(reserva => reserva.id === idReserva);
    if (reserva) {
      document.getElementById("id").value = reserva.id;
      document.getElementById("nombre").value = reserva.nombre;
      document.getElementById("departamento").value = String(reserva.departamento);
      document.getElementById("fechaInicio").value = reserva.inicio;
      document.getElementById("fechaFin").value = reserva.fin;
      document.getElementById("dni").value = reserva.dni;
      document.getElementById("telefono").value = reserva.telefono;
      document.getElementById("email").value = reserva.email;
      document.getElementById("adultos").value = reserva.adultos;
      document.getElementById("menores").value = reserva.menores;
      document.getElementById("total").innerText = `Total: $${reserva.total}`;
      botonCancelar.hidden = false;
      mostrarMensaje("Editando...", "warn");
      toast("Editando reserva.", "warn");
    }
  }

  if (accion === "borrar") {
    Swal.fire({
      title: "¿Eliminar reserva?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar"
    }).then(data => {
      if (!data.isConfirmed) return;
      reservas = reservas.filter(reserva => reserva.id !== idReserva);
      guardarReservas();
      renderReservas();
      mostrarMensaje("Reserva eliminada", "warn");
      toast("Reserva eliminada.", "warn");
    });
  }
});

// Recalcular
["departamento", "fechaInicio", "fechaFin"].forEach(nombreCampo => {
  let elemento = document.getElementById(nombreCampo);
  elemento.addEventListener("input", actualizarTotal);
  elemento.addEventListener("change", actualizarTotal);
});

inicializarFechasMinimas();
cargarDatosIniciales();
