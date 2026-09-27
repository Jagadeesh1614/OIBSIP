// Front-end only auth (localStorage). Passwords are salted + hashed with SHA-256.
// NOTE: this is a learning project; real apps must authenticate on a server.
const Auth = {
  users(){ try { return JSON.parse(localStorage.getItem('users')) || {}; } catch (e) { return {}; } },
  saveUsers(u){ localStorage.setItem('users', JSON.stringify(u)); },
  async hash(password, salt){
    const data = new TextEncoder().encode(salt + password);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  },
  newSalt(){
    return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
  },
  async register(email, password){
    email = email.trim().toLowerCase();
    const users = this.users();
    if (users[email]) return { ok: false, error: 'An account with this email already exists.' };
    const salt = this.newSalt();
    users[email] = { salt, hash: await this.hash(password, salt) };
    this.saveUsers(users);
    return { ok: true };
  },
  async login(email, password){
    email = email.trim().toLowerCase();
    const u = this.users()[email];
    const generic = { ok: false, error: 'Incorrect email or password.' };  // never reveal which one
    if (!u) return generic;
    if (await this.hash(password, u.salt) !== u.hash) return generic;
    localStorage.setItem('session', email);
    return { ok: true };
  },
  current(){ return localStorage.getItem('session'); },
  logout(){ localStorage.removeItem('session'); }
};
