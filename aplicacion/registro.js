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
        alert("Por favor, complete todos los campos.");
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
});
