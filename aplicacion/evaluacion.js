// evaluacion.js

document.getElementById('formEvaluacion').addEventListener('submit', function(event) { 
    event.preventDefault(); // Evitar el envío del formulario

    // Obtener valores de los campos
    const hallazgos = document.getElementById('hallazgos').value.trim();
    const prevencion = document.getElementById('prevencion').value.trim();
    const evaluacion = document.getElementById('evaluacion').value.trim();
    const tratamiento = document.getElementById('tratamiento').value.trim();

    // Validación de campos
    if (!hallazgos || !prevencion || !evaluacion || !tratamiento) {
        alert("Por favor, completa todos los campos antes de enviar.");
        return; // Detener la ejecución si algún campo está vacío
    }

    // Aquí podrías guardar los datos de evaluación
    console.log("Evaluación Guardada:", { hallazgos, prevencion, evaluacion, tratamiento });

    // Mostrar un mensaje de confirmación
    alert("La evaluación se ha guardado correctamente.");

    // Limpiar el formulario después de guardar
    document.getElementById('formEvaluacion').reset();
});
