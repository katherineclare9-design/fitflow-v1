/* =========================================================
   SCHEDULE APP
   USER DATA + APP FUNCTIONALITY
========================================================= */

const STORAGE_KEY = "scheduleAppData_v1";


/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultData = {

    user: {
        name: "",
        theme: "light"
    },

    stats: {
        xp: 0,
        streak: 0,
        completed: 0,
        lastCompletionDate: null
    },

    events: [],

    meals: [],

    foods: [],

    workouts: [],

    school: [],

    habits: [],

    goals: [],

    routines: [],

    achievements: [],

    settings: {
        calendarView: "week",
        mealView: "today"
    }

};


/* =========================================================
   ACHIEVEMENTS
========================================================= */

const achievementDefinitions = [

    {
        id: "first-step",
        title: "First Step",
        description: "Complete your first task.",
        symbol: "✶",
        xp: 25,
        condition: data => data.stats.completed >= 1
    },

    {
        id: "five-tasks",
        title: "Getting Started",
        description: "Complete five tasks.",
        symbol: "♡",
        xp: 50,
        condition: data => data.stats.completed >= 5
    },

    {
        id: "ten-tasks",
        title: "On A Roll",
        description: "Complete ten tasks.",
        symbol: "✦",
        xp: 75,
        condition: data => data.stats.completed >= 10
    },

    {
        id: "twenty-five",
        title: "Momentum",
        description: "Complete twenty-five tasks.",
        symbol: "↗",
        xp: 100,
        condition: data => data.stats.completed >= 25
    },

    {
        id: "first-workout",
        title: "Move",
        description: "Complete your first workout.",
        symbol: "𓀪",
        xp: 50,
        condition: data =>
            data.workouts.some(workout => workout.completedCount > 0)
    },

    {
        id: "first-meal",
        title: "Fuel",
        description: "Add your first planned meal.",
        symbol: "☕︎",
        xp: 25,
        condition: data => data.meals.length >= 1
    },

    {
        id: "first-habit",
        title: "Routine Builder",
        description: "Create your first habit.",
        symbol: "಄",
        xp: 25,
        condition: data => data.habits.length >= 1
    },

    {
        id: "first-goal",
        title: "Aim Higher",
        description: "Create your first goal.",
        symbol: "✶",
        xp: 25,
        condition: data => data.goals.length >= 1
    },

    {
        id: "school-planner",
        title: "Prepared",
        description: "Add your first school task.",
        symbol: "✎",
        xp: 25,
        condition: data => data.school.length >= 1
    },

    {
        id: "organized",
        title: "Organized",
        description: "Create ten scheduled items.",
        symbol: "🕮",
        xp: 100,
        condition: data => data.events.length >= 10
    },

    {
        id: "xp-500",
        title: "500 XP",
        description: "Earn 500 XP.",
        symbol: "♛",
        xp: 100,
        condition: data => data.stats.xp >= 500
    },

    {
        id: "xp-1000",
        title: "1000 XP",
        description: "Earn 1000 XP.",
        symbol: "♕",
        xp: 200,
        condition: data => data.stats.xp >= 1000
    }

];


/* =========================================================
   LOAD / SAVE
========================================================= */

function loadData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return structuredClone(defaultData);
    }

    try {

        const parsed = JSON.parse(saved);

        return {
            ...structuredClone(defaultData),
            ...parsed,
            user: {
                ...defaultData.user,
                ...(parsed.user || {})
            },
            stats: {
                ...defaultData.stats,
                ...(parsed.stats || {})
            },
            settings: {
                ...defaultData.settings,
                ...(parsed.settings || {})
            }
        };

    } catch (error) {

        console.error("Could not load saved data:", error);

        return structuredClone(defaultData);
    }
}


let appData = loadData();


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appData)
    );

    updateDashboard();
    updateSidebarProgress();
}


/* =========================================================
   HELPERS
========================================================= */

