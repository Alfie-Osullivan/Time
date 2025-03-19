// ---------- Local Storage & Initialization ----------
let mainWidget;
let gridWidgets;
let use24Hour = false; // default hours format
let selectedWidgetIndex = null;
let schedulingMode = false;
let scheduledTime = null;

function loadSettings() {
  const storedMainWidget = localStorage.getItem('mainWidget');
  const storedGridWidgets = localStorage.getItem('gridWidgets');
  const storedBackground = localStorage.getItem('backgroundImage');
  const storedHoursFormat = localStorage.getItem('use24Hour');

  // Load main widget
  mainWidget = storedMainWidget 
    ? JSON.parse(storedMainWidget) 
    : { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, name: null, flagUrl: null };

  // Load grid widgets
  try {
    gridWidgets = storedGridWidgets 
      ? JSON.parse(storedGridWidgets) 
      : [{
          timeZone: "Europe/London",
          title: `
            <div class="flag-container">
              <img src="https://flagcdn.com/gb.png" alt="Europe/London flag">
            </div>
            <div class="title-container">Europe/London</div>
          `,
          flagUrl: "https://flagcdn.com/gb.png"
        }];
  } catch(e) {
    gridWidgets = [{
      timeZone: "Europe/London",
      title: `
        <div class="flag-container">
          <img src="https://flagcdn.com/gb.png" alt="Europe/London flag">
        </div>
        <div class="title-container">Europe/London</div>
      `,
      flagUrl: "https://flagcdn.com/gb.png"
    }];
  }
  
  // Load hours format
  if (storedHoursFormat !== null) {
    use24Hour = (storedHoursFormat === "true");
  }
  
  // Set background if stored
  if (storedBackground) {
    document.body.style.backgroundImage = `url(${storedBackground})`;
  }
}

// Save to local storage
function saveSettings() {
  localStorage.setItem('mainWidget', JSON.stringify(mainWidget));
  localStorage.setItem('gridWidgets', JSON.stringify(gridWidgets));
  localStorage.setItem('use24Hour', use24Hour);
}

// ---------- Update Widget Styles Based on Background ----------
function updateWidgetStyles(bgUrl) {
  // All "widget" elements (main + bottom)
  const widgets = document.querySelectorAll(".widget");
  widgets.forEach(widget => {
    widget.classList.remove("blur-widget", "dark-widget", "blur-dark");
  });
  // If background2 => dark
  if (bgUrl.includes("background2.jpg")) {
    widgets.forEach(widget => widget.classList.add("dark-widget"));
  }
  // If background4 or background5 => blur + white text
  else if (bgUrl.includes("background4.jpg") || bgUrl.includes("background5.jpg")) {
    widgets.forEach(widget => {
      widget.classList.add("blur-widget");
      widget.classList.add("blur-dark");
    });
  }
  // If background3 or background6 => blur only
  else if (bgUrl.includes("background3.jpg") || bgUrl.includes("background6.jpg")) {
    widgets.forEach(widget => widget.classList.add("blur-widget"));
  }
  // background1 => no extra style
}

function getTimezoneOffset(timeZone, refTime) {
  const now = refTime || new Date();
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const parts = dtf.formatToParts(now);
  const dateParts = {};
  parts.forEach(part => {
    if (part.type !== "literal") {
      dateParts[part.type] = part.value;
    }
  });
  const formatted = `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`;
  const targetDate = new Date(formatted);
  return Math.round((now.getTime() - targetDate.getTime()) / 60000);
}

function getTimeDifference(widgetTZ, refTime) {
  const mainOffset = getTimezoneOffset(mainWidget.timeZone, refTime);
  const widgetOffset = getTimezoneOffset(widgetTZ, refTime);
  const diff = widgetOffset - mainOffset;
  if (diff === 0) return "Same Time";
  const absDiff = Math.abs(diff);
  const hours = Math.floor(absDiff / 60);
  const minutes = absDiff % 60;
  let diffText = "";
  if (hours > 0) diffText += hours + " Hour" + (hours > 1 ? "s" : "");
  if (minutes > 0) {
    if (diffText) diffText += " ";
    diffText += minutes + " Minute" + (minutes > 1 ? "s" : "");
  }
  return diff > 0 ? diffText + " Ahead" : diffText + " Behind";
}

