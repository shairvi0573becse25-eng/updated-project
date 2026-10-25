document.addEventListener("DOMContentLoaded", () => {
  const list = document.querySelector("#savedList");
  const grid = document.querySelector("#calendarGrid");
  const monthLabel = document.querySelector("#calendarMonth");
  const agenda = document.querySelector("#dayEvents");
  const agendaTitle = document.querySelector("#selectedDateTitle");
  let visibleMonth = new Date();
  visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  let selectedDate = dateKey(new Date());

  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
  function dateFromKey(key) {
    const [year, month, day] = key.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  function prettyDate(key, options = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) {
    return dateFromKey(key).toLocaleDateString("en-IN", options);
  }
  function eventTime(event) {
    if (!event.time) return "Time not set";
    const [hour, minute] = event.time.split(":").map(Number);
    return new Date(2000, 0, 1, hour, minute).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }
  function eventsForDate(key) {
    return getEvents().filter(event => event.date === key).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  }

  function renderCalendar() {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    monthLabel.textContent = visibleMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const events = getEvents();
    const eventDates = new Set(events.map(event => event.date));
    const todayKey = dateKey(new Date());
    let html = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      .map(day => `<div class="calendar-weekday" role="columnheader">${day}</div>`).join("");
    for (let i = 0; i < firstDay; i++) html += `<div class="calendar-blank" aria-hidden="true"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const key = dateKey(new Date(year, month, day));
      const hasEvents = eventDates.has(key);
      const classes = ["calendar-date", key === selectedDate ? "is-selected" : "", key === todayKey ? "is-today" : "", hasEvents ? "has-events" : ""].filter(Boolean).join(" ");
      html += `<button class="${classes}" type="button" role="gridcell" data-calendar-date="${key}" aria-label="${prettyDate(key)}${hasEvents ? ", has events" : ""}" aria-pressed="${key === selectedDate}">${day}${hasEvents ? '<span class="event-dot" aria-hidden="true"></span>' : ""}</button>`;
    }
    grid.innerHTML = html;
    renderAgenda();
  }

  function renderAgenda() {
    agendaTitle.textContent = `Events on ${prettyDate(selectedDate)}`;
    const events = eventsForDate(selectedDate);
    agenda.innerHTML = events.length ? events.map(event => `
      <article class="agenda-event">
        <span class="agenda-emoji" aria-hidden="true">${escapeHtml(event.emoji || "✦")}</span>
        <div class="agenda-event-info"><b>${escapeHtml(event.title)}</b><small>${escapeHtml(eventTime(event))} · ${escapeHtml(event.venue || "Venue to be announced")}</small></div>
        <a class="btn small" href="event-details.html?id=${encodeURIComponent(event.id)}">View</a>
      </article>`).join("") : `<p class="calendar-empty">No events scheduled for this day. Select a marked date or browse <a href="events.html">all events</a>.</p>`;
  }

  function renderSaved() {
    if (!list) return;
    const saved = getSaved();
    const items = getEvents().filter(event => saved.includes(event.id)).sort((a, b) => new Date(a.date + "T" + (a.time || "00:00")) - new Date(b.date + "T" + (b.time || "00:00")));
    list.innerHTML = items.length ? items.map(event => `<div class="saved-item"><span><b>${escapeHtml(event.title)}</b><br><small>${formatDate(event.date)} · ${escapeHtml(event.venue || "Venue TBA")}</small></span><span class="saved-actions"><a class="btn small" href="event-details.html?id=${encodeURIComponent(event.id)}">Open</a><button class="btn small remove-saved" type="button" data-remove-saved="${event.id}" aria-label="Remove ${escapeHtml(event.title)} from saved events">Remove</button></span></div>`).join("") : `<div class="empty"><p>No saved events yet.</p><p style="margin-top:8px">Browse events and tap the heart to build your planner.</p><a class="btn small" href="events.html" style="margin-top:14px">Explore events</a></div>`;
    const count = document.querySelector("#savedCount");
    if (count) count.textContent = items.length;
  }

  function renderRegisteredCount() {
    const registered = getRegistrations().map(item => item.eventId);
    const count = document.querySelector("#registeredCount");
    if (count) count.textContent = new Set(registered).size;
  }

  document.querySelector("#prevMonth")?.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  document.querySelector("#nextMonth")?.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  document.querySelector("#todayButton")?.addEventListener("click", () => {
    const today = new Date();
    visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    selectedDate = dateKey(today);
    renderCalendar();
  });
  grid?.addEventListener("click", event => {
    const button = event.target.closest("[data-calendar-date]");
    if (!button) return;
    selectedDate = button.dataset.calendarDate;
    renderCalendar();
  });
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-remove-saved]");
    if (!button) return;
    const id = Number(button.dataset.removeSaved);
    setSaved(getSaved().filter(savedId => savedId !== id));
    renderSaved();
    toast("Event removed from your planner.");
  });
  window.addEventListener("storage", event => {
    if (["campusEvents", "savedEvents", "registrations"].includes(event.key)) {
      renderCalendar(); renderSaved(); renderRegisteredCount();
    }
  });
  renderCalendar();
  renderSaved();
  renderRegisteredCount();
});
