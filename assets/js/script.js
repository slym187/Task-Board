// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;


// Todo: create a function to generate a unique task id
function generateTaskId() {
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000); 
    return `${timestamp}-${randomNum}`;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    // Create elements for task card
    var card = document.createElement("div");
    card.classList.add("card", "border-light", "mb-3");
    card.dataset.taskId = task.id; // Set the task ID as a dataset attribute
  
    var cardHeader = document.createElement("div");
    cardHeader.classList.add("card-header", "bg-white");
  
    var cardTitle = document.createElement("h5");
    cardTitle.classList.add("card-title");
    cardTitle.textContent = task.title;
  
    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "bg-light");
  
    var cardDescription = document.createElement("p");
    cardDescription.classList.add("card-text");
    cardDescription.textContent = task.description;
  
    var cardDueDate = document.createElement("p");
    cardDueDate.classList.add("card-text");
    cardDueDate.textContent = "Due Date: " + task.dueDate;

    // Calculate days until due date
    var today = dayjs();
    var dueDate = dayjs(task.dueDate);
    var daysUntilDue = dueDate.diff(today, 'day');
    
    // Apply color coding based on due date proximity
    if (daysUntilDue < 0) {
        card.classList.add("border-danger");
    } else if (daysUntilDue < 3) {
        card.classList.add("border-warning");
    }
  
    // Create delete button
    var deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-danger", "btn-sm", "float-end");
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener("click", handleDeleteTask); // Add event listener to delete button

     // Prevent default click behavior of delete button
     deleteButton.addEventListener("click", function(event) {
        event.preventDefault();
    });
  
    // Append elements to form task card
    cardHeader.appendChild(cardTitle);
    cardHeader.appendChild(deleteButton); // Append delete button to card header
    cardBody.appendChild(cardDescription);
    cardBody.appendChild(cardDueDate);
    card.appendChild(cardHeader);
    card.appendChild(cardBody);
  
    return card;
}


  

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    // Select the container where task cards will be appended
    var todoContainer = document.getElementById("todo-cards");
    var inProgressContainer = document.getElementById("in-progress-cards");
    var doneContainer = document.getElementById("done-cards");
  
    // Clear existing task cards
    todoContainer.innerHTML = "";
    inProgressContainer.innerHTML = "";
    doneContainer.innerHTML = "";
  
    // Iterate through tasks in taskList and create task cards
    taskList.forEach(function(task) {
      var taskCard = createTaskCard(task);
  
      // Add task card to appropriate container based on task status
      if (task.status === "To Do") {
        todoContainer.appendChild(taskCard);
      } else if (task.status === "In Progress") {
        inProgressContainer.appendChild(taskCard);
      } else if (task.status === "Done") {
        doneContainer.appendChild(taskCard);
      }
  
      // Make task cards draggable
      $(taskCard).draggable({
        revert: "invalid", // Snap back to original position if not dropped on a valid droppable target
        containment: ".swim-lanes" // Limit dragging within the swim lanes
      });
    });
  }
  
  
// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault(); // Prevent form submission
    
    // Get form input values
    var title = document.getElementById("taskTitle").value;
    var description = document.getElementById("taskDescription").value;
    var dueDate = document.getElementById("taskdueDate").value;
    
    // Create a new task object
    var newTask = {
      id: nextId,
      title: title,
      description: description,
      dueDate: dueDate,
      status: "To Do" // Set initial status as "To Do"
    };
    
    // Add new task to task list
    taskList.push(newTask);
    
    // Increment nextId for the next task
    nextId++;
    
    // Save updated task list and nextId to localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", JSON.stringify(nextId));
    
    // Render updated task list
    renderTaskList();
    
    // Close modal
    var modal = new bootstrap.Modal(document.getElementById("formModal"));
    modal.hide();
  }
  

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
    // Retrieve the task card element
    var taskCard = event.target.closest(".card");
    
    // Retrieve the task ID from the data attribute
    var taskId = parseInt(taskCard.dataset.taskId);
    
    // Find the index of the task with the matching ID in the task list
    var taskIndex = taskList.findIndex(function(task) {
      return task.id === taskId;
    });
    
    // Remove the task from the task list
    if (taskIndex !== -1) {
      taskList.splice(taskIndex, 1);
    }
    
    // Save the updated task list to localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));
    
    // Re-render the task list
    renderTaskList();
  }
  

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    var taskCard = ui.draggable[0]; 
    var taskId = parseInt(taskCard.dataset.taskId); 
    var newStatus = event.target.closest('.lane').id; 

    // Set a higher z-index to ensure the dragged element appears above other elements
    $(taskCard).css("z-index", "2000");

    // Find the index of the task with the matching ID in the task list
    var taskIndex = taskList.findIndex(function(task) {
      return task.id === taskId;
    });
  
    // Update the status of the corresponding task in the task list
    if (taskIndex !== -1) {
      taskList[taskIndex].status = newStatus;
    }
  
    // Save the updated task list to localStorage
    localStorage.setItem("tasks", JSON.stringify(taskList));
  
    // Re-render the task list
    renderTaskList();
}


  
// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    // Render the task list
    renderTaskList();
  
    // Add event listener for the form submission to add a new task
    $("#taskForm").submit(handleAddTask);
  
    // Make lanes droppable
    $(".lane").droppable({
      accept: ".card", // Only allow dropping cards onto lanes
      drop: handleDrop // Call handleDrop function when a card is dropped onto a lane
    });
  
    // Make the due date field a date picker
    $("#taskDueDate").datepicker();
  
    $(document).ready(function () {
        // Add event listener for the modal close button
        $('#formModal').on('hidden.bs.modal', function (e) {
            // Reset the form fields when the modal is closed
            $('#taskForm').trigger('reset');
        });
});
})
