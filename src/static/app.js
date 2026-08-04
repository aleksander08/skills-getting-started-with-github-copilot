document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  async function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  function createParticipantChip(email, activityName) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "participant-chip";
    chip.dataset.email = email;
    chip.dataset.activityName = activityName;

    chip.innerHTML = `
      <span>${email}</span>
      <span class="participant-remove" aria-label="Remove ${email}">×</span>
    `;

    chip.addEventListener("click", async () => {
      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activityName)}/participants/${encodeURIComponent(email)}`,
          { method: "DELETE" }
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.detail || "Unable to remove participant");
        }

        await fetchActivities();
        showMessage(result.message, "success");
      } catch (error) {
        showMessage(error.message, "error");
      }
    });

    return chip;
  }

  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participantSection = document.createElement("div");
        participantSection.className = "participants-section";
        participantSection.innerHTML = `<h5>Participants</h5>`;

        const participantList = document.createElement("div");
        participantList.className = "participants-list";

        if (details.participants.length) {
          details.participants.forEach((email) => {
            participantList.appendChild(createParticipantChip(email, name));
          });
        } else {
          const emptyState = document.createElement("p");
          emptyState.className = "participants-empty";
          emptyState.textContent = "No participants yet";
          participantList.appendChild(emptyState);
        }

        participantSection.appendChild(participantList);

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;
        activityCard.appendChild(participantSection);

        activitiesList.appendChild(activityCard);

        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "An error occurred");
      }

      await fetchActivities();
      signupForm.reset();
      showMessage(result.message, "success");
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  fetchActivities();
});
