// Espera a que todo el contenido del documento HTML haya sido completamente cargado
document.addEventListener("DOMContentLoaded", function() {
    // Selecciona todos los botones de navegación usando la clase .nav-button
    const navButtons = document.querySelectorAll(".nav-button"); // Selecciona los botones con clase 'nav-button'
    // Selecciona todas las secciones del documento
    const sections = document.querySelectorAll("section"); // Selecciona todos los elementos 'section'

    // Oculta todas las secciones al cargar la página
    sections.forEach(section => {
        section.style.display = "none"; // Asegura que todas las secciones estén ocultas
    });

    // Recorre cada botón de navegación
    navButtons.forEach(button => {
        // Añade un evento de clic a cada botón
        button.addEventListener("click", function() {
            // Obtiene el atributo data-section del botón que indica qué sección mostrar
            const sectionToShow = button.getAttribute("data-section"); // Obtiene el valor del atributo 'data-section'
            // Recorre todas las secciones
            sections.forEach(section => {
                // Elimina la clase 'active' de la sección para ocultarla
                section.classList.remove("active"); // Oculta todas las secciones eliminando 'active'
                section.style.display = "none"; // Asegura que todas las secciones queden ocultas
                // Si la sección actual es la que se debe mostrar, añade la clase 'active'
                if (section.id === sectionToShow) { // Comprueba si la sección coincide con el valor de 'data-section'
                    section.classList.add("active"); // Añade la clase 'active' a la sección que se debe mostrar
                    section.style.display = "block"; // Muestra la sección seleccionada
                }
            });
        });
    });

    // Función para buscar paciente cuando se hace clic en el botón de búsqueda
    document.getElementById("buscarPaciente").addEventListener("click", function() {
        const nombre = document.getElementById("pacienteNombre").value; // Obtiene el nombre del campo input
        const edad = document.getElementById("pacienteEdad").value; // Obtiene la edad del campo input

        // Aquí puedes agregar la lógica para buscar el paciente en tu base de datos
        // Verifica que tanto el nombre como la edad estén completos
        if (nombre && edad) { // Verifica que los campos de nombre y edad estén llenos
            const resultado = `Paciente encontrado: ${nombre}, Edad: ${edad}`; // Genera un mensaje con los datos del paciente
            alert(resultado); // Muestra un mensaje con la información del paciente
        } else {
            alert("Por favor, complete el nombre y la edad para buscar."); // Muestra una advertencia si los campos no están completos
        }
    });

    // Función para limpiar los datos del formulario de registro
    document.getElementById("limpiarDatos").addEventListener("click", function() {
        document.getElementById("formRegistro").reset(); // Resetea el formulario de registro para limpiar todos los campos
    });

    // Función para limpiar los datos del formulario de seguimiento
    document.getElementById("limpiarDatosSeguimiento").addEventListener("click", function() {
        document.getElementById("formSeguimiento").reset(); // Resetea el formulario de seguimiento para limpiar todos los campos
    });
});