function convertUTCOffsetToIANA(offsetStr) {
  if (!offsetStr.startsWith("UTC")) return offsetStr;
  const sign = offsetStr[3];
  const timePart = offsetStr.slice(4);
  const hourPart = timePart.split(":")[0];
  const hours = parseInt(hourPart, 10);
  return sign === "+" ? `Etc/GMT-${hours}` : `Etc/GMT+${hours}`;
}

function updateMainWidgetDisplay() {
  const el = document.getElementById('mainLocation');
  if (mainWidget.name && mainWidget.flagUrl) {
    el.innerHTML = `
      <div class="flag-container">
        <img src="${mainWidget.flagUrl}" alt="${mainWidget.name} flag">
      </div>
      <div class="title-container">${mainWidget.name}</div>
    `;
  } else {
    el.innerText = mainWidget.timeZone;
  }
}

// ---------- Time Updates ----------
function updateAllTimes() {
  let now = schedulingMode ? new Date(scheduledTime) : new Date();
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: !use24Hour };
  
  if (schedulingMode) {
    const hoursInput = document.getElementById("hoursInput");
    const minutesInput = document.getElementById("minutesInput");
    if (hoursInput && minutesInput) {
      let hrs = parseInt(hoursInput.value, 10);
      let mins = parseInt(minutesInput.value, 10);
      if (!use24Hour) {
        const ampmSelect = document.getElementById("ampmSelect");
        if (ampmSelect) {
          const ampm = ampmSelect.value;
          if (ampm === "PM" && hrs < 12) hrs += 12;
          else if (ampm === "AM" && hrs === 12) hrs = 0;
        }
      }
      let temp = new Date();
      temp.setHours(hrs, mins, 0, 0);
      scheduledTime = temp;
      now = temp;
    }
  } else {
    const mainTimeEl = document.getElementById("mainTime");
    if (!mainTimeEl) {
      const container = document.getElementById("mainTimeContainer");
      container.innerHTML = `<h1 id="mainTime">--:--</h1>`;
    }
    document.getElementById('mainTime').innerText =
      now.toLocaleTimeString('en-US', { timeZone: mainWidget.timeZone, ...timeOptions });
  }
  
  gridWidgets.forEach((widget, index) => {
    const timeEl = document.getElementById('time' + index);
    const diffEl = document.getElementById('timeDiff' + index);
    try {
      if (timeEl) {
        timeEl.innerText = now.toLocaleTimeString('en-US', { timeZone: widget.timeZone, ...timeOptions });
      }
      if (diffEl) {
        diffEl.innerText = getTimeDifference(widget.timeZone, now);
      }
    } catch (e) {
      console.error(`Error updating time for widget ${index}:`, e);
      if (timeEl) timeEl.innerText = "Error";
    }
  });
}
setInterval(updateAllTimes, 1000);

// ---------- Render & Dynamic Grid ----------
function renderGrid() {
  const gridContainer = document.getElementById("gridContainer");
  gridContainer.innerHTML = "";
  
  gridWidgets.forEach((widget, index) => {
    // Add "widget" class so both main and grid items are styled uniformly
    let gridItem = document.createElement("div");
    gridItem.className = "grid-item widget";
    gridItem.setAttribute("data-index", index);
    
    let locationDiv = document.createElement("div");
    locationDiv.className = "location";
    locationDiv.innerHTML = widget.title || widget.timeZone;
    
    let timeH2 = document.createElement("h2");
    timeH2.id = "time" + index;
    timeH2.innerText = "--:--";
    
    let timeDiff = document.createElement("p");
    timeDiff.className = "time-diff";
    timeDiff.id = "timeDiff" + index;
    timeDiff.innerText = getTimeDifference(widget.timeZone);
    
    let actionsDiv = document.createElement("div");
    actionsDiv.className = "widget-actions";
    actionsDiv.style.display = "flex";
    actionsDiv.style.justifyContent = "space-between";
    
    let globeBtn = document.createElement("button");
    globeBtn.className = "globe-button circle-button";
    globeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectedWidgetIndex = index;
      countryModal.style.display = "flex";
    });
    
    // Trash button
    let trashBtn = document.createElement("button");
    trashBtn.className = "trash-button circle-button";
    trashBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      gridWidgets.splice(index, 1);
      saveSettings();
      renderGrid();
    });
    
    actionsDiv.appendChild(globeBtn);
    actionsDiv.appendChild(trashBtn);
    
    gridItem.appendChild(locationDiv);
    gridItem.appendChild(timeH2);
    gridItem.appendChild(timeDiff);
    gridItem.appendChild(actionsDiv);
    gridContainer.appendChild(gridItem);
  });
  
  // "Add widget" placeholder if fewer than 6
  if (gridWidgets.length < 6) {
    let addItem = document.createElement("div");
    addItem.className = "grid-item widget add-widget";
    addItem.innerText = "+";
    addItem.addEventListener("click", () => {
      if (gridWidgets.length < 6) {
        gridWidgets.push({
          timeZone: "Europe/London",
          title: `
            <div class="flag-container">
              <img src="https://flagcdn.com/gb.png" alt="Europe/London flag">
            </div>
            <div class="title-container">Europe/London</div>
          `,
          flagUrl: "https://flagcdn.com/gb.png"
        });
        saveSettings();
        renderGrid();
      }
    });
    gridContainer.appendChild(addItem);
  }
}