function createId(prefix = "item") {

    return `${prefix}_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
}


function todayISO() {

    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    if (!dateString) return "";

    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


function formatShortDate(dateString) {

    if (!dateString) return "";

    const date = new Date(`${dateString}T12:00:00`);

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
    });
}


function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimeout);

    window.toastTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}


/* =========================================================
   NAVIGATION
========================================================= */

function openPage(pageName) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const target = document.getElementById(`${pageName}Page`);

    if (target) {
        target.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );

    });

    document.querySelector(".sidebar")
        ?.classList.remove("mobile-open");

    if (pageName === "dashboard") {
        renderDashboard();
    }

    if (pageName === "schedule") {
        renderSchedule();
    }

    if (pageName === "meals") {
        renderMeals();
    }

    if (pageName === "achievements") {
        renderAchievements();
    }

    if (pageName === "workouts") {
        renderWorkouts();
    }

    if (pageName === "school") {
        renderSchool();
    }

    if (pageName === "habits") {
        renderHabits();
    }

    if (pageName === "goals") {
        renderGoals();
    }

    if (pageName === "routines") {
        renderRoutines();
    }

    if (pageName === "settings") {
        renderSettings();
    }
}


document.querySelectorAll("[data-page]").forEach(button => {

    button.addEventListener("click", () => {
        openPage(button.dataset.page);
    });

});


document
    .getElementById("mobileMenuButton")
    ?.addEventListener("click", () => {

        document
            .querySelector(".sidebar")
            .classList.toggle("mobile-open");

    });


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("open");

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("open");

}


document.querySelectorAll("[data-close-modal]").forEach(button => {

    button.addEventListener("click", () => {

        const modal = button.closest(".modal-overlay");

        modal.classList.remove("open");

    });

});


document.querySelectorAll(".modal-overlay").forEach(overlay => {

    overlay.addEventListener("click", event => {

        if (event.target === overlay) {
            overlay.classList.remove("open");
        }

    });

});


/* =========================================================
   QUICK ADD
========================================================= */

document
    .getElementById("quickAddButton")
    ?.addEventListener("click", () => openModal("quickAddModal"));

document
    .getElementById("quickAddMobile")
    ?.addEventListener("click", () => openModal("quickAddModal"));


document
    .querySelectorAll("[data-quick-type]")
    .forEach(button => {

        button.addEventListener("click", () => {

            closeModal("quickAddModal");

            openForm(button.dataset.quickType);

        });

    });


/* =========================================================
   FORM SYSTEM
========================================================= */

let currentFormType = null;


function field(label, inputHTML) {

    return `
        <div class="form-group">
            <label>${label}</label>
            ${inputHTML}
        </div>
    `;
}


function openForm(type) {

    currentFormType = type;

    const fields = document.getElementById("formFields");

    const title = document.getElementById("formTitle");
    const eyebrow = document.getElementById("formEyebrow");

    eyebrow.textContent = "CREATE";

    let html = "";

    if (type === "event") {

        title.textContent = "Add schedule event";

        html += field(
            "TITLE",
            `<input required class="form-input" name="title" placeholder="Practice, homework, appointment...">`
        );

        html += field(
            "DATE",
            `<input required class="form-input" name="date" type="date" value="${todayISO()}">`
        );

        html += field(
            "TIME",
            `<input class="form-input" name="time" type="time">`
        );

        html += field(
            "CATEGORY",
            `
            <select class="form-select" name="category">
                <option>Personal</option>
                <option>Workout</option>
                <option>School</option>
                <option>Meal</option>
                <option>Cheer</option>
                <option>Other</option>
            </select>
            `
        );

        html += field(
            "NOTES",
            `<textarea class="form-textarea" name="notes" placeholder="Optional details..."></textarea>`
        );

    }


    if (type === "meal") {

        title.textContent = "Plan a meal";

        html += field(
            "MEAL NAME",
            `<input required class="form-input" name="title" placeholder="Chicken rice bowl">`
        );

        html += field(
            "DATE",
            `<input required class="form-input" name="date" type="date" value="${todayISO()}">`
        );

        html += field(
            "MEAL TYPE",
            `
            <select class="form-select" name="mealType">
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Snack</option>
                <option>Dinner</option>
            </select>
            `
        );

        html += field(
            "FOODS",
            `<textarea class="form-textarea" name="foods" placeholder="List each food separated by a comma"></textarea>`
        );

        html += field(
            "NOTES",
            `<textarea class="form-textarea" name="notes" placeholder="Optional notes..."></textarea>`
        );

    }


    if (type === "workout") {

        title.textContent = "Create workout";

        html += field(
            "WORKOUT NAME",
            `<input required class="form-input" name="title" placeholder="Upper Body Strength">`
        );

        html += field(
            "TYPE",
            `
            <select class="form-select" name="category">
                <option>Upper Body</option>
                <option>Lower Body</option>
                <option>Core</option>
                <option>Full Body</option>
                <option>Cardio</option>
                <option>Flexibility</option>
                <option>Custom</option>
            </select>
            `
        );

        html += field(
            "EXERCISES",
            `<textarea required class="form-textarea" name="exercises" placeholder="Push-ups - 15&#10;Rows - 20&#10;Shoulder press - 15"></textarea>`
        );

        html += field(
            "DESCRIPTION",
            `<textarea class="form-textarea" name="description" placeholder="What is this workout for?"></textarea>`
        );

    }


    if (type === "habit") {

        title.textContent = "Create habit";

        html += field(
            "HABIT",
            `<input required class="form-input" name="title" placeholder="Drink water">`
        );

        html += field(
            "FREQUENCY",
            `
            <select class="form-select" name="frequency">
                <option>Every day</option>
                <option>Weekdays</option>
                <option>Weekends</option>
                <option>Custom</option>
            </select>
            `
        );

    }


    if (type === "goal") {

        title.textContent = "Create goal";

        html += field(
            "GOAL",
            `<input required class="form-input" name="title" placeholder="What do you want to accomplish?">`
        );

        html += field(
            "CATEGORY",
            `
            <select class="form-select" name="category">
                <option>Fitness</option>
                <option>School</option>
                <option>Personal</option>
                <option>Health</option>
                <option>Other</option>
            </select>
            `
        );

        html += field(
            "TARGET",
            `<input class="form-input" name="target" type="number" min="1" value="10">`
        );

        html += field(
            "DESCRIPTION",
            `<textarea class="form-textarea" name="description" placeholder="Describe your goal..."></textarea>`
        );

    }


    if (type === "school") {

        title.textContent = "Add school task";

        html += field(
            "ASSIGNMENT",
            `<input required class="form-input" name="title" placeholder="Math homework">`
        );

        html += field(
            "SUBJECT",
            `<input class="form-input" name="subject" placeholder="Algebra">`
        );

        html += field(
            "DUE DATE",
            `<input required class="form-input" name="date" type="date" value="${todayISO()}">`
        );

        html += field(
            "TYPE",
            `
            <select class="form-select" name="type">
                <option>Homework</option>
                <option>Test</option>
                <option>Quiz</option>
                <option>Project</option>
                <option>Essay</option>
                <option>Other</option>
            </select>
            `
        );

    }


    if (type === "routine") {

        title.textContent = "Create routine";

        html += field(
            "ROUTINE NAME",
            `<input required class="form-input" name="title" placeholder="Morning routine">`
        );

        html += field(
            "TIME",
            `<input class="form-input" name="time" type="time">`
        );

        html += field(
            "STEPS",
            `<textarea required class="form-textarea" name="steps" placeholder="Wake up&#10;Drink water&#10;Get ready&#10;Eat breakfast"></textarea>`
        );

    }


    fields.innerHTML = html;

    openModal("formModal");
}


document
    .getElementById("dynamicForm")
    ?.addEventListener("submit", event => {

        event.preventDefault();

        const formData = new FormData(event.target);

        const values = Object.fromEntries(formData.entries());

        saveFormData(currentFormType, values);

        event.target.reset();

        closeModal("formModal");

    });


/* =========================================================
   SAVE FORMS
========================================================= */

function saveFormData(type, values) {

    if (type === "event") {

        appData.events.push({
            id: createId("event"),
            title: values.title,
            date: values.date,
            time: values.time || "",
            category: values.category,
            notes: values.notes || "",
            completed: false
        });

        showToast("Schedule event saved.");

    }


    if (type === "meal") {

        const foods = values.foods
            .split(",")
            .map(food => food.trim())
            .filter(Boolean);

        appData.meals.push({
            id: createId("meal"),
            title: values.title,
            date: values.date,
            mealType: values.mealType,
            foods,
            notes: values.notes || "",
            completed: false
        });

        showToast("Meal saved.");

    }


    if (type === "workout") {

        const exercises = values.exercises
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => {

                const parts = line.split(" - ");

                return {
                    name: parts[0],
                    reps: parts[1] || ""
                };

            });

        appData.workouts.push({
            id: createId("workout"),
            title: values.title,
            category: values.category,
            description: values.description || "",
            exercises,
            completedCount: 0
        });

        showToast("Workout created.");

    }


    if (type === "habit") {

        appData.habits.push({
            id: createId("habit"),
            title: values.title,
            frequency: values.frequency,
            completedDates: [],
            streak: 0
        });

        showToast("Habit created.");

    }


    if (type === "goal") {

        appData.goals.push({
            id: createId("goal"),
            title: values.title,
            category: values.category,
            target: Number(values.target) || 1,
            progress: 0,
            description: values.description || "",
            completed: false
        });

        showToast("Goal created.");

    }


    if (type === "school") {

        appData.school.push({
            id: createId("school"),
            title: values.title,
            subject: values.subject || "School",
            date: values.date,
            type: values.type,
            completed: false
        });

        showToast("School task saved.");

    }


    if (type === "routine") {

        const steps = values.steps
            .split("\n")
            .map(step => step.trim())
            .filter(Boolean);

        appData.routines.push({
            id: createId("routine"),
            title: values.title,
            time: values.time || "",
            steps
        });

        showToast("Routine created.");

    }


    checkAchievements();

    saveData();

    refreshCurrentPage();
}


/* =========================================================
   COMPLETION / XP
========================================================= */

function completeItem(type, id) {

    let item = null;

    if (type === "event") {
        item = appData.events.find(x => x.id === id);
    }

    if (type === "meal") {
        item = appData.meals.find(x => x.id === id);
    }

    if (type === "school") {
        item = appData.school.find(x => x.id === id);
    }

    if (!item) return;

    if (item.completed) return;

    item.completed = true;

    appData.stats.completed += 1;
    appData.stats.xp += 10;

    updateStreak();

    checkAchievements();

    saveData();

    showToast("+10 XP");

    refreshCurrentPage();
}


function completeWorkout(id) {

    const workout = appData.workouts.find(
        workout => workout.id === id
    );

    if (!workout) return;

    workout.completedCount =
        Number(workout.completedCount || 0) + 1;

    appData.stats.completed += 1;
    appData.stats.xp += 25;

    updateStreak();

    checkAchievements();

    saveData();

    showToast("+25 XP — workout complete.");

    renderWorkouts();
}


function updateStreak() {

    const today = todayISO();

    if (appData.stats.lastCompletionDate === today) {
        return;
    }

    const previous = new Date(`${appData.stats.lastCompletionDate}T12:00:00`);
    const current = new Date(`${today}T12:00:00`);

    const difference =
        Math.round((current - previous) / 86400000);

    if (difference === 1) {

        appData.stats.streak += 1;

    } else if (difference > 1 || !appData.stats.lastCompletionDate) {

        appData.stats.streak = 1;

    }

    appData.stats.lastCompletionDate = today;
}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

function checkAchievements() {

    achievementDefinitions.forEach(definition => {

        const alreadyUnlocked =
            appData.achievements.includes(definition.id);

        if (
            !alreadyUnlocked &&
            definition.condition(appData)
        ) {

            appData.achievements.push(definition.id);

            appData.stats.xp += definition.xp;

            setTimeout(() => {

                showToast(
                    `Achievement unlocked: ${definition.title}`
                );

            }, 100);

        }

    });

}


function renderAchievements() {

    const container =
        document.getElementById("achievementsGrid");

    const unlocked =
        appData.achievements.length;

    document.getElementById("achievementCount").textContent =
        `${unlocked} / ${achievementDefinitions.length}`;

    container.innerHTML =
        achievementDefinitions
            .map(definition => {

                const isUnlocked =
                    appData.achievements.includes(definition.id);

                return `
                    <div class="achievement-card ${isUnlocked ? "unlocked" : "locked"}">

                        <div class="achievement-symbol">
                            ${definition.symbol}
                        </div>

                        <h3>${escapeHTML(definition.title)}</h3>

                        <p>${escapeHTML(definition.description)}</p>

                        <span class="achievement-xp">
                            +${definition.xp} XP
                        </span>

                    </div>
                `;

            })
            .join("");
}


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const progress = calculateWeeklyProgress();

    document.getElementById("streakValue").textContent =
        `${appData.stats.streak} day${appData.stats.streak === 1 ? "" : "s"}`;

    document.getElementById("xpValue").textContent =
        `${appData.stats.xp} XP`;

    document.getElementById("completedValue").textContent =
        appData.stats.completed;

    document.getElementById("dashboardProgress").textContent =
        `${progress}%`;

    document.getElementById("circleProgress").textContent =
        `${progress}%`;

    const circle =
        document.querySelector(".progress-circle");

    if (circle) {
        circle.style.setProperty(
            "--progress",
            `${progress * 3.6}deg`
        );
    }

    const greeting = document.getElementById("greeting");

    const hour = new Date().getHours();

    if (hour < 12) {
        greeting.textContent = "GOOD MORNING";
    } else if (hour < 18) {
        greeting.textContent = "GOOD AFTERNOON";
    } else {
        greeting.textContent = "GOOD EVENING";
    }

    const name =
        appData.user.name
            ? `, ${escapeHTML(appData.user.name)}`
            : "";

    document.getElementById("userNameGreeting").textContent =
        name;

    document.getElementById("todayDate").textContent =
        new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
}


function renderDashboard() {

    updateDashboard();

    const today = todayISO();

    const todayItems =
        document.getElementById("todayItems");

    const items = [

        ...appData.events
            .filter(item => item.date === today)
            .map(item => ({
                ...item,
                type: "event"
            })),

        ...appData.meals
            .filter(item => item.date === today)
            .map(item => ({
                ...item,
                type: "meal"
            })),

        ...appData.school
            .filter(item => item.date === today)
            .map(item => ({
                ...item,
                type: "school"
            }))

    ];

    if (!items.length) {

        todayItems.innerHTML = `
            <div class="empty-state">
                Nothing scheduled for today yet.
            </div>
        `;

    } else {

        todayItems.innerHTML =
            items.map(item => `

                <div class="today-item">

                    <div class="item-dot"></div>

                    <div class="today-item-content">

                        <strong>
                            ${escapeHTML(item.title)}
                        </strong>

                        <span>
                            ${escapeHTML(
                                item.time ||
                                item.mealType ||
                                item.subject ||
                                item.category ||
                                "Task"
                            )}
                        </span>

                    </div>

                    <button
                        class="check-button ${item.completed ? "checked" : ""}"
                        onclick="completeItem('${item.type}', '${item.id}')"
                    >
                        ${item.completed ? "✓" : ""}
                    </button>

                </div>

            `).join("");

    }


    renderUpcoming();
}


function renderUpcoming() {

    const container =
        document.getElementById("upcomingItems");

    const all = [

        ...appData.events.map(item => ({
            ...item,
            type: "Schedule"
        })),

        ...appData.school.map(item => ({
            ...item,
            type: "School"
        })),

        ...appData.meals.map(item => ({
            ...item,
            type: "Meal"
        }))

    ]
        .filter(item => item.date)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 6);


    if (!all.length) {

        container.innerHTML = `
            <div class="empty-state">
                Your upcoming plans will appear here.
            </div>
        `;

        return;
    }


    container.innerHTML =
        all.map(item => `

            <div class="upcoming-row">

                <div class="upcoming-date">
                    ${formatShortDate(item.date)}
                </div>

                <div>
                    <strong>${escapeHTML(item.title)}</strong>
                    <span>${escapeHTML(item.time || "")}</span>
                </div>

                <span class="category-pill">
                    ${escapeHTML(item.type)}
                </span>

            </div>

        `).join("");
}


/* =========================================================
   WEEKLY PROGRESS
========================================================= */

function calculateWeeklyProgress() {

    const today = new Date();

    const day =
        today.getDay();

    const monday =
        new Date(today);

    const difference =
        day === 0 ? -6 : 1 - day;

    monday.setDate(
        today.getDate() + difference
    );

    monday.setHours(0, 0, 0, 0);


    const sunday =
        new Date(monday);

    sunday.setDate(
        monday.getDate() + 6
    );

    sunday.setHours(23, 59, 59, 999);


    const isThisWeek = dateString => {

        if (!dateString) return false;

        const date =
            new Date(`${dateString}T12:00:00`);

        return date >= monday && date <= sunday;
    };


    const total = [

        ...appData.events.filter(item =>
            isThisWeek(item.date)
        ),

        ...appData.meals.filter(item =>
            isThisWeek(item.date)
        ),

        ...appData.school.filter(item =>
            isThisWeek(item.date)
        )

    ].length;


    const completed = [

        ...appData.events.filter(item =>
            isThisWeek(item.date) && item.completed
        ),

        ...appData.meals.filter(item =>
            isThisWeek(item.date) && item.completed
        ),

        ...appData.school.filter(item =>
            isThisWeek(item.date) && item.completed
        )

    ].length;


    if (total === 0) return 0;

    return Math.round((completed / total) * 100);
}


function updateSidebarProgress() {

    const progress =
        calculateWeeklyProgress();

    document.getElementById("sidebarProgress").textContent =
        `${progress}%`;

    document.getElementById("sidebarProgressBar").style.width =
        `${progress}%`;
}


/* =========================================================
   SCHEDULE
========================================================= */

let scheduleDate =
    new Date();

let scheduleView =
    appData.settings.calendarView || "week";


function startOfWeek(date) {

    const result = new Date(date);

    const day = result.getDay();

    const difference =
        day === 0 ? -6 : 1 - day;

    result.setDate(
        result.getDate() + difference
    );

    result.setHours(0, 0, 0, 0);

    return result;
}


function dateToISO(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getAllCalendarItems() {

    return [

        ...appData.events.map(item => ({
            ...item,
            itemType: "event"
        })),

        ...appData.meals.map(item => ({
            ...item,
            itemType: "meal"
        })),

        ...appData.school.map(item => ({
            ...item,
            itemType: "school"
        }))

    ];
}


function renderSchedule() {

    scheduleView =
        appData.settings.calendarView || "week";

    document.querySelectorAll(".view-switch")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.view === scheduleView
            );

        });


    if (scheduleView === "week") {
        renderWeekCalendar();
    } else {
        renderMonthCalendar();
    }
}


function renderWeekCalendar() {

    const container =
        document.getElementById("calendarContainer");

    const monday =
        startOfWeek(scheduleDate);

    const dates = [];

    for (let i = 0; i < 7; i++) {

        const date =
            new Date(monday);

        date.setDate(
            monday.getDate() + i
        );

        dates.push(date);
    }


    const endDate =
        dates[6];

    document.getElementById("periodLabel").textContent =
        `${monday.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        })} – ${endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        })}`;


    const allItems =
        getAllCalendarItems();


    container.innerHTML = `

        <div class="week-calendar">

            ${dates.map(date => {

                const iso =
                    dateToISO(date);

                const dayItems =
                    allItems.filter(
                        item => item.date === iso
                    );

                const isToday =
                    iso === todayISO();

                return `

                    <div class="day-column">

                        <div class="day-header ${isToday ? "today" : ""}">

                            <small>
                                ${date.toLocaleDateString("en-US", {
                                    weekday: "short"
                                }).toUpperCase()}
                            </small>

                            <strong>
                                ${date.getDate()}
                            </strong>

                        </div>

                        <div class="day-events">

                            ${
                                dayItems.length
                                    ? dayItems.map(item => `

                                        <div class="calendar-event">

                                            <strong>
                                                ${escapeHTML(item.title)}
                                            </strong>

                                            <span>
                                                ${
                                                    escapeHTML(
                                                        item.time ||
                                                        item.mealType ||
                                                        item.subject ||
                                                        item.category ||
                                                        ""
                                                    )
                                                }
                                            </span>

                                        </div>

                                    `).join("")
                                    : `
                                        <div class="empty-state">
                                            —
                                        </div>
                                    `
                            }

                        </div>

                    </div>

                `;

            }).join("")}

        </div>
    `;
}


function renderMonthCalendar() {

    const container =
        document.getElementById("calendarContainer");

    const year =
        scheduleDate.getFullYear();

    const month =
        scheduleDate.getMonth();

    const firstDay =
        new Date(year, month, 1);

    const lastDay =
        new Date(year, month + 1, 0);

    const firstWeekday =
        firstDay.getDay() === 0
            ? 6
            : firstDay.getDay() - 1;

    const daysInMonth =
        lastDay.getDate();

    document.getElementById("periodLabel").textContent =
        scheduleDate.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric"
        });


    const allItems =
        getAllCalendarItems();


    let cells = "";


    for (let i = 0; i < firstWeekday; i++) {

        cells += `
            <div class="month-day"></div>
        `;

    }


    for (let day = 1; day <= daysInMonth; day++) {

        const date =
            new Date(year, month, day);

        const iso =
            dateToISO(date);

        const dayItems =
            allItems.filter(
                item => item.date === iso
            );

        const isToday =
            iso === todayISO();


        cells += `

            <div class="month-day ${isToday ? "today" : ""}">

                <div class="month-day-number">
                    ${day}
                </div>

                ${
                    dayItems
                        .slice(0, 3)
                        .map(item => `
                            <div class="month-event">
                                ${escapeHTML(item.title)}
                            </div>
                        `)
                        .join("")
                }

            </div>

        `;

    }


    container.innerHTML = `

        <div class="month-calendar">

            ${["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
                .map(day => `
                    <div class="month-weekday">
                        ${day}
                    </div>
                `).join("")}

            ${cells}

        </div>

    `;
}


document.querySelectorAll(".view-switch")
    .forEach(button => {

        button.addEventListener("click", () => {

            scheduleView =
                button.dataset.view;

            appData.settings.calendarView =
                scheduleView;

            saveData();

            renderSchedule();

        });

    });


document
    .getElementById("previousPeriod")
    ?.addEventListener("click", () => {

        if (scheduleView === "week") {

            scheduleDate.setDate(
                scheduleDate.getDate() - 7
            );

        } else {

            scheduleDate.setMonth(
                scheduleDate.getMonth() - 1
            );

        }

        renderSchedule();

    });


document
    .getElementById("nextPeriod")
    ?.addEventListener("click", () => {

        if (scheduleView === "week") {

            scheduleDate.setDate(
                scheduleDate.getDate() + 7
            );

        } else {

            scheduleDate.setMonth(
                scheduleDate.getMonth() + 1
            );

        }

        renderSchedule();

    });


document
    .getElementById("todayPeriod")
    ?.addEventListener("click", () => {

        scheduleDate = new Date();

        renderSchedule();

    });


document
    .getElementById("scheduleAddButton")
    ?.addEventListener("click", () => {

        openForm("event");

    });


/* =========================================================
   MEALS
========================================================= */

function renderMeals() {

    const container =
        document.getElementById("mealsContainer");

    const view =
        appData.settings.mealView || "today";


    document.querySelectorAll("[data-meal-view]")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.mealView === view
            );

        });


    let meals =
        [...appData.meals];


    if (view === "today") {

        meals =
            meals.filter(
                meal => meal.date === todayISO()
            );

    }


    if (view === "week") {

        const monday =
            startOfWeek(new Date());

        const sunday =
            new Date(monday);

        sunday.setDate(
            monday.getDate() + 6
        );

        meals =
            meals.filter(meal => {

                const date =
                    new Date(`${meal.date}T12:00:00`);

                return date >= monday &&
                       date <= sunday;

            });

    }


    if (view === "foods") {

        renderFoodLibrary(container);

        return;

    }


    if (!meals.length) {

        container.innerHTML = `
            <div class="dashboard-card">
                <div class="empty-state">
                    No meals planned yet.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        meals.map(meal => `

            <div class="meal-card">

                <div class="meal-top">

                    <div>

                        <span class="meal-type">
                            ${escapeHTML(meal.mealType)}
                        </span>

                        <h3>
                            ${escapeHTML(meal.title)}
                        </h3>

                        <p class="page-subtitle">
                            ${formatDate(meal.date)}
                        </p>

                    </div>

                    <button
                        class="check-button ${meal.completed ? "checked" : ""}"
                        onclick="completeItem('meal', '${meal.id}')"
                    >
                        ${meal.completed ? "✓" : ""}
                    </button>

                </div>

                <div class="food-list">

                    ${
                        meal.foods
                            .map(food => `
                                <span class="food-tag">
                                    ${escapeHTML(food)}
                                </span>
                            `)
                            .join("")
                    }

                </div>

            </div>

        `).join("");
}


