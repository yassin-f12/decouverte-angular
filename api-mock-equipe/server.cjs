// Fausse API REST de TechCorp Equipe (TP 2 bonus).
//
// json-server fournit le CRUD complet a partir de db.json. Ce fichier ajoute
// autour de lui ce qu'une vraie API ferait :
// - une connexion (POST /api/login) qui renvoie un jeton ;
// - un controle du jeton sur toutes les routes, sauf la connexion et les services ;
// - des droits selon le role (employee ou admin) ;
// - une validation des donnees envoyees ;
// - un delai sur chaque reponse, pour voir les etats de chargement.
//
// ATTENTION : c'est un faux serveur pedagogique. Les mots de passe sont en clair
// dans accounts.json et les jetons sont gardes en memoire. Une vraie API stocke
// des mots de passe hashes (bcrypt) et signe ses jetons (JWT) : voir le jour 5.

const crypto = require('node:crypto');
const path = require('node:path');
const jsonServer = require('json-server');
const accounts = require('./accounts.json');

const PORT = Number(process.env.PORT ?? 3000);
const DELAY_MS = Number(process.env.DELAY ?? 500);
const TOKEN_TTL_MINUTES = Number(process.env.TOKEN_TTL_MINUTES ?? 30);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const db = router.db;

// Jetons valides : jeton -> { account, expiresAt }. Vides a chaque redemarrage :
// redemarrer le serveur "expire" donc toutes les sessions (pratique pour tester le 401).
const sessions = new Map();

server.use(jsonServer.defaults({ static: path.join(__dirname, 'public') }));
server.use(jsonServer.bodyParser);

// Delai artificiel : une vraie API sur Internet ne repond jamais instantanement.
server.use((req, res, next) => setTimeout(next, DELAY_MS));

// ---------------------------------------------------------------------------
// Connexion, deconnexion, profil
// ---------------------------------------------------------------------------

server.post('/api/login', (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
    return res.status(400).json({ message: "L'adresse e-mail et le mot de passe sont obligatoires." });
  }
  const account = accounts.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
  );
  if (!account) {
    // Message volontairement vague : on ne dit pas si c'est l'e-mail ou le mot de passe.
    return res.status(401).json({ message: 'Adresse e-mail ou mot de passe incorrect.' });
  }
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000);
  sessions.set(token, { account, expiresAt });
  res.json({ token, expiresAt: expiresAt.toISOString(), user: publicUser(account) });
});

server.post('/api/logout', (req, res) => {
  const token = readToken(req);
  if (token) {
    sessions.delete(token);
  }
  res.status(204).end();
});

// GET /api/departments est public : il sert avant la connexion (accueil).
server.use('/api', (req, res, next) => {
  if (req.method === 'GET' && /^\/departments(\/|$)/.test(req.path)) {
    return next();
  }
  const token = readToken(req);
  const session = token ? sessions.get(token) : undefined;
  if (!session) {
    return res.status(401).json({ message: 'Authentification requise.' });
  }
  if (session.expiresAt.getTime() <= Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ message: 'Session expirée, reconnectez-vous.' });
  }
  req.user = session.account;
  next();
});

server.get('/api/me', (req, res) => {
  res.json(publicUser(req.user));
});

// ---------------------------------------------------------------------------
// Services : lecture seule
// ---------------------------------------------------------------------------

server.use('/api/departments', (req, res, next) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'La liste des services est en lecture seule.' });
  }
  next();
});

// ---------------------------------------------------------------------------
// Collegues : lecture pour tous, ecriture pour les administrateurs RH
// ---------------------------------------------------------------------------

server.use('/api/employees', (req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Action réservée aux administrateurs RH.' });
  }
  const id = idFromPath(req.path);

  if (req.method === 'DELETE') {
    if (id === req.user.employeeId) {
      return res.status(409).json({ message: 'Vous ne pouvez pas supprimer votre propre fiche.' });
    }
    // Ses demandes de conges disparaissent avec lui.
    db.get('leaves').remove({ employeeId: id }).write();
    return next();
  }

  // POST, PUT, PATCH : on fusionne avec la fiche existante pour valider le resultat final.
  const existing = id ? db.get('employees').find({ id }).value() : undefined;
  if (id && !existing) {
    return res.status(404).json({ message: 'Collègue introuvable.' });
  }
  const candidate = req.method === 'PATCH' ? { ...existing, ...req.body } : req.body;
  const errors = validateEmployee(candidate, id);
  if (errors.conflict) {
    return res.status(409).json({ message: errors.conflict });
  }
  if (errors.messages.length > 0) {
    return res.status(400).json({ message: errors.messages });
  }
  // Le serveur choisit l'identifiant : on ignore celui envoye par le client.
  req.body = pickEmployee(candidate);
  next();
});

// ---------------------------------------------------------------------------
// Conges : chacun voit et gere les siens, l'administrateur voit et decide tout
// ---------------------------------------------------------------------------

