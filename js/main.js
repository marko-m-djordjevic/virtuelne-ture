(function () {
  const mapContainer = document.querySelector(".map-container");
  const popupOverlay = document.querySelector(".popup-overlay");
  const popup = document.querySelector(".popup");
  const popupName = document.querySelector(".popup-name");
  const popupImage = document.querySelector(".popup-image");
  const popupDescription = document.querySelector(".popup-description");
  const popupButton = document.querySelector(".popup-button");

  let locations = [];
  let isPinned = false;
  let hideTimeout = null;
  const HIDE_DELAY = 150;

  function setActivePin(identifier) {
    document.querySelectorAll(".pin").forEach(function (pin) {
      pin.classList.toggle(
        "pin-active",
        pin.getAttribute("data-identifier") === identifier,
      );
    });
  }

  function clearActivePin() {
    document.querySelectorAll(".pin").forEach(function (pin) {
      pin.classList.remove("pin-active");
    });
  }

  function showPopup(location) {
    popupName.textContent = location.name;
    if (location.image && location.image.trim()) {
      popupImage.src = location.image;
      popupImage.alt = location.name;
      popupImage.hidden = false;
    } else {
      popupImage.hidden = true;
    }
    popupDescription.innerHTML = location.description;
    popupButton.href = location.link;
    popupButton.textContent = "ПОГЛЕДАЈ ВИРТУЕЛНУ ТУРУ";
    popupOverlay.classList.add("visible");
    setActivePin(location.identifier);
  }

  function hidePopup() {
    popupOverlay.classList.remove("visible");
    clearActivePin();
  }

  function scheduleHide() {
    if (isPinned) return;
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(function () {
      hidePopup();
      hideTimeout = null;
    }, HIDE_DELAY);
  }

  function cancelHide() {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  }

  function openForLocation(location) {
    showPopup(location);
    cancelHide();
  }

  function handlePinMouseEnter(location) {
    if (isPinned) return;
    openForLocation(location);
  }

  function handlePinMouseLeave() {
    scheduleHide();
  }

  function handlePinClick(location, e) {
    e.preventDefault();
    isPinned = true;
    cancelHide();
    openForLocation(location);
  }

  function handlePopupMouseEnter() {
    cancelHide();
  }

  function handlePopupMouseLeave() {
    scheduleHide();
  }

  function handleDocumentClick(e) {
    var target = e.target;
    var mapWrapper = document.querySelector(".map-wrapper");
    if (
      mapWrapper &&
      mapWrapper.classList.contains("menu-open") &&
      !target.closest(".menu-sidebar") &&
      !target.closest(".hamburger")
    ) {
      mapWrapper.classList.remove("menu-open");
    }
    if (!isPinned || !popupOverlay.classList.contains("visible")) return;
    if (
      popup.contains(target) ||
      target.closest(".pin") ||
      target.closest(".menu-sidebar")
    )
      return;
    isPinned = false;
    hidePopup();
  }

  function init() {
    fetch("assets/data.json?v=1.0.3")
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        locations = data.locations || [];
        renderPins();
        renderMenu();
      })
      .catch(function (err) {
        console.error("Failed to load data:", err);
      });

    popupOverlay.addEventListener("mouseenter", handlePopupMouseEnter);
    popupOverlay.addEventListener("mouseleave", handlePopupMouseLeave);
    document.addEventListener("click", handleDocumentClick);

    var hamburger = document.querySelector(".hamburger");
    var mapWrapper = document.querySelector(".map-wrapper");
    if (hamburger && mapWrapper) {
      hamburger.addEventListener("click", function (e) {
        e.stopPropagation();
        mapWrapper.classList.toggle("menu-open");
        hamburger.setAttribute(
          "aria-expanded",
          mapWrapper.classList.contains("menu-open"),
        );
        document
          .querySelector(".menu-sidebar")
          .setAttribute(
            "aria-hidden",
            !mapWrapper.classList.contains("menu-open"),
          );
      });
    }
  }

  function renderMenu() {
    var menuList = document.querySelector(".menu-list");
    if (!menuList) return;
    menuList.innerHTML = "";
    locations.forEach(function (loc) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = loc.link;
      a.textContent = loc.name;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        isPinned = true;
        cancelHide();
        openForLocation(loc);
      });
      li.appendChild(a);
      menuList.appendChild(li);
    });
  }

  function renderPins() {
    const pinsContainer = document.querySelector(".pins-container");
    if (!pinsContainer) return;

    locations.forEach(function (loc) {
      const pin = document.createElement("button");
      pin.className = "pin";
      pin.setAttribute("data-identifier", loc.identifier);
      pin.setAttribute("aria-label", loc.name);
      pin.style.left = loc.left + "%";
      pin.style.top = loc.top + "%";
      if (loc.zIndex != null) pin.style.zIndex = loc.zIndex;
      pin.textContent = "";

      pin.addEventListener("mouseenter", function () {
        handlePinMouseEnter(loc);
      });
      pin.addEventListener("mouseleave", function () {
        handlePinMouseLeave();
      });
      pin.addEventListener("click", function (e) {
        handlePinClick(loc, e);
      });

      pinsContainer.appendChild(pin);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
