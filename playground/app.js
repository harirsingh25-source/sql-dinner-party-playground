"use strict";

const SQL_WASM_BASE = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";

const exampleQueries = {
  guests: `SELECT *
FROM guests;`,

  vegetarian: `SELECT
    dish_name,
    category,
    price
FROM dishes
WHERE vegetarian = 1
ORDER BY price;`,

  seating: `SELECT
    g.guest_name,
    g.city,
    s.table_name,
    s.seat_number
FROM guests AS g
INNER JOIN seats AS s
    ON g.seat_id = s.seat_id
ORDER BY s.seat_id;`,

  popular: `SELECT
    d.dish_name,
    SUM(o.quantity) AS portions_ordered
FROM orders AS o
INNER JOIN dishes AS d
    ON o.dish_id = d.dish_id
GROUP BY d.dish_name
HAVING SUM(o.quantity) >= 2
ORDER BY portions_ordered DESC, d.dish_name;`,

  mystery: `SELECT
    g.guest_name,
    d.dish_name,
    s.table_name,
    s.seat_number,
    o.quantity
FROM orders AS o
INNER JOIN guests AS g
    ON o.guest_id = g.guest_id
INNER JOIN dishes AS d
    ON o.dish_id = d.dish_id
INNER JOIN seats AS s
    ON g.seat_id = s.seat_id
WHERE d.category = 'main'
  AND d.vegetarian = 1
  AND d.price > 18
  AND o.quantity = 2;`
};

const schemaDefinition = {
  guests: [
    "guest_id — primary key",
    "guest_name",
    "city",
    "dietary_preference",
    "seat_id — foreign key"
  ],
  seats: [
    "seat_id — primary key",
    "table_name",
    "seat_number"
  ],
  dishes: [
    "dish_id — primary key",
    "dish_name",
    "category",
    "price",
    "vegetarian"
  ],
  orders: [
    "order_id — primary key",
    "guest_id — foreign key",
    "dish_id — foreign key",
    "quantity",
    "ordered_at"
  ]
};

let database = null;

const editor = document.querySelector("#sql-editor");
const runButton = document.querySelector("#run-query");
const resetButton = document.querySelector("#reset-query");
const clearButton = document.querySelector("#clear-query");
const resultsContainer = document.querySelector("#results");
const resultSummary = document.querySelector("#result-summary");
const errorMessage = document.querySelector("#error-message");
const databaseStatus = document.querySelector("#database-status");
const schemaCards = document.querySelector("#schema-cards");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSchemaCards() {
  schemaCards.innerHTML = Object.entries(schemaDefinition)
    .map(([tableName, columns]) => {
      const items = columns
        .map((column) => `<li><code>${escapeHtml(column)}</code></li>`)
        .join("");

      return `
        <article class="schema-card">
          <h3>${escapeHtml(tableName)}</h3>
          <ul>${items}</ul>
        </article>
      `;
    })
    .join("");
}

renderSchemaCards();

async function fetchText(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status}).`);
  }

  return response.text();
}

async function initializeDatabase() {
  try {
    runButton.disabled = true;
    databaseStatus.textContent = "Loading the fictional database…";

    const SQL = await initSqlJs({
      locateFile: (file) => `${SQL_WASM_BASE}${file}`
    });

    const [setupSql, seedSql] = await Promise.all([
      fetchText("sql/setup.sql"),
      fetchText("sql/seed.sql")
    ]);

    database = new SQL.Database();
    database.run(setupSql);
    database.run(seedSql);

    databaseStatus.textContent = "Database ready · 20 guests · 35 orders";
    runButton.disabled = false;
  } catch (error) {
    databaseStatus.textContent = "Database failed to load.";
    errorMessage.hidden = false;
    errorMessage.textContent = error.message;
    console.error(error);
  }
}

function renderResultSet(resultSet) {
  if (!resultSet) {
    resultsContainer.innerHTML = "";
    resultSummary.textContent = "Query completed with no result table.";
    return;
  }

  const { columns, values } = resultSet;

  const tableHead = columns
    .map((column) => `<th scope="col">${escapeHtml(column)}</th>`)
    .join("");

  const tableRows = values
    .map((row) => {
      const cells = row
        .map((value) => {
          const displayValue = value === null ? "NULL" : value;
          return `<td>${escapeHtml(displayValue)}</td>`;
        })
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  resultsContainer.innerHTML = `
    <table>
      <thead>
        <tr>${tableHead}</tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;

  const rowLabel = values.length === 1 ? "row" : "rows";
  resultSummary.textContent = `${values.length} ${rowLabel} returned`;
}

function runQuery() {
  if (!database) {
    errorMessage.hidden = false;
    errorMessage.textContent = "The database is still loading. Please try again.";
    return;
  }

  const query = editor.value.trim();

  if (!query) {
    errorMessage.hidden = false;
    errorMessage.textContent = "Write a SQL query before running it.";
    resultsContainer.innerHTML = "";
    resultSummary.textContent = "No query was run.";
    return;
  }

  errorMessage.hidden = true;
  errorMessage.textContent = "";

  try {
    const resultSets = database.exec(query);
    const finalResultSet = resultSets[resultSets.length - 1];
    renderResultSet(finalResultSet);
  } catch (error) {
    resultsContainer.innerHTML = "";
    resultSummary.textContent = "Query could not be completed.";
    errorMessage.hidden = false;
    errorMessage.textContent = error.message;
  }
}

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    const queryName = button.dataset.query;
    editor.value = exampleQueries[queryName];
    editor.focus();
  });
});

runButton.addEventListener("click", runQuery);

resetButton.addEventListener("click", () => {
  editor.value = exampleQueries.guests;
  errorMessage.hidden = true;
  resultsContainer.innerHTML = "";
  resultSummary.textContent = "Run a query to see results.";
  editor.focus();
});

clearButton.addEventListener("click", () => {
  editor.value = "";
  errorMessage.hidden = true;
  resultsContainer.innerHTML = "";
  resultSummary.textContent = "Editor cleared.";
  editor.focus();
});

editor.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    runQuery();
  }
});

initializeDatabase();


// Presenter-only drumroll
const presenterControls = document.querySelector("#presenter-controls");
const drumrollButton = document.querySelector("#drumroll-button");
const presenterMode =
  new URLSearchParams(window.location.search).get("presenter") === "1";

if (presenterMode && presenterControls) {
  presenterControls.hidden = false;
}

const drumrollAudio = new Audio("assets/drumroll.wav");
drumrollAudio.preload = "auto";

async function playDrumroll() {
  drumrollButton.disabled = true;
  drumrollButton.textContent = "🥁 Tabla crescendo playing…";

  drumrollAudio.pause();
  drumrollAudio.currentTime = 0;
  drumrollAudio.volume = 1;

  try {
    await drumrollAudio.play();
  } catch (error) {
    drumrollButton.disabled = false;
    drumrollButton.textContent = "🥁 Play tabla crescendo";
    alert(`The sound could not be played: ${error.message}`);
  }
}

drumrollAudio.addEventListener("ended", () => {
  drumrollButton.disabled = false;
  drumrollButton.textContent = "🥁 Play tabla crescendo";
});

if (drumrollButton) {
  drumrollButton.addEventListener("click", playDrumroll);
}
