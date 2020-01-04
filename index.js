function emptyElement(element) {
  while(element.firstChild) { element.removeChild(element.firstChild); }
}

var Calendar = FullCalendar.Calendar;
var Draggable = FullCalendarInteraction.Draggable

var containerEl = document.getElementById('external-events-list');
new Draggable(containerEl, {
  itemSelector: '.fc-event',
  eventData: function(eventEl) {
    return {
      title: eventEl.innerText.trim()
    }
  }
});

const TASK_ADDED = 'TASK_ADDED';
const TASK_MOVED = 'TASK_MOVED';
const TASK_COMPLETED = 'TASK_COMPLETED';

function jsonParse(string) {
  const state = JSON.parse(string);
  if (state) {
    state.tasks = state.tasks.map(task => {
      return {
        ...task,
        start: new Date(task.start),
        end: new Date(task.end),
      }
    })
  }
  return state;
}

function initialState() {
  var state = jsonParse(localStorage.getItem('TASKS_MARATHON'));
  return state || { tasks: [] };
}

function uuid() {
  return 'hxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function changeById(taskId, state, cb) {
  state.tasks = state.tasks.map(task => task.id === taskId ? cb(task) : task);
}

function moveTask(taskId, state) {
  changeById(taskId, state, task => {
    debugger;
    // task.start
    // task.end
    return task;
  })
}

function completeTask(taskId, state) {
  changeById(taskId, state, task => ({ ...task, isCompleted: !task.isCompleted }))
}

function Task(props) {
  return { id: uuid(), isCompleted: false, ...props }
}

function TasksCalendar(state, action) {
  if (typeof state === 'undefined') { return initialState(); }

  console.log(action.type, action);
  var newState = jsonParse(JSON.stringify(state));

  switch (action.type) {
    case TASK_ADDED:
      const newTask = Task(action.payload);
      newState.tasks.push(newTask);
      return newState;
    case TASK_MOVED:
      moveTask(action.payload, newState);
      return newState;
    case TASK_COMPLETED:
      completeTask(action.payload, newState)
      return newState;
    default:
      return state;
  }
}

function persist(state) {
  localStorage.setItem('TASKS_MARATHON', JSON.stringify(state))
}

function render(state) {
  console.log(state);
  calendar.removeAllEvents()
  emptyElement(containerEl);

  state.tasks.forEach(task => {
    calendar.addEvent({
      title: task.title,
      start: task.start,
      end: task.end,
      allDay: task.allDay
    })


    // <label for="for3" class='fc-event'>
    //   <input type="checkbox" name="for3" id="for3">
    //   <span>My Event 1</span>
    // </label>
    const label = document.createElement('label');
    label.addEventListener('click', function() {
      store.dispatch({
        type: TASK_COMPLETED,
        payload: task.id,
      })
    })
    label.htmlFor = task.id;
    label.className = 'fc-event';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = task.id;
    input.checked = task.isCompleted;
    input.id = task.id;
    label.appendChild(input);
    const span = document.createElement('span');
    span.innerText = task.title;
    label.appendChild(span)
    containerEl.appendChild(label);
  })
}

store = StateMachine(TasksCalendar);

var calendarEl = document.getElementById('calendar');
var calendar = new Calendar(calendarEl, {
  plugins: [ 'bootstrap', 'interaction', 'dayGrid', 'timeGrid', 'list' ],
  nowIndicator: true,
  themeSystem: 'bootstrap',
  header: {
    left: 'prevYear,prev,next,nextYear today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek'
  },
  // customize the button names,
  // otherwise they'd all just say "list"
  views: {
    listDay: { buttonText: 'list day' },
    listWeek: { buttonText: 'list week' }
  },
  defaultView: 'timeGridDay',
  weekNumbers: false,
  navLinks: true, // can click day/week names to navigate views
  droppable: true, // this allows things to be dropped onto the calendar
  drop: function(arg) {
    // is the "remove after drop" checkbox checked?
    // if (document.getElementById('drop-remove').checked) {
    //   // if so, remove the element from the "Draggable Events" list
    //   arg.draggedEl.parentNode.removeChild(arg.draggedEl);
    // }
  },
  editable: true,
  eventLimit: false, // allow "more" link when too many events
  selectable: true,
  selectMirror: true,
  select: function(arg) {
    var title = prompt('Task:');
    if (title) {
      store.dispatch({
        type: TASK_ADDED,
        payload: { title, start: arg.start, end: arg.end, allDay: arg.allDay }
      })
    }
    calendar.unselect()
  },
});
calendar.render();

var state = store.getState();

store.subscribe(render);
render(state);
store.subscribe(persist);
persist(state);

// document.getElementById('')