// ---------- Settings Modal Functionality ----------
const settingsButton = document.getElementById("settingsButton");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");

settingsButton.addEventListener("click", () => {
  document.getElementById("hoursToggleText").innerText = use24Hour ? "24h" : "12h";
  settingsModal.style.display = "flex";
});

closeSettings.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

// Background previews
const bgPreviews = document.querySelectorAll(".bg-preview");
bgPreviews.forEach(preview => {
  preview.addEventListener("click", () => {
    const newBg = preview.getAttribute("data-bg");
    document.body.style.backgroundImage = `url(${newBg})`;
    localStorage.setItem("backgroundImage", newBg);
    updateWidgetStyles(newBg);
  });
});

// Hours toggle in settings
const hoursToggleBtn = document.getElementById("hoursToggleBtn");
hoursToggleBtn.addEventListener("click", () => {
  use24Hour = !use24Hour;
  document.getElementById("hoursToggleText").innerText = use24Hour ? "24h" : "12h";
  localStorage.setItem("use24Hour", use24Hour);
});

// ---------- Country Selection ----------
const countryModal = document.getElementById('countryModal');
const countrySearchInput = document.getElementById('countrySearch');
const countryListDiv = document.getElementById('countryList');
const closeModalSpan = document.getElementById('closeModal');

document.getElementById('changeMainTimeZone').addEventListener('click', () => {
  selectedWidgetIndex = -1;
  countryModal.style.display = "flex";
});

closeModalSpan.addEventListener('click', () => {
  countryModal.style.display = "none";
});
window.addEventListener('click', (event) => {
  if (event.target === countryModal) {
    countryModal.style.display = "none";
  }
});

let countriesData = [];
fetch('https://restcountries.com/v3.1/all')
  .then(response => response.json())
  .then(data => {
    countriesData = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    renderCountryList(countriesData);
  })
  .catch(err => console.error('Error fetching countries:', err));

