/* =========================================================
   AgroSana · Actividad 2 · Comportamiento de la página
   Reglas (constitución P9): sin innerHTML ni sinks, sin leer la
   dirección de la página, sin mensajes en consola.
   ========================================================= */

'use strict';

// Con JavaScript activo, el menú de teléfono se vuelve desplegable (ver estilos.css).
document.documentElement.classList.add('js');

/* ---------- Menú de navegación en teléfono y tableta ---------- */

function iniciarMenu() {
    const boton = document.querySelector('.boton-menu');
    const menu = document.getElementById('menu');
    if (!boton || !menu) return;
    const icono = boton.querySelector('i');

    function cambiarMenu(abrir) {
        menu.classList.toggle('abierto', abrir);
        boton.setAttribute('aria-expanded', String(abrir));
        icono.classList.toggle('fa-bars', !abrir);
        icono.classList.toggle('fa-xmark', abrir);
    }

    boton.addEventListener('click', () => {
        cambiarMenu(boton.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', (evento) => {
        if (evento.target.closest('a, .boton-instalar')) cambiarMenu(false);
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && boton.getAttribute('aria-expanded') === 'true') {
            cambiarMenu(false);
            boton.focus();
        }
    });
}

iniciarMenu();

/* ---------- Filtro de productos por categoría ---------- */

const CATEGORIAS = ['todos', 'fertilizantes', 'fungicidas', 'coadyuvantes', 'bioestimulantes'];

function iniciarFiltro() {
    const grupo = document.querySelector('#productos .filtros');
    const productos = document.querySelectorAll('#productos article.producto');
    const anuncio = document.getElementById('resultado-filtro');
    if (!grupo || !anuncio) return;

    function aplicar(categoria) {
        const elegida = CATEGORIAS.includes(categoria) ? categoria : 'todos';
        let visibles = 0;
        productos.forEach((producto) => {
            const mostrar = elegida === 'todos' || producto.dataset.categoria === elegida;
            producto.hidden = !mostrar;
            if (mostrar) visibles += 1;
        });
        grupo.querySelectorAll('button.filtro').forEach((boton) => {
            boton.setAttribute('aria-pressed', String(boton.dataset.categoria === elegida));
        });
        anuncio.textContent = `Mostrando ${visibles} ${visibles === 1 ? 'producto' : 'productos'}`;
    }

    grupo.addEventListener('click', (evento) => {
        const boton = evento.target.closest('button.filtro');
        if (boton) aplicar(boton.dataset.categoria);
    });

    // La franja de categorías lleva a Productos con su categoría ya filtrada (review R7).
    document.querySelectorAll('#inicio .franja a[data-categoria]').forEach((enlace) => {
        enlace.addEventListener('click', () => aplicar(enlace.dataset.categoria));
    });
}

iniciarFiltro();

/* ---------- Ventana de detalles del producto ---------- */

function iniciarModal() {
    const dialogo = document.getElementById('modal-producto');
    if (!dialogo || typeof dialogo.showModal !== 'function') return;
    const imagen = dialogo.querySelector('.modal-imagen');
    const categoria = dialogo.querySelector('.categoria');
    const titulo = dialogo.querySelector('#modal-titulo');
    const descripcion = dialogo.querySelector('.modal-descripcion');
    let origen = null;

    document.querySelectorAll('#productos .ver-detalles').forEach((boton) => {
        boton.addEventListener('click', () => {
            const producto = boton.closest('article.producto');
            const foto = producto.querySelector('img');
            imagen.setAttribute('src', foto.getAttribute('src'));
            imagen.setAttribute('alt', foto.getAttribute('alt'));
            categoria.textContent = producto.querySelector('.categoria').textContent;
            titulo.textContent = producto.querySelector('h3').textContent;
            descripcion.textContent = producto.dataset.uso;
            dialogo.dataset.categoria = producto.dataset.categoria;
            origen = boton;
            dialogo.showModal();
        });
    });

    dialogo.querySelector('.cerrar-modal').addEventListener('click', () => dialogo.close());
    // Clic en el fondo: el evento llega al propio <dialog>, no a su contenido.
    dialogo.addEventListener('click', (evento) => {
        if (evento.target === dialogo) dialogo.close();
    });
    dialogo.addEventListener('close', () => {
        if (origen) origen.focus();
    });
}

iniciarModal();

/* ---------- Ver más / Ver menos precauciones ---------- */

function iniciarVerMas() {
    const boton = document.getElementById('ver-mas');
    const extra = document.getElementById('mas-recomendaciones');
    if (!boton || !extra) return;
    const texto = boton.querySelector('.ver-mas-texto');
    const icono = boton.querySelector('i');

    boton.addEventListener('click', () => {
        const abrir = extra.hidden;
        extra.hidden = !abrir;
        boton.setAttribute('aria-expanded', String(abrir));
        texto.textContent = abrir ? 'Ver menos precauciones' : 'Ver más precauciones';
        icono.classList.toggle('fa-plus', !abrir);
        icono.classList.toggle('fa-minus', abrir);
    });
}

iniciarVerMas();

/* ---------- Botón de instalación de la PWA en el navbar ---------- */

function iniciarInstalacionPWA() {
    const contenedor = document.querySelector('.menu-item-instalar');
    const boton = document.getElementById('boton-instalar');
    if (!contenedor || !boton) return;

    let eventoInstalacion = null;

    window.addEventListener('beforeinstallprompt', (evento) => {
        evento.preventDefault();
        eventoInstalacion = evento;
        contenedor.hidden = false;
    });

    boton.addEventListener('click', async () => {
        if (!eventoInstalacion) return;
        eventoInstalacion.prompt();
        await eventoInstalacion.userChoice;
        eventoInstalacion = null;
        contenedor.hidden = true;
    });

    window.addEventListener('appinstalled', () => {
        eventoInstalacion = null;
        contenedor.hidden = true;
    });
}

iniciarInstalacionPWA();

/* ---------- Registro del Service Worker ---------- */

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(() => {});
    });
}