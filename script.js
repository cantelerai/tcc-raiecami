let userType = "";
let eventos = [];
let membros = ["Ana", "João", "Carlos"];
let escala = ["Louvor - Domingo", "Limpeza - Quarta"];
const menu = document.getElementById("menu");
const menuItems = document.getElementById("menuItems");

function login(tipo) {
  userType = tipo;
  document.getElementById("loginScreen").classList.remove("active");
  menu.classList.remove("hidden");
  showScreen("eventos");
  loadMenu();
}

function loadMenu() {
  menuItems.innerHTML = "";

  addMenuItem("Eventos", "eventos");
  addMenuItem("Minha Escala", "escala");

  if (userType === "lider") {
    addMenuItem("Membros & Escalas", "membros");
  } else {
    addMenuItem("Sobre a Igreja", "sobre");
  }

  addMenuItem("Sair", "loginScreen", logout);
}

function addMenuItem(name, screenId, action = null) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = "#";
  a.innerText = name;
  a.onclick = () => {
    if (action) action();
    else showScreen(screenId);
  };
  li.appendChild(a);
  menuItems.appendChild(li);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "eventos" && userType === "lider") {
    document.getElementById("eventForm").classList.remove("hidden");
  } else if (id === "eventos") {
    document.getElementById("eventForm").classList.add("hidden");
  }

  if (id === "membros") loadMembros();
  if (id === "escala") loadEscala();
  if (id === "eventos") loadEventos();
}

function logout() {
  location.reload();
}

function addEvent() {
  const name = document.getElementById("eventName").value;
  const date = document.getElementById("eventDate").value;
  const preacher = document.getElementById("eventPreacher").value;

  if (name && date && preacher) {
    eventos.push({ name, date, preacher });
    loadEventos();
  }
}

function loadEventos() {
  const list = document.getElementById("eventList");
  list.innerHTML = "";
  eventos.forEach(e => {
    const li = document.createElement("li");
    li.innerText = `${e.name} - ${e.date} | Pregador: ${e.preacher}`;
    list.appendChild(li);
  });
}

function addMember() {
  const name = document.getElementById("newMember").value;
  if (name) {
    membros.push(name);
    loadMembros();
  }
}

function loadMembros() {
  const list = document.getElementById("memberList");
  list.innerHTML = "";
  membros.forEach((m, i) => {
    const li = document.createElement("li");
    li.innerText = m;
    const btn = document.createElement("button");
    btn.innerText = "Excluir";
    btn.onclick = () => {
      membros.splice(i, 1);
      loadMembros();
    };
    li.appendChild(btn);
    list.appendChild(li);
  });
}

function loadEscala() {
  const list = document.getElementById("escalaList");
  list.innerHTML = "";
  escala.forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    list.appendChild(li);
  });
}

