class InboxComponent {
  constructor(containerSelector, storageService) {
    this.container = document.querySelector(containerSelector);
    this.storage = storageService;
    this.invitations = [];
    this.init();
  }

  init() {
    this.loadInvitations();
    this.renderInvitations();
  }

  loadInvitations() {
    this.invitations = this.storage.get("invitations", []);
  }

  renderInvitations() {
    if (!this.container) return;

    this.container.innerHTML = "";

    if (this.invitations.length === 0) {
      this.container.innerHTML =
        '<li id="no-invitation" style="text-align: center; color: var(--text-light); padding: 2rem;">No invitations</li>';
      return;
    }

    this.invitations.forEach((invitation, index) => {
      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.flexDirection = "column";
      li.style.padding = "1.5rem";
      li.style.borderBottom = "1px solid var(--gray-hover)";
      li.style.backgroundColor = "var(--secondary-bg)";
      li.style.margin = "0.5rem";
      li.style.borderRadius = "0.5rem";

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.marginBottom = "1rem";

      const title = document.createElement("h3");
      title.textContent = invitation.listTitle;
      title.style.color = "var(--accent)";
      title.style.margin = "0";

      const sender = document.createElement("span");
      sender.textContent = `From: ${invitation.senderName}`;
      sender.style.fontSize = "0.9rem";
      sender.style.color = "var(--text-light)";

      header.appendChild(title);

      const senderDiv = document.createElement("div");
      senderDiv.appendChild(sender);
      senderDiv.style.marginBottom = "0.5rem";

      const message = document.createElement("p");
      message.textContent = `${invitation.senderName} invited you to join "${invitation.listTitle}"`;
      message.style.color = "var(--text)";
      message.style.margin = "0.5rem 0";
      message.style.fontSize = "0.95rem";

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "1rem";
      actions.style.marginTop = "1rem";

      const acceptBtn = document.createElement("button");
      acceptBtn.textContent = "Accept";
      acceptBtn.style.padding = "0.75rem 1.5rem";
      acceptBtn.style.backgroundColor = "var(--accent)";
      acceptBtn.style.color = "var(--primary-bg)";
      acceptBtn.style.border = "none";
      acceptBtn.style.borderRadius = "0.5rem";
      acceptBtn.style.cursor = "pointer";
      acceptBtn.style.fontWeight = "500";

      acceptBtn.addEventListener("click", () => {
        this.acceptInvitation(index);
      });

      const declineBtn = document.createElement("button");
      declineBtn.textContent = "Decline";
      declineBtn.style.padding = "0.75rem 1.5rem";
      declineBtn.style.backgroundColor = "var(--gray-hover)";
      declineBtn.style.color = "var(--text)";
      declineBtn.style.border = "none";
      declineBtn.style.borderRadius = "0.5rem";
      declineBtn.style.cursor = "pointer";
      declineBtn.style.fontWeight = "500";

      declineBtn.addEventListener("click", () => {
        this.declineInvitation(index);
      });

      actions.appendChild(acceptBtn);
      actions.appendChild(declineBtn);

      li.appendChild(header);
      li.appendChild(senderDiv);
      li.appendChild(message);
      li.appendChild(actions);

      this.container.appendChild(li);
    });
  }

  addInvitation(senderName, listTitle, listId) {
    const invitation = {
      id: `invite_${Date.now()}`,
      senderName: senderName,
      listTitle: listTitle,
      listId: listId,
      createdAt: new Date().toISOString(),
    };

    this.invitations.push(invitation);
    this.storage.set("invitations", this.invitations);
    this.renderInvitations();
    
    if (window.toast) {
      toast.info(`New invitation from ${senderName} for "${listTitle}"`);
    }
  }

  acceptInvitation(index) {
    if (index >= 0 && index < this.invitations.length) {
      const invitation = this.invitations[index];
      
      // Add shared list to user's shared lists
      let sharedLists = this.storage.get("sharedLists", []);
      sharedLists.push({
        id: invitation.listId,
        title: invitation.listTitle,
        owner: invitation.senderName,
        acceptedAt: new Date().toISOString(),
      });
      this.storage.set("sharedLists", sharedLists);

      // Remove invitation
      this.invitations.splice(index, 1);
      this.storage.set("invitations", this.invitations);
      this.renderInvitations();

      if (window.toast) {
        toast.success(`Accepted invitation for "${invitation.listTitle}"`);
      }
    }
  }

  declineInvitation(index) {
    if (index >= 0 && index < this.invitations.length) {
      const invitation = this.invitations[index];
      this.invitations.splice(index, 1);
      this.storage.set("invitations", this.invitations);
      this.renderInvitations();

      if (window.toast) {
        toast.info(`Declined invitation for "${invitation.listTitle}"`);
      }
    }
  }

  refresh() {
    this.loadInvitations();
    this.renderInvitations();
  }
}
