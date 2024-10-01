// Navegación entre secciones
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".nav-button");
    const sections = document.querySelectorAll("section");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            // Ocultar todas las secciones
            sections.forEach(section => {
                section.classList.add("hidden");
            });

            // Mostrar la sección correspondiente
            const sectionId = button.getAttribute("data-section");
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.classList.remove("hidden");
            }
        });
    });
});
