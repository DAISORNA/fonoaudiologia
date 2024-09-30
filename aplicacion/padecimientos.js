// Lista de padecimientos y sus terapias
const padecimientosData = [
    {
        id: 1,
        nombre: "Dislalia",
        terapias: [
            "Terapia de articulación",
            "Terapia de lenguaje"
        ]
    },
    {
        id: 2,
        nombre: "Dislexia",
        terapias: [
            "Terapia de lectura",
            "Terapia de escritura"
        ]
    },
    {
        id: 3,
        nombre: "Trastorno del Espectro Autista",
        terapias: [
            "Terapia conductual",
            "Terapia de juego"
        ]
    }
];

// Función para cargar terapias según el padecimiento seleccionado
function loadTherapies(padecimiento) {
    const terapiasDiv = document.getElementById('terapias');
    terapiasDiv.innerHTML = ''; // Limpiar contenido previo

    const padecimientoSeleccionado = padecimientosData.find(p => p.nombre.toLowerCase() === padecimiento.toLowerCase());

    if (padecimientoSeleccionado) {
        terapiasDiv.innerHTML = `<h3>Terapias para ${padecimientoSeleccionado.nombre}:</h3><ul>`;
        padecimientoSeleccionado.terapias.forEach(terapia => {
            terapiasDiv.innerHTML += `<li>${terapia}</li>`;
        });
        terapiasDiv.innerHTML += '</ul>';
    } else {
        terapiasDiv.innerHTML = '<p>No se encontraron terapias para el padecimiento seleccionado.</p>';
    }
}

// Función para agregar un nuevo padecimiento
function addPadecimiento(nombre, terapias) {
    const nuevoPadecimiento = {
        id: padecimientosData.length + 1,
        nombre: nombre,
        terapias: terapias.split(',').map(terapia => terapia.trim()) // Convierte el string en un array
    };
    padecimientosData.push(nuevoPadecimiento);
    alert(`Padecimiento '${nombre}' agregado.`);
    console.log(padecimientosData); // Mostrar la lista actualizada en la consola
}

// Función para editar un padecimiento existente
function editPadecimiento(id, nuevoNombre, nuevasTerapias) {
    const padecimiento = padecimientosData.find(p => p.id === id);
    if (padecimiento) {
        padecimiento.nombre = nuevoNombre;
        padecimiento.terapias = nuevasTerapias.split(',').map(terapia => terapia.trim());
        alert(`Padecimiento '${nuevoNombre}' editado.`);
        console.log(padecimientosData); // Mostrar la lista actualizada en la consola
    } else {
        alert('Padecimiento no encontrado.');
    }
}

// Función para eliminar un padecimiento
function deletePadecimiento(id) {
    const index = padecimientosData.findIndex(p => p.id === id);
    if (index !== -1) {
        const eliminado = padecimientosData.splice(index, 1);
        alert(`Padecimiento '${eliminado[0].nombre}' eliminado.`);
        console.log(padecimientosData); // Mostrar la lista actualizada en la consola
    } else {
        alert('Padecimiento no encontrado.');
    }
}

// Ejemplo de uso (descomentar para probar)
// addPadecimiento("Afasia", "Terapia del habla, Terapia cognitiva");
// editPadecimiento(1, "Dislalia Mejorada", "Terapia de articulación avanzada");
// deletePadecimiento(2);
