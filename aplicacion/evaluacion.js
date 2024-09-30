// evaluacion.js

document.getElementById('formEvaluacion').addEventListener('submit', function(event) { 
    event.preventDefault(); // Evitar el envío del formulario

    const hallazgos = document.getElementById('hallazgosEvaluacion').value; // Asegúrate de que el ID coincida con el HTML
    const prevencion = document.getElementById('prevencionEvaluacion').value; // Asegúrate de que el ID coincida con el HTML
    const evaluacion = document.getElementById('evaluacionResultados').value; // Asegúrate de que el ID coincida con el HTML
    const tratamiento = document.getElementById('tratamientoEvaluacion').value; // Asegúrate de que el ID coincida con el HTML

    // Aquí podrías guardar los datos de evaluación
    console.log("Evaluación Guardada:", { hallazgos, prevencion, evaluacion, tratamiento });

    // Limpiar el formulario después de guardar
    document.getElementById('formEvaluacion').reset();
});
