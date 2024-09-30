document.getElementById('formRegistro').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío del formulario

    const nombre = document.getElementById('nombre').value.trim();
    const edad = document.getElementById('edad').value.trim();
    const fechaNacimiento = document.getElementById('fechaNacimiento').value.trim();
    const escolaridad = document.getElementById('escolaridad').value.trim();
    const domicilio = document.getElementById('domicilio').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const acudiente = document.getElementById('acudiente').value.trim();
    const referencia = document.getElementById('referencia').value.trim();
    const fechaEntrevista = document.getElementById('fechaEntrevista').value.trim();
    const motivoConsulta = document.getElementById('motivoConsulta').value.trim();

    // Validación básica
    if (!nombre || !edad || !fechaNacimiento || !escolaridad || !domicilio || !telefono || !acudiente || !referencia || !fechaEntrevista || !motivoConsulta) {
        showMessage("Por favor, complete todos los campos.");
        return;
    }

    // Validación adicional para la edad (número)
    if (isNaN(edad) || edad <= 0) {
        showMessage("Por favor, ingrese una edad válida.");
        return;
    }

    // Validación para el teléfono (opcional, dependiendo del formato)
    const telefonoRegex = /^\d{7,}$/; // Ejemplo: número de 7 dígitos
    if (!telefonoRegex.test(telefono)) {
        showMessage("Por favor, ingrese un número de teléfono válido.");
        return;
    }

    // Aquí podrías guardar los datos en una base de datos o localStorage
    console.log("Paciente Registrado:", {
        nombre,
        edad,
        fechaNacimiento,
        escolaridad,
        domicilio,
        telefono,
        acudiente,
        referencia,
        fechaEntrevista,
        motivoConsulta
    });

    // Limpiar el formulario después de registrar
    document.getElementById('formRegistro').reset();
    showMessage("Paciente registrado con éxito.");
});

// Función para mostrar mensajes en la interfaz
function showMessage(message) {
    const messageDiv = document.getElementById('message'); // Asegúrate de tener un div en tu HTML para mensajes
    messageDiv.innerText = message;
    setTimeout(() => {
        messageDiv.innerText = ''; // Limpiar mensaje después de 3 segundos
    }, 3000);
}
