const ultimaReservaLocal = "ultima-reserva";

function mostrarToast(mensaje, tipo) {
  let color = "#6b7280";
  if (tipo === "ok") color = "#16a34a";
  if (tipo === "warn") color = "#f59e0b";
  if (tipo === "error") color = "#dc2626";

  Toastify({
    text: mensaje,
    duration: 1500,
    gravity: "bottom",
    position: "right",
    close: true,
    style:
        { background: color }
  }).showToast();
}

function cargarResumen() {
  const contenedor = document.getElementById("resumen");
  const btnEmail = document.getElementById("btn-email");
  const btnWhatsapp = document.getElementById("btn-whatsapp");

  const data = localStorage.getItem(ultimaReservaLocal);

  if (!data) {
    contenedor.innerHTML = `
      <p class="resumen-datos">
        No se encontró ninguna reserva reciente. Volvé al simulador y generá una nueva reserva.
      </p>`;
    btnEmail.style.display = "none";
    btnWhatsapp.style.display = "none";
    mostrarToast("No hay resumen para mostrar.", "warn");
    return;
  }

  const reserva = JSON.parse(data);

  const textoResumen = `
Titular: ${reserva.nombre}
DNI: ${reserva.dni}
Teléfono: ${reserva.telefono}
Email: ${reserva.email}

Departamento: ${reserva.departamento} (${reserva.tipoDepartamento})
Ingreso: ${reserva.inicio}
Egreso: ${reserva.fin}
Huéspedes: ${reserva.adultos} adultos, ${reserva.menores} menores

Total: $${reserva.total}
Método de pago: ${reserva.metodoPagoTexto}
`;

  // ver el resumen en el HTML
  contenedor.innerHTML = `
    <div class="resumen-datos">
      <p><strong>Titular:</strong> ${reserva.nombre}</p>
      <p><strong>DNI:</strong> ${reserva.dni}</p>
      <p><strong>Teléfono:</strong> ${reserva.telefono}</p>
      <p><strong>Email:</strong> ${reserva.email}</p>
      <hr>
      <p><strong>Departamento:</strong> ${reserva.departamento} (${reserva.tipoDepartamento})</p>
      <p><strong>Ingreso:</strong> ${reserva.inicio}</p>
      <p><strong>Egreso:</strong> ${reserva.fin}</p>
      <p><strong>Huéspedes:</strong> ${reserva.adultos} adultos, ${reserva.menores} menores</p>
      <p><strong>Total:</strong> $${reserva.total}</p>
      <p><strong>Método de pago:</strong> ${reserva.metodoPagoTexto}</p>
    </div>
  `;

const mensajeReserva = textoResumen;

btnEmail.href = `mailto:${reserva.email}?subject=Detalle de tu reserva&body=${mensajeReserva}`;

  let telefonoAcomodado = "";

  for (let caracter of reserva.telefono) {
    if (!isNaN(caracter) && caracter !== " ") {
      telefonoAcomodado += caracter;
    }
  }

  if (telefonoAcomodado && !telefonoAcomodado.startsWith("54")) {
    telefonoAcomodado = "54" + telefonoAcomodado;
  }

  if (telefonoAcomodado) {
    btnWhatsapp.href = `https://wa.me/${telefonoAcomodado}?text=${mensajeReserva}`;
    btnWhatsapp.style.display = "inline-block";
  } else {
    btnWhatsapp.style.display = "none";
  }

  mostrarToast("Resumen cargado correctamente.", "ok");
}

cargarResumen();
