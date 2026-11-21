(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Animação de entrada das seções. Vem primeiro: se algo abaixo falhar,
  // o conteúdo continua aparecendo.
  var revelar = document.querySelectorAll('.revelar');
  if ('IntersectionObserver' in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('visivel');
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revelar.forEach(function (el) { observador.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add('visivel'); });
  }

  // Cenas animadas dos projetos. Sem JS, ou com movimento reduzido, ficam paradas no quadro final.
  try {
    var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduzir && 'IntersectionObserver' in window) {
      document.querySelectorAll('.cena').forEach(function (cena) {
        var passos = Array.prototype.slice.call(cena.querySelectorAll('[data-passo]'));
        if (!passos.length) return;
        var ultimo = Math.max.apply(null, passos.map(function (p) { return Number(p.getAttribute('data-passo')); }));
        var ritmo = Number(cena.getAttribute('data-ritmo')) || 700;
        var etapa = 0, timer = null, visivel = false;
        cena.classList.add('animada');

        function zerar() {
          cena.classList.add('zerando');
          passos.forEach(function (p) { p.classList.remove('on'); });
          void cena.offsetWidth;
          cena.classList.remove('zerando');
        }
        function avancar() {
          if (!visivel) return;
          if (etapa <= ultimo) {
            passos.forEach(function (p) {
              if (Number(p.getAttribute('data-passo')) === etapa) p.classList.add('on');
            });
            etapa++;
            timer = setTimeout(avancar, ritmo);
            return;
          }
          timer = setTimeout(function () {
            cena.classList.add('saindo');
            timer = setTimeout(function () {
              zerar();
              cena.classList.remove('saindo');
              etapa = 0;
              timer = setTimeout(avancar, 400);
            }, 500);
          }, 2600);
        }
        new IntersectionObserver(function (entradas) {
          entradas.forEach(function (entrada) {
            visivel = entrada.isIntersecting;
            clearTimeout(timer);
            if (visivel) timer = setTimeout(avancar, 300);
          });
        }, { threshold: 0.3 }).observe(cena);
      });
    }
  } catch (erro) {
    document.querySelectorAll('.cena').forEach(function (cena) { cena.classList.remove('animada'); });
  }

  var topo = document.getElementById('topo-barra');
  var botaoMenu = document.querySelector('.menu-botao');
  var listaMenu = document.getElementById('menu-lista');

  // Barra do topo ganha fundo depois de rolar.
  function marcarRolagem() {
    topo.classList.toggle('rolado', window.scrollY > 8);
  }
  marcarRolagem();
  window.addEventListener('scroll', marcarRolagem, { passive: true });

  // Menu do celular.
  function fecharMenu() {
    listaMenu.classList.remove('aberto');
    botaoMenu.setAttribute('aria-expanded', 'false');
  }
  botaoMenu.addEventListener('click', function () {
    var abrir = !listaMenu.classList.contains('aberto');
    listaMenu.classList.toggle('aberto', abrir);
    botaoMenu.setAttribute('aria-expanded', String(abrir));
  });
  listaMenu.addEventListener('click', function (evento) {
    if (evento.target.closest('a')) fecharMenu();
  });
  document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && listaMenu.classList.contains('aberto')) {
      fecharMenu();
      botaoMenu.focus();
    }
  });
  document.addEventListener('click', function (evento) {
    if (!evento.target.closest('.menu')) fecharMenu();
  });

  // Filtro de projetos.
  var botoesFiltro = document.querySelectorAll('[data-filtro]');
  var projetos = document.querySelectorAll('[data-categoria]');
  botoesFiltro.forEach(function (botao) {
    botao.addEventListener('click', function () {
      var filtro = botao.getAttribute('data-filtro');
      botoesFiltro.forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === botao));
      });
      projetos.forEach(function (projeto) {
        var categorias = projeto.getAttribute('data-categoria').split(' ');
        var mostrar = filtro === 'todos' || categorias.indexOf(filtro) !== -1;
        projeto.hidden = !mostrar;
        if (mostrar) projeto.classList.add('visivel');
      });
    });
  });

  // Ano do rodapé.
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
