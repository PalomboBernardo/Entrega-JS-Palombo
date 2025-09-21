const reservas = [];          
const MAXIMO = 4;     

let opciones;

do {
  opciones = parseInt(prompt("Reservas - 1. Sacar Reserva - 2. Reservas Dadas - 3. Buscar Reserva - 4. Salir"));

  switch (opciones) {
    case 1:
      let nombre1 = prompt("¿a nombre de quien desea hacer la reserva?:");
      SacarReserva(nombre1, reservas);
      break;

    case 2:
      ReservasDadas(reservas);
      break;

    case 3:
      let nombre2 = prompt("A nombre de quien esta la reserva?:");
      buscarReserva(nombre2, reservas);
      break;

    case 4:
      break;

    default:
      alert("No quiero hacer reserva.");
      console.log("No quiero hacer reserva. " + opciones);
  }
} while (opciones !== 4);

console.log("Se terminaron las Reservas.");
alert("Se terminaron las reservas.");
  
// función para mostrar turnos
function ReservasDadas(listaReservas) {
  if (listaReservas.length === 0) {
    console.log("No hay turnos.");
  } else {
      let i = 0;
      let lista = "";
    while (i < listaReservas.length) {
      lista += (i + 1) + ". " + listaReservas[i] + "";
      i++;
    }
    console.log("Personas que reservaron:" + lista);
    alert("Personas que hicieron reserva:" + lista);
    
  }
}

// función para agregar un turno
function SacarReserva(nombre, listaReservas) {
  if (listaReservas.length < MAXIMO) {
    listaReservas.push(nombre);
    console.log("Reserva de: " + nombre);
    alert("Reserva de: " + nombre);
  } else {
    console.log("No hay lugar mas lugar");
    alert("No hay lugar hoy.");
  }
}

function buscarReserva(nombre, listaReservas) {
  let encontrado = false;

  for (let i = 0; i < listaReservas.length; i++) {
    if (listaReservas[i] === nombre) {
      encontrado = true;
    }
  }
  
  if (encontrado) {
    console.log("Reserva encontrada: " + nombre);
    alert("La reserva de " + nombre + " está registrada.");
    
  } else {
    console.log("no hay reserva de: " + nombre);
    alert("No existe Reserva a para " + nombre);
  }
}
