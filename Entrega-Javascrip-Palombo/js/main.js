// departamentos 
let DEPARTAMENTOS = [
  { numero: 1, tipo: "Basico", precio: 35000 },
  { numero: 2, tipo: "Basico", precio: 35000 },
  { numero: 3, tipo: "Basico", precio: 35000 },
  { numero: 4, tipo: "Suite", precio: 55000 },
  { numero: 5, tipo: "Suite", precio: 55000 },
  { numero: 6, tipo: "Suite Presidencial", precio: 85000 }
];

let reservasLocal = "reservas-departamentos";
let reservas = JSON.parse(localStorage.getItem(reservasLocal) || "[]");

function mostrarMensaje(texto, tipo) {
  let mensajeEstado = document.getElementById("estado");
  mensajeEstado.innerText = texto;
  mensajeEstado.className = tipo || "";
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
  let departamento = DEPARTAMENTOS.find(departamento => departamento.numero === numeroDepartamento);
  if (!departamento) return 0;
  let noches = calcularNoches(inicio, fin);
  if (noches <= 0) return 0;
  return noches * departamento.precio;
}

function guardarEnLocalStorage() {
  localStorage.setItem(reservasLocal, JSON.stringify(reservas));
}

function cargarOpcionesDepartamento() {
  let selectDepartamento = document.getElementById("departamento");
  selectDepartamento.innerHTML = '<option value="" selected disabled>Elegi un departamento</option>';
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
    let departamento = DEPARTAMENTOS.find(departamento => departamento.numero === reserva.departamento);
    let tipo = departamento ? departamento.tipo : "—";
    let item = document.createElement("li");
    item.className = "item";
    item.innerHTML = `
            span>${reserva.nombre} — Dpto ${reserva.departamento} (${tipo}) · ${reserva.inicio} a ${reserva.fin} · Total: $${reserva.total}</span>
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
    if (reservaExistente.departamento !== numeroDepartamento || reservaExistente.id === excluirId) return false;
    let noSolapan = fin < reservaExistente.inicio || inicio > reservaExistente.fin;
    return !noSolapan;
  });
}

function crearReserva(reservaNueva) {
  reservas.push(reservaNueva);
  guardarEnLocalStorage();
  renderReservas();
  let formulario = document.getElementById("form");
  let botonCancelar = document.getElementById("cancelar");
  let totalElemento = document.getElementById("total");
  formulario.reset();
  botonCancelar.hidden = true;
  totalElemento.innerText = "Total: —";
  mostrarMensaje("Reserva creada", "ok");
}

function editarReserva(reservaEditada) {
  reservas.forEach(reserva => {
    if (reserva.id === reservaEditada.id) {
      reserva.nombre = reservaEditada.nombre;
      reserva.departamento = reservaEditada.departamento;
      reserva.inicio = reservaEditada.inicio;
      reserva.fin = reservaEditada.fin;
      reserva.total = reservaEditada.total;
    }
  });
  guardarEnLocalStorage();
  renderReservas();
  let formulario = document.getElementById("form");
  let botonCancelar = document.getElementById("cancelar");
  let totalElemento = document.getElementById("total");
  formulario.reset();
  botonCancelar.hidden = true;
  totalElemento.innerText = "Total: —";
  mostrarMensaje("Reserva actualizada", "ok");
}

function borrarReserva(idReserva) {
  reservas = reservas.filter(reserva => reserva.id !== idReserva);
  guardarEnLocalStorage();
  renderReservas();
  mostrarMensaje("Reserva eliminada", "warn");
}

function actualizarTotal() {
  let selectDepartamento = document.getElementById("departamento");
  let inputInicio = document.getElementById("fechaInicio");
  let inputFin = document.getElementById("fechaFin");
  let totalElemento = document.getElementById("total");
  let total = calcularTotal(Number(selectDepartamento.value), inputInicio.value, inputFin.value);
  totalElemento.innerText = total > 0 ? `Total: $${total}` : "Total: —";
}

let formulario = document.getElementById("form");
formulario.addEventListener("submit", evento => {
  evento.preventDefault();

  let inputId = document.getElementById("id");
  let inputNombre = document.getElementById("nombre");
  let selectDepartamento = document.getElementById("departamento");
  let inputInicio = document.getElementById("fechaInicio");
  let inputFin = document.getElementById("fechaFin");

  let reservaNueva = {
    id: inputId.value || String(Date.now()),
    nombre: inputNombre.value.trim(),
    departamento: Number(selectDepartamento.value),
    inicio: inputInicio.value,
    fin: inputFin.value,
    total: 0
  };

  if (!reservaNueva.nombre || !reservaNueva.departamento || !reservaNueva.inicio || !reservaNueva.fin) {
    mostrarMensaje("Completa todos los datos", "error");
    return;
  }

  let noches = calcularNoches(reservaNueva.inicio, reservaNueva.fin);
  if (noches <= 0) {
    mostrarMensaje("La fecha de fin debe ser posterior al inicio", "warn");
    return;
  }

  if (fechasSolapadas(reservaNueva.inicio, reservaNueva.fin, reservaNueva.departamento, inputId.value || null)) {
    mostrarMensaje("Fechas ocupadas en ese departamento", "warn");
    return;
  }

  if (!inputId.value && !hayLugar()) {
    mostrarMensaje("Maximo 6 reservas activas", "warn");
    return;
  }

  reservaNueva.total = calcularTotal(reservaNueva.departamento, reservaNueva.inicio, reservaNueva.fin);

  if (inputId.value) {
    editarReserva(reservaNueva);
  } else {
    crearReserva(reservaNueva);
  }
});

let botonCancelar = document.getElementById("cancelar");
botonCancelar.addEventListener("click", () => {
  let formulario = document.getElementById("form");
  let inputId = document.getElementById("id");
  let totalElemento = document.getElementById("total");
  formulario.reset();
  inputId.value = "";
  botonCancelar.hidden = true;
  totalElemento.innerText = "Total: —";
  mostrarMensaje("Edicion cancelada", "warn");
});

let lista = document.getElementById("lista");
lista.addEventListener("click", evento => {
  let boton = evento.target.closest("button");
  if (!boton) return;

  let idReserva = boton.dataset.id;
  let accion = boton.dataset.accion;

  if (accion === "editar") {
    let reserva = reservas.find(reserva => reserva.id === idReserva);
    if (reserva) {
      let inputId = document.getElementById("id");
      let inputNombre = document.getElementById("nombre");
      let selectDepartamento = document.getElementById("departamento");
      let inputInicio = document.getElementById("fechaInicio");
      let inputFin = document.getElementById("fechaFin");
      let totalElemento = document.getElementById("total");
      inputId.value = reserva.id;
      inputNombre.value = reserva.nombre;
      selectDepartamento.value = String(reserva.departamento);
      inputInicio.value = reserva.inicio;
      inputFin.value = reserva.fin;
      totalElemento.innerText = reserva.total ? `Total: $${reserva.total}` : "Total: —";
      botonCancelar.hidden = false;
      mostrarMensaje("Editando...", "warn");
    }
  }

  if (accion === "borrar") {
    borrarReserva(idReserva);
  }
});

["departamento", "fechaInicio", "fechaFin"].forEach(nombreCampo => {
  let elemento = document.getElementById(nombreCampo);
  elemento.addEventListener("input", actualizarTotal);
  elemento.addEventListener("change", actualizarTotal);
});

cargarOpcionesDepartamento();
renderReservas();
