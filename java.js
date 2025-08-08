document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("travel-form");
  const photoInput = document.getElementById("photo");
  const photoPreview = document.getElementById("photo-preview");
  const galleryGrid = document.querySelector(".gallery-grid");

  let editingId = null; // track if we're editing a journey

  // Preview image before adding
  photoInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        photoPreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      photoPreview.src = "";
    }
  });

  // Format date to: August 1, 2025
  function formatDate(rawDate) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const newDate = new Date(rawDate);
    return newDate.toLocaleDateString("en-US", options);
  }

  // Toast message
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "custom-toast";
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Render a journey card
  function renderJourney(journey) {
    const journeyCard = document.createElement("div");
    journeyCard.classList.add("gallery-item");
    journeyCard.dataset.id = journey.id; // store unique id

    journeyCard.innerHTML = `
      <img src="${journey.image}" alt="${journey.destination}">
      <div class="hover-details">
        <h3>${journey.destination}</h3>
        <p>${formatDate(journey.date)}</p>
        <p>${journey.description}</p>
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    `;

    galleryGrid.prepend(journeyCard);

    // Delete button functionality
    journeyCard.querySelector(".delete-btn").addEventListener("click", () => {
      deleteJourney(journey.id, journeyCard);
    });

    // Edit button functionality
    journeyCard.querySelector(".edit-btn").addEventListener("click", () => {
      editJourney(journey);
    });
  }

  // Load saved journeys from localStorage and render
  function loadJourneys() {
    const saved = JSON.parse(localStorage.getItem("journeys")) || [];
    saved.forEach(renderJourney);
  }

  // Save a journey (add or update)
  function saveJourney(journey) {
    const journeys = JSON.parse(localStorage.getItem("journeys")) || [];

    if (journey.id) {
      const index = journeys.findIndex(j => j.id === journey.id);
      if (index !== -1) {
        journeys[index] = journey;
      } else {
        journeys.push(journey);
      }
    } else {
      journey.id = Date.now().toString(); // assign unique id
      journeys.push(journey);
    }

    localStorage.setItem("journeys", JSON.stringify(journeys));
  }

  // Delete journey by id and remove card from DOM
  function deleteJourney(id, journeyCard) {
    let journeys = JSON.parse(localStorage.getItem("journeys")) || [];
    journeys = journeys.filter(j => j.id !== id);
    localStorage.setItem("journeys", JSON.stringify(journeys));

    // Fade out animation then remove
    journeyCard.style.opacity = "0";
    setTimeout(() => journeyCard.remove(), 300);

    showToast("🗑️ Journey deleted!");
  }

  // Load journey data into form for editing
  function editJourney(journey) {
    editingId = journey.id;

    document.getElementById("destination").value = journey.destination;
    document.getElementById("date").value = journey.date;
    document.getElementById("description").value = journey.description;
    photoPreview.src = journey.image;

    // Scroll to form section and glow effect
    const formSection = document.querySelector(".form-section");
    formSection.scrollIntoView({ behavior: "smooth" });
    formSection.classList.add("glow");

    // Change submit button text
    form.querySelector("button[type='submit']").innerText = "Update Journey";
  }

  // Reset form after submit or cancel
  function resetFormAfterSubmit() {
    form.reset();
    photoPreview.src = "";
    editingId = null;
    form.querySelector("button[type='submit']").innerText = "Add Journey";
    const formSection = document.querySelector(".form-section");
    formSection.classList.remove("glow");
  }

  // Handle form submit for add/update
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const destination = document.getElementById("destination").value.trim();
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value.trim();
    const photoFile = photoInput.files[0];

    if (!destination || !date || !description) {
      showToast("⚠️ Please fill out all fields.");
      return;
    }

    // If editing and no new photo selected, keep existing photoPreview.src
    if (editingId && !photoFile) {
      const journey = {
        id: editingId,
        destination,
        date,
        description,
        image: photoPreview.src,
      };

      saveJourney(journey);

      // Remove old card and render updated journey
      const oldCard = document.querySelector(`.gallery-item[data-id="${editingId}"]`);
      if (oldCard) oldCard.remove();
      renderJourney(journey);

      resetFormAfterSubmit();
      showToast("✏️ Journey updated!");
      return;
    }

    if (!photoFile) {
      showToast("⚠️ Please select a photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const imageData = event.target.result;

      const journey = {
        id: editingId || null,
        destination,
        date,
        description,
        image: imageData,
      };

      if (editingId) {
        const oldCard = document.querySelector(`.gallery-item[data-id="${editingId}"]`);
        if (oldCard) oldCard.remove();
      }

      saveJourney(journey);
      renderJourney(journey);

      resetFormAfterSubmit();
      showToast(editingId ? "✏️ Journey updated!" : "✅ Your journey has been added!");
    };

    reader.readAsDataURL(photoFile);
  });

  // Load stored journeys on page load
  loadJourneys();

  // ==========================
  // Your existing nav and search code below, no change
  // ==========================

  // Map nav li text to the corresponding section selectors
  const sectionMap = {
    Home: "main",
    About: "#about",
    Gallery: ".gallery",
    Addtrip: ".form-section",
  };

  const navItems = document.querySelectorAll("nav ul li");
  const formSection = document.querySelector(".form-section");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const sectionSelector = sectionMap[item.textContent.trim()];

      if (!sectionSelector) return;

      // Scroll to the section smoothly
      const targetSection = document.querySelector(sectionSelector);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
      }

      // Remove glow from form-section always before
      formSection.classList.remove("glow");

      // If clicked 'Addtrip', add glow effect on form section
      if (item.textContent.trim() === "Addtrip") {
        formSection.classList.add("glow");
      }

      // Manage active nav item styling
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
    });
  });

  const searchInput = document.getElementById("search-input");
  const notFoundMsg = document.getElementById("not-found-msg");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const galleryItems = document.querySelectorAll(".gallery-item");

    let matches = 0;

    galleryItems.forEach((item) => {
      const title = item.querySelector(".hover-details h3").textContent.toLowerCase();
      if (title.includes(query) && query !== "") {
        item.classList.add("matched");
        item.classList.remove("dimmed");
        matches++;
      } else if (query === "") {
        item.classList.remove("matched", "dimmed");
      } else {
        item.classList.remove("matched");
        item.classList.add("dimmed");
      }
    });

    if (matches === 0 && query !== "") {
      notFoundMsg.style.display = "block";
    } else {
      notFoundMsg.style.display = "none";
    }
  });
});

// Initialize AOS
AOS.init({
  duration: 1000,
  once: true
});  



