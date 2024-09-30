// navigation.js

// Función para mostrar la sección seleccionada y ocultar las demás
export function showSection(sectionId) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('hidden'); // Agrega la clase 'hidden' a cada sección
    });

    // Mostrar la sección seleccionada
    const selectedSection = document.getElementById(sectionId);
    selectedSection.classList.remove('hidden'); // Elimina la clase 'hidden' de la sección seleccionada
}

// Función para manejar el envío del formulario
function handleFormSubmission(event) {
    event.preventDefault(); // Evita el envío del formulario
    // Aquí puedes agregar la lógica para manejar los datos del formulario
    console.log("Formulario enviado");
}

// Inicializa la aplicación al cargar
function init() {
    // Asigna eventos a los botones de navegación
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            showSection(button.dataset.section); // Usa data-section para obtener el ID de la sección
        });
    });

    // Event listener para el formulario
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', handleFormSubmission); // Maneja el envío del formulario
    }

    // Llama a la función para mostrar padecimientos, si es necesario
    showPadecimientos(); // Asegúrate de definir esta función en este archivo o importarla si es de otro módulo
}

// Ejecuta la función de inicialización al cargar el módulo
init();
