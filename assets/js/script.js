// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  let dueDate = dayjs(task.dueDate);
  let today = dayjs();

  // Calculate the difference in days between the due date and today
  let daysDifference = dueDate.diff(today, 'day');

  console.log("Due Date:", dueDate.format('YYYY-MM-DD'));
  console.log("Today:", today.format('YYYY-MM-DD'));
  console.log("Difference in days:", daysDifference);

  // Define the class based on the difference in days
  let cardClasses = "task-card card mb-3";
  if (daysDifference < 0) {
    cardClasses += " past-due";
  } else if (daysDifference === 0) { // Change this condition to check for 0 days difference
    cardClasses += " due-tomorrow";
  } else if (daysDifference >= 1) {
    cardClasses += " future-due";
  }

  // Create HTML for task card
  let cardHtml = `
    <div id="task-${task.id}" class="${cardClasses}">
      <div class="card-body">
        <h5 class="card-title">${task.name}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due Date: ${task.dueDate}</small></p>
        <button type="button" class="btn btn-danger delete-task-btn">Delete</button>
      </div>
    </div>
  `;
  return cardHtml;
}

  
  
  
  

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty(); // Clear existing cards
  taskList.forEach(task => {
    let cardHtml = createTaskCard(task);
    $(`#${task.status}-cards`).append(cardHtml);
  });
  // Make cards draggable
  $(".task-card").draggable({
    revert: "invalid",
    helper: "clone"
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  let taskName = $("#taskName").val().trim();
  let taskDescription = $("#taskDescription").val().trim();
  let dueDate = $("#dueDate").val();
  if (taskName !== "") {
    let newTask = {
      id: generateTaskId(),
      name: taskName,
      description: taskDescription,
      dueDate: dueDate,
      status: "todo"
    };
    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", nextId);
    renderTaskList();
    $("#formModal").modal("hide");
    $("#taskForm")[0].reset();
  } else {
    alert("Task name cannot be empty!");
  }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  let taskId = $(this).closest(".task-card").attr("id").split("-")[1];
  taskList = taskList.filter(task => task.id != taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  let taskId = ui.draggable.attr("id").split("-")[1];
  let newStatus = $(this).attr("id");
  let taskIndex = taskList.findIndex(task => task.id == taskId);
  taskList[taskIndex].status = newStatus;
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// When the page loads
$(document).ready(function () {
    // Make the due date field a date picker using Day.js
    $("#dueDate").on("change", function() {
      // Get the selected date from the input field
      let selectedDate = $(this).val();
      // Format the selected date to match the desired format
      let formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
      // Set the formatted date back to the input field
      $(this).val(formattedDate);
    });

  // Render the task list
  renderTaskList();

  // Add event listener for Add Task button
  $("#addTaskBtn").click(handleAddTask);

  // Add event listener for Delete Task button
  $(document).on("click", ".delete-task-btn", handleDeleteTask);

  // Make lanes droppable
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop
  });
});
