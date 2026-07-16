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
      this._root = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
      this._render();
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
            <h3>Thank you</h3>
            <p>Thank you for letting us know. We'll be in touch with details.</p>
            <a href="#" data-action="another">Submit another RSVP</a>
          </div>
        `;
      }

      const errorBanner =
        this._state === "error" && this._error
          ? `<div class="banner error" role="alert">${escapeHtml(this._error)}</div>`
          : "";

      const isSubmitting = this._state === "submitting";
      const submitLabel = isSubmitting ? "Sending…" : "Send RSVP";

      const guestRows = this._guests
        .map((g, i) => {
          const dis = isSubmitting ? "disabled" : "";
          const ageField = g.child
            ? `<input class="txt guest-age" type="number" min="0" max="17" inputmode="numeric"
                      data-guest-age="${i}" placeholder="Age" value="${escapeAttr(g.age ?? "")}" ${dis}>`
            : "";
          return `
        <div class="guest-row">
          <input class="txt guest-name" type="text" data-guest-name="${i}"
                 maxlength="${GUEST_MAX}" autocomplete="off"
                 placeholder="Guest name"
                 value="${escapeAttr(g.name ?? "")}" ${dis}>
          <label class="guest-child"><input type="checkbox" data-guest-child="${i}"
                 ${g.child ? "checked" : ""} ${dis}> Child</label>
          ${ageField}
          <button type="button" class="remove" data-remove-idx="${i}"
                  aria-label="Remove guest" ${dis}>×</button>
        </div>
      `;
        })
        .join("");

      return `
        <h2 class="title">Kindly Reply</h2>
        <p class="lede">Let us know if you will be joining us.</p>
        ${errorBanner}
        <form data-form novalidate>
          <div class="name-row">
            <label class="fld">
              <span>First name</span>
              <input class="txt" type="text" name="firstName" required
                     maxlength="40" autocomplete="given-name"
                     value="${escapeAttr(this._pendingFirst ?? "")}"
                     ${isSubmitting ? "disabled" : ""}>
            </label>
            <label class="fld">
              <span>Last name</span>
              <input class="txt" type="text" name="lastName" required
                     maxlength="40" autocomplete="family-name"
                     value="${escapeAttr(this._pendingLast ?? "")}"
                     ${isSubmitting ? "disabled" : ""}>
            </label>
          </div>

          <label class="fld">
            <span>Email</span>
            <input class="txt" type="email" name="email" required
                   maxlength="${EMAIL_MAX}" autocomplete="email"
                   value="${escapeAttr(this._pendingEmail ?? "")}"
                   ${isSubmitting ? "disabled" : ""}>
          </label>

          <div class="attend">
            <span class="label">Will you attend:</span>
            <div class="radios">
              <label class="radio"><input type="radio" name="attendance" value="in_person"
                     ${this._attendance === "in_person" ? "checked" : ""} ${isSubmitting ? "disabled" : ""}> In person</label>
              <label class="radio"><input type="radio" name="attendance" value="virtual"
                     ${this._attendance === "virtual" ? "checked" : ""} ${isSubmitting ? "disabled" : ""}> Virtually</label>
            </div>
          </div>

          <div class="guests">
            <span class="label">Guests you'll bring (including children)</span>
            ${guestRows}
            <button type="button" class="add" data-add
                    ${this._guests.length >= GUESTS_MAX || isSubmitting ? "disabled" : ""}>
              + Add guest
            </button>
          </div>

          <button class="submit" type="submit"
                  ${isSubmitting ? "disabled" : ""}
                  ${isSubmitting ? 'aria-busy="true"' : ""}>${submitLabel}</button>
          <p class="note">No account needed. We'll only use your email if plans change.</p>
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
      const guests = this._guests
        .map((g) => ({
          name: (g.name ?? "").trim(),
          child: !!g.child,
          age: g.child ? String(g.age ?? "").trim() : "",
        }))
        .filter((g) => g.name);
      const turnstileToken = this._turnstileToken;

      if (!first) return this._fail("Please enter your first name.");
      if (!last) return this._fail("Please enter your last name.");
      if (!email) return this._fail("Please enter your email.");
      if (!/^\S+@\S+\.\S+$/.test(email)) return this._fail("That email address doesn't look right.");
      if (attendance !== "in_person" && attendance !== "virtual") {
        return this._fail("Please let us know if you'll attend in person or virtually.");
      }
      for (const g of guests) {
        if (g.child) {
          const n = Number(g.age);
          if (g.age === "" || !Number.isInteger(n) || n < 0 || n > 17) {
            return this._fail(`Please enter an age (0–17) for ${g.name}.`);
          }
        }
      }
      if (guests.length > GUESTS_MAX) return this._fail(`Please list at most ${GUESTS_MAX} additional guests.`);
      if (!turnstileToken) return this._fail("Please complete the bot check.");

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
          body: JSON.stringify({ name, email, attendance, guests: guestsPayload, turnstileToken }),
        });
      } catch {
        // Pending values are already stored; the re-render will re-fill the fields.
        // Turnstile tokens are single-use; force a fresh widget for retry.
        this._turnstileToken = "";
        return this._fail("Couldn't reach the server. Please try again.");
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
        return this._fail(serverMsg || "Something went wrong on our end. Please try again in a moment.");
      }
      return this._fail(serverMsg || "Something looked off with that submission. Please check the fields.");
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