server.use('/api/leaves', (req, res, next) => {
  const isAdmin = req.user.role === 'admin';
  const me = req.user.employeeId;
  const id = idFromPath(req.path);
  const leave = id ? db.get('leaves').find({ id }).value() : undefined;

  if (id && !leave) {
    return res.status(404).json({ message: 'Demande de congé introuvable.' });
  }
  if (leave && !isAdmin && leave.employeeId !== me) {
    return res.status(403).json({ message: "Cette demande appartient à quelqu'un d'autre." });
  }

  if (req.method === 'GET') {
    // Un employe ne recoit que ses demandes, quels que soient les parametres envoyes.
    if (!isAdmin && !id) {
      req.query.employeeId = String(me);
    }
    return next();
  }

  if (req.method === 'POST') {
    const errors = validateLeave(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: errors });
    }
    const employeeId = isAdmin && Number.isInteger(req.body.employeeId) ? req.body.employeeId : me;
    req.body = {
      employeeId,
      type: req.body.type,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      days: countWorkingDays(req.body.startDate, req.body.endDate),
      reason: typeof req.body.reason === 'string' ? req.body.reason.trim() : '',
      // Ces valeurs sont fixees par le serveur, jamais par le client.
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return next();
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (!isAdmin) {
      return res.status(403).json({ message: 'Seul un administrateur RH peut traiter une demande.' });
    }
    const status = req.body?.status;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: ['Le statut doit valoir pending, approved ou rejected.'] });
    }
    // Seul le statut est modifiable : le reste de la demande appartient a l'employe.
    req.method = 'PATCH';
    req.body = { status };
    return next();
  }

  if (req.method === 'DELETE') {
    if (!isAdmin && leave.status !== 'pending') {
      return res.status(409).json({ message: 'Seule une demande en attente peut être annulée.' });
    }
    return next();
  }

  next();
});

// Le CRUD de json-server, sous le prefixe /api.
server.use('/api', router);

server.listen(PORT, () => {
  console.log(`API TechCorp Equipe : http://localhost:${PORT}/api`);
  console.log(`Comptes de demonstration (mot de passe ${accounts[0].password}) :`);
  for (const account of accounts) {
    console.log(`  - ${account.email} (${account.role})`);
  }
});

// ---------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------

function readToken(req) {
  const header = req.headers.authorization ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

function publicUser(account) {
  const employee = db.get('employees').find({ id: account.employeeId }).value();
  return {
    id: account.employeeId,
    firstName: employee?.firstName ?? '',
    lastName: employee?.lastName ?? '',
    email: account.email,
    role: account.role,
  };
}

// "/12" -> 12, "/" -> undefined
function idFromPath(urlPath) {
  const match = /^\/(\d+)\/?$/.exec(urlPath);
  return match ? Number(match[1]) : undefined;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEXT_FIELDS = { firstName: 'Le prénom', lastName: 'Le nom', job: 'Le poste' };

function validateEmployee(body, currentId) {
  const messages = [];
  if (typeof body !== 'object' || body === null) {
    return { messages: ['Les données envoyées sont invalides.'] };
  }
  for (const [field, label] of Object.entries(TEXT_FIELDS)) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      messages.push(`${label} est obligatoire.`);
    }
  }
  if (typeof body.email !== 'string' || !EMAIL_PATTERN.test(body.email)) {
    messages.push("L'adresse e-mail est invalide.");
  }
  const departments = db.get('departments').map('name').value();
  if (!departments.includes(body.department)) {
    messages.push(`Le service doit être l'un de : ${departments.join(', ')}.`);
  }
  if (typeof body.remote !== 'boolean') {
    messages.push('Le télétravail doit valoir true ou false.');
  }
  if (messages.length === 0) {
    const email = body.email.trim().toLowerCase();
    const duplicate = db
      .get('employees')
      .find((e) => e.email.toLowerCase() === email && e.id !== currentId)
      .value();
    if (duplicate) {
      return { messages, conflict: 'Cette adresse e-mail est déjà utilisée par un collègue.' };
    }
  }
  return { messages };
}

function pickEmployee(body) {
  return {
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.trim().toLowerCase(),
    job: body.job.trim(),
    department: body.department,
    remote: body.remote,
  };
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateLeave(body) {
  const messages = [];
  if (!['paid', 'rtt', 'unpaid'].includes(body?.type)) {
    messages.push('Le type doit valoir paid, rtt ou unpaid.');
  }
  const { startDate, endDate } = body ?? {};
  if (!DATE_PATTERN.test(startDate ?? '') || !DATE_PATTERN.test(endDate ?? '')) {
    messages.push('Les dates doivent être au format AAAA-MM-JJ.');
  } else if (endDate < startDate) {
    messages.push('La date de fin doit être postérieure ou égale à la date de début.');
  } else if (countWorkingDays(startDate, endDate) === 0) {
    messages.push('La période ne contient aucun jour ouvré.');
  }
  return messages;
}

function countWorkingDays(start, end) {
  let count = 0;
  for (let d = new Date(`${start}T00:00:00Z`); d <= new Date(`${end}T00:00:00Z`); ) {
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return count;
}
