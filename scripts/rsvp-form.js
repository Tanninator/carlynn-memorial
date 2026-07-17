// <rsvp-form> — autonomous custom element for the memorial RSVP form.
// Theme via CSS custom properties on the host:
//   --rsvp-ink, --rsvp-ink-soft, --rsvp-accent, --rsvp-line, --rsvp-bg, --rsvp-serif
// Endpoint via the `endpoint` attribute (default: "/api/rsvp").

(function () {
  const NAME_MAX = 80;
  const EMAIL_MAX = 120;
  const GUEST_MAX = 80;
  const GUESTS_MAX = 10;

  const css = `
:host {
  --rsvp-ink: #f3ead7;
  --rsvp-ink-soft: #d8cdb4;
  --rsvp-accent: #c89968;
  --rsvp-line: rgba(200,153,104,0.3);
  --rsvp-bg: rgba(10,20,34,0.6);
  --rsvp-serif: "Cormorant Garamond", Georgia, serif;
  --rsvp-sans: "Inter", system-ui, sans-serif;
  display: block;
  color: var(--rsvp-ink);
  font-family: var(--rsvp-sans);
}
* { box-sizing: border-box; }

.wrap { padding: 28px 28px 24px; background: var(--rsvp-bg); }
.title {
  font-family: var(--rsvp-serif); font-weight: 500;
  font-size: 28px; line-height: 1.1; margin: 0 0 6px;
}
.lede {
  color: var(--rsvp-ink-soft); font-family: var(--rsvp-serif); font-style: italic;
  font-size: 16px; line-height: 1.4; margin: 0 0 22px;
}

label.fld { display: block; margin-bottom: 18px; }
label.fld > span {
  display: block; color: var(--rsvp-accent);
  font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
  margin-bottom: 6px;
}
input.txt {
  width: 100%; background: transparent; border: 0;
  border-bottom: 1px solid var(--rsvp-line);
  color: var(--rsvp-ink); font-family: var(--rsvp-serif); font-size: 18px;
  padding: 6px 0 10px; outline: none;
}
input.txt:focus { border-bottom-color: var(--rsvp-accent); }
input.txt:disabled { opacity: 0.6; }

textarea.notes {
  width: 100%; background: transparent; border: 1px solid var(--rsvp-line);
  color: var(--rsvp-ink); font-family: var(--rsvp-serif); font-size: 16px;
  padding: 10px 12px; outline: none; resize: vertical; line-height: 1.45;
}
textarea.notes:focus { border-color: var(--rsvp-accent); }
textarea.notes:disabled { opacity: 0.6; }
textarea.notes::placeholder { color: var(--rsvp-ink-soft); opacity: 0.55; }
.fld > span .opt { color: var(--rsvp-ink-soft); letter-spacing: 0.18em; }

.name-row { display: flex; gap: 16px; }
.name-row > .fld { flex: 1; }
@media (max-width: 430px) { .name-row { flex-wrap: wrap; gap: 0; } .name-row > .fld { flex: 1 1 100%; } }

.attend { margin: 4px 0 22px; }
.attend > .label {
  display: block; color: var(--rsvp-accent);
  font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
  margin-bottom: 10px;
}
.radios { display: flex; flex-wrap: wrap; gap: 14px 28px; }
.radio { display: inline-flex; align-items: center; gap: 9px; cursor: pointer; font-family: var(--rsvp-serif); font-size: 18px; color: var(--rsvp-ink); }
.radio input { accent-color: var(--rsvp-accent); width: 17px; height: 17px; cursor: pointer; }
.radio input:disabled { cursor: not-allowed; opacity: 0.6; }

.guests { margin: 4px 0 22px; }
.guests > .label {
  display: block; color: var(--rsvp-accent);
  font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase;
  margin-bottom: 8px;
}
.guest-row { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; margin-bottom: 12px; }
.guest-row .guest-name { flex: 1 1 150px; }
.guest-child { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; font-family: var(--rsvp-serif); font-size: 15px; color: var(--rsvp-ink-soft); white-space: nowrap; }
.guest-child input { accent-color: var(--rsvp-accent); width: 15px; height: 15px; cursor: pointer; }
.guest-age { flex: 0 0 76px; }
.guest-row button.remove {
  background: transparent; border: 1px solid var(--rsvp-line);
  color: var(--rsvp-ink-soft); cursor: pointer;
  width: 32px; height: 32px; font-size: 18px; line-height: 1;
}
.guest-row button.remove:hover { color: var(--rsvp-accent); border-color: var(--rsvp-accent); }
.add {
  display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
  background: transparent; border: 1px solid var(--rsvp-line);
  color: var(--rsvp-ink-soft);
  padding: 8px 14px; font: inherit; font-size: 11px;
  letter-spacing: 0.2em; text-transform: uppercase;
  margin-top: 4px;
}
.add:hover { color: var(--rsvp-accent); border-color: var(--rsvp-accent); }
.add:disabled { opacity: 0.4; cursor: not-allowed; }

button.submit {
  width: 100%; background: var(--rsvp-accent); color: #0a1422;
  border: 0; padding: 14px 22px; cursor: pointer;
  font: inherit; font-size: 11px; letter-spacing: 0.3em;
  text-transform: uppercase; font-weight: 600;
  margin-top: 8px;
}
button.submit:hover:not(:disabled) { filter: brightness(1.06); }
button.submit:disabled { opacity: 0.65; cursor: not-allowed; }

.note { color: var(--rsvp-ink-soft); font-size: 12px; margin-top: 12px; text-align: center; }

.banner {
  border: 1px solid var(--rsvp-accent);
  color: var(--rsvp-ink); padding: 12px 14px; margin-bottom: 18px;
  font-size: 14px; line-height: 1.4;
}
.banner.error { border-color: #d99c8a; color: #f0c8bb; }

.done {
  text-align: center; padding: 16px 8px 6px;
}
.done h3 {
  font-family: var(--rsvp-serif); font-weight: 500;
  font-size: 26px; margin: 6px 0 8px;
}
.done p { color: var(--rsvp-ink-soft); margin: 0 0 16px; }
.done a {
  color: var(--rsvp-accent); cursor: pointer;
  font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
  text-decoration: none; border-bottom: 1px solid var(--rsvp-line);
  padding-bottom: 2px;
}
.done a:hover { color: var(--rsvp-ink); }
`;

  // UI strings by language. English is the fallback for any missing key.
  // Kept in sync with the site-wide switcher in scripts/i18n.js.
  const LABELS = {
    en: {
      title: "Kindly Reply",
      lede: "Let us know if you will be joining us.",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      attendQ: "Will you attend:",
      inPerson: "In person",
      virtually: "Virtually",
      guestsLabel: "Guests you'll bring (including children)",
      child: "Child",
      age: "Age",
      guestName: "Guest name",
      addGuest: "+ Add guest",
      removeGuest: "Remove guest",
      notes: "Notes",
      optional: "(optional)",
      notesPlaceholder: "Questions, childcare needs, or any other comments.",
      send: "Send RSVP",
      sending: "Sending…",
      footNote: "No account needed. We'll only use your email if plans change.",
      thanks: "Thank you",
      thanksBody: "Thank you for letting us know. We'll be in touch with details.",
      another: "Submit another RSVP",
      errFirst: "Please enter your first name.",
      errLast: "Please enter your last name.",
      errEmail: "Please enter your email.",
      errEmailBad: "That email address doesn't look right.",
      errAttend: "Please let us know if you'll attend in person or virtually.",
      errAge: function (name) { return "Please enter an age (0–17) for " + name + "."; },
      errMaxGuests: function (max) { return "Please list at most " + max + " additional guests."; },
      errBot: "Please complete the bot check.",
      errNetwork: "Couldn't reach the server. Please try again.",
      errServer: "Something went wrong on our end. Please try again in a moment.",
      errClient: "Something looked off with that submission. Please check the fields.",
    },
    fr: {
      title: "Merci de répondre",
      lede: "Faites-nous savoir si vous serez des nôtres.",
      firstName: "Prénom",
      lastName: "Nom",
      email: "E-mail",
      attendQ: "Serez-vous présent :",
      inPerson: "En personne",
      virtually: "À distance",
      guestsLabel: "Invités que vous amènerez (enfants compris)",
      child: "Enfant",
      age: "Âge",
      guestName: "Nom de l'invité",
      addGuest: "+ Ajouter un invité",
      removeGuest: "Retirer l'invité",
      notes: "Remarques",
      optional: "(facultatif)",
      notesPlaceholder: "Questions, besoins de garde d'enfants ou tout autre commentaire.",
      send: "Envoyer la réponse",
      sending: "Envoi…",
      footNote: "Aucun compte requis. Nous n'utiliserons votre e-mail qu'en cas de changement.",
      thanks: "Merci",
      thanksBody: "Merci de nous avoir prévenus. Nous vous communiquerons les détails.",
      another: "Envoyer une autre réponse",
      errFirst: "Veuillez saisir votre prénom.",
      errLast: "Veuillez saisir votre nom.",
      errEmail: "Veuillez saisir votre e-mail.",
      errEmailBad: "Cette adresse e-mail semble incorrecte.",
      errAttend: "Veuillez indiquer si vous serez présent en personne ou à distance.",
      errAge: function (name) { return "Veuillez indiquer un âge (0–17) pour " + name + "."; },
      errMaxGuests: function (max) { return "Veuillez indiquer au maximum " + max + " invités supplémentaires."; },
      errBot: "Veuillez compléter la vérification anti-robot.",
      errNetwork: "Impossible de joindre le serveur. Veuillez réessayer.",
      errServer: "Une erreur est survenue de notre côté. Veuillez réessayer dans un instant.",
      errClient: "Un problème est survenu avec cet envoi. Veuillez vérifier les champs.",
    },
    zh: {
      title: "敬请回复",
      lede: "请告知我们您是否能出席。",
      firstName: "名字",
      lastName: "姓氏",
      email: "电子邮箱",
      attendQ: "您将如何出席：",
      inPerson: "亲自到场",
      virtually: "线上参加",
      guestsLabel: "您将携带的宾客（含儿童）",
      child: "儿童",
      age: "年龄",
      guestName: "宾客姓名",
      addGuest: "+ 添加宾客",
      removeGuest: "移除宾客",
      notes: "留言",
      optional: "（选填）",
      notesPlaceholder: "疑问、儿童看护需求，或其他任何留言。",
      send: "提交回复",
      sending: "提交中…",
      footNote: "无需注册账户。仅在安排有变时，我们才会使用您的邮箱。",
      thanks: "谢谢您",
      thanksBody: "感谢您的告知。我们会与您联系并告知详情。",
      another: "再提交一份回复",
      errFirst: "请填写您的名字。",
      errLast: "请填写您的姓氏。",
      errEmail: "请填写您的电子邮箱。",
      errEmailBad: "该电子邮箱地址似乎有误。",
      errAttend: "请告知您将亲自到场还是线上参加。",
      errAge: function (name) { return "请为 " + name + " 填写年龄（0–17 岁）。"; },
      errMaxGuests: function (max) { return "最多可添加 " + max + " 位额外宾客。"; },
      errBot: "请完成人机验证。",
      errNetwork: "无法连接服务器，请重试。",
      errServer: "我们这边出了点问题，请稍后再试。",
      errClient: "提交内容似乎有误，请检查各项填写。",
    },
  };

  class RsvpForm extends HTMLElement {
    constructor() {
      super();
      this._state = "editing";
      this._guests = [];
      this._error = "";
      this._turnstileToken = "";
      this._pendingFirst = "";
      this._pendingLast = "";
      this._pendingEmail = "";
      this._attendance = "";
      this._pendingNotes = "";
      this._root = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this._render();
      // Re-render labels when the site language changes (see scripts/i18n.js).
      this._onLang = () => {
        this._snapshotInputs();
        this._render();
      };
      document.addEventListener("i18n:changed", this._onLang);
    }

    disconnectedCallback() {
      if (this._onLang) document.removeEventListener("i18n:changed", this._onLang);
    }

    _lang() {
      return (window.I18N && window.I18N.lang) || "en";
    }

    _t(key) {
      const dict = LABELS[this._lang()] || LABELS.en;
      const val = dict[key];
      return val == null ? LABELS.en[key] : val;
    }

    reset() {
      this._state = "editing";
      this._guests = [];
      this._error = "";
      this._turnstileToken = "";
      this._pendingFirst = "";
      this._pendingLast = "";
      this._pendingEmail = "";
      this._attendance = "";
      this._pendingNotes = "";
      this._render();
      this.dispatchEvent(new CustomEvent("rsvp-reset", { bubbles: true, composed: true }));
    }

    // Turnstile is mounted in light DOM by the page (its widget script can't
    // safely run inside shadow DOM). The page calls these to relay the token.
    setTurnstileToken(token) {
      this._turnstileToken = String(token || "");
    }

    clearTurnstileToken() {
      this._turnstileToken = "";
    }

    get isDone() {
      return this._state === "done";
    }

    get _endpoint() {
      return this.getAttribute("endpoint") || "/api/rsvp";
    }

    _render() {
      this._root.innerHTML = `<style>${css}</style><div class="wrap">${this._html()}</div>`;
      this._wireEvents();
    }

    _html() {
      if (this._state === "done") {
        return `
          <div class="done" role="status">
            <h3>${escapeHtml(this._t("thanks"))}</h3>
            <p>${escapeHtml(this._t("thanksBody"))}</p>
            <a href="#" data-action="another">${escapeHtml(this._t("another"))}</a>
          </div>
        `;
      }

      const errorBanner =
        this._state === "error" && this._error
          ? `<div class="banner error" role="alert">${escapeHtml(this._error)}</div>`
          : "";

      const isSubmitting = this._state === "submitting";
      const submitLabel = isSubmitting ? this._t("sending") : this._t("send");

      const guestRows = this._guests
        .map((g, i) => {
          const dis = isSubmitting ? "disabled" : "";
          const ageField = g.child
            ? `<input class="txt guest-age" type="number" min="0" max="17" inputmode="numeric"
                      data-guest-age="${i}" placeholder="${escapeAttr(this._t("age"))}" value="${escapeAttr(g.age ?? "")}" ${dis}>`
            : "";
          return `
        <div class="guest-row">
          <input class="txt guest-name" type="text" data-guest-name="${i}"
                 maxlength="${GUEST_MAX}" autocomplete="off"
                 placeholder="${escapeAttr(this._t("guestName"))}"
                 value="${escapeAttr(g.name ?? "")}" ${dis}>
          <label class="guest-child"><input type="checkbox" data-guest-child="${i}"
                 ${g.child ? "checked" : ""} ${dis}> ${escapeHtml(this._t("child"))}</label>
          ${ageField}
          <button type="button" class="remove" data-remove-idx="${i}"
                  aria-label="${escapeAttr(this._t("removeGuest"))}" ${dis}>×</button>
        </div>
      `;
        })
        .join("");

      return `
        <h2 class="title">${escapeHtml(this._t("title"))}</h2>
        <p class="lede">${escapeHtml(this._t("lede"))}</p>
        ${errorBanner}
        <form data-form novalidate>
          <div class="name-row">
            <label class="fld">
              <span>${escapeHtml(this._t("firstName"))}</span>
              <input class="txt" type="text" name="firstName" required
                     maxlength="40" autocomplete="given-name"
                     value="${escapeAttr(this._pendingFirst ?? "")}"
                     ${isSubmitting ? "disabled" : ""}>
            </label>
            <label class="fld">
              <span>${escapeHtml(this._t("lastName"))}</span>
              <input class="txt" type="text" name="lastName" required
                     maxlength="40" autocomplete="family-name"
                     value="${escapeAttr(this._pendingLast ?? "")}"
                     ${isSubmitting ? "disabled" : ""}>
            </label>
          </div>

          <label class="fld">
            <span>${escapeHtml(this._t("email"))}</span>
            <input class="txt" type="email" name="email" required
                   maxlength="${EMAIL_MAX}" autocomplete="email"
                   value="${escapeAttr(this._pendingEmail ?? "")}"
                   ${isSubmitting ? "disabled" : ""}>
          </label>

          <div class="attend">
            <span class="label">${escapeHtml(this._t("attendQ"))}</span>
            <div class="radios">
              <label class="radio"><input type="radio" name="attendance" value="in_person"
                     ${this._attendance === "in_person" ? "checked" : ""} ${isSubmitting ? "disabled" : ""}> ${escapeHtml(this._t("inPerson"))}</label>
              <label class="radio"><input type="radio" name="attendance" value="virtual"
                     ${this._attendance === "virtual" ? "checked" : ""} ${isSubmitting ? "disabled" : ""}> ${escapeHtml(this._t("virtually"))}</label>
            </div>
          </div>

          <div class="guests">
            <span class="label">${escapeHtml(this._t("guestsLabel"))}</span>
            ${guestRows}
            <button type="button" class="add" data-add
                    ${this._guests.length >= GUESTS_MAX || isSubmitting ? "disabled" : ""}>
              ${escapeHtml(this._t("addGuest"))}
            </button>
          </div>

          <label class="fld">
            <span>${escapeHtml(this._t("notes"))} <span class="opt">${escapeHtml(this._t("optional"))}</span></span>
            <textarea class="notes" name="notes" rows="3" maxlength="1000"
                      placeholder="${escapeAttr(this._t("notesPlaceholder"))}"
                      ${isSubmitting ? "disabled" : ""}>${escapeHtml(this._pendingNotes ?? "")}</textarea>
          </label>

          <button class="submit" type="submit"
                  ${isSubmitting ? "disabled" : ""}
                  ${isSubmitting ? 'aria-busy="true"' : ""}>${escapeHtml(submitLabel)}</button>
          <p class="note">${escapeHtml(this._t("footNote"))}</p>
        </form>
      `;
    }

    _wireEvents() {
      const root = this._root;
      const form = root.querySelector("[data-form]");
      const addBtn = root.querySelector("[data-add]");
      const another = root.querySelector('[data-action="another"]');

      if (addBtn) {
        addBtn.addEventListener("click", () => {
          if (this._guests.length >= GUESTS_MAX) return;
          this._snapshotInputs();
          this._guests.push({ name: "", child: false, age: "" });
          this._render();
          // focus the newly-added row
          const idx = this._guests.length - 1;
          const newInput = this._root.querySelector(`input[data-guest-name="${idx}"]`);
          if (newInput) newInput.focus();
        });
      }

      root.querySelectorAll("[data-remove-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.getAttribute("data-remove-idx"));
          this._snapshotInputs();
          this._guests.splice(idx, 1);
          this._render();
        });
      });

      root.querySelectorAll("[data-guest-child]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const idx = Number(cb.getAttribute("data-guest-child"));
          this._snapshotInputs();
          if (this._guests[idx]) {
            this._guests[idx].child = cb.checked;
            if (!cb.checked) this._guests[idx].age = "";
          }
          this._render();
          if (cb.checked) {
            const ageInput = this._root.querySelector(`input[data-guest-age="${idx}"]`);
            if (ageInput) ageInput.focus();
          }
        });
      });

      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          this._snapshotInputs();
          this._submit();
        });
      }

      if (another) {
        another.addEventListener("click", (e) => {
          e.preventDefault();
          this.reset();
        });
      }
    }

    _snapshotGuests() {
      this._root.querySelectorAll(".guest-row").forEach((row) => {
        const nameEl = row.querySelector("[data-guest-name]");
        if (!nameEl) return;
        const idx = Number(nameEl.getAttribute("data-guest-name"));
        if (!Number.isInteger(idx) || idx < 0 || idx >= this._guests.length) return;
        const childEl = row.querySelector("[data-guest-child]");
        const ageEl = row.querySelector("[data-guest-age]");
        const child = childEl ? childEl.checked : false;
        this._guests[idx] = {
          name: nameEl.value,
          child,
          age: child && ageEl ? ageEl.value : "",
        };
      });
    }

    _snapshotInputs() {
      this._snapshotGuests();
      const firstEl = this._root.querySelector('input[name="firstName"]');
      const lastEl = this._root.querySelector('input[name="lastName"]');
      const emailEl = this._root.querySelector('input[name="email"]');
      const attEl = this._root.querySelector('input[name="attendance"]:checked');
      if (firstEl) this._pendingFirst = firstEl.value;
      if (lastEl) this._pendingLast = lastEl.value;
      if (emailEl) this._pendingEmail = emailEl.value;
      if (attEl) this._attendance = attEl.value;
      const notesEl = this._root.querySelector('textarea[name="notes"]');
      if (notesEl) this._pendingNotes = notesEl.value;
    }

    async _submit() {
      this._snapshotGuests();
      const firstEl = this._root.querySelector('input[name="firstName"]');
      const lastEl = this._root.querySelector('input[name="lastName"]');
      const emailEl = this._root.querySelector('input[name="email"]');
      const first = (firstEl?.value ?? "").trim();
      const last = (lastEl?.value ?? "").trim();
      this._pendingFirst = first;
      this._pendingLast = last;
      const email = (emailEl?.value ?? "").trim();
      this._pendingEmail = email;
      const attendance = this._root.querySelector('input[name="attendance"]:checked')?.value || "";
      this._attendance = attendance;
      const notes = (this._root.querySelector('textarea[name="notes"]')?.value ?? "").trim();
      this._pendingNotes = notes;
      const guests = this._guests
        .map((g) => ({
          name: (g.name ?? "").trim(),
          child: !!g.child,
          age: g.child ? String(g.age ?? "").trim() : "",
        }))
        .filter((g) => g.name);
      const turnstileToken = this._turnstileToken;

      if (!first) return this._fail(this._t("errFirst"));
      if (!last) return this._fail(this._t("errLast"));
      if (!email) return this._fail(this._t("errEmail"));
      if (!/^\S+@\S+\.\S+$/.test(email)) return this._fail(this._t("errEmailBad"));
      if (attendance !== "in_person" && attendance !== "virtual") {
        return this._fail(this._t("errAttend"));
      }
      for (const g of guests) {
        if (g.child) {
          const n = Number(g.age);
          if (g.age === "" || !Number.isInteger(n) || n < 0 || n > 17) {
            return this._fail(this._t("errAge")(g.name));
          }
        }
      }
      if (guests.length > GUESTS_MAX) return this._fail(this._t("errMaxGuests")(GUESTS_MAX));
      if (!turnstileToken) return this._fail(this._t("errBot"));

      const name = `${first} ${last}`;
      const guestsPayload = guests.map((g) => ({
        name: g.name,
        child: g.child,
        age: g.child ? Number(g.age) : null,
      }));

      this._state = "submitting";
      this._error = "";
      this._render();

      let res;
      try {
        res = await fetch(this._endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, attendance, notes, guests: guestsPayload, turnstileToken }),
        });
      } catch {
        // Pending values are already stored; the re-render will re-fill the fields.
        // Turnstile tokens are single-use; force a fresh widget for retry.
        this._turnstileToken = "";
        return this._fail(this._t("errNetwork"));
      }

      if (res.ok) {
        this._state = "done";
        this._error = "";
        this._turnstileToken = "";
        this._render();
        this.dispatchEvent(new CustomEvent("rsvp-submitted", { bubbles: true, composed: true }));
        return;
      }

      let serverMsg = "";
      try {
        const body = await res.json();
        if (body && typeof body.error === "string") serverMsg = body.error;
      } catch {}
      this._turnstileToken = "";
      if (res.status >= 500) {
        return this._fail(serverMsg || this._t("errServer"));
      }
      return this._fail(serverMsg || this._t("errClient"));
    }

    _fail(message) {
      this._state = "error";
      this._error = message;
      this._render();
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(s) {
    return escapeHtml(s);
  }

  if (!customElements.get("rsvp-form")) {
    customElements.define("rsvp-form", RsvpForm);
  }
})();
