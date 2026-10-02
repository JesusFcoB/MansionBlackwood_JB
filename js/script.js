$(function () {
    // Respetar la preferencia de movimiento reducido.
    $.fx.off = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Textos de las pistas (para mostrarlas al final) y lista de habitaciones requeridas.
    const PISTAS = {
        biblioteca: "📖 Un diario dice: “La respuesta está detrás del espejo”.",
        laboratorio: "🧪 Un recipiente comienza a brillar misteriosamente.",
        espejo: "👻 El espejo parece moverse…",
        cripta: "🕯️ El féretro está abierto y dentro hay una llave todavía tibia…"
    };
    const requeridas = Object.keys(PISTAS);
    // Set: guarda habitaciones ÚNICAS, repetir un clic no suma visitas nuevas.
    const visitas = new Set();

    // Reto 1: calabaza que aparece con fadeIn().
    $("#calabaza").fadeIn(1000);

    function irA(selector) {
        $("html, body").stop(true).animate({
            scrollTop: Math.max(0, $(selector).offset().top - 75)
        }, 700);
    }

    function actualizarContador() {
        $("#contadorVisitas").text(visitas.size);
    }

    function faltantes() {
        return requeridas.filter(function (h) { return !visitas.has(h); });
    }

    function actualizarPuerta() {
        const aviso = $("#avisoPuerta");
        const faltan = faltantes();
        if (faltan.length === 0) {
            aviso.removeClass("alert-warning").addClass("alert-success")
                .text("✅ Exploraste las " + requeridas.length + " habitaciones: la puerta está libre.");
        } else {
            aviso.removeClass("alert-success").addClass("alert-warning")
                .text("🔑 Debes explorar todas las habitaciones antes de mover el espejo (" +
                    visitas.size + " de " + requeridas.length + ").");
        }
    }

    function registrarVisita(habitacion) {
        if (visitas.has(habitacion)) return; // repetir la misma habitación no cuenta de nuevo
        visitas.add(habitacion);
        actualizarContador();
        actualizarPuerta();
    }

    // Mostrar la historia y desplazar la página (duración cambiada: 1200 → 800).
    $("#btnEntrar").on("click", function () {
        $(this).prop("disabled", true);
        $("#textoHistoria").fadeIn(800, function () { irA("#historia"); });
    });

    // Evitar que varios clics acumulen animaciones.
    $("#continuarHistoria").on("click", function () {
        $(this).prop("disabled", true);
        $("#mensajeOscuro").fadeIn(500);
        $("#habitaciones").slideDown(1200, function () { irA("#habitaciones"); });
        // Duración cambiada: 3000 → 4000 (el fantasma tarda más en cruzar).
        $("#fantasma").stop(true, true).css("left", "-150px").animate({ left: "110%" }, 4000);
    });

    // data-habitacion vincula cada botón con su pista.
    $(".explorar").on("click", function () {
        const boton = $(this);
        const habitacion = boton.data("habitacion");
        const pista = $("#" + habitacion);
        const abriendo = pista.is(":hidden");
        pista.stop(true, true).slideToggle(600);
        boton.attr("aria-expanded", abriendo ? "true" : "false");
        if (abriendo) registrarVisita(habitacion);
    });

    $(".habitacion").on("mouseenter", function () {
        $(this).find(".icono").stop(true).animate({ fontSize: "90px" }, 250);
    }).on("mouseleave", function () {
        $(this).find(".icono").stop(true).animate({ fontSize: "70px" }, 250);
    });

    // Reto 2: encender / apagar las luces.
    $("#btnLuces").on("click", function () {
        const encendidas = !$("body").hasClass("luz");
        $("body").toggleClass("luz", encendidas);
        $(this).attr("aria-pressed", encendidas ? "true" : "false")
            .text(encendidas ? "🕯️ Apagar luces" : "💡 Encender luces");
    });

    // Reto 4: la puerta queda bloqueada hasta explorar todas las habitaciones.
    $("#abrirPuerta").on("click", function () {
        if (faltantes().length > 0) {
            actualizarPuerta();
            $("#avisoPuerta").stop(true, true).fadeOut(150).fadeIn(150).fadeOut(150).fadeIn(150);
            return;
        }
        $(this).prop("disabled", true);
        $("#habitaciones").fadeOut(700, function () {
            $("body").addClass("fondo-rojo");
            $("#secreto").fadeIn(1000, function () { irA("#secreto"); });
        });
    });

    // Bootstrap 5 usa su API nativa; no necesita jQuery.
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modalFinal"));

    // Retos 5 y 6: dos finales según la decisión + lista de pistas encontradas.
    function abrirFinal(tipo) {
        const verdad = tipo === "verdad";
        $("#finalVerdad").toggleClass("d-none", !verdad);
        $("#finalHuir").toggleClass("d-none", verdad);
        $("#tituloFinal").text(verdad ? "El secreto de Blackwood" : "La huida de Blackwood");
        const lista = $("#listaPistas").empty();
        requeridas.forEach(function (habitacion) {
            if (visitas.has(habitacion)) lista.append($("<li>").text(PISTAS[habitacion]));
        });
        modal.show();
    }

    $("#btnFinal").on("click", function () { abrirFinal("verdad"); });
    $("#btnHuir").on("click", function () { abrirFinal("huir"); });
    $("#reiniciar").on("click", function () { window.location.reload(); });

    // Estado inicial del contador y del aviso de la puerta.
    $("#totalHabitaciones").text(requeridas.length);
    actualizarContador();
    actualizarPuerta();
});
