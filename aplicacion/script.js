// Espera a que todo el contenido del documento HTML haya sido completamente cargado
document.addEventListener("DOMContentLoaded", function() {
    // Selecciona todos los botones de navegación usando la clase .nav-button
    const navButtons = document.querySelectorAll(".nav-button");
    // Selecciona todas las secciones del documento
    const sections = document.querySelectorAll("section");

    // Recorre cada botón de navegación
    navButtons.forEach(button => {
        // Añade un evento de clic a cada botón
        button.addEventListener("click", function() {
            // Obtiene el atributo data-section del botón que indica qué sección mostrar
            const sectionToShow = button.getAttribute("data-section");
            // Recorre todas las secciones
            sections.forEach(section => {
                // Elimina la clase 'active' de la sección para ocultarla
                section.classList.remove("active");
                // Si la sección actual es la que se debe mostrar, añade la clase 'active'
                if (section.id === sectionToShow) {
                    section.classList.add("active");
                }
            });
        });
    });

    // Función para buscar paciente cuando se hace clic en el botón de búsqueda
    document.getElementById("buscarPaciente").addEventListener("click", function() {
        // Obtiene el valor del campo de nombre del paciente
        const nombre = document.getElementById("pacienteNombre").value;
        // Obtiene el valor del campo de edad del paciente
        const edad = document.getElementById("pacienteEdad").value;

        // Aquí puedes agregar la lógica para buscar el paciente en tu base de datos
        // Verifica que tanto el nombre como la edad estén completos
        if (nombre && edad) {
            // Si se encuentran los datos, muestra un mensaje con la información del paciente
            const resultado = `Paciente encontrado: ${nombre}, Edad: ${edad}`;
            alert(resultado);
        } else {
            // Si faltan datos, muestra una advertencia al usuario
            alert("Por favor, complete el nombre y la edad para buscar.");
        }
    });

    // Función para limpiar los datos del formulario de registro
    document.getElementById("limpiarDatos").addEventListener("click", function() {
        // Resetea el formulario de registro para limpiar todos los campos
        document.getElementById("formRegistro").reset();
    });

    // Función para limpiar los datos del formulario de seguimiento
    document.getElementById("limpiarDatosSeguimiento").addEventListener("click", function() {
        // Resetea el formulario de seguimiento para limpiar todos los campos
        document.getElementById("formSeguimiento").reset();
    });
});

