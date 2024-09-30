// seguimiento.js

// Manejo del envío del formulario de seguimiento
document.getElementById('formSeguimiento').addEventListener('submit', function (event) {
    event.preventDefault();

    const paciente = document.getElementById('nombrePaciente').value.trim(); 
    const comentario = document.getElementById('comentarioSeguimiento').value.trim(); 

    if (!paciente || !comentario) {
        showMessage("Por favor, complete todos los campos.");
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

    // Guardar en LocalStorage
    saveSeguimiento(seguimiento);

    // Mostrar comentario guardado
    mostrarComentariosAnteriores();

    // Mensaje de éxito
    showMessage("Seguimiento agregado con éxito.", true);

    // Limpiar el formulario
    document.getElementById('formSeguimiento').reset();
});

// Función para guardar seguimiento en LocalStorage
function saveSeguimiento(seguimiento) {
    const seguimientos = JSON.parse(localStorage.getItem('seguimientos')) || [];
    seguimientos.push(seguimiento);
    localStorage.setItem('seguimientos', JSON.stringify(seguimientos));
}

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

// Función para mostrar mensajes en la interfaz
function showMessage(message, isSuccess = false) {
    const messageDiv = document.getElementById('message'); // Asegúrate de tener un div en tu HTML para mensajes
    messageDiv.innerText = message;
    messageDiv.style.color = isSuccess ? 'green' : 'red'; // Cambiar color según éxito
    setTimeout(() => {
        messageDiv.innerText = ''; // Limpiar mensaje después de 3 segundos
    }, 3000);
}

// Cargar los comentarios al iniciar la página
window.onload = mostrarComentariosAnteriores;
