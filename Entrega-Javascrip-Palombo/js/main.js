const reservas = [];          
const MAXIMO = 4;     

let opciones;

do {
  opciones = parseInt(prompt("Reservas \n1.Sacar Reserva \n2.Reservas Dadas \n3.Buscar Reserva \n4. Salir"));

  switch (opciones) {
    case 1:
      let nombre1 = prompt("¿A nombre de quien desea hacer la reserva?:");
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
      alert("Esa opcion no exite.");
      console.log("Esa opcion no exite. " + opciones);
  }
} while (opciones !== 4);

console.log("Se terminaron las Reservas.");
alert("Se terminaron las reservas.");
  

// funcion para sacar las reservas
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

// funcion para lista de reservas
function ReservasDadas(listaReservas) {
  if (listaReservas.length === 0) {
    console.log("No hay reservas.");
  } else {
      let i = 0;
      let lista = "";
    while (i < listaReservas.length) {
      lista = lista + (i + 1) + ". " + listaReservas[i] + "\n";
      i++;
    }
    console.log("Personas que reservaron:" + lista);
    alert("Personas que hicieron reserva:" + lista);
    
  }
}

// funcion para buscar las reservas
function buscarReserva(nombre, listaReservas) {
  let encontrada = false;

  for (let i = 0; i < listaReservas.length; i++) {
    if (listaReservas[i] === nombre) {
      encontrado = true;
    }
  }
  
  if (encontrada) {
    console.log("Reserva encontrada: " + nombre);
    alert("La reserva de " + nombre + " está registrada.");
    
  } else {
    console.log("no hay reserva de: " + nombre);
    alert("No existe Reserva para " + nombre);
  }
}
