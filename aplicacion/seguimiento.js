// seguimiento.js

// Manejo del envío del formulario de seguimiento
document.getElementById('formSeguimiento').addEventListener('submit', function (event) {
    event.preventDefault();
    
    const paciente = document.getElementById('nombrePaciente').value; // Cambiado para usar el ID correcto
    const comentario = document.getElementById('comentarioSeguimiento').value; // Cambiado para usar el ID correcto
    
    if (!paciente || !comentario) {
        alert("Por favor, complete todos los campos.");
        return;
    }

    // Obtener la fecha y hora actuales
    const fechaHora = new Date().toLocaleString();

    // Crear objeto de seguimiento
    const seguimiento = {
        paciente: paciente,
        comentario: comentario,
        fechaHora: fechaHora
    };

    // Guardar en LocalStorage (puedes cambiarlo para guardar en una base de datos)
    let seguimientos = JSON.parse(localStorage.getItem('seguimientos')) || [];
    seguimientos.push(seguimiento);
    localStorage.setItem('seguimientos', JSON.stringify(seguimientos));

    // Mostrar comentario guardado
    mostrarComentariosAnteriores();

    // Limpiar el formulario
    document.getElementById('formSeguimiento').reset();
});

// Función para mostrar los comentarios anteriores
function mostrarComentariosAnteriores() {
    const resultadosDiv = document.getElementById('resultadosSeguimiento');
    const listaSeguimientos = document.getElementById('listaSeguimientos');
    listaSeguimientos.innerHTML = ''; // Limpiar comentarios previos
    
    const seguimientos = JSON.parse(localStorage.getItem('seguimientos')) || [];
    
    seguimientos.forEach(seguimiento => {
        const comentarioHTML = `
            <li><strong>${seguimiento.paciente}</strong> (${seguimiento.fechaHora}): ${seguimiento.comentario}</li>
        `;
        listaSeguimientos.innerHTML += comentarioHTML; // Agregar cada seguimiento a la lista
    });
}

// Cargar los comentarios al iniciar la página
window.onload = mostrarComentariosAnteriores;
