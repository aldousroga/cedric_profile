(function(){
    // ---- day / night mode toggle ----
    (function(){
      var root = document.documentElement;
      var btn = document.getElementById('themeToggle');
      if(!btn) return;
      var override = null; // null = follow system, else 'light' | 'dark'
      function systemPrefersDark(){
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      function effectiveTheme(){ return override || (systemPrefersDark() ? 'dark' : 'light'); }
      function apply(){
        if(override){ root.setAttribute('data-theme', override); }
        else{ root.removeAttribute('data-theme'); }
        var isDark = effectiveTheme() === 'dark';
        btn.classList.toggle('is-dark', isDark);
        btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      }
      btn.addEventListener('click', function(){
        override = effectiveTheme() === 'dark' ? 'light' : 'dark';
        apply();
      });
      apply();
    })();
 
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    toggle.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
 
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 
    // ---- boot sequence ----
    (function(){
      var overlay = document.getElementById('bootOverlay');
      if(!overlay) return;
      if(prefersReduced){ overlay.remove(); return; }
      var bar = document.getElementById('bootBar');
      var pct = document.getElementById('bootPct');
      var barLength = 18;
      var start = null;
      var duration = 850;
      var dismissed = false;
 
      function dismiss(){
        if(dismissed) return;
        dismissed = true;
        overlay.classList.add('hide');
        setTimeout(function(){ overlay.remove(); }, 550);
      }
      function step(now){
        if(dismissed) return;
        if(start === null) start = now;
        var t = Math.min(1, (now - start) / duration);
        var filled = Math.round(t * barLength);
        if(bar) bar.textContent = '#'.repeat(filled) + '-'.repeat(barLength - filled);
        if(pct) pct.textContent = Math.round(t * 100) + '%';
        if(t < 1){ requestAnimationFrame(step); }
        else { setTimeout(dismiss, 300); }
      }
      requestAnimationFrame(step);
      window.addEventListener('keydown', dismiss, {once:true});
      overlay.addEventListener('click', dismiss);
      window.addEventListener('scroll', dismiss, {once:true, passive:true});
      setTimeout(dismiss, 2400);
    })();
 
    // ---- settle terminal lines after typing so they can wrap normally ----
    document.querySelectorAll('.term-line').forEach(function(el){
      el.addEventListener('animationend', function(){ el.classList.add('typed'); });
    });
 
    // ---- scroll progress bar ----
    (function(){
      var bar = document.getElementById('scrollProgress');
      if(!bar) return;
      var ticking = false;
      function update(){
        var doc = document.documentElement;
        var scrollable = doc.scrollHeight - doc.clientHeight;
        var pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
        bar.style.width = pct + '%';
        ticking = false;
      }
      window.addEventListener('scroll', function(){
        if(!ticking){ requestAnimationFrame(update); ticking = true; }
      }, {passive:true});
      update();
    })();
 
    // ---- scrollspy: highlight the current section in the nav ----
    (function(){
      var sections = document.querySelectorAll('main section[id]');
      var navLinks = document.querySelectorAll('.nav-links a');
      if(!sections.length || !navLinks.length) return;
      function setActive(id){
        navLinks.forEach(function(a){
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
      if('IntersectionObserver' in window){
        var spy = new IntersectionObserver(function(entries){
          entries.forEach(function(e){
            if(e.isIntersecting){ setActive(e.target.id); }
          });
        }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
        sections.forEach(function(s){ spy.observe(s); });
      }
    })();
 
    // ---- back to top ----
    (function(){
      var btn = document.getElementById('toTop');
      if(!btn) return;
      var ticking = false;
      function update(){
        btn.classList.toggle('show', (window.scrollY || window.pageYOffset) > 600);
        ticking = false;
      }
      window.addEventListener('scroll', function(){
        if(!ticking){ requestAnimationFrame(update); ticking = true; }
      }, {passive:true});
      update();
      btn.addEventListener('click', function(){
        window.scrollTo({top:0, behavior: prefersReduced ? 'auto' : 'smooth'});
      });
    })();
 
    // ---- tech-stack panel: a neat grid of logos reveals at the bottom of the page ----
    (function(){
      var panel = document.getElementById('techPanel');
      var grid = document.getElementById('techGrid');
      if(!panel || !grid) return;
      var COUNT = 20;
      var ICONS = [
        { name:'HTML5', url:'https://developer.mozilla.org/en-US/docs/Web/HTML', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#E44D26"/><path d="M12 8h24l-2.1 27L24 40l-9.9-5L12 8z" fill="#F16529"/><path d="M24 8v29.9l7.9-2.4L33.6 8H24z" fill="#EBEBEB"/><text x="24" y="30" font-family="Arial,sans-serif" font-weight="700" font-size="14" fill="#fff" text-anchor="middle">5</text></svg>' },
        { name:'CSS3', url:'https://developer.mozilla.org/en-US/docs/Web/CSS', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#1572B6"/><path d="M12 8h24l-2.1 27L24 40l-9.9-5L12 8z" fill="#33A9DC"/><path d="M24 8v29.9l7.9-2.4L33.6 8H24z" fill="#EBF6FC"/><text x="24" y="30" font-family="Arial,sans-serif" font-weight="700" font-size="14" fill="#fff" text-anchor="middle">3</text></svg>' },
        { name:'JavaScript', url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#F0DB4F"/><text x="24" y="30" font-family="Arial,sans-serif" font-weight="700" font-size="15" fill="#111" text-anchor="middle">JS</text></svg>' },
        { name:'Java', url:'https://www.java.com', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#fff"/><path d="M19 11c-2 2 2 3 0 5M25 11c-2 2 2 3 0 5M31 11c-2 2 2 3 0 5" stroke="#5382A1" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M13 23h22c0 7-5 12-11 12s-11-5-11-12z" fill="#F58219"/><path d="M34 25c3.4.3 5.4 2.2 5.4 4.4 0 2.5-2.6 4.6-6.4 4.6" stroke="#F58219" stroke-width="2.2" fill="none"/><path d="M15 38c5 2.4 13 2.4 18 0" stroke="#5382A1" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>' },
        { name:'Android', url:'https://developer.android.com', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#3DDC84"/><g fill="#0B2B1D"><rect x="16" y="20" width="16" height="12" rx="6"/><line x1="18" y1="17" x2="20.5" y2="20" stroke="#0B2B1D" stroke-width="1.6" stroke-linecap="round"/><line x1="30" y1="17" x2="27.5" y2="20" stroke="#0B2B1D" stroke-width="1.6" stroke-linecap="round"/><rect x="14" y="22" width="3" height="8" rx="1.5"/><rect x="31" y="22" width="3" height="8" rx="1.5"/></g><circle cx="20" cy="26" r="1.5" fill="#3DDC84"/><circle cx="28" cy="26" r="1.5" fill="#3DDC84"/></svg>' },
        { name:'WordPress', url:'https://wordpress.org', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#21759B"/><text x="24" y="30" font-family="Georgia,serif" font-weight="700" font-size="18" fill="#fff" text-anchor="middle">W</text></svg>' },
        { name:'C++', url:'https://isocpp.org', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#00599C"/><text x="24" y="29" font-family="Arial,sans-serif" font-weight="700" font-size="11.5" fill="#fff" text-anchor="middle">C++</text></svg>' },
        { name:'C#', url:'https://dotnet.microsoft.com/en-us/languages/csharp', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#68217A"/><text x="24" y="30" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="#fff" text-anchor="middle">C#</text></svg>' },
        { name:'Visual Basic', url:'https://learn.microsoft.com/en-us/dotnet/visual-basic/', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#00539C"/><text x="24" y="30" font-family="Arial,sans-serif" font-weight="700" font-size="12.5" fill="#fff" text-anchor="middle">VB</text></svg>' },
        { name:'Git', url:'https://git-scm.com', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#F05033"/><g stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"><line x1="24" y1="12" x2="24" y2="35"/><line x1="24" y1="22" x2="32" y2="22"/></g><circle cx="24" cy="12" r="3" fill="#fff"/><circle cx="24" cy="35" r="3" fill="#fff"/><circle cx="32" cy="22" r="3" fill="#fff"/></svg>' },
        { name:'VS Code', url:'https://code.visualstudio.com', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#007ACC"/><text x="24" y="30" font-family="Arial,sans-serif" font-weight="700" font-size="13" fill="#fff" text-anchor="middle">&lt;/&gt;</text></svg>' },
        { name:'.NET MAUI', url:'https://dotnet.microsoft.com/en-us/apps/maui', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#512BD4"/><text x="24" y="22" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="#fff" text-anchor="middle">.NET</text><text x="24" y="34" font-family="Arial,sans-serif" font-weight="700" font-size="10" fill="#fff" text-anchor="middle">MAUI</text></svg>' },
        { name:'React', url:'https://react.dev', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#111827"/><g fill="none" stroke="#61DAFB" stroke-width="1.6"><ellipse cx="24" cy="24" rx="14" ry="5.6"/><ellipse cx="24" cy="24" rx="14" ry="5.6" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="14" ry="5.6" transform="rotate(120 24 24)"/></g><circle cx="24" cy="24" r="2.6" fill="#61DAFB"/></svg>' },
        { name:'Node.js', url:'https://nodejs.org', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#313131"/><path d="M24 6 8 15v18l16 9 16-9V15L24 6z" fill="none" stroke="#83CD29" stroke-width="1.6"/><text x="24" y="29" font-family="Arial,sans-serif" font-weight="700" font-size="8.5" fill="#83CD29" text-anchor="middle">node</text></svg>' },
        { name:'Python', url:'https://www.python.org', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#fff"/><path d="M24 8c-7 0-6.6 3-6.6 3v3.2h6.7v1H14.4S9 14.6 9 22s4.7 7.2 4.7 7.2h2.8v-3.7s-.15-4.7 4.6-4.7h6.6s4.4.07 4.4-4.2V12s.67-4-8.1-4z" fill="#3776AB"/><path d="M24 40c7 0 6.6-3 6.6-3v-3.2h-6.7v-1h9.7S38.6 33.4 38.6 26s-4.7-7.2-4.7-7.2h-2.8v3.7s.15 4.7-4.6 4.7h-6.6s-4.4-.07-4.4 4.2V36s-.67 4 8.1 4z" fill="#FFD43B"/></svg>' },
        { name:'PHP', url:'https://www.php.net', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#777BB4"/><ellipse cx="24" cy="24" rx="17" ry="9.5" fill="none" stroke="#fff" stroke-width="1.6"/><text x="24" y="28" font-family="Arial,sans-serif" font-weight="700" font-style="italic" font-size="11" fill="#fff" text-anchor="middle">php</text></svg>' },
        { name:'MySQL', url:'https://www.mysql.com', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#00758F"/><text x="24" y="22" font-family="Arial,sans-serif" font-weight="700" font-size="9" fill="#fff" text-anchor="middle">My</text><text x="24" y="34" font-family="Arial,sans-serif" font-weight="700" font-size="11" fill="#fff" text-anchor="middle">SQL</text></svg>' },
        { name:'Figma', url:'https://www.figma.com', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#1E1E1E"/><circle cx="24" cy="12" r="6" fill="#F24E1E"/><path d="M12 24a6 6 0 0 1 6-6h6v12h-6a6 6 0 0 1-6-6z" fill="#A259FF"/><path d="M24 6h-6a6 6 0 0 0 0 12h6V6z" fill="#FF7262"/><circle cx="24" cy="30" r="6" fill="#1ABCFE"/><path d="M12 36a6 6 0 0 1 6-6h6v6a6 6 0 1 1-12 0z" fill="#0ACF83"/></svg>' },
        { name:'TypeScript', url:'https://www.typescriptlang.org', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#3178C6"/><text x="24" y="31" font-family="Arial,sans-serif" font-weight="700" font-size="16" fill="#fff" text-anchor="middle">TS</text></svg>' },
        { name:'Bootstrap', url:'https://getbootstrap.com', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#7952B3"/><text x="24" y="32" font-family="Georgia,serif" font-weight="700" font-size="20" fill="#fff" text-anchor="middle">B</text></svg>' },
        { name:'Docker', url:'https://www.docker.com', svg:'<svg viewBox="0 0 48 48"><rect width="48" height="48" fill="#2496ED"/><g fill="#fff"><rect x="10" y="22" width="6" height="5"/><rect x="17" y="22" width="6" height="5"/><rect x="24" y="22" width="6" height="5"/><rect x="17" y="15" width="6" height="5"/><rect x="24" y="15" width="6" height="5"/></g><path d="M6 27c1 6 6 9 13 9 9 0 16-4 19-11-1-1-3-1-4 0-2 1-4 1-4 1s2-3 1-6c-2 1-4 3-4 3s-2-1-5-1-11 1-16 5z" fill="#fff"/></svg>' }
      ];
      var built = false;
      function shuffle(arr){
        var a = arr.slice();
        for(var i = a.length - 1; i > 0; i--){
          var j = Math.floor(Math.random() * (i + 1));
          var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
      }
      function build(){
        if(built) return;
        built = true;
        var picks = shuffle(ICONS).slice(0, Math.min(COUNT, ICONS.length));
        var frag = document.createDocumentFragment();
        for(var i = 0; i < picks.length; i++){
          var item = picks[i];
          var badge = document.createElement('a');
          badge.className = 'tech-badge';
          badge.href = item.url;
          badge.target = '_blank';
          badge.rel = 'noopener noreferrer';
          badge.setAttribute('aria-label', item.name + ' (opens in a new tab)');
          badge.innerHTML = '<span class="tech-icon">' + item.svg + '</span><span class="tech-tip">' + item.name + '</span>';
          badge.style.setProperty('--delay', (i * 0.04).toFixed(2) + 's');
          frag.appendChild(badge);
        }
        grid.appendChild(frag);
      }
      var ticking = false;
      function update(){
        var doc = document.documentElement;
        var nearBottom = (window.scrollY || window.pageYOffset) + doc.clientHeight >= doc.scrollHeight - 60;
        if(nearBottom) build();
        panel.classList.toggle('show', nearBottom);
        ticking = false;
      }
      window.addEventListener('scroll', function(){
        if(!ticking){ requestAnimationFrame(update); ticking = true; }
      }, {passive:true});
      window.addEventListener('resize', function(){
        if(!ticking){ requestAnimationFrame(update); ticking = true; }
      });
      update();
    })();
 
    // ---- ambient parallax: dot-grid drift + hero card drift ----
    if(!prefersReduced){
      (function(){
        var profileCard = document.querySelector('.profile-card');
        var ticking = false;
        function update(){
          var y = window.scrollY || window.pageYOffset;
          document.body.style.backgroundPosition = '-14px ' + (-14 - y * 0.12) + 'px';
          if(profileCard){
            var offset = Math.min(y * 0.18, 60);
            profileCard.style.transform = 'translateY(' + offset + 'px)';
          }
          ticking = false;
        }
        window.addEventListener('scroll', function(){
          if(!ticking){ requestAnimationFrame(update); ticking = true; }
        }, {passive:true});
        update();
      })();
    }
 
    if('IntersectionObserver' in window && !prefersReduced){
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); }
        });
      }, {threshold:0.12});
      document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
    } else {
      document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
    }
 
    // ---- hero role typewriter ----
    var roleEl = document.getElementById('roleText');
    if(roleEl){
      if(prefersReduced){
        roleEl.textContent = 'web & android developer';
      } else {
        var roles = ['web developer', 'android developer', 'problem solver'];
        var ri = 0, ci = 0, deleting = false;
        var typeSpeed = 55, deleteSpeed = 32, holdTime = 1400, gapTime = 400;
        (function tick(){
          var word = roles[ri];
          if(!deleting){
            ci++;
            roleEl.textContent = word.slice(0, ci);
            if(ci === word.length){ deleting = true; setTimeout(tick, holdTime); }
            else{ setTimeout(tick, typeSpeed); }
          } else {
            ci--;
            roleEl.textContent = word.slice(0, ci);
            if(ci === 0){ deleting = false; ri = (ri + 1) % roles.length; setTimeout(tick, gapTime); }
            else{ setTimeout(tick, deleteSpeed); }
          }
        })();
      }
    }
 
    // ---- hero code-rain background ----
    var canvas = document.getElementById('heroRain');
    if(canvas && !prefersReduced && canvas.getContext){
      var ctx = canvas.getContext('2d');
      var hero = canvas.closest('.hero');
      var chars = '01{}<>/;=+-#[]'.split('');
      var fontSize = 15;
      var columns = [];
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
 
      function styleColor(name){
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      }
      function hexToRgb(hex){
        hex = (hex || '').replace('#', '');
        if(hex.length === 3){ hex = hex.split('').map(function(c){ return c + c; }).join(''); }
        var num = parseInt(hex, 16);
        if(isNaN(num)) return [89, 201, 186];
        return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
      }
      var accentRgb = hexToRgb(styleColor('--accent') || '#F2B84B');
      var accent2Rgb = hexToRgb(styleColor('--accent-2') || '#59C9BA');
 
      function setup(){
        var rect = hero.getBoundingClientRect();
        canvas.width = Math.max(1, rect.width * dpr);
        canvas.height = Math.max(1, rect.height * dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var count = Math.max(1, Math.floor(rect.width / (fontSize * 1.4)));
        columns = [];
        for(var i = 0; i < count; i++){
          columns.push({
            x: i * (rect.width / count) + (rect.width / count) / 2,
            y: Math.random() * -rect.height / fontSize,
            speed: 0.15 + Math.random() * 0.28,
            len: 10 + Math.floor(Math.random() * 10),
            useAccent: Math.random() < 0.18
          });
        }
      }
      var resizeTimer;
      window.addEventListener('resize', function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setup, 200);
      });
      setup();
 
      function frame(){
        var rect = hero.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.font = fontSize + "px 'IBM Plex Mono', monospace";
        ctx.textAlign = 'center';
        columns.forEach(function(col){
          for(var j = 0; j < col.len; j++){
            var y = (col.y - j) * fontSize;
            if(y < 0 || y > rect.height) continue;
            var alpha = Math.max(0, 1 - j / col.len);
            var rgb = col.useAccent ? accentRgb : accent2Rgb;
            var glyphAlpha = j === 0 ? alpha * 0.9 : alpha * 0.5;
            ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + glyphAlpha.toFixed(3) + ')';
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], col.x, y);
          }
          col.y += col.speed;
          if((col.y - col.len) * fontSize > rect.height){ col.y = Math.random() * -20; }
        });
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
 
    // ---- live terminal: a real, typeable command line ----
    (function(){
      var body = document.getElementById('liveTermBody');
      var output = document.getElementById('liveTermOutput');
      var input = document.getElementById('liveTermInput');
      if(!body || !output || !input) return;
 
      var history = [];
      var histIndex = 0;
 
      function scrollToBottom(){ body.scrollTop = body.scrollHeight; }
 
      function addLine(text, cls){
        var div = document.createElement('div');
        div.className = 'live-term-line' + (cls ? ' ' + cls : '');
        div.textContent = text;
        output.appendChild(div);
        scrollToBottom();
        return div;
      }
 
      function addCmdLine(cmd){
        var div = document.createElement('div');
        div.className = 'live-term-line cmd';
        var promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = 'visitor@portfolio:~$';
        div.appendChild(promptSpan);
        div.appendChild(document.createTextNode(' ' + cmd));
        output.appendChild(div);
        scrollToBottom();
      }
 
      function typeLine(text, cls, cb){
        var div = addLine('', cls);
        if(prefersReduced){
          div.textContent = text;
          scrollToBottom();
          if(cb) cb();
          return;
        }
        var i = 0;
        (function step(){
          i++;
          div.textContent = text.slice(0, i);
          scrollToBottom();
          if(i < text.length){ setTimeout(step, 10); }
          else if(cb){ cb(); }
        })();
      }
 
      function typeLines(lines, i, cls, onDone){
        i = i || 0;
        if(i >= lines.length){ if(onDone) onDone(); return; }
        typeLine(lines[i], cls, function(){ typeLines(lines, i + 1, cls, onDone); });
      }
 
      var promptEl = document.getElementById('liveTermPrompt');
      function setBusy(isBusy){
        input.disabled = isBusy;
        if(promptEl) promptEl.classList.toggle('busy', isBusy);
        if(!isBusy) input.focus();
      }
 
      function jumpTo(id){
        var el = document.getElementById(id);
        if(el){
          setTimeout(function(){
            el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
          }, 450);
        }
      }
 
      var SECTIONS = ['home', 'services', 'projects', 'about', 'contact'];
 
      var COMMANDS = {
        help: function(){
          return [
            'available commands:',
            '  help          show this list',
            '  about         jump to the about section',
            '  services      jump to services',
            '  projects      jump to projects',
            '  contact       jump to contact',
            '  skills        list tech skills',
            '  whoami        who is viewing this site',
            '  ls            list sections',
            '  cd <section>  jump to a section',
            '  theme dark    switch to dark mode',
            '  theme light   switch to light mode',
            '  date          print the current date',
            '  clear         clear the terminal'
          ];
        },
        about: function(){ jumpTo('about'); return ['opening about.tsx ...']; },
        services: function(){ jumpTo('services'); return ['opening services.tsx ...']; },
        projects: function(){ jumpTo('projects'); return ['opening projects.tsx ...']; },
        contact: function(){ jumpTo('contact'); return ['opening contact.tsx ...']; },
        home: function(){ jumpTo('home'); return ['back to home.tsx ...']; },
        cd: function(args){
          var target = (args[0] || '').replace(/^\.\//, '').replace(/\/$/, '');
          if(SECTIONS.indexOf(target) !== -1){ jumpTo(target); return ['cd ' + target]; }
          return ['no such section: ' + (args[0] || '') + ' — try \'ls\'.'];
        },
        ls: function(){ return ['home.tsx  services.tsx  projects.tsx  about.tsx  contact.tsx']; },
        skills: function(){ return ['Java, C++, HTML, CSS, JavaScript, WordPress', '(and whatever this terminal is built with)']; },
        whoami: function(){ return ['just a visitor, poking around cedric’s portfolio.']; },
        date: function(){ return [new Date().toString()]; },
        sudo: function(args){
          if(args.join(' ').toLowerCase() === 'hire me'){ return ['permission granted — scroll to contact and say hi.']; }
          return ['permission denied: nice try.'];
        },
        theme: function(args){
          var toggle = document.getElementById('themeToggle');
          if(!toggle) return ['theme toggle unavailable.'];
          var wantDark = args[0] === 'dark';
          var wantLight = args[0] === 'light';
          if(!wantDark && !wantLight) return ['usage: theme dark | theme light'];
          var isDark = toggle.classList.contains('is-dark');
          if((wantDark && !isDark) || (wantLight && isDark)){ toggle.click(); }
          return ['switched to ' + (wantDark ? 'dark' : 'light') + ' mode.'];
        },
        echo: function(args){ return [args.join(' ')]; }
      };
 
      function run(raw){
        var trimmed = raw.trim();
        addCmdLine(raw);
        if(!trimmed) return;
        history.push(raw);
        histIndex = history.length;
        if(trimmed.toLowerCase() === 'clear'){ output.innerHTML = ''; return; }
        var parts = trimmed.split(/\s+/);
        var cmd = parts[0].toLowerCase();
        var args = parts.slice(1);
        var handler = COMMANDS[cmd];
        if(!handler){
          setBusy(true);
          typeLine('command not found: ' + cmd + ' — type \'help\' for a list.', 'warn', function(){ setBusy(false); });
          return;
        }
        var lines = handler(args);
        if(lines){
          setBusy(true);
          typeLines(lines, 0, null, function(){ setBusy(false); });
        }
      }
 
      input.addEventListener('keydown', function(e){
        if(input.disabled) return;
        if(e.key === 'Enter'){
          var val = input.value;
          input.value = '';
          run(val);
        } else if(e.key === 'ArrowUp'){
          if(history.length){
            histIndex = Math.max(0, histIndex - 1);
            input.value = history[histIndex] || '';
          }
          e.preventDefault();
        } else if(e.key === 'ArrowDown'){
          if(history.length){
            histIndex = Math.min(history.length, histIndex + 1);
            input.value = history[histIndex] || '';
          }
          e.preventDefault();
        }
      });
 
      body.addEventListener('click', function(){ input.focus(); });
 
      input.disabled = true;
      if(promptEl) promptEl.classList.add('busy');
      typeLines(['cedric_tadeo portfolio terminal v1.0', 'type \'help\' to see what this does.'], 0, null, function(){
        input.disabled = false;
        if(promptEl) promptEl.classList.remove('busy');
      });
    })();
  })();