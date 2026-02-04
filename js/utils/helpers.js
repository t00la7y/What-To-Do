function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function throttle(func, interval = 300) {
  let lastCallTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCallTime >= interval) {
      lastCallTime = now;
      func.apply(this, args);
    }
  };
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function getElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element;
}

function getAllElements(selector) {
  return document.querySelectorAll(selector);
}

function addClass(element, className) {
  element.classList.add(className);
}

function removeClass(element, className) {
  element.classList.remove(className);
}

function toggleClass(element, className) {
  element.classList.toggle(className);
}

function hasClass(element, className) {
  return element.classList.contains(className);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelToKebab(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}

function kebabToCamel(str) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

function generateId() {
  return "id_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

function wait(ms = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getQueryParam(param) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(param);
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
}

function confirm(message) {
  return window.confirm(message);
}

function groupBy(array, key) {
  return array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});
}

function sortBy(array, key, ascending = true) {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
}

function unique(array, key = null) {
  if (!key) return [...new Set(array)];

  const seen = new Set();
  return array.filter((item) => {
    const value = typeof key === "function" ? key(item) : item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function showPage(pageClass) {
  const pages = document.querySelectorAll('[class^="page-"]');

  pages.forEach((page) => {
    page.hidden = true;
    page.style.display = "none";
  });

  const target = document.querySelector(`.${pageClass}`);
  if (target) {
    target.hidden = false;
    target.style.display = "flex";
    target.style.height = "auto";
    target.style.width = "80%";
  }
}

function setFontSize(str) {
  switch (str) {
    case "small":
      document.documentElement.style.fontSize = "12px";
      toast.info("Font size set to Small");
      break;
    case "medium":
      document.documentElement.style.fontSize = "16px";
      toast.info("Font size set to Medium");
      break;
    case "large":
      document.documentElement.style.fontSize = "20px";
      toast.info("Font size set to Large");
      break;
    default:
      document.documentElement.style.fontSize = "16px";
      toast.warning("Invalid option. Defaulting to Medium");
      break;
  }
}

function clearTasks() {
  if (confirm("Are you sure you want to clear all tasks? This cannot be undone.")) {
    const storage = new StorageService("wtd_");
    storage.clear();
    location.reload();
    toast.success("All tasks cleared");
  }
}

function exportTasks() {
  try {
    const storage = new StorageService("wtd_");
    const tasks = storage.get("tasks", {});
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tasks-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Tasks exported successfully");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Failed to export tasks");
  }
}

function importTasks() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        const storage = new StorageService("wtd_");
        storage.set("tasks", imported);
        location.reload();
        toast.success("Tasks imported successfully");
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import tasks. Invalid file format");
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

function addTask() {
  if (window.app && window.app.tasks) {
    window.app.tasks.addTask();
  }
}

function toggleSignUp() {
  document.querySelector(".page-userProfile .logIn").style.display = "none";
  document.querySelector(".page-userProfile .signUp").style.display = "flex";
}

function toggleLogIn() {
  document.querySelector(".page-userProfile .signUp").style.display = "none";
  document.querySelector(".page-userProfile .logIn").style.display = "flex";
}

function sendInvitation(recipientUsername, listTitle, listId) {
  if (window.app && window.app.inbox) {
    const currentUser = localStorage.getItem("currentUsername") || "Anonymous";
    window.app.inbox.addInvitation(currentUser, listTitle, listId);
    if (window.toast) {
      toast.success(`Invitation sent to ${recipientUsername}`);
    }
  }
}
