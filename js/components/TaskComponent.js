class TaskComponent {
  constructor(
    inputSelector,
    buttonSelector,
    containerSelector,
    storageService,
  ) {
    this.inputBox = document.querySelector(inputSelector);
    this.addButton = document.querySelector(buttonSelector);
    this.container = document.querySelector(containerSelector);
    this.storage = storageService;
    this.tasksByTag = {};
    this.currentTag = null;
    this.init();
  }

  init() {
    this.loadTasks();
    this.setupEventListeners();
  }

  loadTasks() {
    const saved = this.storage.get("tasks", {});
    this.tasksByTag = saved;
  }

  saveTasks() {
    this.storage.set("tasks", this.tasksByTag);
  }

  setCurrentTag(tagId) {
    this.currentTag = tagId;
    if (!this.tasksByTag[tagId]) {
      this.tasksByTag[tagId] = [];
    }
    this.renderTasks();
  }

  voiceTasks() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (window.toast) {
        toast.error("Your browser does not support voice recognition.");
      } else {
        alert("Sorry, your browser does not support voice recognition.");
      }
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    
    const addBtn = document.getElementById("add-task");
    let isListening = false;

    recognition.onstart = () => {
      isListening = true;
      if (addBtn) addBtn.innerHTML = '<i class="fa-solid fa-microphone" style="color: red;"></i>';
      if (window.toast) toast.info("Listening... Speak your task");
    };

    recognition.onresult = (event) => {
      if (event.results && event.results.length > 0) {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        if (transcript) {
          this.inputBox.value = transcript;
          this.addTask(transcript);
          if (window.toast) toast.success(`Task added: "${transcript}"`);
        }
      }
    };

    recognition.onerror = (event) => {
      isListening = false;
      console.error("Voice recognition error:", event.error);
      if (window.toast) toast.error(`Voice error: ${event.error}`);
    };

    recognition.onend = () => {
      isListening = false;
      if (addBtn) addBtn.innerHTML = "Add";
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start voice recognition:", error);
      if (window.toast) toast.error("Failed to start voice recognition");
    }
  }

  addTask(taskText = null) {
    const text = (taskText || this.inputBox.value).trim();

    if (!text) {
      this.voiceTasks();
      return false;
    }

    if (!this.tasksByTag[this.currentTag]) {
      this.tasksByTag[this.currentTag] = [];
    }

    this.tasksByTag[this.currentTag].push({ text, checked: false });
    this.saveTasks();
    this.inputBox.value = "";
    this.renderTasks();

    return true;
  }

  deleteTask(taskText) {
    if (this.tasksByTag[this.currentTag]) {
      this.tasksByTag[this.currentTag] = this.tasksByTag[
        this.currentTag
      ].filter((t) => t.text !== taskText);
      this.saveTasks();
      this.renderTasks();
    }
  }

  renderTasks() {
    this.container.innerHTML = "";
    const tasks = this.tasksByTag[this.currentTag] || [];

    if (tasks.length === 0) {
      this.container.innerHTML =
        '<li id="no-task" style="text-align: center; color: var(--text-light); padding: 2rem;">No tasks yet</li>';
      return;
    }

    tasks.forEach((task) => {
      const li = this.createTaskElement(task);
      this.container.appendChild(li);
    });
  }

  createTaskElement(task) {
    const li = document.createElement("li");
    li.textContent = task.text;

    if (task.checked) {
      li.classList.add("checked");
    }

    const deleteSpan = document.createElement("span");
    deleteSpan.innerHTML = "\u00d7";
    deleteSpan.className = "task-delete";
    li.appendChild(deleteSpan);

    // Only attach toggle logic if this is NOT the #no-task placeholder
    if (li.id !== "no-task") {
      li.addEventListener("click", (e) => {
        if (e.target !== deleteSpan) {
          task.checked = !task.checked; // persist state
          li.classList.toggle("checked");
          this.saveTasks();
        }
      });

      deleteSpan.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deleteTask(task.text);
      });
    }

    return li;
  }

  setupEventListeners() {
    if (this.addButton) {
      this.addButton.addEventListener("click", () => this.addTask());
    }

    this.inputBox.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTask();
      }
    });
  }

  getTasks(tagId) {
    return this.tasksByTag[tagId] || [];
  }

  searchTasks(query) {
    const tasks = this.tasksByTag[this.currentTag] || [];
    return tasks.filter((task) =>
      task.text.toLowerCase().includes(query.toLowerCase()),
    );
  }
}
