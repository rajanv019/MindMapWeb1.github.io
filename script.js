
const $ = id => document.getElementById(id);



const now = new Date();

const todayKey =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

const storageKey = "mindnest-" + todayKey;



let data;

try {
    data = JSON.parse(
        localStorage.getItem(storageKey) ||
        '{"tasks":[],"schedule":[],"sessions":0,"mood":"","goal":""}'
    );
} catch (error) {
    data = {
        tasks: [],
        schedule: [],
        sessions: 0,
        mood: "",
        goal: ""
    };
}



function save() {
    localStorage.setItem(storageKey, JSON.stringify(data));
}



function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}



function updateDate() {

    const now = new Date();

    $("todayDate").textContent =
        now.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });

    const hour = now.getHours();

    const greeting =
        hour < 12 ? "Good morning" :
        hour < 17 ? "Good afternoon" :
        "Good evening";

    $("greeting").textContent =
        greeting + ", student! ";

    $("liveGreeting").textContent =
        "Make today count ";
}



function renderTasks() {

    const list = $("taskList");

    if (!data.tasks.length) {

        list.innerHTML =
            '<div class="empty">No tasks yet. Add your first task above!</div>';

    } else {

        list.innerHTML = data.tasks.map((t, i) => `

            <div class="item ${t.done ? "done" : ""}">

                <input
                    type="checkbox"
                    aria-label="Mark task complete"
                    ${t.done ? "checked" : ""}
                    onchange="toggleTask(${i})">

                <div class="item-main">

                    <div class="item-title">
                        ${escapeHTML(t.title)}
                    </div>

                    <div class="item-meta">
                        Added to today's list
                    </div>

                </div>

                <span class="priority ${t.priority}">
                    ${escapeHTML(t.priority)}
                </span>

                <button
                    class="small danger"
                    onclick="deleteTask(${i})">
                    
                </button>

            </div>

        `).join("");

    }

   
    const done = data.tasks.filter(t => t.done).length;

    const total = data.tasks.length;

    $("completedCount").textContent = done + "/" + total;

    
    const percent = total ?
        Math.round(done / total * 100) : 0;

    $("progressPercent").textContent = percent + "%";

    $("progressBar").style.width = percent + "%";

}



function addTask(title, priority) {

    data.tasks.push({
        title: title,
        priority: priority,
        done: false
    });

    save();

    renderTasks();

}



function toggleTask(i) {

    data.tasks[i].done = !data.tasks[i].done;

    save();

    renderTasks();

}



function deleteTask(i) {

    data.tasks.splice(i, 1);

    save();

    renderTasks();

}



$("taskForm").addEventListener("submit", e => {

    e.preventDefault();

    const title = $("taskTitle").value.trim();

    if (!title) {
        alert("Please enter a task.");
        return;
    }

    addTask(title, $("taskPriority").value);

    e.target.reset();

});



function renderSchedule() {

    const list = $("scheduleList");

    
    const sortedSchedule = [...data.schedule].sort((a, b) =>
        a.time.localeCompare(b.time)
    );

    if (!sortedSchedule.length) {

        list.innerHTML =
            '<div class="empty">Your schedule is empty. Add an activity to get started.</div>';

        return;

    }

    list.innerHTML = sortedSchedule.map(s => {

        const originalIndex = data.schedule.indexOf(s);

        return `

            <div class="item">

                <div class="item-main">

                    <div class="item-title">
                        ${escapeHTML(s.title)}
                    </div>

                    <div class="item-meta">
                         ${escapeHTML(s.time)}
                    </div>

                </div>

                <button
                    class="small danger"
                    onclick="deleteSchedule(${originalIndex})">
                    ✕
                </button>

            </div>

        `;

    }).join("");

}



$("scheduleForm").addEventListener("submit", e => {

    e.preventDefault();

    const title = $("scheduleTitle").value.trim();

    const time = $("scheduleTime").value;

    if (!title || !time) {

        alert("Please enter an activity and time.");

        return;

    }

    data.schedule.push({
        title: title,
        time: time
    });

    save();

    renderSchedule();

    e.target.reset();

});



function deleteSchedule(i) {

    data.schedule.splice(i, 1);

    save();

    renderSchedule();

}





$("goalForm").addEventListener("submit", e => {

    e.preventDefault();

    const goal = $("goalInput").value.trim();

    if (!goal) return;

    data.goal = goal;

    save();

    renderGoal();

    e.target.reset();

});

function renderGoal() {

    $("goalDisplay").textContent =
        data.goal ?
        "Today's goal: " + data.goal :
        "You haven't set a goal yet. Add one above!";

}

const moodMessages = {

    Great:
        "Wonderful! Keep that positive energy going. ",

    Good:
        "Glad you're doing well. Keep a healthy balance!",

    Okay:
        "It's okay to have an ordinary day. Take it one step at a time.",

    Low:
        "Be kind to yourself. Consider talking to someone you trust.",

    Stressed:
        "Pause, breathe slowly and take a small break. You don't have to do everything at once."

};


function renderMood() {

    $("moodStat").textContent = data.mood || "—";

    document.querySelectorAll(".mood").forEach(b => {

        b.classList.toggle(
            "selected",
            b.dataset.mood === data.mood
        );

    });

    $("moodMessage").textContent =
        data.mood ?
        moodMessages[data.mood] :
        "Your feelings matter. Take a moment for yourself.";

}



$("moodButtons").addEventListener("click", e => {

    const b = e.target.closest("[data-mood]");

    if (!b) return;

    data.mood = b.dataset.mood;

    save();

    renderMood();

});



const quotes = [

    "“You don't have to be perfect. You just have to begin.”",

    "“Small progress is still progress.”",

    "“Your future is created by what you do today, not tomorrow.”",

    "“Take a break, not a breakdown. Your wellbeing matters.”",

    "“Focus on the step in front of you, not the whole staircase.”"

];



$("newQuote").addEventListener("click", () => {

    const q = quotes[
        Math.floor(Math.random() * quotes.length)
    ];

    $("quoteText").textContent = q;

});



function resetToday() {

    if (!confirm(
        "Clear today's tasks and schedule? Your mood and goal will also reset."
    )) return;

    data = {
        tasks: [],
        schedule: [],
        sessions: 0,
        mood: "",
        goal: ""
    };

    save();

    renderAll();

}


function renderAll() {

    renderTasks();

    renderSchedule();

    renderGoal();

    renderMood();

}




updateDate();

renderAll();