function renderCountryList(countries) {
  countryListDiv.innerHTML = '';
  countries.forEach(country => {
    const countryName = country.name.common;
    const flagUrl = country.flags && country.flags.png ? country.flags.png : '';
    let newTZ;
    if (country.cca2 === "JE") {
      newTZ = "Europe/London";
    } else if (country.timezones && country.timezones.length > 0) {
      newTZ = convertUTCOffsetToIANA(country.timezones[0]);
    } else {
      newTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    
    const countryItem = document.createElement('div');
    countryItem.className = 'country-item';
    countryItem.innerHTML = `
      <img src="${flagUrl}" alt="${countryName} flag" width="32" style="vertical-align:middle; margin-right:10px;">
      ${countryName}
    `;
    countryItem.addEventListener('click', () => {
      if (selectedWidgetIndex === -1) {
        mainWidget.timeZone = newTZ;
        mainWidget.name = countryName;
        mainWidget.flagUrl = flagUrl;
        updateMainWidgetDisplay();
      } else if (selectedWidgetIndex !== null) {
        gridWidgets[selectedWidgetIndex].timeZone = newTZ;
        gridWidgets[selectedWidgetIndex].title = `
          <div class="flag-container">
            <img src="${flagUrl}" alt="${countryName} flag">
          </div>
          <div class="title-container">${countryName}</div>
        `;
        gridWidgets[selectedWidgetIndex].flagUrl = flagUrl;
      }
      saveSettings();
      countryModal.style.display = "none";
      countrySearchInput.value = "";
      renderCountryList(countriesData);
      renderGrid();
    });
    countryListDiv.appendChild(countryItem);
  });
}

countrySearchInput.addEventListener('input', () => {
  const query = countrySearchInput.value.toLowerCase();
  const filtered = countriesData.filter(country => country.name.common.toLowerCase().includes(query));
  renderCountryList(filtered);
});

// ---------- Scheduling Mode Functionality ----------
const scheduleButton = document.getElementById("scheduleButton");
const schedulingBanner = document.getElementById("schedulingBanner");
const leaveSchedulingBtn = document.getElementById("leaveSchedulingBtn");

scheduleButton.addEventListener("click", () => {
  if (!schedulingMode) activateSchedulingMode();
});

leaveSchedulingBtn.addEventListener("click", () => {
  deactivateSchedulingMode();
});

function activateSchedulingMode() {
  schedulingMode = true;
  if (!scheduledTime) scheduledTime = new Date();
  const container = document.getElementById("mainTimeContainer");
  let currentHours = scheduledTime.getHours();
  let displayHours = !use24Hour ? (currentHours % 12 || 12) : currentHours;
  let minutesValue = scheduledTime.getMinutes();
  container.innerHTML = `
    <div class="scheduling-container">
      <input type="number" id="hoursInput" class="scheduling-input" placeholder="HH"
        value="${('0' + displayHours).slice(-2)}" 
        min="${use24Hour ? '0' : '1'}" 
        max="${use24Hour ? '23' : '12'}"
        oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(this.value<this.min){this.value=this.min} if(this.value>this.max){this.value=this.max}"
      />
      <span class="time-separator">:</span>
      <input type="number" id="minutesInput" class="scheduling-input" placeholder="MM"
        value="${('0' + minutesValue).slice(-2)}"
        min="0" max="59"
        oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(this.value<this.min){this.value=this.min} if(this.value>this.max){this.value=this.max}"
      />
      ${
        !use24Hour
          ? `<select id="ampmSelect" class="ampm-select">
              <option value="AM" ${currentHours < 12 ? "selected" : ""}>AM</option>
              <option value="PM" ${currentHours >= 12 ? "selected" : ""}>PM</option>
            </select>`
          : ""
      }
    </div>
  `;
  schedulingBanner.style.display = "block";
}

function deactivateSchedulingMode() {
  schedulingMode = false;
  scheduledTime = null;
  const container = document.getElementById("mainTimeContainer");
  container.innerHTML = `<h1 id="mainTime">--:--</h1>`;
  schedulingBanner.style.display = "none";
}

// ---------- Fullscreen Display Mode ----------
const displayButton = document.getElementById("displayButton");
displayButton.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Error enabling full-screen: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
});
document.addEventListener("fullscreenchange", () => {
  displayButton.innerText = document.fullscreenElement ? "Exit Display" : "Display";
});

// ---------- Initial Load ----------
loadSettings();
renderGrid();
updateMainWidgetDisplay();

// Re-apply blur/dark styling after grid is rendered
const storedBg = localStorage.getItem("backgroundImage");
if (storedBg) {
  updateWidgetStyles(storedBg);
}
updateAllTimes();


// ---------- Scheduling Pop-Up Logic ----------
const schedulingPopup = document.getElementById("schedulingPopup");
const scheduleMeetingButton = document.getElementById("scheduleMeetingButton");
const addToCalendarButton = document.getElementById("addToCalendarButton");

function showSchedulingPopup() {
    schedulingPopup.classList.remove("hidden");
    const mainWidget = document.querySelector(".main-widget");
    const rect = mainWidget.getBoundingClientRect();
    schedulingPopup.style.top = rect.top + "px";
    schedulingPopup.style.left = (rect.right + 10) + "px"; // Position next to main widget
}

function hideSchedulingPopup() {
    schedulingPopup.classList.add("hidden");
}

scheduleButton.addEventListener("click", () => {
    if (!schedulingMode) {
        activateSchedulingMode();
        showSchedulingPopup();
    }
});

leaveSchedulingBtn.addEventListener("click", () => {
    deactivateSchedulingMode();
    hideSchedulingPopup();
});

addToCalendarButton.addEventListener("click", () => {
    if (!scheduledTime) return;
    const formattedStartTime = scheduledTime.toISOString().replace(".000Z", "Z");

    const outlookUrl = `outlook://calendar/action/compose?startdt=${formattedStartTime}`;
    const webFallbackUrl = `https://outlook.live.com/calendar/0/deeplink/compose?startdt=${formattedStartTime}`;

    // Attempt to open the Outlook app, fallback to web if it fails
    window.location.href = outlookUrl;
    setTimeout(() => { window.open(webFallbackUrl, "_blank"); }, 1000);
});
