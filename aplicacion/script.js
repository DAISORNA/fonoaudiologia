// script.js
document.addEventListener("DOMContentLoaded", () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const sections = document.querySelectorAll('section');
    
    // Manejar clic en los botones de navegación
    navButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const sectionToShow = event.target.getAttribute('data-section');
            toggleSections(sectionToShow);
        });
    });

    // Función para mostrar y ocultar secciones
    function toggleSections(sectionToShow) {
        sections.forEach(section => {
            section.classList.toggle('active', section.id === sectionToShow);
        });
    }

    // Manejo del registro de pacientes
    const formRegistro = document.getElementById('formRegistro');
    formRegistro.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevenir el envío del formulario
        const formData = new FormData(formRegistro);
        const pacienteData = {};
        formData.forEach((value, key) => {
            pacienteData[key] = value;
        });
        console.log('Registro de paciente:', pacienteData);
        formRegistro.reset(); // Limpiar el formulario
        showMessage('Paciente registrado con éxito');
    });

    // Manejo de la evaluación
    const formEvaluacion = document.getElementById('formEvaluacion');
    formEvaluacion.addEventListener('submit', (event) => {
        event.preventDefault();
        const evaluacionData = new FormData(formEvaluacion);
        console.log('Evaluación guardada:', Object.fromEntries(evaluacionData.entries()));
        formEvaluacion.reset();
        showMessage('Evaluación guardada con éxito');
    });

    // Manejo de los padecimientos
    const formPadecimientos = document.getElementById('formPadecimientos');
    formPadecimientos.addEventListener('submit', (event) => {
        event.preventDefault();
        const padecimientoData = new FormData(formPadecimientos);
        console.log('Padecimiento guardado:', Object.fromEntries(padecimientoData.entries()));
        formPadecimientos.reset();
        showMessage('Padecimiento guardado con éxito');
    });

    // Manejo del seguimiento
    const formSeguimiento = document.getElementById('formSeguimiento');
    formSeguimiento.addEventListener('submit', (event) => {
        event.preventDefault();
        const seguimientoData = new FormData(formSeguimiento);
        const resultadosDiv = document.getElementById('resultadosSeguimiento');
        const resultadosHtml = document.createElement('div');
        resultadosHtml.textContent = `Seguimiento de ${seguimientoData.get('nombre')}: ${seguimientoData.get('resultados')}`;
        resultadosDiv.appendChild(resultadosHtml);
        formSeguimiento.reset();
        showMessage('Seguimiento guardado con éxito');
    });

    // Función para mostrar mensajes
    function showMessage(msg) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = msg;
        setTimeout(() => {
            messageDiv.textContent = '';
        }, 3000);
    }
});