function renderFoodLibrary(container) {

    const foods =
        appData.foods;


    container.innerHTML = `

        <div class="dashboard-card">

            <div class="card-heading">

                <div>
                    <p class="eyebrow">YOUR FOOD LIBRARY</p>
                    <h3>Foods</h3>
                </div>

            </div>

            ${
                foods.length
                    ? `
                        <div class="food-list">
                            ${foods.map(food => `
                                <span class="food-tag">
                                    ${escapeHTML(food)}
                                </span>
                            `).join("")}
                        </div>
                    `
                    : `
                        <div class="empty-state">
                            Foods you use in your meal plans can appear here.
                        </div>
                    `
            }

        </div>

    `;
}


document.querySelectorAll("[data-meal-view]")
    .forEach(button => {

        button.addEventListener("click", () => {

            appData.settings.mealView =
                button.dataset.mealView;

            saveData();

            renderMeals();

        });

    });


document
    .getElementById("mealAddButton")
    ?.addEventListener("click", () => {

        openForm("meal");

    });


/* =========================================================
   WORKOUTS
========================================================= */

function renderWorkouts() {

    const container =
        document.getElementById("workoutsGrid");

    document.getElementById("workoutCount").textContent =
        appData.workouts.length;

    document.getElementById("workoutCompleted").textContent =
        appData.workouts.reduce(
            (sum, workout) =>
                sum + Number(workout.completedCount || 0),
            0
        );

    document.getElementById("exerciseCount").textContent =
        appData.workouts.reduce(
            (sum, workout) =>
                sum + workout.exercises.length,
            0
        );


    if (!appData.workouts.length) {

        container.innerHTML = `
            <div class="dashboard-card">
                <div class="empty-state">
                    Create your first custom workout.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        appData.workouts.map(workout => `

            <div class="workout-card">

                <div class="workout-card-top">

                    <div>

                        <span class="category-pill">
                            ${escapeHTML(workout.category)}
                        </span>

                        <h3>
                            ${escapeHTML(workout.title)}
                        </h3>

                        <p>
                            ${escapeHTML(workout.description)}
                        </p>

                    </div>

                    <button
                        class="text-button"
                        onclick="completeWorkout('${workout.id}')"
                    >
                        Complete
                    </button>

                </div>


                <div class="exercise-list">

                    ${
                        workout.exercises
                            .map(exercise => `

                                <div class="exercise-row">

                                    <strong>
                                        ${escapeHTML(exercise.name)}
                                    </strong>

                                    <span>
                                        ${escapeHTML(exercise.reps)}
                                    </span>

                                </div>

                            `)
                            .join("")
                    }

                </div>

            </div>

        `).join("");
}


document
    .getElementById("workoutCreateButton")
    ?.addEventListener("click", () => {

        openForm("workout");

    });


/* =========================================================
   SCHOOL
========================================================= */

function renderSchool() {

    const container =
        document.getElementById("schoolContainer");

    document.getElementById("assignmentCount").textContent =
        appData.school.length;

    document.getElementById("schoolCompleted").textContent =
        appData.school.filter(
            task => task.completed
        ).length;


    const today =
        new Date();

    const soon =
        new Date();

    soon.setDate(
        soon.getDate() + 7
    );


    const dueSoon =
        appData.school.filter(task => {

            if (!task.date) return false;

            const date =
                new Date(`${task.date}T12:00:00`);

            return date >= today &&
                   date <= soon &&
                   !task.completed;

        }).length;


    document.getElementById("dueSoonCount").textContent =
        dueSoon;


    if (!appData.school.length) {

        container.innerHTML = `
            <div class="dashboard-card">
                <div class="empty-state">
                    No school tasks yet.
                </div>
            </div>
        `;

        return;
    }


    const sorted =
        [...appData.school]
            .sort((a, b) =>
                a.date.localeCompare(b.date)
            );


    container.innerHTML =
        sorted.map(task => `

            <div class="school-task">

                <button
                    class="check-button ${task.completed ? "checked" : ""}"
                    onclick="completeItem('school', '${task.id}')"
                >
                    ${task.completed ? "✓" : ""}
                </button>

                <div class="school-task-main">

                    <h3>
                        ${escapeHTML(task.title)}
                    </h3>

                    <p>
                        ${escapeHTML(task.subject)}
                        ·
                        Due ${formatDate(task.date)}
                    </p>

                </div>

                <span class="subject-tag">
                    ${escapeHTML(task.type)}
                </span>

            </div>

        `).join("");
}


document
    .getElementById("schoolAddButton")
    ?.addEventListener("click", () => {

        openForm("school");

    });


/* =========================================================
   HABITS
========================================================= */

function renderHabits() {

    const container =
        document.getElementById("habitsContainer");


    if (!appData.habits.length) {

        container.innerHTML = `
            <div class="dashboard-card">
                <div class="empty-state">
                    Add habits you want to consistently practice.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        appData.habits.map(habit => {

            const completedToday =
                habit.completedDates.includes(
                    todayISO()
                );

            return `

                <div class="habit-card">

                    <div class="habit-top">

                        <div>

                            <h3>
                                ${escapeHTML(habit.title)}
                            </h3>

                            <p>
                                ${escapeHTML(habit.frequency)}
                            </p>

                        </div>

                        <span class="streak-pill">
                            ${habit.streak || 0} day streak
                        </span>

                    </div>


                    <button
                        class="primary-button habit-check"
                        onclick="toggleHabit('${habit.id}')"
                    >
                        ${
                            completedToday
                                ? "Completed today ✓"
                                : "Mark complete"
                        }
                    </button>

                </div>

            `;

        }).join("");
}


function toggleHabit(id) {

    const habit =
        appData.habits.find(
            habit => habit.id === id
        );

    if (!habit) return;


    const today =
        todayISO();


    const index =
        habit.completedDates.indexOf(today);


    if (index >= 0) {

        habit.completedDates.splice(index, 1);

        habit.streak =
            Math.max(0, habit.streak - 1);

        appData.stats.completed =
            Math.max(0, appData.stats.completed - 1);

    } else {

        habit.completedDates.push(today);

        habit.streak =
            Number(habit.streak || 0) + 1;

        appData.stats.completed += 1;
        appData.stats.xp += 10;

        updateStreak();

        checkAchievements();

    }


    saveData();

    renderHabits();

    showToast("Habit updated.");

}


document
    .getElementById("habitAddButton")
    ?.addEventListener("click", () => {

        openForm("habit");

    });


/* =========================================================
   GOALS
========================================================= */

function renderGoals() {

    const container =
        document.getElementById("goalsContainer");


    if (!appData.goals.length) {

        container.innerHTML = `
            <div class="dashboard-card">
                <div class="empty-state">
                    Add a goal and start tracking your progress.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        appData.goals.map(goal => {

            const percentage =
                Math.min(
                    100,
                    Math.round(
                        (goal.progress / goal.target) * 100
                    )
                );


            return `

                <div class="goal-card">

                    <div class="goal-top">

                        <div>

                            <span class="category-pill">
                                ${escapeHTML(goal.category)}
                            </span>

                            <h3>
                                ${escapeHTML(goal.title)}
                            </h3>

                            <p>
                                ${escapeHTML(goal.description)}
                            </p>

                        </div>

                    </div>


                    <div class="goal-progress">

                        <div class="goal-progress-header">

                            <span>
                                Progress
                            </span>

                            <strong>
                                ${goal.progress} / ${goal.target}
                            </strong>

                        </div>

                        <div class="goal-progress-track">

                            <div
                                class="goal-progress-fill"
                                style="width:${percentage}%"
                            ></div>

                        </div>

                    </div>


                    <button
                        class="primary-button habit-check"
                        onclick="increaseGoal('${goal.id}')"
                    >
                        +1 progress
                    </button>

                </div>

            `;

        }).join("");
}


function increaseGoal(id) {

    const goal =
        appData.goals.find(
            goal => goal.id === id
        );

    if (!goal) return;

    if (goal.progress >= goal.target) return;

    goal.progress += 1;

    appData.stats.xp += 5;

    if (goal.progress === goal.target) {

        goal.completed = true;

        appData.stats.completed += 1;

        showToast("Goal completed.");

    } else {

        showToast("+5 XP");

    }

    checkAchievements();

    saveData();

    renderGoals();

}


document
    .getElementById("goalAddButton")
    ?.addEventListener("click", () => {

        openForm("goal");

    });


/* =========================================================
   ROUTINES
========================================================= */

function renderRoutines() {

    const container =
        document.getElementById("routinesContainer");


    if (!appData.routines.length) {

        container.innerHTML = `
            <div class="dashboard-card">
                <div class="empty-state">
                    Create your first routine.
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        appData.routines.map(routine => `

            <div class="routine-card">

                <div class="routine-top">

                    <div>

                        <span class="category-pill">
                            ${escapeHTML(routine.time || "Anytime")}
                        </span>

                        <h3>
                            ${escapeHTML(routine.title)}
                        </h3>

                    </div>

                    <span class="nav-symbol">
                        ↻
                    </span>

                </div>


                <div class="routine-items">

                    ${
                        routine.steps.map(
                            (step, index) => `
                                <div class="routine-item">
                                    ${index + 1}. ${escapeHTML(step)}
                                </div>
                            `
                        ).join("")
                    }

                </div>

            </div>

        `).join("");
}


document
    .getElementById("routineAddButton")
    ?.addEventListener("click", () => {

        openForm("routine");

    });


/* =========================================================
   SETTINGS
========================================================= */

function renderSettings() {

    document.getElementById("nameSetting").value =
        appData.user.name || "";

    document.getElementById("themeSetting").value =
        appData.user.theme || "light";

}


document
    .getElementById("nameSetting")
    ?.addEventListener("input", event => {

        appData.user.name =
            event.target.value;

        saveData();

    });


document
    .getElementById("themeSetting")
    ?.addEventListener("change", event => {

        appData.user.theme =
            event.target.value;

        applyTheme();

        saveData();

    });


function applyTheme() {

    document.body.classList.remove(
        "theme-dark",
        "theme-soft"
    );

    if (appData.user.theme === "dark") {

        document.body.classList.add(
            "theme-dark"
        );

    }

    if (appData.user.theme === "soft") {

        document.body.classList.add(
            "theme-soft"
        );

    }

}


document
    .getElementById("resetDataButton")
    ?.addEventListener("click", () => {

        const confirmed =
            confirm(
                "Are you sure you want to erase all Schedule app data?"
            );

        if (!confirmed) return;

        localStorage.removeItem(STORAGE_KEY);

        appData =
            structuredClone(defaultData);

        applyTheme();

        refreshCurrentPage();

        showToast("App data reset.");

    });


/* =========================================================
   BUTTON SHORTCUTS
========================================================= */

document
    .querySelectorAll("[data-page]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.page;

            if (page === "schedule") {
                renderSchedule();
            }

        });

    });


/* =========================================================
   REFRESH CURRENT PAGE
========================================================= */

function getCurrentPage() {

    const active =
        document.querySelector(".page.active");

    if (!active) return "dashboard";

    return active.id
        .replace("Page", "");
}


function refreshCurrentPage() {

    const page =
        getCurrentPage();

    openPage(page);

}


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeApp() {

    applyTheme();

    updateDashboard();

    updateSidebarProgress();

    renderDashboard();

    renderAchievements();

    renderWorkouts();

    renderSchool();

    renderHabits();

    renderGoals();

    renderRoutines();

    renderMeals();

    renderSchedule();

}


initializeApp();


/* =========================================================
   GLOBAL DEBUG ACCESS
   Helpful while developing on GitHub Pages.
========================================================= */

window.ScheduleApp = {

    getData: () => appData,

    save: saveData,

    reset: () => {

        localStorage.removeItem(STORAGE_KEY);

        location.reload();

    }

};
