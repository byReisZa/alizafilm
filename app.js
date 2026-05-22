const APP = {
  adminPassword: '3454',
  isAdmin: sessionStorage.getItem('aliza_admin') === 'true',

  init() {
    if (!localStorage.getItem('aliza_movies')) {
      this.seedData();
    }
    this.renderMovies();
    this.bindEvents();
    if (document.getElementById('adminApp')) this.initAdmin();
  },

  seedData() {
    const samples = [
      { id: Date.now() + 1, title: 'Interstellar', image: 'https://image.tmdb.org/t/p/w342/nCbkOyOMTEwlEV0LtCOvCnwEONA.jpg', category: 'film', embed: '', description: 'Bir grup kaşif, insanlığın geleceğini kurtarmak için solucan deliği aracılığıyla galaksiler arası bir yolculuğa çıkar.' },
      { id: Date.now() + 2, title: 'Breaking Bad', image: 'https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9T8tNZ9N4aMqJw.jpg', category: 'dizi', embed: '', description: 'Kimyager öğretmen Walter White, ailesinin geleceğini garanti altına almak için metamfetamin üretmeye başlar.' },
      { id: Date.now() + 3, title: 'Inception', image: 'https://image.tmdb.org/t/p/w342/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg', category: 'film', embed: '', description: 'Bir hırsız, rüya paylaşım teknolojisini kullanarak bir iş adamının bilinçaltına bir fikir yerleştirmek için işe alınır.' },
      { id: Date.now() + 4, title: 'The Dark Knight', image: 'https://image.tmdb.org/t/p/w342/qJ2tW6WMUDux911BB6n7k8S1K8.jpg', category: 'film', embed: '', description: 'Batman, Joker adlı kaotik bir suç dehasıyla yüzleşmek zorunda kalır.' },
      { id: Date.now() + 5, title: 'Stranger Things', image: 'https://image.tmdb.org/t/p/w342/49WJfeN0m4bUJ5igLDUH30H3pU.jpg', category: 'dizi', embed: '', description: 'Kaybolan bir çocuğu ararken, küçük bir kasaba gizli bir hükümet laboratuvarı ve doğaüstü bir kızın varlığını keşfeder.' },
      { id: Date.now() + 6, title: 'Pulp Fiction', image: 'https://image.tmdb.org/t/p/w342/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg', category: 'film', embed: '', description: 'Los Angeles\'ta geçen ve birbirine bağlı birkaç hikayeyi anlatan kült bir suç filmi.' },
      { id: Date.now() + 7, title: 'The Matrix', image: 'https://image.tmdb.org/t/p/w342/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg', category: 'film', embed: '', description: 'Bir bilgisayar korsanı, gerçekliğin aslında bir simülasyon olduğunu keşfeder.' },
      { id: Date.now() + 8, title: 'La Casa de Papel', image: 'https://image.tmdb.org/t/p/w342/ooBGRQBdbGzBxAVfExiO8rWcS3d.jpg', category: 'dizi', embed: '', description: 'Profesör liderliğindeki bir ekip, İspanya Kraliyet Darphanesi\'nde büyük bir soygun gerçekleştirir.' },
    ];
    localStorage.setItem('aliza_movies', JSON.stringify(samples));
  },

  getMovies() {
    return JSON.parse(localStorage.getItem('aliza_movies') || '[]');
  },

  saveMovies(movies) {
    localStorage.setItem('aliza_movies', JSON.stringify(movies));
    this.renderMovies();
  },

  addMovie(movie) {
    const movies = this.getMovies();
    movie.id = Date.now();
    movies.unshift(movie);
    this.saveMovies(movies);
  },

  updateMovie(id, data) {
    const movies = this.getMovies();
    const idx = movies.findIndex(m => m.id === id);
    if (idx > -1) {
      movies[idx] = { ...movies[idx], ...data };
      this.saveMovies(movies);
    }
  },

  deleteMovie(id) {
    let movies = this.getMovies();
    movies = movies.filter(m => m.id !== id);
    this.saveMovies(movies);
  },

  getMovie(id) {
    return this.getMovies().find(m => m.id === id);
  },

  renderMovies(category = 'all', search = '') {
    const grid = document.getElementById('movieGrid');
    if (!grid) return;
    let movies = this.getMovies();

    if (category !== 'all') {
      movies = movies.filter(m => m.category === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      movies = movies.filter(m => m.title.toLowerCase().includes(q));
    }

    if (movies.length === 0) {
      grid.innerHTML = '<div class="empty-state"><span>🎬</span>Henüz içerik bulunmuyor.</div>';
      return;
    }

    grid.innerHTML = movies.map(m => `
      <div class="movie-card" data-id="${m.id}">
        ${m.image
          ? `<img class="poster" src="${m.image}" alt="${m.title}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'poster-placeholder\\'>🎬</div>'">`
          : `<div class="poster-placeholder">🎬</div>`}
        <div class="info">
          <h3>${m.title}</h3>
          <div class="meta">
            <span class="badge ${m.category === 'film' ? 'badge-film' : 'badge-dizi'}">${m.category === 'film' ? 'Film' : 'Dizi'}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  openModal(id) {
    const m = this.getMovie(id);
    if (!m) return;
    const overlay = document.getElementById('modalOverlay');
    document.getElementById('modalTitle').textContent = m.title;
    document.getElementById('modalBadge').textContent = m.category === 'film' ? 'Film' : 'Dizi';
    document.getElementById('modalBadge').className = `badge ${m.category === 'film' ? 'badge-film' : 'badge-dizi'}`;
    document.getElementById('modalDesc').textContent = m.description || 'Açıklama eklenmemiş.';

    const wrap = document.getElementById('playerWrap');
    if (m.embed && m.embed.trim()) {
      let embedHtml = m.embed.trim();
      if (embedHtml.startsWith('http')) {
        embedHtml = `<iframe src="${embedHtml}" allowfullscreen></iframe>`;
      }
      wrap.innerHTML = embedHtml;
    } else {
      wrap.innerHTML = '<div class="no-embed">Henüz embed linki eklenmemiş.</div>';
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.remove('open');
    document.body.style.overflow = '';
    const wrap = document.getElementById('playerWrap');
    wrap.innerHTML = '<div class="no-embed">Yükleniyor...</div>';
  },

  // ===== ADMIN =====
  initAdmin() {
    const loginWrap = document.getElementById('loginWrap');
    const dashboard = document.getElementById('dashboard');
    const adminMovieList = document.getElementById('adminMovieList');

    if (this.isAdmin) {
      loginWrap.style.display = 'none';
      dashboard.classList.add('open');
      this.renderAdminList();
    } else {
      loginWrap.style.display = 'flex';
      dashboard.classList.remove('open');
    }

    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const pw = document.getElementById('passwordInput').value;
      if (pw === this.adminPassword) {
        sessionStorage.setItem('aliza_admin', 'true');
        this.isAdmin = true;
        loginWrap.style.display = 'none';
        dashboard.classList.add('open');
        this.renderAdminList();
        this.showToast('Giriş başarılı!', 'success');
      } else {
        document.getElementById('loginError').style.display = 'block';
      }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
      sessionStorage.removeItem('aliza_admin');
      this.isAdmin = false;
      loginWrap.style.display = 'flex';
      dashboard.classList.remove('open');
      this.showToast('Çıkış yapıldı.', 'success');
    });

    document.getElementById('movieForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const data = {
        title: f.title.value.trim(),
        image: f.image.value.trim(),
        category: f.category.value,
        embed: f.embed.value.trim(),
        description: f.description.value.trim(),
      };

      const editId = f.dataset.editId;
      if (editId) {
        this.updateMovie(Number(editId), data);
        this.showToast('İçerik güncellendi!', 'success');
        f.dataset.editId = '';
        f.querySelector('button').textContent = 'Ekle';
      } else {
        if (!data.title) { this.showToast('Başlık zorunludur.', 'error'); return; }
        this.addMovie(data);
        this.showToast('İçerik eklendi!', 'success');
      }
      f.reset();
      this.renderAdminList();
    });
  },

  renderAdminList() {
    const container = document.getElementById('adminMovieList');
    if (!container) return;
    const movies = this.getMovies();
    if (movies.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding:30px 0">Henüz içerik eklenmemiş.</div>';
      return;
    }
    container.innerHTML = movies.map(m => `
      <div class="movie-list-item">
        ${m.image
          ? `<img src="${m.image}" alt="${m.title}" onerror="this.src=''">`
          : `<div style="width:44px;height:62px;border-radius:6px;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:20px">🎬</div>`}
        <div class="ml-info">
          <h4>${m.title}</h4>
          <div class="ml-meta">
            <span class="badge ${m.category === 'film' ? 'badge-film' : 'badge-dizi'}">${m.category === 'film' ? 'Film' : 'Dizi'}</span>
            ${m.embed ? '• Link var' : '• Link yok'}
          </div>
        </div>
        <div class="ml-actions">
          <button class="btn-edit" data-id="${m.id}">Düzenle</button>
          <button class="btn-delete" data-id="${m.id}">Sil</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => this.editMovie(Number(btn.dataset.id)));
    });
    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
          this.deleteMovie(Number(btn.dataset.id));
          this.renderAdminList();
          this.showToast('İçerik silindi!', 'success');
        }
      });
    });
  },

  editMovie(id) {
    const m = this.getMovie(id);
    if (!m) return;
    const f = document.getElementById('movieForm');
    f.title.value = m.title;
    f.image.value = m.image || '';
    f.category.value = m.category;
    f.embed.value = m.embed || '';
    f.description.value = m.description || '';
    f.dataset.editId = id;
    f.querySelector('button').textContent = 'Güncelle';
    f.scrollIntoView({ behavior: 'smooth' });
  },

  showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast ${type}`;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { t.className = 'toast'; }, 3000);
  },

  bindEvents() {
    const filterByCategory = (cat, activeEl) => {
      document.querySelectorAll('.tab, .nav-links a').forEach(el => el.classList.remove('active'));
      if (activeEl) activeEl.classList.add('active');
      const search = document.getElementById('searchInput')?.value || '';
      this.renderMovies(cat, search);
    };

    document.querySelectorAll('.tab, .nav-links a').forEach(el => {
      el.addEventListener('click', () => {
        filterByCategory(el.dataset.category, el);
      });
    });

    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      let debounce;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          const activeTab = document.querySelector('.tab.active');
          const cat = activeTab ? activeTab.dataset.category : 'all';
          this.renderMovies(cat, searchInput.value);
        }, 300);
      });
    }

    // Movie grid click (delegation)
    const grid = document.getElementById('movieGrid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const card = e.target.closest('.movie-card');
        if (card) {
          const id = Number(card.dataset.id);
          // Check if clicked on the card itself (not a child button)
          this.openModal(id);
        }
      });
    }

    // Modal close
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModal();
      });
      document.getElementById('modalCloseBtn').addEventListener('click', () => this.closeModal());
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) this.closeModal();
      });
    }
  },
};

document.addEventListener('DOMContentLoaded', () => APP.init());

